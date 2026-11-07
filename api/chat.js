/**
 * ============================================================
 * Manuver Assistant - Serverless Chat Endpoint (/api/chat)
 * Supports Streaming (Server-Sent Events) & Full JSON Fallback
 * Compatible with Vercel Serverless Functions & local Vite dev
 * ============================================================
 */

import { buildSystemPrompt, WHATSAPP_NUMBER, AI_MODEL } from './knowledge.js';

// Simple in-memory rate limiting map: ip -> { count, resetTime }
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 15; // 15 requests per 10 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) rateLimitMap.delete(k);
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((record.resetTime - now) / 1000) };
  }

  record.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// Parse request body strictly as JSON; returns null if invalid JSON
async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      return null;
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      if (!raw || !raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (_) {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '';
  const isAllowed = !origin ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.includes('vercel.app');

  res.setHeader('Access-Control-Allow-Origin', isAllowed ? (origin || '*') : '');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Vary', 'Origin');
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  // Determine client IP
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || 'unknown');

  // Parse JSON Body strictly
  const body = await parseJsonBody(req);
  if (!body || typeof body !== 'object') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
  }

  const lang = body.lang === 'id' ? 'id' : 'en';

  // 1. Check Rate Limit (15 pesan / 10 menit)
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    const msg = lang === 'id'
      ? 'Maaf, batas pesan telah tercapai (15 pesan per 10 menit). Kamu bisa langsung chat lewat WhatsApp untuk respon cepat.'
      : 'Sorry, the message limit has been reached (15 messages per 10 minutes). You can chat directly via WhatsApp for a quick response.';
    return res.end(JSON.stringify({
      error: 'rate_limited',
      reply: msg,
      suggestWhatsApp: true,
      whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}`
    }));
  }

  // 2. Validate Input Messages
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  if (rawMessages.length === 0) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Invalid or empty messages array' }));
  }

  // Keep last 20 messages, max 500 chars each, only user and assistant roles
  const validMessages = rawMessages
    .slice(-20)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, 500)
    }))
    .filter((m) => m.content.length > 0);

  if (validMessages.length === 0 || validMessages[validMessages.length - 1].role !== 'user') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'No valid user message found' }));
  }

  const acceptsStream = (req.headers.accept || '').includes('text/event-stream') || body.stream === true;
  const apiKey = process.env.AI_API_KEY?.trim();

  // 3. Fallback when AI_API_KEY is not configured
  if (!apiKey) {
    const fallbackText = lang === 'id'
      ? 'Halo! Layanan asisten otomatis sedang dalam pemeliharaan. Kamu bisa langsung chat lewat WhatsApp untuk tanya jasa atau mulai project.'
      : 'Hello! The automated assistant is currently in maintenance. You can chat with me directly on WhatsApp to inquire about services or start a project.';

    if (acceptsStream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });
      res.write(`data: ${JSON.stringify({ text: fallbackText, suggestWhatsApp: true })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      reply: fallbackText,
      suggestWhatsApp: true
    }));
  }

  // 4. Prepare Gemini Request Payload
  const contents = validMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const languageDirective = lang === 'id'
    ? 'Bahasa pengunjung saat ini: Bahasa Indonesia.'
    : 'Visitor interface current language: English.';

  const requestPayload = {
    contents,
    systemInstruction: {
      parts: [{ text: `${buildSystemPrompt()}\n\n[PANDUAN BAHASA]\n${languageDirective}` }]
    },
    generationConfig: {
      maxOutputTokens: 300,
      temperature: 0.35
    }
  };

  // 5. Execute with Streaming (SSE) or Full JSON Fallback
  const candidateModels = [
    AI_MODEL,
    'gemini-2.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash'
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  if (acceptsStream) {
    for (const model of candidateModels) {
      try {
        const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 18000);

        const geminiStream = await fetch(streamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!geminiStream.ok || !geminiStream.body) {
          // If model not found or deprecated, try next model
          if (geminiStream.status === 404) continue;
          throw new Error(`Gemini stream error status ${geminiStream.status}`);
        }

        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no'
        });

        const reader = geminiStream.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let accumulatedText = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const partText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (partText) {
                accumulatedText += partText;
                res.write(`data: ${JSON.stringify({ text: partText })}\n\n`);
              }
            } catch (_) {}
          }
        }

        // Check if WhatsApp should be suggested based on accumulated content
        const lower = accumulatedText.toLowerCase();
        const suggestWhatsApp = lower.includes('whatsapp') ||
          lower.includes('harga') ||
          lower.includes('price') ||
          lower.includes('jadwal') ||
          lower.includes('schedule') ||
          lower.includes('mulai');

        if (suggestWhatsApp) {
          res.write(`data: ${JSON.stringify({ suggestWhatsApp: true })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        return res.end();
      } catch (err) {
        if (res.headersSent) {
          res.write(`data: ${JSON.stringify({ text: '\n\n' + (lang === 'id' ? 'Kamu bisa langsung chat lewat WhatsApp.' : 'You can reach out directly via WhatsApp.'), suggestWhatsApp: true })}\n\n`);
          res.write('data: [DONE]\n\n');
          return res.end();
        }
      }
    }
  }

  // Non-streaming / Fallback path
  for (const model of candidateModels) {
    try {
      const fullUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const apiResponse = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!apiResponse.ok) {
        if (apiResponse.status === 404) continue;
        throw new Error(`API responded with status ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      const candidate = data.candidates?.[0];
      const replyText = candidate?.content?.parts?.[0]?.text?.trim();

      if (!replyText) {
        throw new Error('Empty candidate response');
      }

      const lower = replyText.toLowerCase();
      const suggestWhatsApp = lower.includes('whatsapp') ||
        lower.includes('harga') ||
        lower.includes('price') ||
        lower.includes('jadwal') ||
        lower.includes('schedule') ||
        lower.includes('mulai');

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        reply: replyText,
        suggestWhatsApp
      }));
    } catch (err) {
      // Continue to next model if available
    }
  }
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    const errMsg = lang === 'id'
      ? 'Maaf, asisten sedang sibuk. Kamu bisa langsung chat lewat WhatsApp.'
      : 'Sorry, the assistant is currently busy. You can chat directly via WhatsApp.';
    return res.end(JSON.stringify({
      reply: errMsg,
      suggestWhatsApp: true
    }));
  }
