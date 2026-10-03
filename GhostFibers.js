/**
 * GhostFibers - Vanilla WebGL2 Implementation
 * Ported directly from React Bits <GhostFibers /> component
 * Features:
 * - Pure WebGL2 (zero dependencies)
 * - Exact GLSL 300 es ray/fiber displacement shader
 * - Low CPU & GPU overhead with DPR control and visibility throttling
 * - Supports dynamic configuration and uniform updates
 */
(function(window) {
  'use strict';

  const hexToRgb = hex => {
    if (!hex) return [1, 1, 1];
    const value = hex.trim().replace(/^#/, '');
    const normalized = value.length === 3 ? value.replace(/./g, c => c + c) : value;
    const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
    if (!match) return [1, 1, 1];
    return [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255];
  };

  const vertexShaderSource = `#version 300 es
  in vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
  `;

  const fragmentShaderSource = `#version 300 es
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uScale;
  uniform float uRotation;
  uniform float uLayers;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequency;
  uniform float uWaveSpeed;
  uniform float uLayerSpeed;
  uniform float uTwist;
  uniform float uTwistFrequency;
  uniform float uTwistSpeed;
  uniform float uLineFrequency;
  uniform float uLineSpacing;
  uniform float uLineSharpness;
  uniform float uGlowFalloff;
  uniform float uGlowIntensity;
  uniform float uBrightness;
  uniform float uBlueBoost;
  uniform float uVignette;
  uniform float uGrain;
  uniform float uRotationSpeed;
  uniform float uLightMode;
  uniform vec3 uLineColor;
  uniform vec3 uGlowColor;

  out vec4 fragColor;

  #define MAX_LAYERS 10

  mat2 rotate2d(float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat2(cosine, -sine, sine, cosine);
  }

  float grainHash(vec2 point) {
    point = floor(point);
    float hash = 52.9829189 * fract(dot(point, vec2(0.065, 0.005)));
    return fract(hash);
  }

  float layeredGrain(vec2 fragmentPixel) {
    vec2 point = mod(fragmentPixel + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
    vec2 rotated = mat2(0.8, -0.5, 0.5, 0.8) * point;
    float grain = 0.0;
    grain += 0.40 * grainHash(rotated);
    grain += 0.25 * grainHash(rotated * 2.0 + 17.0);
    grain += 0.20 * grainHash(rotated * 4.0 + 47.0);
    grain += 0.10 * grainHash(rotated * 8.0 + 113.0);
    grain += 0.05 * grainHash(rotated * 16.0 + 191.0);
    return grain;
  }

  void main() {
    vec2 resolution = max(uResolution, vec2(1.0));
    vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y;
    float time = uTime * uSpeed;
    vec3 backdrop = mix(vec3(0.0), vec3(1.0), step(0.5, uLightMode));
    vec3 centerTone = max(uLineColor * 0.85567 - uGlowColor * 0.06186, vec3(0.0));
    vec3 cloudTone = uLineColor * 0.19588 + uGlowColor * 0.2268;
    vec2 p = uv;
    p /= max(uScale, 0.05);
    p = rotate2d(radians(uRotation) + time * uRotationSpeed) * p;
    vec3 color = vec3(0.0);
    float fiberField = 0.0;

    for (int index = 0; index < MAX_LAYERS; index++) {
      float fi = float(index) + 1.0;
      if (fi > uLayers) break;

      p += uWaveAmplitude * sin(p.yx * fi * uWaveFrequency + time * (uWaveSpeed + fi * uLayerSpeed));

      float radius = length(p);
      float polarAngle = atan(p.y, p.x);
      polarAngle += sin(radius * uTwistFrequency - time * uTwistSpeed + fi) * uTwist;
      p = vec2(cos(polarAngle), sin(polarAngle)) * radius;

      float lines = abs(sin(p.x * (uLineFrequency + fi * uLineSpacing) + sin(p.y * 3.0 + time)));
      lines = pow(max(0.0, 1.0 - lines), uLineSharpness);
      fiberField += lines / fi;
      color += uLineColor * lines / fi;

      float glow = exp(-uGlowFalloff * abs(sin(p.x * 3.0 + time + fi)));
      color += uGlowColor * glow * uGlowIntensity / (fi * 2.0);
    }

    float center = exp(-2.2 * dot(uv, uv));
    color += centerTone * center;

    float cloud = exp(-1.5 * length(uv + vec2(sin(time * 0.3) * 0.25, cos(time * 0.25) * 0.18)));
    color += cloudTone * cloud;

    float vignette = 1.0 - smoothstep(0.35, 1.45, length(uv));
    color *= mix(1.0 - uVignette, 1.0, vignette);
    color = 1.0 - exp(-color * uBrightness);
    color.b *= uBlueBoost;

    vec3 outputColor;
    if (uLightMode > 0.5) {
      float edgeFade = mix(1.0 - uVignette, 1.0, vignette);
      float fibers = pow(smoothstep(0.12, 1.05, fiberField) * edgeFade, 1.5);
      float atmosphere = (center * 0.025 + cloud * 0.015) * edgeFade;
      vec3 fiberInk = mix(backdrop, uLineColor, 0.52);
      vec3 airColor = mix(backdrop, uGlowColor, 0.16);

      outputColor = mix(backdrop, airColor, atmosphere);
      outputColor = mix(outputColor, fiberInk, fibers * 0.3);
    } else {
      outputColor = backdrop + color;
    }

    float noise = (layeredGrain(gl_FragCoord.xy) - 0.5) * uGrain;
    outputColor = clamp(outputColor + noise, 0.0, 1.0);
    fragColor = vec4(outputColor, 1.0);
  }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Shader compilation error: ' + info);
    }
    return shader;
  }

  function createProgram(gl, vSource, fSource) {
    const vShader = createShader(gl, gl.VERTEX_SHADER, vSource);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fSource);
    const program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error('Program link error: ' + info);
    }
    return program;
  }

  class GhostFibersRenderer {
    constructor(canvasOrContainer, options = {}) {
      if (typeof canvasOrContainer === 'string') {
        this.container = document.querySelector(canvasOrContainer);
      } else {
        this.container = canvasOrContainer;
      }

      if (!this.container) {
        console.warn('GhostFibers: target container not found');
        return;
      }

      if (this.container.tagName.toLowerCase() === 'canvas') {
        this.canvas = this.container;
        this.wrapper = this.canvas.parentElement;
      } else {
        this.wrapper = this.container;
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'ghost-fibers-canvas';
        this.wrapper.appendChild(this.canvas);
      }

      this.options = Object.assign({
        lineColor: '#ffffff',
        glowColor: '#ffffff',
        speed: 0.08,
        scale: 2,
        rotation: 0,
        rotationSpeed: 0.25,
        layers: 4,
        waveAmplitude: 0.015,
        waveFrequency: 3,
        waveSpeed: 0.15,
        layerSpeed: 0.08,
        twist: 0.1,
        twistFrequency: 5,
        twistSpeed: 1.2,
        lineFrequency: 5,
        lineSpacing: 2,
        lineSharpness: 16,
        glowFalloff: 10,
        glowIntensity: 1.6,
        brightness: 2,
        blueBoost: 1.25,
        vignette: 0.8,
        grain: 0.05,
        lightMode: false,
        dpr: 1,
        fps: 60,
        paused: false
      }, options);

      try {
        this.gl = this.canvas.getContext('webgl2', {
          alpha: false,
          antialias: false,
          powerPreference: 'high-performance'
        });
      } catch (err) {
        console.warn('GhostFibers: WebGL2 not supported', err);
        return;
      }

      if (!this.gl) {
        console.warn('GhostFibers: WebGL2 context creation failed');
        return;
      }

      this.initGL();
      this.bindEvents();
      this.resize();
      this.start();
    }

    initGL() {
      const gl = this.gl;
      this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
      gl.useProgram(this.program);

      // Fullscreen Triangle: covers [-1, 1] clip space in 1 draw call
      const positions = new Float32Array([
        -1, -1,
         3, -1,
        -1,  3
      ]);
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      const posLoc = gl.getAttribLocation(this.program, 'position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      // Uniform Locations
      this.uniforms = {
        uResolution: gl.getUniformLocation(this.program, 'uResolution'),
        uTime: gl.getUniformLocation(this.program, 'uTime'),
        uSpeed: gl.getUniformLocation(this.program, 'uSpeed'),
        uScale: gl.getUniformLocation(this.program, 'uScale'),
        uRotation: gl.getUniformLocation(this.program, 'uRotation'),
        uRotationSpeed: gl.getUniformLocation(this.program, 'uRotationSpeed'),
        uLayers: gl.getUniformLocation(this.program, 'uLayers'),
        uWaveAmplitude: gl.getUniformLocation(this.program, 'uWaveAmplitude'),
        uWaveFrequency: gl.getUniformLocation(this.program, 'uWaveFrequency'),
        uWaveSpeed: gl.getUniformLocation(this.program, 'uWaveSpeed'),
        uLayerSpeed: gl.getUniformLocation(this.program, 'uLayerSpeed'),
        uTwist: gl.getUniformLocation(this.program, 'uTwist'),
        uTwistFrequency: gl.getUniformLocation(this.program, 'uTwistFrequency'),
        uTwistSpeed: gl.getUniformLocation(this.program, 'uTwistSpeed'),
        uLineFrequency: gl.getUniformLocation(this.program, 'uLineFrequency'),
        uLineSpacing: gl.getUniformLocation(this.program, 'uLineSpacing'),
        uLineSharpness: gl.getUniformLocation(this.program, 'uLineSharpness'),
        uGlowFalloff: gl.getUniformLocation(this.program, 'uGlowFalloff'),
        uGlowIntensity: gl.getUniformLocation(this.program, 'uGlowIntensity'),
        uBrightness: gl.getUniformLocation(this.program, 'uBrightness'),
        uBlueBoost: gl.getUniformLocation(this.program, 'uBlueBoost'),
        uVignette: gl.getUniformLocation(this.program, 'uVignette'),
        uGrain: gl.getUniformLocation(this.program, 'uGrain'),
        uLightMode: gl.getUniformLocation(this.program, 'uLightMode'),
        uLineColor: gl.getUniformLocation(this.program, 'uLineColor'),
        uGlowColor: gl.getUniformLocation(this.program, 'uGlowColor')
      };

      this.updateStaticUniforms();

      this.frameId = 0;
      this.elapsed = 0;
      this.previousTime = performance.now();
      this.lastRenderTime = 0;
      this.isPageVisible = !document.hidden;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    }

    updateStaticUniforms() {
      const gl = this.gl;
      if (!gl || !this.program) return;
      gl.useProgram(this.program);

      const o = this.options;
      const lineColorRgb = hexToRgb(o.lineColor);
      const glowColorRgb = hexToRgb(o.glowColor);

      gl.uniform3f(this.uniforms.uLineColor, lineColorRgb[0], lineColorRgb[1], lineColorRgb[2]);
      gl.uniform3f(this.uniforms.uGlowColor, glowColorRgb[0], glowColorRgb[1], glowColorRgb[2]);
      gl.uniform1f(this.uniforms.uSpeed, o.speed);
      gl.uniform1f(this.uniforms.uScale, o.scale);
      gl.uniform1f(this.uniforms.uRotation, o.rotation);
      gl.uniform1f(this.uniforms.uRotationSpeed, o.rotationSpeed);
      gl.uniform1f(this.uniforms.uLayers, Math.min(Math.max(Math.round(o.layers), 1), 10));
      gl.uniform1f(this.uniforms.uWaveAmplitude, o.waveAmplitude);
      gl.uniform1f(this.uniforms.uWaveFrequency, o.waveFrequency);
      gl.uniform1f(this.uniforms.uWaveSpeed, o.waveSpeed);
      gl.uniform1f(this.uniforms.uLayerSpeed, o.layerSpeed);
      gl.uniform1f(this.uniforms.uTwist, o.twist);
      gl.uniform1f(this.uniforms.uTwistFrequency, o.twistFrequency);
      gl.uniform1f(this.uniforms.uTwistSpeed, o.twistSpeed);
      gl.uniform1f(this.uniforms.uLineFrequency, o.lineFrequency);
      gl.uniform1f(this.uniforms.uLineSpacing, o.lineSpacing);
      gl.uniform1f(this.uniforms.uLineSharpness, o.lineSharpness);
      gl.uniform1f(this.uniforms.uGlowFalloff, o.glowFalloff);
      gl.uniform1f(this.uniforms.uGlowIntensity, o.glowIntensity);
      gl.uniform1f(this.uniforms.uBrightness, o.brightness);
      gl.uniform1f(this.uniforms.uBlueBoost, o.blueBoost);
      gl.uniform1f(this.uniforms.uVignette, o.vignette);
      gl.uniform1f(this.uniforms.uGrain, o.grain);
      gl.uniform1f(this.uniforms.uLightMode, o.lightMode ? 1.0 : 0.0);
    }

    setOptions(newOpts = {}) {
      Object.assign(this.options, newOpts);
      this.updateStaticUniforms();
      this.render();
    }

    resize() {
      if (!this.gl || !this.canvas) return;
      const rect = this.wrapper ? this.wrapper.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      const width = Math.max(1, Math.floor(rect.width || window.innerWidth));
      const height = Math.max(1, Math.floor(rect.height || window.innerHeight));
      const dpr = Math.min(Math.max(this.options.dpr || 1, 0.5), 2);

      this.canvas.width = Math.floor(width * dpr);
      this.canvas.height = Math.floor(height * dpr);
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';

      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.gl.useProgram(this.program);
      this.gl.uniform2f(this.uniforms.uResolution, this.canvas.width, this.canvas.height);

      this.render();
    }

    bindEvents() {
      this.handleResize = () => this.resize();
      window.addEventListener('resize', this.handleResize, { passive: true });

      this.handleVisibility = () => {
        this.isPageVisible = !document.hidden;
        if (this.canAnimate()) {
          this.start();
        } else {
          this.stop();
        }
      };
      document.addEventListener('visibilitychange', this.handleVisibility);

      this.handleMotion = () => {
        if (this.canAnimate()) this.start();
        else {
          this.stop();
          this.render();
        }
      };
      if (this.reducedMotion && this.reducedMotion.addEventListener) {
        this.reducedMotion.addEventListener('change', this.handleMotion);
      }
    }

    canAnimate() {
      return (
        this.isPageVisible &&
        !this.options.paused &&
        !(this.reducedMotion && this.reducedMotion.matches)
      );
    }

    render() {
      if (!this.gl || !this.program || !this.vao) return;
      const gl = this.gl;
      gl.useProgram(this.program);
      gl.bindVertexArray(this.vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    loop(now) {
      this.frameId = 0;
      if (!this.canAnimate()) return;

      const delta = Math.min((now - this.previousTime) / 1000, 0.1);
      this.previousTime = now;
      this.elapsed += delta;

      const targetInterval = 1000 / (this.options.fps || 60);
      if (now - this.lastRenderTime >= targetInterval - 0.5) {
        this.gl.useProgram(this.program);
        this.gl.uniform1f(this.uniforms.uTime, this.elapsed);
        this.render();
        this.lastRenderTime = now;
      }

      this.frameId = requestAnimationFrame(t => this.loop(t));
    }

    start() {
      if (!this.canAnimate() || this.frameId !== 0) return;
      this.previousTime = performance.now();
      this.frameId = requestAnimationFrame(t => this.loop(t));
    }

    stop() {
      if (this.frameId !== 0) {
        cancelAnimationFrame(this.frameId);
        this.frameId = 0;
      }
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this.handleResize);
      document.removeEventListener('visibilitychange', this.handleVisibility);
      if (this.reducedMotion && this.reducedMotion.removeEventListener) {
        this.reducedMotion.removeEventListener('change', this.handleMotion);
      }
      if (this.gl) {
        const ext = this.gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
      if (this.canvas && this.canvas.parentElement) {
        this.canvas.parentElement.removeChild(this.canvas);
      }
    }
  }

  // Export to window
  window.GhostFibersRenderer = GhostFibersRenderer;

  // Auto initialize helper if requested
  window.initGhostFibers = function(targetSelector = '#ghost-fibers-canvas', options = {}) {
    return new GhostFibersRenderer(targetSelector, options);
  };
})(window);
