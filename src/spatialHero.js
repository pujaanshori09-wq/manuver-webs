/**
 * ============================================================
 * MANUVER — High-Performance Cinematic Spatial Particle Engine
 * Integrated Hero 3D Visual Experience
 * 60 FPS Optimized GPU Shader with Vector Flow & 3-Layer Depth
 * ============================================================
 */

export class SpatialHero {
  constructor(canvasId = 'hero-particles') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.container = this.canvas.parentElement || document.querySelector('.hero-main');
    this.isMobile = window.innerWidth < 768;

    // Adaptive density based on GPU tier & screen size
    this.particleCount = this.isMobile ? 5500 : 16000;
    this.bokehCount = this.isMobile ? 30 : 70;
    this.dustCount = this.isMobile ? 800 : 2200;
    this.dprCap = 2.0;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Pointer Parallax State
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isPointerActive = false;
    this.lastPointerTime = 0;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Objects & Materials
    this.streamSystem = null;
    this.bokehSystem = null;
    this.dustSystem = null;
    this.streamMaterial = null;

    this.clock = new THREE.Clock();
    this.rafId = null;
    this.isVisible = true;

    this.init();
  }

  init() {
    const width = this.container ? this.container.clientWidth : window.innerWidth;
    const height = this.container ? this.container.clientHeight : window.innerHeight;

    // 1. Scene with Deep Void Fog
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070709, 0.0024);

    // 2. Camera Setup (Wide cinematic view)
    this.camera = new THREE.PerspectiveCamera(52, width / height, 1, 1000);
    this.camera.position.set(0, 0, 140);

    // 3. WebGLRenderer with sRGB output
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.dprCap));
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // 4. Create 3 Spatial Depth Layers
    this.createFluidStream();
    this.createForegroundBokeh();
    this.createDeepVoidDust();

    // 5. Setup Events & Performance Watchers
    this.bindEvents();

    // 6. Start 60 FPS Render Loop
    this.animate();
  }

  /**
   * LAYER 2: Ultra-Fast GPU Harmonic Fluid Vector Stream
   * 60 FPS even on integrated GPUs
   */
  createFluidStream() {
    const count = this.particleCount;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const randomness = new Float32Array(count * 3);
    const phaseOffset = new Float32Array(count);

    // Asymmetric offset: cluster primarily on the right half of the hero on desktop
    const centerOffsetX = this.isMobile ? 0 : 38;
    const radiusX = this.isMobile ? 120 : 135;
    const radiusY = 75;
    const radiusZ = 110;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const u = Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const r = Math.cbrt(u);
      positions[i3] = centerOffsetX + r * radiusX * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * radiusY * Math.sin(phi) * Math.sin(theta) * 0.72;
      positions[i3 + 2] = r * radiusZ * Math.cos(phi) - 15;

      scales[i] = Math.random() * 0.9 + 0.45;
      randomness[i3] = Math.random();
      randomness[i3 + 1] = Math.random();
      randomness[i3 + 2] = Math.random();
      phaseOffset[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phaseOffset, 1));

    // Custom High-Performance Shader
    this.streamMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, this.dprCap) },
        uSpeed: { value: this.reducedMotion ? 0.05 : 0.95 }
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uPixelRatio;
        uniform float uSpeed;

        attribute float aScale;
        attribute vec3 aRandomness;
        attribute float aPhase;

        varying vec3 vColor;
        varying float vAlpha;

        // Ultra-fast 3D Harmonic Fluid Flow Vector Field
        vec3 fluidFlow(vec3 p, float t) {
          float k1 = 0.015;
          float k2 = 0.022;
          float k3 = 0.018;

          float vx = sin(p.y * k1 + t * 0.8) * cos(p.z * k2 + t * 0.6);
          float vy = sin(p.z * k2 + t * 0.9) * cos(p.x * k1 + t * 0.7);
          float vz = sin(p.x * k3 + t * 1.0) * cos(p.y * k2 + t * 0.5);

          // Subtle secondary turbulence octave
          vx += 0.4 * sin(p.z * 0.04 + t * 1.2);
          vy += 0.4 * cos(p.x * 0.04 + t * 1.1);
          vz += 0.4 * sin(p.y * 0.04 + t * 0.9);

          return vec3(vx, vy, vz);
        }

        void main() {
          vec3 pos = position;

          // 1. Organic Fluid Wave Evolution
          float t = uTime * 0.28 * uSpeed + aPhase;
          vec3 flow = fluidFlow(pos, t);
          pos += flow * 22.0;

          // 2. Mouse Deflection Field
          vec2 mouseWorld = uMouse * 65.0;
          float mouseDist = distance(pos.xy, mouseWorld);
          float repelRadius = 45.0;
          if (mouseDist < repelRadius) {
            float repelForce = (1.0 - mouseDist / repelRadius);
            vec2 repelDir = normalize(pos.xy - mouseWorld);
            pos.xy += repelDir * repelForce * 18.0;
            pos.z += repelForce * 14.0;
          }

          // 3. Matrix Projection
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // 4. Distance-based sizing
          float pointSize = (32.0 * aScale * uPixelRatio) / -mvPosition.z;
          gl_PointSize = clamp(pointSize, 2.0, 14.0);

          // 5. Electric Blue & Luminous White Gradient
          float speedRatio = clamp(length(flow) * 0.7, 0.0, 1.0);
          vec3 col = mix(vec3(0.0, 0.45, 1.0), vec3(0.0, 0.95, 1.0), speedRatio);
          if (aRandomness.x > 0.82) {
            col = mix(col, vec3(0.96, 0.98, 1.0), 0.75);
          }

          vColor = col;
          vAlpha = smoothstep(230.0, 45.0, -mvPosition.z) * 0.9;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          float intensity = smoothstep(0.5, 0.04, dist);
          intensity = pow(intensity, 1.3);

          gl_FragColor = vec4(vColor, intensity * vAlpha);
        }
      `
    });

    this.streamSystem = new THREE.Points(geometry, this.streamMaterial);
    this.scene.add(this.streamSystem);
  }

  /**
   * LAYER 1: Foreground Macro Bokeh Discs
   */
  createForegroundBokeh() {
    const count = this.bokehCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 190;
      positions[i3 + 1] = (Math.random() - 0.5) * 110;
      positions[i3 + 2] = Math.random() * 55 + 55;
      scales[i] = Math.random() * 28 + 18;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, this.dprCap) }
      },
      vertexShader: `
        attribute float aScale;
        uniform float uPixelRatio;
        varying float vAlpha;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = (aScale * uPixelRatio * 32.0) / -mvPosition.z;
          vAlpha = clamp(0.14, 0.32, 16.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          float intensity = exp(-dist * dist * 9.0);
          vec3 bokehColor = vec3(0.0, 0.85, 1.0);
          gl_FragColor = vec4(bokehColor, intensity * vAlpha * 0.45);
        }
      `
    });

    this.bokehSystem = new THREE.Points(geometry, material);
    this.scene.add(this.bokehSystem);
  }

  /**
   * LAYER 3: Deep Atmospheric Void Dust
   */
  createDeepVoidDust() {
    const count = this.dustCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 480;
      positions[i3 + 1] = (Math.random() - 0.5) * 340;
      positions[i3 + 2] = -Math.random() * 320 - 90;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x3366cc,
      size: 1.3,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending
    });

    this.dustSystem = new THREE.Points(geometry, material);
    this.scene.add(this.dustSystem);
  }

  bindEvents() {
    this.onPointerMove = (e) => {
      this.isPointerActive = true;
      this.lastPointerTime = performance.now();

      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;

      this.mouse.targetX = nx;
      this.mouse.targetY = ny;
    };

    this.onPointerLeave = () => {
      this.isPointerActive = false;
      this.mouse.targetX = 0;
      this.mouse.targetY = 0;
    };

    this.onResize = () => {
      if (!this.renderer || !this.camera) return;
      const width = this.container ? this.container.clientWidth : window.innerWidth;
      const height = this.container ? this.container.clientHeight : window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.dprCap));

      if (this.streamMaterial) {
        this.streamMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, this.dprCap);
      }
    };

    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });

    // Performance: Pause when tab is not visible
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible && !this.rafId) {
        this.animate();
      }
    }, { passive: true });

    // Performance: Pause when hero is scrolled out of view
    if (window.IntersectionObserver && this.container) {
      const observer = new IntersectionObserver(([entry]) => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !this.rafId) {
          this.animate();
        }
      }, { threshold: 0.05 });
      observer.observe(this.container);
    }
  }

  animate() {
    if (!this.isVisible) {
      this.rafId = null;
      return;
    }

    this.rafId = requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();
    const now = performance.now();

    // Idle decay
    if (this.isPointerActive && now - this.lastPointerTime > 2200) {
      this.mouse.targetX = 0;
      this.mouse.targetY = 0;
    }

    // Smooth Damping (0.06 factor)
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    // Cinematic Parallax Tilt
    const autonomousTiltX = Math.sin(elapsedTime * 0.35) * 0.015;
    const autonomousTiltY = Math.cos(elapsedTime * 0.28) * 0.02;

    this.camera.rotation.y = this.mouse.x * 0.042 + autonomousTiltY;
    this.camera.rotation.x = -this.mouse.y * 0.032 + autonomousTiltX;
    this.camera.position.x = this.mouse.x * 5.0;
    this.camera.position.y = this.mouse.y * 3.5;

    // Shader Uniforms
    if (this.streamMaterial) {
      this.streamMaterial.uniforms.uTime.value = elapsedTime;
      this.streamMaterial.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
    }

    // Subtle ambient drift for background & foreground
    if (this.bokehSystem) {
      this.bokehSystem.rotation.z = elapsedTime * 0.025;
      this.bokehSystem.position.y = Math.sin(elapsedTime * 0.45) * 3.5;
    }
    if (this.dustSystem) {
      this.dustSystem.rotation.y = elapsedTime * 0.01;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Auto-mount on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    new SpatialHero('hero-particles');
  });
}
