/**
 * ============================================================
 * MANUVER — Cinematic Spatial Particle Experience
 * Engine: Three.js GPU GLSL Curl-Noise Vector Field System
 * Isolated Prototype Component
 * ============================================================
 */

export class SpatialParticleEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {
      particleCount: options.particleCount || (window.innerWidth < 768 ? 4500 : 18000),
      bokehCount: window.innerWidth < 768 ? 25 : 75,
      dustCount: window.innerWidth < 768 ? 800 : 2500,
      dprCap: 2.0,
      ...options
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Spatial Interaction State
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isPointerActive = false;
    this.lastPointerMoveTime = 0;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Performance telemetry
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.onTelemetryUpdate = options.onTelemetryUpdate || null;

    // Meshes & Materials
    this.streamSystem = null;
    this.bokehSystem = null;
    this.dustSystem = null;
    this.streamMaterial = null;

    this.clock = new THREE.Clock();
    this.rafId = null;
    this.isDestroyed = false;

    this.init();
  }

  init() {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    // 1. Scene & Cinematic Fog
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070709, 0.0022);

    // 2. Camera Setup (55 deg FOV, cinematic depth)
    this.camera = new THREE.PerspectiveCamera(55, width / height, 1, 1000);
    this.camera.position.set(0, 0, 140);

    // 3. Renderer with High Dynamic Range & Color Management
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.options.dprCap));
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // 4. Build Layers
    this.createFluidStream();
    this.createForegroundBokeh();
    this.createDeepVoidDust();

    // 5. Event Listeners
    this.bindEvents();

    // 6. Start Render Loop
    this.animate();
  }

  /**
   * LAYER 2: GPU Shader Driven Fluid Vector Field (Core Visual)
   */
  createFluidStream() {
    const count = this.options.particleCount;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const randomness = new Float32Array(count * 3);
    const phaseOffset = new Float32Array(count);

    const radiusX = 140;
    const radiusY = 70;
    const radiusZ = 120;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Elliptical organic volume distribution
      const u = Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const r = Math.cbrt(u);
      positions[i3] = r * radiusX * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * radiusY * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i3 + 2] = r * radiusZ * Math.cos(phi) - 20;

      scales[i] = Math.random() * 0.8 + 0.4;
      randomness[i3] = Math.random();
      randomness[i3 + 1] = Math.random();
      randomness[i3 + 2] = Math.random();
      phaseOffset[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phaseOffset, 1));

    // Custom GLSL Curl-Noise Shader
    this.streamMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, this.options.dprCap) },
        uSpeed: { value: this.reducedMotion ? 0.05 : 0.85 },
        uColorDark: { value: new THREE.Color(0x0033aa) },
        uColorElectric: { value: new THREE.Color(0x00f0ff) },
        uColorWhite: { value: new THREE.Color(0xf4f8ff) }
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

        // Simplex Noise 3D Implementation in GLSL
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        // Curl noise derivation for incompressible fluid flow
        vec3 curlNoise(vec3 p) {
          const float e = 0.05;
          float n1 = snoise(vec3(p.x, p.y + e, p.z));
          float n2 = snoise(vec3(p.x, p.y - e, p.z));
          float n3 = snoise(vec3(p.x, p.y, p.z + e));
          float n4 = snoise(vec3(p.x, p.y, p.z - e));
          float n5 = snoise(vec3(p.x + e, p.y, p.z));
          float n6 = snoise(vec3(p.x - e, p.y, p.z));

          float x = (n1 - n2) - (n3 - n4);
          float y = (n3 - n4) - (n5 - n6);
          float z = (n5 - n6) - (n1 - n2);

          return normalize(vec3(x, y, z));
        }

        void main() {
          vec3 pos = position;

          // 1. Fluid organic curl flow evolution
          float t = uTime * 0.12 * uSpeed + aPhase;
          vec3 flow = curlNoise(pos * 0.012 + vec3(t * 0.3, t * 0.2, t * 0.15));
          pos += flow * 18.0;

          // 2. Mouse deflection & spatial parallax
          vec2 mouseWorld = uMouse * 60.0;
          float mouseDist = distance(pos.xy, mouseWorld);
          float repelRadius = 45.0;
          if (mouseDist < repelRadius) {
            float repelForce = (1.0 - mouseDist / repelRadius);
            vec2 repelDir = normalize(pos.xy - mouseWorld);
            pos.xy += repelDir * repelForce * 16.0;
            pos.z += repelForce * 12.0;
          }

          // 3. Depth & Project Matrix
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // 4. Attenuated point sizing based on camera distance (1/Z)
          float pointSize = (28.0 * aScale * uPixelRatio) / -mvPosition.z;
          gl_PointSize = clamp(pointSize, 1.5, 12.0);

          // 5. Chromatic speed gradient
          float speedRatio = clamp(length(flow), 0.0, 1.0);
          vec3 col = mix(vec3(0.0, 0.4, 0.9), vec3(0.0, 0.94, 1.0), speedRatio);
          if (aRandomness.x > 0.85) {
            col = mix(col, vec3(0.96, 0.98, 1.0), 0.7);
          }

          vColor = col;
          vAlpha = smoothstep(220.0, 40.0, -mvPosition.z) * 0.85;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          // Circular Gaussian alpha falloff
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          float intensity = smoothstep(0.5, 0.05, dist);
          intensity = pow(intensity, 1.4);

          gl_FragColor = vec4(vColor, intensity * vAlpha);
        }
      `
    });

    this.streamSystem = new THREE.Points(geometry, this.streamMaterial);
    this.scene.add(this.streamSystem);
  }

  /**
   * LAYER 1: Foreground Soft Macro Bokeh Discs (Cinematic Defocus)
   */
  createForegroundBokeh() {
    const count = this.options.bokehCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 180;
      positions[i3 + 1] = (Math.random() - 0.5) * 110;
      positions[i3 + 2] = Math.random() * 60 + 50; // Close to camera lens
      scales[i] = Math.random() * 25 + 15;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, this.options.dprCap) }
      },
      vertexShader: `
        attribute float aScale;
        uniform float uPixelRatio;
        varying float vAlpha;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = (aScale * uPixelRatio * 30.0) / -mvPosition.z;
          vAlpha = clamp(0.12, 0.28, 15.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          // Extra soft Gaussian dispersion
          float intensity = exp(-dist * dist * 10.0);
          vec3 bokehColor = vec3(0.0, 0.75, 1.0);
          gl_FragColor = vec4(bokehColor, intensity * vAlpha * 0.45);
        }
      `
    });

    this.bokehSystem = new THREE.Points(geometry, material);
    this.scene.add(this.bokehSystem);
  }

  /**
   * LAYER 3: Deep Atmospheric Void Stardust (Far Background)
   */
  createDeepVoidDust() {
    const count = this.options.dustCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 450;
      positions[i3 + 1] = (Math.random() - 0.5) * 320;
      positions[i3 + 2] = -Math.random() * 300 - 100; // Far deep void
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x4466aa,
      size: 1.2,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    this.dustSystem = new THREE.Points(geometry, material);
    this.scene.add(this.dustSystem);
  }

  bindEvents() {
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);

    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange, { passive: true });
  }

  onPointerMove(e) {
    this.isPointerActive = true;
    this.lastPointerMoveTime = performance.now();

    // Normalized coordinates [-1, 1]
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;

    this.mouse.targetX = nx;
    this.mouse.targetY = ny;
  }

  onPointerLeave() {
    this.isPointerActive = false;
    this.mouse.targetX = 0;
    this.mouse.targetY = 0;
  }

  onResize() {
    if (!this.renderer || !this.camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.options.dprCap));

    if (this.streamMaterial) {
      this.streamMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, this.options.dprCap);
    }
  }

  onVisibilityChange() {
    if (document.hidden) {
      if (this.rafId) cancelAnimationFrame(this.rafId);
    } else {
      this.lastFpsUpdate = performance.now();
      this.animate();
    }
  }

  animate() {
    if (this.isDestroyed) return;

    this.rafId = requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();
    const now = performance.now();

    // 1. Idle Detection & Natural Damping
    if (this.isPointerActive && now - this.lastPointerMoveTime > 2500) {
      this.mouse.targetX = 0;
      this.mouse.targetY = 0;
    }

    // Smooth Interpolation (0.06 damping factor)
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    // 2. Cinematic Camera Parallax (Max ~2.5 deg rotation)
    const autonomousTiltX = Math.sin(elapsedTime * 0.3) * 0.015;
    const autonomousTiltY = Math.cos(elapsedTime * 0.25) * 0.02;

    this.camera.rotation.y = this.mouse.x * 0.045 + autonomousTiltY;
    this.camera.rotation.x = -this.mouse.y * 0.035 + autonomousTiltX;
    this.camera.position.x = this.mouse.x * 6.0;
    this.camera.position.y = this.mouse.y * 4.0;

    // 3. Update GPU Shader Uniforms
    if (this.streamMaterial) {
      this.streamMaterial.uniforms.uTime.value = elapsedTime;
      this.streamMaterial.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
    }

    // 4. Drift Layer 1 & Layer 3 subtly
    if (this.bokehSystem) {
      this.bokehSystem.rotation.z = elapsedTime * 0.02;
      this.bokehSystem.position.y = Math.sin(elapsedTime * 0.4) * 3.0;
    }
    if (this.dustSystem) {
      this.dustSystem.rotation.y = elapsedTime * 0.008;
    }

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);

    // 6. FPS Telemetry Calculation
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      if (this.onTelemetryUpdate) {
        this.onTelemetryUpdate({
          fps: this.fps,
          particles: this.options.particleCount + this.options.bokehCount + this.options.dustCount,
          isPointerActive: this.isPointerActive
        });
      }
    }
  }

  setFlowSpeed(multiplier) {
    if (this.streamMaterial) {
      this.streamMaterial.uniforms.uSpeed.value = multiplier;
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerleave', this.onPointerLeave);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    // Dispose Geometries and Materials
    if (this.streamSystem) {
      this.streamSystem.geometry.dispose();
      this.streamSystem.material.dispose();
      this.scene.remove(this.streamSystem);
    }
    if (this.bokehSystem) {
      this.bokehSystem.geometry.dispose();
      this.bokehSystem.material.dispose();
      this.scene.remove(this.bokehSystem);
    }
    if (this.dustSystem) {
      this.dustSystem.geometry.dispose();
      this.dustSystem.material.dispose();
      this.scene.remove(this.dustSystem);
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }
}
