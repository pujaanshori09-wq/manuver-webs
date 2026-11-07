/**
 * ============================================================
 * Manuver Assistant - Chat Widget Component
 * Warm, lightweight, friendly, un-stiff aesthetic.
 * ============================================================
 */

import './ChatWidget.css';
import { t, getCurrentLanguage, onLanguageChange } from './i18n.js';
import { WHATSAPP_NUMBER } from '../api/knowledge.js';

const STORAGE_KEY = 'manuver_chat_session_v1';
const MAX_CHAR_LIMIT = 500;

export function initChatWidget(container = document.body) {
  let isOpen = false;
  let isLoading = false;
  let lang = getCurrentLanguage();

  // Load saved session or initialize empty
  let messages = loadSessionMessages();

  // Build DOM Structure
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-widget-root';

  wrapper.innerHTML = `
    <!-- Floating Launcher (visible only when panel is closed) -->
    <button type="button" class="chat-launcher" id="chat-launcher" aria-label="${t('chat.launcherAria', lang)}" aria-haspopup="dialog" aria-expanded="false">
      <svg viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>

    <!-- Chat Panel Dialog -->
    <div class="chat-panel" id="chat-panel" role="dialog" aria-label="${t('chat.title', lang)}" aria-modal="true" aria-hidden="true">
      <!-- Light Header -->
      <header class="chat-header">
        <div class="chat-header-identity">
          <div class="chat-avatar-badge" aria-hidden="true">M</div>
          <div class="chat-header-text">
            <span class="chat-header-title" data-i18n-key="chat.title">${t('chat.title', lang)}</span>
            <div class="chat-header-status">
              <span class="chat-status-dot" aria-hidden="true"></span>
              <span data-i18n-key="chat.onlineStatus">${t('chat.onlineStatus', lang)}</span>
            </div>
          </div>
        </div>
        <div class="chat-header-actions">
          <button type="button" class="chat-ghost-btn" id="chat-restart-btn" aria-label="${t('chat.restartAria', lang)}" title="${t('chat.restart', lang)}">
            <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          </button>
          <button type="button" class="chat-ghost-btn" id="chat-close-btn" aria-label="${t('chat.closeAria', lang)}" title="${t('chat.closeAria', lang)}">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </header>

      <!-- Messages Feed Area -->
      <div class="chat-feed" id="chat-feed" role="log" aria-live="polite"></div>

      <!-- Footer & Input Area -->
      <div class="chat-input-area">
        <!-- Subtle Left-Aligned WhatsApp Link -->
        <div class="chat-footer-wa">
          <a class="chat-footer-wa-link" id="chat-footer-wa-link" href="${getWhatsAppUrl(lang)}" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            <span data-i18n-key="chat.whatsappFooterLink">${t('chat.whatsappFooterLink', lang)} &rarr;</span>
          </a>
        </div>

        <div class="chat-input-row">
          <textarea
            class="chat-textarea"
            id="chat-textarea"
            rows="1"
            maxlength="${MAX_CHAR_LIMIT}"
            placeholder="${t('chat.placeholder', lang)}"
            aria-label="${t('chat.placeholder', lang)}"
          ></textarea>
          <button type="button" class="chat-btn-send" id="chat-send-btn" aria-label="${t('chat.sendAria', lang)}" disabled>
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>

        <div class="chat-footer-meta">
          <span class="chat-privacy-notice" data-i18n-key="chat.privacyNotice">${t('chat.privacyNotice', lang)}</span>
          <span class="chat-char-counter" id="chat-char-counter"></span>
        </div>
      </div>
    </div>
  `;

  container.appendChild(wrapper);

  // Element Selectors
  const launcher = wrapper.querySelector('#chat-launcher');
  const panel = wrapper.querySelector('#chat-panel');
  const closeBtn = wrapper.querySelector('#chat-close-btn');
  const restartBtn = wrapper.querySelector('#chat-restart-btn');
  const feed = wrapper.querySelector('#chat-feed');
  const textarea = wrapper.querySelector('#chat-textarea');
  const sendBtn = wrapper.querySelector('#chat-send-btn');
  const charCounter = wrapper.querySelector('#chat-char-counter');
  const footerWaLink = wrapper.querySelector('#chat-footer-wa-link');

  // Initial render of messages
  renderMessages();

  // Event Listeners
  launcher.addEventListener('click', () => setOpen(true));
  closeBtn.addEventListener('click', () => setOpen(false));
  restartBtn.addEventListener('click', restartChat);

  textarea.addEventListener('input', () => {
    updateCharCounter();
    autoResizeTextarea();
    const hasText = Boolean(textarea.value.trim());
    sendBtn.disabled = !hasText || isLoading;
    sendBtn.classList.toggle('is-active', hasText && !isLoading);
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        handleUserSend();
      }
    }
  });

  sendBtn.addEventListener('click', () => handleUserSend());

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      setOpen(false);
      launcher.focus();
    }
  });

  // Listen to Language Switch changes
  onLanguageChange((newLang) => {
    lang = newLang;
    updateLanguageStrings();
  });

  function getWhatsAppUrl(currentLang) {
    const text = t('chat.whatsappMessage', currentLang);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function updateLanguageStrings() {
    launcher.setAttribute('aria-label', t('chat.launcherAria', lang));
    panel.setAttribute('aria-label', t('chat.title', lang));
    closeBtn.setAttribute('aria-label', t('chat.closeAria', lang));
    closeBtn.title = t('chat.closeAria', lang);
    restartBtn.setAttribute('aria-label', t('chat.restartAria', lang));
    restartBtn.title = t('chat.restart', lang);
    textarea.placeholder = t('chat.placeholder', lang);
    textarea.setAttribute('aria-label', t('chat.placeholder', lang));
    sendBtn.setAttribute('aria-label', t('chat.sendAria', lang));
    footerWaLink.href = getWhatsAppUrl(lang);

    wrapper.querySelectorAll('[data-i18n-key]').forEach((el) => {
      const key = el.getAttribute('data-i18n-key');
      if (key) el.textContent = t(key, lang);
    });

    // If chat is empty or only has the initial greeting, refresh greeting language
    if (messages.length === 0) {
      renderMessages();
    }
  }

  function setOpen(open) {
    isOpen = open;
    launcher.classList.toggle('is-hidden', isOpen);
    launcher.setAttribute('aria-expanded', String(isOpen));
    panel.classList.toggle('is-open', isOpen);
    panel.setAttribute('aria-hidden', String(!isOpen));

    if (isOpen) {
      setTimeout(() => textarea.focus(), 140);
      scrollToBottom();
    }
  }

  function updateCharCounter() {
    const len = textarea.value.length;
    // Only display counter after 400 characters to keep footer minimal
    if (len >= 400) {
      charCounter.textContent = `${len} / ${MAX_CHAR_LIMIT}`;
      charCounter.classList.toggle('is-warning', len > MAX_CHAR_LIMIT - 30);
    } else {
      charCounter.textContent = '';
      charCounter.classList.remove('is-warning');
    }
  }

  function autoResizeTextarea() {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 92)}px`;
  }

  function scrollToBottom() {
    feed.scrollTop = feed.scrollHeight;
  }

  function loadSessionMessages() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  }

  function saveSessionMessages() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (_) {}
  }

  function restartChat() {
    messages = [];
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    renderMessages();
    textarea.value = '';
    updateCharCounter();
    autoResizeTextarea();
    sendBtn.disabled = true;
    sendBtn.classList.remove('is-active');
    textarea.focus();
  }

  function renderMessages() {
    feed.innerHTML = '';

    const hasUserSentAny = messages.some((m) => m.role === 'user');

    // If no messages in session, show initial greeting + suggestion chips
    if (messages.length === 0) {
      const greetingRow = document.createElement('div');
      greetingRow.className = 'chat-row chat-row--bot';
      greetingRow.innerHTML = `
        <div class="chat-bot-avatar" aria-hidden="true">M</div>
        <div class="chat-bubble">
          <p>${escapeHtml(t('chat.greeting', lang))}</p>
        </div>
      `;
      feed.appendChild(greetingRow);

      // Suggestions chips container (only visible before user sends a message)
      const suggestions = t('chat.suggestions', lang);
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        const suggestionsBox = document.createElement('div');
        suggestionsBox.className = 'chat-suggestions';
        suggestions.forEach((text) => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'chat-chip';
          chip.textContent = text;
          chip.addEventListener('click', () => {
            textarea.value = text;
            updateCharCounter();
            autoResizeTextarea();
            handleUserSend(text);
          });
          suggestionsBox.appendChild(chip);
        });
        feed.appendChild(suggestionsBox);
      }
      return;
    }

    // Render conversation messages
    messages.forEach((msg) => {
      const row = document.createElement('div');
      row.className = `chat-row chat-row--${msg.role === 'user' ? 'user' : 'bot'}`;

      if (msg.role === 'assistant') {
        const avatar = document.createElement('div');
        avatar.className = 'chat-bot-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.textContent = 'M';
        row.appendChild(avatar);
      }

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      bubble.innerHTML = formatMarkdown(msg.content);

      // Prominent WhatsApp CTA only when visitor touches pricing, schedule, or wants to start
      if (msg.role === 'assistant' && msg.suggestWhatsApp) {
        const waBtn = createMessageWhatsAppButton();
        bubble.appendChild(waBtn);
      }

      row.appendChild(bubble);
      feed.appendChild(row);
    });

    scrollToBottom();
  }

  function createMessageWhatsAppButton() {
    const waLink = document.createElement('a');
    waLink.className = 'chat-msg-wa-btn';
    waLink.href = getWhatsAppUrl(lang);
    waLink.target = '_blank';
    waLink.rel = 'noopener noreferrer';
    waLink.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      <span>${t('chat.whatsappBtn', lang)} &rarr;</span>
    `;
    return waLink;
  }

  async function handleUserSend(customText) {
    const text = (customText !== undefined ? customText : textarea.value).trim().slice(0, MAX_CHAR_LIMIT);
    if (!text || isLoading) return;

    // Remove suggestions immediately upon user sending first message
    const suggestionsEl = feed.querySelector('.chat-suggestions');
    if (suggestionsEl) {
      suggestionsEl.remove();
    }

    // Append user message
    messages.push({ role: 'user', content: text });
    saveSessionMessages();
    renderMessages();

    // Reset input
    textarea.value = '';
    updateCharCounter();
    autoResizeTextarea();
    sendBtn.disabled = true;
    sendBtn.classList.remove('is-active');

    // Show gentle bouncing typing indicator
    isLoading = true;
    const typingIndicator = showTypingIndicator();
    scrollToBottom();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          messages: messages.slice(-20),
          lang: lang,
          stream: true
        })
      });

      removeTypingIndicator(typingIndicator);

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json().catch(() => ({}));
          const rateMsg = errorData.reply || t('chat.rateLimitAlert', lang);
          appendAssistantMessage(rateMsg, true);
          return;
        }
        throw new Error(`Server returned error status ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';

      // Check if server is streaming (SSE)
      if (contentType.includes('text/event-stream') && response.body) {
        let accumulatedText = '';
        let suggestWhatsApp = false;

        const row = document.createElement('div');
        row.className = 'chat-row chat-row--bot';

        const avatar = document.createElement('div');
        avatar.className = 'chat-bot-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.textContent = 'M';
        row.appendChild(avatar);

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        row.appendChild(bubble);
        feed.appendChild(row);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.slice(5).trim();
            if (!dataStr || dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                bubble.innerHTML = formatMarkdown(accumulatedText);
                scrollToBottom();
              }
              if (parsed.suggestWhatsApp) {
                suggestWhatsApp = true;
              }
            } catch (_) {}
          }
        }

        if (suggestWhatsApp) {
          bubble.appendChild(createMessageWhatsAppButton());
          scrollToBottom();
        }

        messages.push({
          role: 'assistant',
          content: accumulatedText,
          suggestWhatsApp
        });
        saveSessionMessages();
      } else {
        // Full JSON response fallback
        const data = await response.json();
        const replyText = data.reply || t('chat.errorBusy', lang);
        appendAssistantMessage(replyText, Boolean(data.suggestWhatsApp));
      }
    } catch (err) {
      removeTypingIndicator(typingIndicator);
      appendErrorMessage(t('chat.errorBusy', lang), text);
    } finally {
      isLoading = false;
      const hasText = Boolean(textarea.value.trim());
      sendBtn.disabled = !hasText;
      sendBtn.classList.toggle('is-active', hasText);
    }
  }

  function showTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'chat-row chat-row--bot';
    row.innerHTML = `
      <div class="chat-bot-avatar" aria-hidden="true">M</div>
      <div class="chat-typing" aria-label="${t('chat.typing', lang)}">
        <span class="chat-dot"></span>
        <span class="chat-dot"></span>
        <span class="chat-dot"></span>
      </div>
    `;
    feed.appendChild(row);
    scrollToBottom();
    return row;
  }

  function removeTypingIndicator(indicatorEl) {
    if (indicatorEl && indicatorEl.parentNode) {
      indicatorEl.parentNode.removeChild(indicatorEl);
    }
  }

  function appendAssistantMessage(fullText, suggestWhatsApp = false) {
    const msgObj = {
      role: 'assistant',
      content: fullText,
      suggestWhatsApp
    };
    messages.push(msgObj);
    saveSessionMessages();

    const row = document.createElement('div');
    row.className = 'chat-row chat-row--bot';

    const avatar = document.createElement('div');
    avatar.className = 'chat-bot-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'M';
    row.appendChild(avatar);

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = formatMarkdown(fullText);

    if (suggestWhatsApp) {
      bubble.appendChild(createMessageWhatsAppButton());
    }

    row.appendChild(bubble);
    feed.appendChild(row);
    scrollToBottom();
  }

  function appendErrorMessage(errorText, textToRetry) {
    const row = document.createElement('div');
    row.className = 'chat-row chat-row--bot';

    const avatar = document.createElement('div');
    avatar.className = 'chat-bot-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'M';
    row.appendChild(avatar);

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = `<p>${escapeHtml(errorText)}</p>`;

    // "Coba lagi" retry button
    const retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'chat-btn-retry';
    retryBtn.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
      <span>${t('chat.retryBtn', lang)}</span>
    `;
    retryBtn.addEventListener('click', () => {
      row.remove();
      handleUserSend(textToRetry);
    });

    bubble.appendChild(retryBtn);
    bubble.appendChild(createMessageWhatsAppButton());

    row.appendChild(bubble);
    feed.appendChild(row);
    scrollToBottom();
  }

  // Safe HTML Escape
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Safe markdown subset: bold, italic, safe links, paragraphs, bullet points
  function formatMarkdown(rawText) {
    if (!rawText) return '';
    const safe = escapeHtml(rawText);

    // Links [text](url) - strictly validate http, https, mailto
    const withLinks = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, (match, txt, url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${txt}</a>`;
    });

    // Bold **text**
    const withBold = withLinks.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic *text*
    const withItalic = withBold.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Bullet points
    const lines = withItalic.split('\n');
    let inList = false;
    let formatted = '';

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList) {
          formatted += '<ul>';
          inList = true;
        }
        formatted += `<li>${trimmed.substring(2)}</li>`;
      } else {
        if (inList) {
          formatted += '</ul>';
          inList = false;
        }
        if (trimmed) {
          formatted += `<p>${trimmed}</p>`;
        }
      }
    });

    if (inList) formatted += '</ul>';
    return formatted || `<p>${withItalic}</p>`;
  }

  // Expose global helper for landing page CTA buttons
  window.openManuverChat = (customPrompt) => {
    setOpen(true);
    if (customPrompt && typeof customPrompt === 'string') {
      setTimeout(() => {
        handleUserSend(customPrompt);
      }, 250);
    } else {
      setTimeout(() => {
        textarea.focus();
      }, 150);
    }
  };

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    restart: restartChat
  };
}
