/**
 * GlassSurface - Vanilla JavaScript Implementation
 * Ported directly from React Bits <GlassSurface /> component
 * Features:
 * - Pure Vanilla JS & SVG Filter
 * - Dynamic SVG displacement map generation for realistic glass refraction
 * - Chromatic aberration (RGB channel separation)
 * - Automatic resize observation and fallback detection
 */
(function(window) {
  'use strict';

  let idCounter = 0;

  function supportsSVGFilters(filterId) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    if (isWebkit || isFirefox) return false;

    const div = document.createElement('div');
    div.style.backdropFilter = `url(#${filterId})`;
    return div.style.backdropFilter !== '';
  }

  class GlassSurface {
    constructor(elementOrSelector, options = {}) {
      this.container = typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;

      if (!this.container) {
        console.warn('GlassSurface: Target element not found');
        return;
      }

      this.id = 'glass-' + (++idCounter) + '-' + Math.random().toString(36).substr(2, 6);
      this.filterId = `glass-filter-${this.id}`;
      this.redGradId = `red-grad-${this.id}`;
      this.blueGradId = `blue-grad-${this.id}`;

      this.options = Object.assign({
        width: 200,
        height: 80,
        borderRadius: 20,
        borderWidth: 0.07,
        brightness: 50,
        opacity: 0.93,
        blur: 11,
        displace: 0,
        backgroundOpacity: 0,
        saturation: 1,
        distortionScale: -180,
        redOffset: 0,
        greenOffset: 10,
        blueOffset: 20,
        xChannel: 'R',
        yChannel: 'G',
        mixBlendMode: 'difference'
      }, options);

      this.init();
    }

    init() {
      const o = this.options;
      this.container.classList.add('glass-surface');

      // Check SVG support
      this.svgSupported = supportsSVGFilters(this.filterId);
      this.container.classList.add(this.svgSupported ? 'glass-surface--svg' : 'glass-surface--fallback');

      // Create filter SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'glass-surface__filter');
      svg.innerHTML = `
        <defs>
          <filter id="${this.filterId}" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage id="feImage-${this.id}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
            <feDisplacementMap id="dispRed-${this.id}" in="SourceGraphic" in2="map" result="dispRed" />
            <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
            <feDisplacementMap id="dispGreen-${this.id}" in="SourceGraphic" in2="map" result="dispGreen" />
            <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
            <feDisplacementMap id="dispBlue-${this.id}" in="SourceGraphic" in2="map" result="dispBlue" />
            <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur id="blur-${this.id}" in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      `;
      this.container.appendChild(svg);

      this.feImage = svg.querySelector(`#feImage-${this.id}`);
      this.dispRed = svg.querySelector(`#dispRed-${this.id}`);
      this.dispGreen = svg.querySelector(`#dispGreen-${this.id}`);
      this.dispBlue = svg.querySelector(`#dispBlue-${this.id}`);
      this.blurEl = svg.querySelector(`#blur-${this.id}`);

      // Apply initial CSS properties
      this.applyStyles();
      this.updateDisplacementMap();

      // Observe resize
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.updateDisplacementMap();
        });
        this.resizeObserver.observe(this.container);
      }
    }

    generateDisplacementMap() {
      const rect = this.container.getBoundingClientRect();
      const actualWidth = Math.max(10, Math.floor(rect.width || 400));
      const actualHeight = Math.max(10, Math.floor(rect.height || 200));
      const edgeSize = Math.min(actualWidth, actualHeight) * (this.options.borderWidth * 0.5);

      const svgContent = `
        <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${this.redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="red"/>
            </linearGradient>
            <linearGradient id="${this.blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0000"/>
              <stop offset="100%" stop-color="blue"/>
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${this.options.borderRadius}" fill="url(#${this.redGradId})" />
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${this.options.borderRadius}" fill="url(#${this.blueGradId})" style="mix-blend-mode: ${this.options.mixBlendMode}" />
          <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${this.options.borderRadius}" fill="hsl(0 0% ${this.options.brightness}% / ${this.options.opacity})" style="filter:blur(${this.options.blur}px)" />
        </svg>
      `;

      return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
    }

    updateDisplacementMap() {
      if (this.feImage) {
        this.feImage.setAttribute('href', this.generateDisplacementMap());
      }
      const o = this.options;
      if (this.dispRed) {
        this.dispRed.setAttribute('scale', (o.distortionScale + o.redOffset).toString());
        this.dispRed.setAttribute('xChannelSelector', o.xChannel);
        this.dispRed.setAttribute('yChannelSelector', o.yChannel);
      }
      if (this.dispGreen) {
        this.dispGreen.setAttribute('scale', (o.distortionScale + o.greenOffset).toString());
        this.dispGreen.setAttribute('xChannelSelector', o.xChannel);
        this.dispGreen.setAttribute('yChannelSelector', o.yChannel);
      }
      if (this.dispBlue) {
        this.dispBlue.setAttribute('scale', (o.distortionScale + o.blueOffset).toString());
        this.dispBlue.setAttribute('xChannelSelector', o.xChannel);
        this.dispBlue.setAttribute('yChannelSelector', o.yChannel);
      }
      if (this.blurEl) {
        this.blurEl.setAttribute('stdDeviation', o.displace.toString());
      }
    }

    applyStyles() {
      const o = this.options;
      if (o.width) {
        this.container.style.width = typeof o.width === 'number' ? `${o.width}px` : o.width;
      }
      if (o.height) {
        this.container.style.height = typeof o.height === 'number' ? `${o.height}px` : o.height;
      }
      if (o.borderRadius) {
        this.container.style.borderRadius = `${o.borderRadius}px`;
      }
      this.container.style.setProperty('--glass-frost', o.backgroundOpacity.toString());
      this.container.style.setProperty('--glass-saturation', o.saturation.toString());
      this.container.style.setProperty('--filter-id', `url(#${this.filterId})`);
    }

    setOptions(newOpts = {}) {
      Object.assign(this.options, newOpts);
      this.applyStyles();
      this.updateDisplacementMap();
    }

    destroy() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      const svg = this.container.querySelector('.glass-surface__filter');
      if (svg) svg.remove();
      this.container.classList.remove('glass-surface', 'glass-surface--svg', 'glass-surface--fallback');
    }
  }

  window.GlassSurface = GlassSurface;
  window.createGlassSurface = function(selector, options) {
    return new GlassSurface(selector, options);
  };
})(window);
