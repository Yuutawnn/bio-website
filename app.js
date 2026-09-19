/**
 * FRAIL.LOL / SHU BIO APPLICATION LOGIC
 * Boot screen handler, 3D card tilt, Audio player, Tab switching, Social links & Toast
 */

document.addEventListener('DOMContentLoaded', () => {
  const config = window.BIO_CONFIG || {};

  // Device & Performance Capability Detection
  const isTouch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowEndDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                         (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
                         prefersReducedMotion;

  // DOM Elements
  const enterScreen = document.getElementById('enter-screen') || document.getElementById('boot-screen');
  const mainStage = document.getElementById('main-stage');
  const bgVideo = document.getElementById('bg-video');
  const bioCard = document.getElementById('bio-card');
  const toast = document.getElementById('toast-message');
  const toastText = document.getElementById('toast-text');

  // Audio Elements
  const audio = document.getElementById('audio-stream');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const playIcon = document.getElementById('play-icon');
  const prevTrackBtn = document.getElementById('prev-track-btn');
  const nextTrackBtn = document.getElementById('next-track-btn');
  const trackTitleEl = document.getElementById('track-title');
  const trackArtistEl = document.getElementById('track-artist');
  const trackCoverEl = document.getElementById('track-cover');
  const lyricsTrackInfoEl = document.getElementById('lyrics-track-info');
  const currentTimeEl = document.getElementById('current-time');
  const totalDurationEl = document.getElementById('total-duration');
  const progressBarTrack = document.getElementById('progress-bar-container');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressThumb = document.getElementById('progress-thumb');
  const visualizerBars = document.getElementById('visualizer-bars');
  const muteBtn = document.getElementById('mute-btn');
  const volumeIcon = document.getElementById('volume-icon');
  const volumeSlider = document.getElementById('volume-slider');

  // Track & Playlist state
  const playlist = (Array.isArray(config.media?.playlist) && config.media.playlist.length > 0)
    ? config.media.playlist
    : (config.media?.song ? [config.media.song] : [{
        title: "think",
        artist: "plaxz, kelestiial",
        cover: "assets/cover.jpg",
        src: "assets/song.mp3"
      }]);
  const isRandomEnabled = config.media?.random !== false && config.media?.shuffle !== false;
  let currentTrackIndex = (isRandomEnabled && playlist.length > 1)
    ? Math.floor(Math.random() * playlist.length)
    : 0;
  let hasEntered = false;
  let isSeeking = false;
  let previousVolume = 0.6;

  /* ==========================================================================
     1. INITIALIZE DATA FROM CONFIG
     ========================================================================== */
  function initProfileData() {
    const p = config.profile || {};
    const enterCfg = config.enterScreen || config.bootScreen || {};
    const media = config.media || {};

    // Enter Screen Data
    const enterTitleEl = document.getElementById('enter-title');
    if (enterTitleEl && enterCfg.enterPrompt) {
      enterTitleEl.textContent = enterCfg.enterPrompt;
    }
    const enterSubEl = document.getElementById('enter-subtitle');
    if (enterSubEl && enterCfg.subtitle) {
      enterSubEl.textContent = enterCfg.subtitle;
    }

    if (p.avatar) {
      const bootAv = document.getElementById('boot-avatar');
      if (bootAv && bootAv.getAttribute('src') !== p.avatar) bootAv.src = p.avatar;
      const profileAv = document.getElementById('profile-avatar');
      if (profileAv && profileAv.getAttribute('src') !== p.avatar) profileAv.src = p.avatar;
    }

    // Profile Data
    if (p.displayName && document.getElementById('profile-name')) {
      document.getElementById('profile-name').textContent = p.displayName;
    }
    if (p.location && document.getElementById('profile-location')) {
      document.getElementById('profile-location').textContent = p.location;
    }
    const occEl = document.getElementById('profile-occupation');
    if (occEl) {
      if (p.occupation) {
        occEl.textContent = p.occupation;
      } else {
        const item = occEl.closest('.meta-item');
        if (item) item.style.display = 'none';
      }
    }
    // Views counter will be initialized dynamically by initViewCounter()
    if (p.bioText) document.getElementById('profile-bio').textContent = p.bioText.trim();
    const joinedEl = document.getElementById('profile-joined');
    if (joinedEl && p.joinedDate) joinedEl.textContent = p.joinedDate;

    const uidEl = document.getElementById('profile-uid');
    if (uidEl && p.uid) uidEl.textContent = p.uid;

    // Badge styling
    const badgeEl = document.getElementById('premium-badge');
    if (badgeEl) {
      if (p.badge) {
        badgeEl.querySelector('.badge-text').textContent = p.badge.label || 'Premium';
        if (p.badge.color) {
          badgeEl.style.setProperty('--badge-color', p.badge.color);
        }
      } else {
        badgeEl.style.display = 'none';
      }
    }

    // Media & Audio Data
    const initialVol = media.song?.initialVolume !== undefined ? media.song.initialVolume : 0.6;
    audio.volume = initialVol;
    if (volumeSlider) volumeSlider.value = initialVol;
    loadTrack(currentTrackIndex, false);

    // Populate Socials Grid
    renderSocials();
  }

  /* ==========================================================================
     2. RENDER SOCIALS LIST
     ========================================================================== */
  function renderSocials() {
    const list = document.getElementById('socials-list');
    if (!list) return;
    list.innerHTML = '';

    const socials = config.socialLinks || [];
    socials.forEach(item => {
      const isCopy = item.type === 'copy';
      const card = document.createElement(isCopy ? 'button' : 'a');
      card.className = 'social-card-btn';
      card.setAttribute('aria-label', item.platform);

      const tooltip = isCopy 
        ? `${item.platform}: ${item.valueToCopy || item.handle} (${item.hint || 'Click to copy'})` 
        : item.platform;
      card.setAttribute('title', tooltip);

      if (isCopy) {
        card.type = 'button';
        card.addEventListener('click', (e) => {
          e.preventDefault();
          const textToCopy = item.valueToCopy || item.handle;
          navigator.clipboard.writeText(textToCopy).then(() => {
            showToast(`Copied "${textToCopy}" to clipboard!`);
          }).catch(() => {
            showToast(`Username: ${textToCopy}`);
          });
        });
      } else {
        card.href = item.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
      }

      // Render logo only: Roblox SVG or FontAwesome icon
      if (item.id === 'roblox' || item.icon === 'roblox') {
        card.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style="display:block;"><path d="M5.165 0 0 18.835 18.835 24 24 5.165 5.165 0ZM13.88 15.534l-5.654-1.55 1.55-5.654 5.654 1.55-1.55 5.654Z"/></svg>`;
      } else {
        card.innerHTML = `<i class="${item.icon}"></i>`;
      }

      list.appendChild(card);
    });
  }

  /* ==========================================================================
     3. RIPPLE & PULSE ENTER TRANSITION & AUDIO UNLOCK
     ========================================================================== */
  let isEnteringTransition = false;

  function enterExperience() {
    if (hasEntered) return;
    hasEntered = true;
    isEnteringTransition = true;

    // Trigger shockwave burst animation and smooth fade in sync (GPU hardware accelerated)
    if (enterScreen) {
      enterScreen.classList.add('burst');
      requestAnimationFrame(() => {
        enterScreen.classList.add('entered');
      });
    }

    document.body.classList.remove('loading-state');
    document.body.classList.add('unlocked');

    // Start background video only if visible and active
    if (bgVideo && getComputedStyle(bgVideo).display !== 'none') {
      bgVideo.play().catch(e => console.warn("Video autoplay blocked:", e));
    }

    // Start Audio
    if (config.media?.song?.autoplayAfterEnter !== false) {
      audio.play().then(() => {
        setPlayState(true);
      }).catch(err => {
        console.warn("Audio play prevented:", err);
        setPlayState(false);
      });
    }

    // Start Rain Effect on enter
    if (typeof window.startBioRain === 'function') {
      window.startBioRain();
    }

    // Trigger View Counter Reveal count-up animation
    if (typeof window.triggerViewCounterReveal === 'function') {
      window.triggerViewCounterReveal();
    }

    // Remove enter screen from DOM after transition
    setTimeout(() => {
      isEnteringTransition = false;
      if (enterScreen) enterScreen.style.display = 'none';
    }, 650);

    // Allow bio card sequential reveal to play out, then clear animation locks for hover/scale
    setTimeout(() => {
      document.body.classList.add('reveal-done');
      if (bioCard) bioCard.classList.add('reveal-done');
      const activePanel = document.querySelector('.tab-panel.active');
      if (activePanel) activePanel.classList.add('tab-revealed');
      if (typeof window.startAmbientCardMotion === 'function') {
        window.startAmbientCardMotion();
      }
    }, 1300);
  }

  if (enterScreen) {
    enterScreen.addEventListener('click', enterExperience);
  }
  window.addEventListener('keydown', (e) => {
    if (!hasEntered && (e.code === 'Space' || e.code === 'Enter')) {
      enterExperience();
    }
  });

  /* ==========================================================================
     4. 3D CARD TILT & AMBIENT IDLE FLOATING (PHYSICS LERP)
     ========================================================================== */
  if (config.effects?.cardTilt !== false && !isTouch && !prefersReducedMotion) {
    const cardContainer = document.querySelector('.card-perspective-container') || bioCard;
    const isFloatingEnabled = config.effects?.ambientFloating !== false;

    let targetRotX = 0, targetRotY = 0, targetScale = 1, targetTransY = 0;
    let currentRotX = 0, currentRotY = 0, currentScale = 1, currentTransY = 0;
    let isHovered = false;
    let isTiltRunning = false;
    let tiltRafId = null;

    function startTiltLoop() {
      if (!isTiltRunning) {
        isTiltRunning = true;
        tiltRafId = requestAnimationFrame(animateCard);
      }
    }

    // Expose method to resume floating when enter reveal completes
    window.startAmbientCardMotion = () => {
      if (isFloatingEnabled && !isHovered) {
        startTiltLoop();
      }
    };

    // Pause animation when tab is hidden to conserve 100% battery/GPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (tiltRafId) {
          cancelAnimationFrame(tiltRafId);
          tiltRafId = null;
        }
        isTiltRunning = false;
      } else if (hasEntered && !isEnteringTransition && (isFloatingEnabled || isHovered)) {
        startTiltLoop();
      }
    });

    cardContainer.addEventListener('mouseenter', () => {
      if (!hasEntered || isEnteringTransition) return;
      isHovered = true;
      targetScale = 1.025; // Phóng to nhẹ card khi hover theo yêu cầu
      targetTransY = 0;
      startTiltLoop();
    });

    cardContainer.addEventListener('mousemove', (e) => {
      if (!hasEntered || isEnteringTransition) return;
      isHovered = true;

      const rect = bioCard.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      // Mouse distance from card center
      const offsetX = e.clientX - cardCenterX;
      const offsetY = e.clientY - cardCenterY;

      // Limit tilt angle (max +/- 5.5 degrees for elegant gentle tilt)
      const maxAngle = 5.5;
      targetRotX = -(offsetY / (rect.height / 2)) * maxAngle;
      targetRotY = (offsetX / (rect.width / 2)) * maxAngle;
      targetScale = 1.025;
      targetTransY = 0;

      startTiltLoop();
    });

    cardContainer.addEventListener('mouseleave', () => {
      isHovered = false;
      targetScale = 1;
      if (!isFloatingEnabled) {
        targetRotX = 0;
        targetRotY = 0;
        targetTransY = 0;
      }
      startTiltLoop();
    });

    // Buttery-smooth Lerp rendering loop (60-120fps)
    function animateCard() {
      if (!isTiltRunning) return;

      // When not hovering and floating is enabled, follow harmonic zero-gravity orbit
      if (!isHovered && isFloatingEnabled && hasEntered && !isEnteringTransition) {
        const t = performance.now();
        // Gentle vertical bobbing (-6.5px to +6.5px, smooth 5.2s cycle)
        targetTransY = Math.sin(t * 0.0012) * 6.5;
        // Subtle 3D pitch and roll
        targetRotX = Math.sin(t * 0.0009) * 1.5;
        targetRotY = Math.cos(t * 0.00075) * 1.8;
        targetScale = 1;
      }

      // Damping factor 0.055 tạo độ trôi êm ái, chậm rãi, sang trọng
      currentRotX += (targetRotX - currentRotX) * 0.055;
      currentRotY += (targetRotY - currentRotY) * 0.055;
      currentScale += (targetScale - currentScale) * 0.055;
      currentTransY += (targetTransY - currentTransY) * 0.055;

      bioCard.style.transform = `perspective(1000px) translate3d(0, ${currentTransY.toFixed(2)}px, 0) rotateX(${currentRotX.toFixed(3)}deg) rotateY(${currentRotY.toFixed(3)}deg) scale3d(${currentScale.toFixed(4)}, ${currentScale.toFixed(4)}, 1)`;

      // When floating is disabled and mouse is settled, halt rAF loop to drop CPU/GPU usage to 0%
      if (!isFloatingEnabled && !isHovered) {
        const isResting = Math.abs(targetRotX - currentRotX) < 0.002 &&
                          Math.abs(targetRotY - currentRotY) < 0.002 &&
                          Math.abs(targetScale - currentScale) < 0.002 &&
                          Math.abs(targetTransY - currentTransY) < 0.01;

        if (isResting && targetRotX === 0 && targetRotY === 0 && targetScale === 1) {
          currentRotX = 0;
          currentRotY = 0;
          currentScale = 1;
          currentTransY = 0;
          bioCard.style.transform = `perspective(1000px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
          isTiltRunning = false;
          tiltRafId = null;
          return;
        }
      }

      tiltRafId = requestAnimationFrame(animateCard);
    }

    // If page starts already unlocked / entered, start floating immediately
    if (document.body.classList.contains('reveal-done') || !enterScreen) {
      if (isFloatingEnabled) {
        startTiltLoop();
      }
    }
  }

  /* ==========================================================================
     5. TABS SWITCHING (Journal, Socials, Widgets) - SILKY SMOOTH HEIGHT MORPH
     ========================================================================== */
  const tabs = document.querySelectorAll('.nav-tab');
  const panels = document.querySelectorAll('.tab-panel');
  const contentArea = document.querySelector('.tab-content-area');
  let tabTransitionTimer = null;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;
      const targetTab = tab.getAttribute('data-tab');
      const activePanel = document.getElementById(`tab-${targetTab}`);
      if (!activePanel) return;

      // Update active tab button
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      if (contentArea) {
        // Measure start height
        const startHeight = contentArea.offsetHeight;
        contentArea.style.height = `${startHeight}px`;
        contentArea.style.overflow = 'hidden';
        contentArea.style.transition = 'height 0.38s cubic-bezier(0.16, 1, 0.3, 1)';

        // Switch active class on panels
        panels.forEach(panel => {
          panel.classList.remove('active', 'tab-revealed');
        });
        activePanel.classList.add('active');

        // Measure target height after adding active class
        const targetHeight = activePanel.offsetHeight;
        contentArea.style.height = `${targetHeight}px`;

        if (tabTransitionTimer) clearTimeout(tabTransitionTimer);
        tabTransitionTimer = setTimeout(() => {
          contentArea.style.height = 'auto';
          contentArea.style.overflow = 'visible';
          activePanel.classList.add('tab-revealed');
        }, 650);
      } else {
        panels.forEach(panel => panel.classList.remove('active', 'tab-revealed'));
        activePanel.classList.add('active');
        setTimeout(() => activePanel.classList.add('tab-revealed'), 650);
      }
    });
  });

  /* ==========================================================================
     6. AUDIO PLAYER LOGIC
     ========================================================================== */
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function setPlayState(isPlaying) {
    if (isPlaying) {
      playIcon.className = 'fa-solid fa-pause';
      visualizerBars.classList.remove('paused');
    } else {
      playIcon.className = 'fa-solid fa-play';
      visualizerBars.classList.add('paused');
    }
  }

  function loadTrack(index, autoPlay = false) {
    if (!playlist || playlist.length === 0) return;
    currentTrackIndex = (index % playlist.length + playlist.length) % playlist.length;
    const track = playlist[currentTrackIndex];

    if (trackTitleEl) trackTitleEl.textContent = track.title || 'Untitled Track';
    if (trackArtistEl) trackArtistEl.textContent = track.artist || 'Unknown Artist';
    if (trackCoverEl && track.cover) {
      trackCoverEl.src = track.cover;
      trackCoverEl.alt = `${track.title} Cover`;
    }
    if (lyricsTrackInfoEl) {
      lyricsTrackInfoEl.textContent = `${track.title || ''} • ${track.artist || ''}`;
    }

    // Update audio source if changed
    const targetSrc = track.src || track.fallbackSrc || 'assets/song.mp3';
    const isCurrentSrc = audio.src.endsWith(targetSrc) || (audio.currentSrc && audio.currentSrc.endsWith(targetSrc));
    
    if (!isCurrentSrc) {
      audio.src = targetSrc;
      audio.load();
    }
    audio.currentTime = 0;
    if (progressBarFill) progressBarFill.style.width = '0%';
    if (progressThumb) progressThumb.style.left = '0%';
    if (currentTimeEl) currentTimeEl.textContent = "0:00";

    // Reset lyrics state
    currentLyricIndex = -1;
    if (lyricPrevEl) lyricPrevEl.textContent = "";
    if (lyricCurrEl) lyricCurrEl.textContent = track.artist || "";
    if (lyricNextEl) lyricNextEl.textContent = "";

    // Fetch and render lyrics for this track
    if (typeof fetchLyricsForCurrentTrack === 'function') {
      fetchLyricsForCurrentTrack();
    }

    if (autoPlay) {
      audio.play().then(() => {
        setPlayState(true);
      }).catch(err => {
        console.warn("Audio play prevented:", err);
        setPlayState(false);
      });
      showToast(`Now playing: ${track.title}`);
    }
  }

  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => setPlayState(true)).catch(console.error);
    } else {
      audio.pause();
      setPlayState(false);
    }
  });

  if (prevTrackBtn) {
    prevTrackBtn.addEventListener('click', () => {
      loadTrack(currentTrackIndex - 1, true);
    });
  }

  if (nextTrackBtn) {
    nextTrackBtn.addEventListener('click', () => {
      loadTrack(currentTrackIndex + 1, true);
    });
  }

  // Audio source error fallback
  audio.addEventListener('error', () => {
    const track = playlist[currentTrackIndex];
    if (track && track.fallbackSrc && !audio.src.endsWith(track.fallbackSrc)) {
      console.warn("Audio source error, switching to fallback:", track.fallbackSrc);
      audio.src = track.fallbackSrc;
      audio.load();
      if (!audio.paused || hasEntered) {
        audio.play().then(() => setPlayState(true)).catch(console.warn);
      }
    }
  });

  // Time and Progress Update
  audio.addEventListener('timeupdate', () => {
    if (isSeeking) return;
    const current = audio.currentTime;
    const duration = audio.duration || 0;

    currentTimeEl.textContent = formatTime(current);
    if (duration > 0) {
      const progressPercent = (current / duration) * 100;
      progressBarFill.style.width = `${progressPercent}%`;
      progressThumb.style.left = `${progressPercent}%`;
    }

    updateActiveLyric(current);
  });

  audio.addEventListener('loadedmetadata', () => {
    totalDurationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    if (playlist.length > 1) {
      if (isRandomEnabled) {
        // Pick next track without repeating the current one immediately
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentTrackIndex && playlist.length > 1);
        loadTrack(nextIndex, true);
      } else {
        loadTrack(currentTrackIndex + 1, true);
      }
    } else {
      audio.currentTime = 0;
      currentLyricIndex = -1;
      updateActiveLyric(0);
      audio.play().then(() => setPlayState(true)).catch(console.error);
    }
  });

  // Scrubbing on Progress Bar
  function seekToPosition(e) {
    const rect = progressBarTrack.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const seekPercentage = clickX / rect.width;
    if (audio.duration) {
      audio.currentTime = seekPercentage * audio.duration;
      progressBarFill.style.width = `${seekPercentage * 100}%`;
      progressThumb.style.left = `${seekPercentage * 100}%`;
      currentTimeEl.textContent = formatTime(audio.currentTime);
      updateActiveLyric(audio.currentTime);
    }
  }

  progressBarTrack.addEventListener('click', seekToPosition);

  // Volume Controls
  volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    audio.volume = val;
    audio.muted = (val === 0);
    updateVolumeIcon(val);
  });

  muteBtn.addEventListener('click', () => {
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      audio.volume = previousVolume || 0.6;
      volumeSlider.value = audio.volume;
      updateVolumeIcon(audio.volume);
    } else {
      previousVolume = audio.volume;
      audio.muted = true;
      audio.volume = 0;
      volumeSlider.value = 0;
      updateVolumeIcon(0);
    }
  });

  function updateVolumeIcon(vol) {
    if (vol === 0 || audio.muted) {
      volumeIcon.className = 'fa-solid fa-volume-xmark';
    } else if (vol < 0.5) {
      volumeIcon.className = 'fa-solid fa-volume-low';
    } else {
      volumeIcon.className = 'fa-solid fa-volume-high';
    }
  }

  /* ==========================================================================
     6.1 SYNCHRONIZED LYRICS ENGINE (LRCLIB API + REAL-TIME KARAOKE)
     ========================================================================== */
  let parsedLyrics = [];
  let currentLyricIndex = -1;
  const lyricPrevEl = document.getElementById('lyric-prev');
  const lyricCurrEl = document.getElementById('track-lyric-text');
  const lyricNextEl = document.getElementById('lyric-next');
  const lyricBoxEl = document.getElementById('track-lyric-box');
  const lyricsBtn = document.getElementById('lyrics-btn');
  const lyricsPanel = document.getElementById('lyrics-panel');
  const closeLyricsBtn = document.getElementById('close-lyrics-btn');
  const lyricsScrollContainer = document.getElementById('lyrics-scroll-container');

  // Bundled high-accuracy synchronized LRC for "think - plaxz"
  const FALLBACK_THINK_LRC = `[00:09.95] Wake up every day with the thought of being fake
[00:12.44] Cause' you don't want them to see your true self
[00:15.29] You've been in and out my life
[00:16.74] And I really can't decide if I want you to stay
[00:20.61] Call me back, I start to laugh
[00:23.29] The things I'd do to see you again
[00:26.35] Fall right back, back again
[00:28.92] The things I do to see you understand
[00:32.42] You make me lose my mind
[00:34.54] All the days are passing by when I'm with the goddess of time
[00:38.28] Can't help but see you shine
[00:40.14] Every time I see your smile it makes me wanna cry
[00:42.98] Walk past each other friends with the floor
[00:46.34] And somehow you still want an encore
[00:49.04] All my faith, my hope you tore
[00:51.49] Oh, I hear your name when I play a chord
[00:53.99] Oh, I wish you were who I thought you'd be
[00:57.05] Oh, it makes me sick, leave me on my knee
[00:59.74] You keep your smile real for him
[01:02.81] You're eyes just like the ocean, I get lost in the sea
[01:05.33] Oh, when you said that you love me
[01:08.56] You contradict your own words, say it's hard to agree
[01:11.05] Making the same promises to him
[01:14.15] That we're broken just for that one moment
[01:16.80] The tension rise, I'm falling in
[01:19.87] Oh, crushed by your words, with all the lies you're making
[01:22.40] Does she feel so very bad for me?
[01:25.39] Because I was trapped before I could move
[01:28.36] Her laugh makes it feel like that you're meant to be
[01:31.08] But she don't know what a heart is, you're her enemy
[01:33.97] Yet I'd still go let her ruin life
[01:37.62] Cause her love's still true to me
[01:39.12] Your love's the purest to exist
[01:41.67] It overpowers hatred so I'll take a risk
[01:44.56] And I can feel the warmth, when we let our wrists collide
[01:48.24] Take me up to a place where I don't wanna hide
[01:52.16] Wake up every day with the thought of being fake
[01:54.61] Cause' you don't want them to see your true self
[01:57.56] You've been in and out my life
[01:58.88] And I really can't decide
[02:00.36] If I want you to stay`;

  // Bundled high-accuracy synchronized LRC for "foreign girl - lociffer"
  const FALLBACK_FOREIGN_GIRL_LRC = `[00:11.89] I know that you find it terrifying
[00:17.27] Open my wounds, you'll find it petrifying
[00:22.35] Don't know if you're a part of my imagination
[00:25.14] Or if you're stuck inside another nation
[00:27.81] You're a weirdo, you're a bitch
[00:30.55] But we did do well, you know, on stage
[00:33.70] I know that you find it terrifying
[00:39.38] Open my wounds, you'll find it petrifying
[00:44.36] Don't know if you're a part of my imagination
[00:47.18] Or if you're stuck inside another nation
[00:49.74] You're a weirdo, you're a bitch
[00:52.58] But we did do well, you know, on stage
[00:54.86] `;

  function parseLRC(lrcString) {
    if (!lrcString) return [];
    const lines = lrcString.split('\n');
    const result = [];
    const regex = /\[(\d{2}):(\d{2}(?:\.\d+)?)\](.*)/;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const match = line.match(regex);
      if (match) {
        const mins = parseInt(match[1], 10);
        const secs = parseFloat(match[2]);
        const text = match[3].trim();
        if (text) {
          result.push({
            time: mins * 60 + secs,
            text
          });
        }
      }
    }
    return result.sort((a, b) => a.time - b.time);
  }

  function renderLyricsPanel() {
    if (!lyricsScrollContainer) return;
    lyricsScrollContainer.innerHTML = '';

    if (parsedLyrics.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'lyric-line empty';
      empty.textContent = 'Instrumental / No lyrics available';
      lyricsScrollContainer.appendChild(empty);
      return;
    }

    parsedLyrics.forEach((line, index) => {
      const p = document.createElement('p');
      p.className = 'lyric-line';
      p.dataset.index = index;
      p.dataset.time = line.time;
      p.textContent = line.text;

      p.addEventListener('click', () => {
        audio.currentTime = line.time;
        if (audio.paused) {
          audio.play().then(() => setPlayState(true)).catch(console.error);
        }
        updateActiveLyric(line.time);
      });

      lyricsScrollContainer.appendChild(p);
    });
  }

  function updateActiveLyric(currentTime) {
    if (!parsedLyrics || parsedLyrics.length === 0) return;

    let newIndex = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time - 0.15) {
        newIndex = i;
      } else {
        break;
      }
    }

    if (newIndex === currentLyricIndex) return;
    currentLyricIndex = newIndex;

    // 1. Cập nhật 3 hàng lời bài hát thời gian thực (Trước - Đang hát - Tiếp theo)
    if (currentLyricIndex < 0) {
      if (lyricPrevEl) lyricPrevEl.textContent = "";
      if (lyricCurrEl) {
        const track = playlist[currentTrackIndex] || config.media?.song || {};
        lyricCurrEl.textContent = track.artist || "Unknown Artist";
      }
      if (lyricNextEl) {
        lyricNextEl.textContent = parsedLyrics.length > 0 ? parsedLyrics[0].text : "";
      }
    } else {
      // Hàng 1: Câu vừa hát qua (mờ nhẹ)
      if (lyricPrevEl) {
        lyricPrevEl.textContent = currentLyricIndex > 0 
          ? parsedLyrics[currentLyricIndex - 1].text 
          : "";
      }

      // Hàng 2: Câu đang hát (sáng rực rỡ, to đậm)
      if (lyricCurrEl) {
        const targetText = parsedLyrics[currentLyricIndex].text;
        lyricCurrEl.classList.add('changing');
        setTimeout(() => {
          lyricCurrEl.textContent = targetText;
          lyricCurrEl.classList.remove('changing');
        }, 120);
      }

      // Hàng 3: Câu chuẩn bị hát tiếp theo (mờ đón đầu)
      if (lyricNextEl) {
        lyricNextEl.textContent = currentLyricIndex < parsedLyrics.length - 1 
          ? parsedLyrics[currentLyricIndex + 1].text 
          : "";
      }
    }

    // 2. Cuộn bảng lời bài hát toàn màn hình theo câu đang hát
    if (lyricsScrollContainer) {
      const lines = lyricsScrollContainer.querySelectorAll('.lyric-line');
      lines.forEach(line => line.classList.remove('active'));

      if (currentLyricIndex >= 0 && lines[currentLyricIndex]) {
        const activeEl = lines[currentLyricIndex];
        activeEl.classList.add('active');

        if (lyricsPanel && lyricsPanel.classList.contains('open')) {
          scrollActiveLyricToCenter(activeEl, true);
        }
      }
    }
  }

  function scrollActiveLyricToCenter(activeEl, smooth = true) {
    if (!lyricsScrollContainer || !activeEl) return;
    const containerHeight = lyricsScrollContainer.clientHeight;
    const elTop = activeEl.offsetTop;
    const elHeight = activeEl.offsetHeight;
    const targetScroll = elTop - (containerHeight / 2) + (elHeight / 2);

    lyricsScrollContainer.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: smooth ? 'smooth' : 'auto'
    });

    // Ngăn chặn triệt để hiện tượng bio-card bị cuộn lấn lên trên
    if (bioCard && (bioCard.scrollTop !== 0 || bioCard.scrollLeft !== 0)) {
      bioCard.scrollTop = 0;
      bioCard.scrollLeft = 0;
    }
  }

  function toggleLyricsPanel(forceState) {
    if (!lyricsPanel) return;
    const shouldOpen = (typeof forceState === 'boolean') 
      ? forceState 
      : !lyricsPanel.classList.contains('open');

    // Luôn reset vị trí cuộn của thẻ card về 0 tuyệt đối
    if (bioCard) {
      bioCard.scrollTop = 0;
      bioCard.scrollLeft = 0;
    }

    if (shouldOpen) {
      lyricsPanel.classList.add('open');
      lyricsPanel.setAttribute('aria-hidden', 'false');
      if (lyricsBtn) lyricsBtn.classList.add('active');

      setTimeout(() => {
        if (bioCard) {
          bioCard.scrollTop = 0;
          bioCard.scrollLeft = 0;
        }
        if (currentLyricIndex >= 0 && lyricsScrollContainer) {
          const lines = lyricsScrollContainer.querySelectorAll('.lyric-line');
          if (lines[currentLyricIndex]) {
            scrollActiveLyricToCenter(lines[currentLyricIndex], false);
          }
        }
      }, 50);
    } else {
      lyricsPanel.classList.remove('open');
      lyricsPanel.setAttribute('aria-hidden', 'true');
      if (lyricsBtn) lyricsBtn.classList.remove('active');
      if (bioCard) {
        bioCard.scrollTop = 0;
        bioCard.scrollLeft = 0;
      }
    }
  }

  // Khóa cứng không cho bio-card bị cuộn bởi bất kỳ hành vi ngoài ý muốn nào
  if (bioCard) {
    bioCard.addEventListener('scroll', () => {
      if (bioCard.scrollTop !== 0) bioCard.scrollTop = 0;
      if (bioCard.scrollLeft !== 0) bioCard.scrollLeft = 0;
    }, { passive: true });
  }

  if (lyricBoxEl) lyricBoxEl.addEventListener('click', () => toggleLyricsPanel());
  if (lyricPrevEl) {
    lyricPrevEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentLyricIndex > 0 && parsedLyrics[currentLyricIndex - 1]) {
        audio.currentTime = parsedLyrics[currentLyricIndex - 1].time;
        updateActiveLyric(audio.currentTime);
      }
    });
  }
  if (lyricNextEl) {
    lyricNextEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentLyricIndex < parsedLyrics.length - 1 && parsedLyrics[currentLyricIndex + 1]) {
        audio.currentTime = parsedLyrics[currentLyricIndex + 1].time;
        updateActiveLyric(audio.currentTime);
      }
    });
  }
  if (lyricsBtn) lyricsBtn.addEventListener('click', () => toggleLyricsPanel());
  if (closeLyricsBtn) closeLyricsBtn.addEventListener('click', () => toggleLyricsPanel(false));

  let lyricsAbortController = null;

  async function fetchLyricsForCurrentTrack() {
    const track = playlist[currentTrackIndex] || config.media?.song || {};
    const trackId = track.id || "";
    const trackTitle = (track.lyrics?.trackName || track.title || "").trim();
    const trackArtist = (track.lyrics?.artistName || track.artist || "").trim();
    const primaryArtist = trackArtist.split(',')[0].trim();

    // Select correct fallback
    let fallbackLRC = FALLBACK_THINK_LRC;
    if (trackId === 'foreign_girl' || trackTitle.toLowerCase().includes('foreign')) {
      fallbackLRC = FALLBACK_FOREIGN_GIRL_LRC;
    }

    if (lyricsAbortController) {
      lyricsAbortController.abort();
    }
    lyricsAbortController = new AbortController();
    const signal = lyricsAbortController.signal;

    try {
      const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackTitle)}&artist_name=${encodeURIComponent(primaryArtist)}`;
      const timeoutId = setTimeout(() => {
        if (lyricsAbortController) lyricsAbortController.abort();
      }, 4000);

      const res = await fetch(url, {
        signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`LRCLIB HTTP ${res.status}`);
      const data = await res.json();

      if (data && data.syncedLyrics) {
        parsedLyrics = parseLRC(data.syncedLyrics);
      } else if (data && data.plainLyrics) {
        parsedLyrics = data.plainLyrics.split('\n').filter(Boolean).map((text, i) => ({ time: i * 4, text }));
      } else {
        throw new Error("No synced lyrics found");
      }
    } catch (err) {
      parsedLyrics = parseLRC(fallbackLRC);
    }

    renderLyricsPanel();
    updateActiveLyric(audio.currentTime || 0);
  }

  // Alias for backward compatibility
  const fetchLyricsFromLRCLIB = fetchLyricsForCurrentTrack;

  /* ==========================================================================
     7. TOAST NOTIFICATION UTILITY
     ========================================================================== */
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  /* ==========================================================================
     8. INTERACTIVE CANVAS MOUSE EFFECT (RUI2.ONEAPP.DEV SILK RIBBON TRAIL)
     ========================================================================== */
  const isCanvasMouseEnabled = config.effects?.mouseCanvas !== false &&
                               config.effects?.mouseEffect !== 'none';
  const isFollowingDotEnabled = config.effects?.followingDot === true;

  if (isCanvasMouseEnabled && !isTouch && !prefersReducedMotion) {
    (function () {
      const colorHex = config.effects?.mouseCanvasColor || "#ffffff";
      const hex = colorHex.replace('#', '');
      const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16) || 108;
      const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16) || 169;
      const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16) || 245;

      const cursorConfig = {
        debug: true,
        friction: 0.5,
        trails: 20,
        size: 50,
        dampening: 0.2,
        tension: 0.98,
      };

      let canvas = document.getElementById('mouse-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'mouse-canvas';
        canvas.className = 'mouse-canvas';
        document.body.appendChild(canvas);
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let raf = null;
      let segments = [];
      let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      let isMoving = false;
      let idleFrames = 0;

      function Node() {
        this.x = pos.x;
        this.y = pos.y;
        this.vx = 0;
        this.vy = 0;
      }

      function Segment(spring) {
        this.spring = spring + (0.1 * Math.random() - 0.02);
        this.friction = cursorConfig.friction + (0.01 * Math.random() - 0.002);
        this.nodes = [];
        for (let i = 0; i < cursorConfig.size; i++) {
          this.nodes.push(new Node());
        }
      }

      Segment.prototype.update = function () {
        let spring = this.spring;
        const first = this.nodes[0];
        first.vx += (pos.x - first.x) * spring;
        first.vy += (pos.y - first.y) * spring;

        for (let i = 0; i < this.nodes.length; i++) {
          const node = this.nodes[i];
          if (i > 0) {
            const prev = this.nodes[i - 1];
            node.vx += (prev.x - node.x) * spring;
            node.vy += (prev.y - node.y) * spring;
            node.vx += prev.vx * cursorConfig.dampening;
            node.vy += prev.vy * cursorConfig.dampening;
          }
          node.vx *= this.friction;
          node.vy *= this.friction;
          node.x += node.vx;
          node.y += node.vy;
          spring *= cursorConfig.tension;
        }
      };

      Segment.prototype.draw = function () {
        let mx, my;
        const first = this.nodes[0];
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);

        for (let i = 1; i < this.nodes.length - 2; i++) {
          const cur = this.nodes[i];
          const next = this.nodes[i + 1];
          mx = 0.5 * (cur.x + next.x);
          my = 0.5 * (cur.y + next.y);
          ctx.quadraticCurveTo(cur.x, cur.y, mx, my);
        }

        const secondLast = this.nodes[this.nodes.length - 2];
        const last = this.nodes[this.nodes.length - 1];
        ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
        ctx.stroke();
        ctx.closePath();
      };

      function resize() {
        if (canvas && ctx) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
      }

      function loop() {
        if (ctx.running) {
          ctx.globalCompositeOperation = "source-over";
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.22)`;
          ctx.lineWidth = 1;
          for (let i = 0; i < segments.length; i++) {
            segments[i].update();
            segments[i].draw();
          }
          raf = window.requestAnimationFrame(loop);
        }
      }

      function firstMouseMove(e) {
        function track(e) {
          pos.x = e.clientX;
          pos.y = e.clientY;
        }

        document.removeEventListener("mousemove", firstMouseMove);
        document.removeEventListener("touchstart", firstMouseMove);

        document.addEventListener("mousemove", track, { passive: true });
        document.addEventListener("touchmove", (ev) => {
          if (ev.touches && ev.touches.length === 1) {
            pos.x = ev.touches[0].pageX;
            pos.y = ev.touches[0].pageY;
          }
        }, { passive: true });

        track(e);

        segments = [];
        for (let i = 0; i < cursorConfig.trails; i++) {
          segments.push(new Segment(0.4 + (i / cursorConfig.trails) * 0.025));
        }
        loop();
      }

      canvas.style.top = "0px";
      canvas.style.left = "0px";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "999998";
      canvas.style.position = "fixed";

      ctx.running = true;

      document.addEventListener("mousemove", firstMouseMove, { passive: true });
      document.addEventListener("touchstart", firstMouseMove, { passive: true });
      window.addEventListener("resize", resize, { passive: true });

      window.addEventListener("focus", function () {
        if (!ctx.running) {
          ctx.running = true;
          loop();
        }
      });
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          ctx.running = false;
          if (raf) {
            cancelAnimationFrame(raf);
            raf = null;
          }
        } else {
          if (!ctx.running) {
            ctx.running = true;
            loop();
          }
        }
      });

      resize();
    })();
  }

  // Fallback / optional following dot (if user explicitly turns on followingDot: true)
  if (isFollowingDotEnabled && !isTouch) {
    const cursorDot = document.getElementById('cursor-dot');
    if (cursorDot) {
      cursorDot.style.display = 'block';
      let mouseX = -100, mouseY = -100;
      let dotX = -100, dotY = -100;
      let isVisible = false;
      let isDotAnimating = false;
      let dotRafId = null;

      function startDotLoop() {
        if (!isDotAnimating && isVisible) {
          isDotAnimating = true;
          dotRafId = requestAnimationFrame(animateDot);
        }
      }

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isVisible) {
          isVisible = true;
          cursorDot.style.opacity = '1';
          dotX = mouseX;
          dotY = mouseY;
          cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
        }

        startDotLoop();
      }, { passive: true });

      document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        isVisible = false;
        isDotAnimating = false;
        if (dotRafId) {
          cancelAnimationFrame(dotRafId);
          dotRafId = null;
        }
      });

      document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        isVisible = true;
        startDotLoop();
      });

      function animateDot() {
        if (!isVisible || !isDotAnimating) return;

        dotX += (mouseX - dotX) * 0.16;
        dotY += (mouseY - dotY) * 0.16;
        cursorDot.style.transform = `translate3d(${dotX.toFixed(2)}px, ${dotY.toFixed(2)}px, 0) translate(-50%, -50%)`;

        if (Math.abs(mouseX - dotX) < 0.25 && Math.abs(mouseY - dotY) < 0.25) {
          dotX = mouseX;
          dotY = mouseY;
          cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
          isDotAnimating = false;
          dotRafId = null;
          return;
        }

        dotRafId = requestAnimationFrame(animateDot);
      }
    }
  } else {
    const cursorDot = document.getElementById('cursor-dot');
    if (cursorDot) cursorDot.style.display = 'none';
  }

  /* ==========================================================================
     9. REAL-TIME DISCORD PRESENCE SYNC (LANYARD API)
     ========================================================================== */
  function initDiscordSync() {
    const discordCfg = config.widgets?.discord || config.widgets?.discordPresence || {};
    const userId = (discordCfg.userId || "").trim();

    const avatarEl = document.getElementById('discord-avatar');
    const displayNameEl = document.getElementById('discord-display-name');
    const usernameEl = document.getElementById('discord-username');
    const clanPill = document.getElementById('discord-clan-pill');
    const badgesContainer = document.getElementById('discord-badges-list');
    const statusDot = document.getElementById('discord-status-dot');
    const statusLabel = document.getElementById('discord-status-label');
    const customStatusEl = document.getElementById('discord-custom-status');
    const activityEl = document.getElementById('discord-activity');

    // Bảng từ điển huy hiệu Discord chính thức (Khớp 100% tài khoản của bạn)
    const DISCORD_BADGES_MAP = {
      // 1. Evolving Nitro Subscriber
      nitro: { id: 'nitro', name: 'Discord Nitro Subscriber', icon: 'assets/badges/nitro_evolving.png' },
      nitro_diamond: { id: 'nitro_diamond', name: 'Discord Nitro Diamond', icon: 'assets/badges/nitro_diamond.png' },
      nitro_classic: { id: 'nitro_classic', name: 'Discord Nitro', icon: 'assets/badges/nitro.svg' },

      // 2. HypeSquad
      bravery: { id: 'bravery', name: 'HypeSquad Bravery', icon: 'assets/badges/bravery.svg' },
      brilliance: { id: 'brilliance', name: 'HypeSquad Brilliance', icon: 'assets/badges/brilliance.svg' },
      balance: { id: 'balance', name: 'HypeSquad Balance', icon: 'assets/badges/balance.svg' },
      hypesquad_event: { id: 'hypesquad_event', name: 'HypeSquad Events Coordinator', icon: 'assets/badges/hypesquad_event.svg' },

      // 3. Server Booster
      boost: { id: 'boost', name: 'Server Booster (24 Months Diamond)', icon: 'assets/badges/boost_24_months.png' },
      boost_24m: { id: 'boost_24m', name: 'Server Booster (24 Months Diamond)', icon: 'assets/badges/boost_24_months.png' },
      boost_1m: { id: 'boost_1m', name: 'Server Booster (1 Month)', icon: 'assets/badges/boost_1m.svg' },
      boost_2m: { id: 'boost_2m', name: 'Server Booster (2 Months)', icon: 'assets/badges/boost_2m.svg' },
      boost_3m: { id: 'boost_3m', name: 'Server Booster (3 Months)', icon: 'assets/badges/boost_3m.svg' },
      boost_6m: { id: 'boost_6m', name: 'Server Booster (6 Months)', icon: 'assets/badges/boost_6m.svg' },
      boost_9m: { id: 'boost_9m', name: 'Server Booster (9 Months)', icon: 'assets/badges/boost_9m.svg' },

      // 4. Originally Known As (Legacy Username)
      legacy_username: { id: 'legacy_username', name: 'Originally known as (Legacy Username)', icon: 'assets/badges/originally_known_as.png' },
      originally_known_as: { id: 'originally_known_as', name: 'Originally known as (Legacy Username)', icon: 'assets/badges/originally_known_as.png' },

      // 5. Completed a Quest
      quest: { id: 'quest', name: 'Completed a Quest (Discord Quests)', icon: 'assets/badges/complete_a_quest.png' },
      complete_a_quest: { id: 'complete_a_quest', name: 'Completed a Quest (Discord Quests)', icon: 'assets/badges/complete_a_quest.png' },

      // 6. The Last Meadow Online (Green Leaf)
      last_meadow: { id: 'last_meadow', name: 'The Last Meadow Online', icon: 'assets/badges/last_meadow.png' },
      leaf: { id: 'leaf', name: 'The Last Meadow Online', icon: 'assets/badges/last_meadow.png' },

      // 7. Orbs Apprentice
      orbs: { id: 'orbs', name: 'Orbs Apprentice', icon: 'assets/badges/orbs_apprentice.png' },
      orbs_apprentice: { id: 'orbs_apprentice', name: 'Orbs Apprentice', icon: 'assets/badges/orbs_apprentice.png' },

      // 8. Passionate Gifter
      gifting: { id: 'gifting', name: 'Passionate Gifter (Luminary)', icon: 'assets/badges/gifting_luminary.png' },
      gifting_luminary: { id: 'gifting_luminary', name: 'Passionate Gifter (Luminary)', icon: 'assets/badges/gifting_luminary.png' },
      gifting_legend: { id: 'gifting_legend', name: 'Passionate Gifter (Legend)', icon: 'assets/badges/gifting_legend.png' },

      // Developers & Staff
      active_developer: { id: 'active_developer', name: 'Active Developer', icon: 'assets/badges/active_developer.png' },
      developer: { id: 'developer', name: 'Verified Bot Developer', icon: 'assets/badges/developer.svg' },
      early_supporter: { id: 'early_supporter', name: 'Early Supporter', icon: 'assets/badges/early_supporter.svg' },
      bug_hunter_1: { id: 'bug_hunter_1', name: 'Bug Hunter Level 1', icon: 'assets/badges/bug_hunter_1.svg' },
      bug_hunter_2: { id: 'bug_hunter_2', name: 'Bug Hunter Level 2', icon: 'assets/badges/bug_hunter_2.svg' },
      partner: { id: 'partner', name: 'Partnered Server Owner', icon: 'assets/badges/partner.svg' },
      staff: { id: 'staff', name: 'Discord Staff', icon: 'assets/badges/staff.svg' }
    };

    function renderBadges(badgeIds) {
      if (!badgesContainer) return;
      badgesContainer.innerHTML = '';
      if (!badgeIds || badgeIds.length === 0) {
        badgesContainer.style.display = 'none';
        return;
      }

      badgeIds.forEach(id => {
        const badge = DISCORD_BADGES_MAP[id];
        if (!badge) return;
        const item = document.createElement('div');
        item.className = 'discord-badge-item';
        item.setAttribute('title', badge.name);
        item.setAttribute('aria-label', badge.name);

        const img = document.createElement('img');
        img.src = badge.icon;
        img.alt = badge.name;
        img.className = 'discord-badge-icon';
        img.loading = 'lazy';
        img.decoding = 'async';

        item.appendChild(img);
        badgesContainer.appendChild(item);
      });
      badgesContainer.style.display = 'inline-flex';
    }

    function renderClan(primaryGuild) {
      if (!clanPill) return;
      if (primaryGuild && primaryGuild.tag) {
        clanPill.innerHTML = '';
        if (primaryGuild.badge) {
          const iconUrl = primaryGuild.badge.startsWith('http') 
            ? primaryGuild.badge 
            : `https://cdn.discordapp.com/clan-badges/${primaryGuild.identity_guild_id}/${primaryGuild.badge}.png?size=32`;
          const icon = document.createElement('img');
          icon.src = iconUrl;
          icon.alt = '';
          icon.className = 'discord-clan-icon';
          clanPill.appendChild(icon);
        }
        const tagText = document.createElement('span');
        tagText.textContent = primaryGuild.tag;
        clanPill.appendChild(tagText);
        clanPill.setAttribute('title', `Guild Clan: ${primaryGuild.tag}`);
        clanPill.style.display = 'inline-flex';
      } else {
        clanPill.style.display = 'none';
      }
    }

    // Fallback data
    const fb = discordCfg.fallback || {};
    if (fb.username && usernameEl) usernameEl.textContent = `@${fb.username}`;
    if (fb.displayName && displayNameEl) displayNameEl.textContent = fb.displayName;
    if (fb.customStatus && customStatusEl) customStatusEl.textContent = fb.customStatus;
    if (fb.clan) renderClan(fb.clan);
    if (fb.badges) renderBadges(fb.badges);

    // Cache để tránh swap avatar / re-render socials khi dữ liệu không đổi
    // (PRESENCE_UPDATE bắn liên tục — mỗi lần set src + rebuild DOM là avatar chớp/khựng)
    let lastDiscordAvatarUrl = null;
    let lastDiscordUsername = null;

    if (!userId || userId === "YOUR_DISCORD_USER_ID") {
      console.log("Discord Sync: Chưa cấu hình Discord User ID trong config.js. Đang sử dụng dữ liệu mặc định.");
      return;
    }

    function updateDiscordUI(data) {
      if (!data) return;
      const user = data.discord_user;
      const status = data.discord_status; // "online" | "idle" | "dnd" | "offline"
      const activities = data.activities || [];
      const spotify = data.spotify;

      // 1. Avatar (hỗ trợ cả ảnh GIF động nếu có Nitro)
      // Chỉ swap khi hash avatar thật sự đổi — tránh preload + set src liên tục gây chớp/khựng
      if (user && user.avatar) {
        const isGif = user.avatar.startsWith('a_');
        const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${isGif ? 'gif' : 'png'}?size=128`;

        if (avatarUrl !== lastDiscordAvatarUrl) {
          lastDiscordAvatarUrl = avatarUrl;
          // Preload ảnh mới trước khi swap để tránh ghost/nhấp nháy avatar cũ
          const preloader = new Image();
          preloader.decoding = 'async';
          preloader.onload = () => {
            if (avatarEl && avatarEl.src !== avatarUrl) avatarEl.src = avatarUrl;
            if (discordCfg.syncMainAvatarAndStatus) {
              const profileAv = document.getElementById('profile-avatar');
              if (profileAv && profileAv.src !== avatarUrl) profileAv.src = avatarUrl;
            }
          };
          preloader.src = avatarUrl;
        }
      }

      // 2. Display Name, Username, Clan Tag & Badges
      if (user) {
        if (displayNameEl) displayNameEl.textContent = user.global_name || user.username;
        if (usernameEl) usernameEl.textContent = `@${user.username}`;

        // Clan Tag
        renderClan(user.primary_guild);

        // Badges: Phân tích bitwise từ public_flags của Discord
        const flags = Number(user.public_flags) || 0;
        const autoFlags = [];
        if (flags & (1 << 0)) autoFlags.push('staff');
        if (flags & (1 << 1)) autoFlags.push('partner');
        if (flags & (1 << 2)) autoFlags.push('hypesquad_event');
        if (flags & (1 << 3)) autoFlags.push('bug_hunter_1');
        if (flags & (1 << 6)) autoFlags.push('bravery');
        if (flags & (1 << 7)) autoFlags.push('brilliance');
        if (flags & (1 << 8)) autoFlags.push('balance');
        if (flags & (1 << 9)) autoFlags.push('early_supporter');
        if (flags & (1 << 14)) autoFlags.push('bug_hunter_2');
        if (flags & (1 << 17)) autoFlags.push('developer');
        if (flags & (1 << 22)) autoFlags.push('active_developer');

        const badgeSet = new Set();
        const cfgBadges = Array.isArray(discordCfg.badges) ? discordCfg.badges : ['auto'];
        cfgBadges.forEach(b => {
          if (b === 'auto') {
            autoFlags.forEach(af => badgeSet.add(af));
          } else if (DISCORD_BADGES_MAP[b]) {
            badgeSet.add(b);
          }
        });
        renderBadges(Array.from(badgeSet));

        // Chỉ re-render Socials khi username thật sự đổi — tránh rebuild DOM mỗi presence update
        if (user.username !== lastDiscordUsername) {
          lastDiscordUsername = user.username;
          const socials = config.socialLinks || [];
          const discordSocial = socials.find(s => s.id === 'discord');
          if (discordSocial) {
            discordSocial.valueToCopy = user.username;
            discordSocial.handle = user.username;
            renderSocials();
          }
        }
      }

      // 3. Status (Online, Idle, DND, Offline)
      if (status) {
        const statusMap = {
          online: "Online",
          idle: "Idle / AFK",
          dnd: "Do Not Disturb",
          offline: "Offline"
        };

        if (statusDot) statusDot.className = `status-indicator-dot ${status}`;
        if (statusLabel) statusLabel.textContent = statusMap[status] || "Offline";

        if (discordCfg.syncMainAvatarAndStatus) {
          const mainOnlineDot = document.querySelector('.online-status-dot');
          if (mainOnlineDot) {
            mainOnlineDot.className = `online-status-dot ${status}`;
          }
        }
      }

      // 4. Custom Status (Activity type 4)
      const customActivity = activities.find(a => a.type === 4);
      if (customStatusEl) {
        if (customActivity && (customActivity.state || customActivity.emoji)) {
          const emoji = customActivity.emoji?.name ? `${customActivity.emoji.name} ` : "";
          customStatusEl.textContent = `"${emoji}${customActivity.state || ""}"`;
          customStatusEl.style.display = 'block';
        } else {
          customStatusEl.style.display = 'none';
        }
      }

      // 5. Activity (Spotify hoặc Game đang chơi)
      if (activityEl) {
        if (data.listening_to_spotify && spotify) {
          activityEl.innerHTML = `<i class="fa-brands fa-spotify spotify-icon"></i> Listening to <strong>${spotify.song}</strong> - ${spotify.artist}`;
          activityEl.className = 'widget-activity spotify-live';
          activityEl.style.display = 'flex';
        } else {
          const gameActivity = activities.find(a => a.type !== 4);
          if (gameActivity) {
            const actName = gameActivity.name || "a game";
            const actDetails = gameActivity.details ? ` (${gameActivity.details})` : "";
            activityEl.innerHTML = `<i class="fa-solid fa-gamepad game-icon"></i> Playing <strong>${actName}</strong>${actDetails}`;
            activityEl.className = 'widget-activity game-live';
            activityEl.style.display = 'flex';
          } else if (status === 'offline') {
            activityEl.innerHTML = `<i class="fa-regular fa-moon"></i> Currently Offline`;
            activityEl.className = 'widget-activity offline';
            activityEl.style.display = 'flex';
          } else {
            activityEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Chilling on Discord`;
            activityEl.className = 'widget-activity chilling';
            activityEl.style.display = 'flex';
          }
        }
      }
    }

    // Bước 1: Gọi REST API lấy dữ liệu tức thì
    fetch(`https://api.lanyard.rest/v1/users/${userId}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          updateDiscordUI(json.data);
        }
      })
      .catch(err => console.warn("Lanyard REST error:", err));

    // Bước 2: Kết nối WebSocket để cập nhật Real-time
    let ws = null;
    let heartbeatInterval = null;

    function connectWebSocket() {
      try {
        ws = new WebSocket("wss://api.lanyard.rest/socket");

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          const { op, d, t } = message;

          if (op === 1) { // Hello opcode
            heartbeatInterval = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ op: 3 }));
              }
            }, d.heartbeat_interval);

            // Subscribe user presence
            ws.send(JSON.stringify({
              op: 2,
              d: { subscribe_to_id: userId }
            }));
          } else if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
            updateDiscordUI(d);
          }
        };

        ws.onclose = () => {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          setTimeout(connectWebSocket, 5000); // Tự động kết nối lại sau 5s
        };

        ws.onerror = (err) => {
          console.warn("Lanyard WS error:", err);
          ws.close();
        };
      } catch (e) {
        console.warn("WebSocket init error:", e);
      }
    }

    connectWebSocket();
  }

  /* ==========================================================================
     9b. ROBLOX PROFILE WIDGET SYNC (AUTO PARSE LINK & CDN THUMBNAIL)
     ========================================================================== */
  function initRobloxWidget() {
    const robloxCfg = config.widgets?.roblox;
    const cardEl = document.getElementById('roblox-widget-card');
    if (!robloxCfg || robloxCfg.enabled === false) {
      if (cardEl) cardEl.style.display = 'none';
      return;
    }

    const profileLinkEl = document.getElementById('roblox-profile-link');
    const avatarEl = document.getElementById('roblox-avatar');
    const displayNameEl = document.getElementById('roblox-display-name');
    const usernameEl = document.getElementById('roblox-username');
    const bioEl = document.getElementById('roblox-bio');
    const metaEl = document.getElementById('roblox-meta-text');
    const copyBtn = document.getElementById('roblox-copy-btn');

    // 1. Tự động trích xuất User ID và Username từ link profile (profileUrl)
    let rawUrl = (robloxCfg.profileUrl || "").trim();
    let userId = (robloxCfg.userId || "").toString().trim();
    let username = (robloxCfg.username || "").trim();
    let displayName = (robloxCfg.displayName || username || "Roblox User").trim();
    let bioText = (robloxCfg.description || "").trim();
    let joinDate = (robloxCfg.joinDate || "").trim();
    let avatarSrc = robloxCfg.avatar || "assets/roblox_avatar.png";

    // Phân tích link Roblox nếu được cung cấp (ví dụ: https://www.roblox.com/users/4282487160/profile)
    if (rawUrl) {
      const idMatch = rawUrl.match(/(?:users\/|id=)(\d+)/i);
      if (idMatch && idMatch[1]) {
        userId = idMatch[1];
      }
      const userMatch = rawUrl.match(/profile\?username=([a-zA-Z0-9_]+)/i);
      if (userMatch && userMatch[1]) {
        username = userMatch[1];
      }
    }

    // Hoàn thiện URL trang cá nhân chuẩn
    const finalProfileUrl = userId 
      ? `https://www.roblox.com/users/${userId}/profile` 
      : (rawUrl || (username ? `https://www.roblox.com/users/profile?username=${username}` : "https://www.roblox.com"));

    // 2. Hiển thị thông tin lên giao diện
    if (profileLinkEl) {
      profileLinkEl.href = finalProfileUrl;
    }
    if (displayNameEl) {
      displayNameEl.textContent = displayName;
    }
    if (usernameEl) {
      usernameEl.textContent = `@${username}`;
    }
    if (bioEl) {
      if (bioText) {
        bioEl.textContent = `"${bioText}"`;
        bioEl.style.display = 'block';
      } else {
        bioEl.style.display = 'none';
      }
    }
    if (metaEl) {
      const parts = [];
      if (joinDate) parts.push(`Joined ${joinDate}`);
      if (userId) parts.push(`ID: ${userId}`);
      metaEl.textContent = parts.length > 0 ? parts.join(" • ") : "Active Roblox Player";
    }
    if (avatarEl) {
      avatarEl.src = avatarSrc;
    }

    // 3. Sao chép username khi nhấp nút copy hoặc click vào username tag
    function copyRobloxName(e) {
      e?.stopPropagation();
      if (!username) return;
      navigator.clipboard.writeText(username).then(() => {
        showToast(`Copied Roblox: ${username}`);
      }).catch(() => {
        showToast(`Roblox: ${username}`);
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', copyRobloxName);
    }
    if (usernameEl) {
      usernameEl.style.cursor = 'pointer';
      usernameEl.title = 'Click to copy username';
      usernameEl.addEventListener('click', copyRobloxName);
    }

    // 4. Tự động đồng bộ hóa Avatar & Thông tin mới nhất từ API Roblox
    if (userId) {
      const headshotApi = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`;
      const proxyUrls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(headshotApi)}`,
        `https://corsproxy.io/?${encodeURIComponent(headshotApi)}`
      ];

      async function syncLiveAvatar() {
        for (const pUrl of proxyUrls) {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3500);
            const res = await fetch(pUrl, { signal: controller.signal, cache: 'no-cache' });
            clearTimeout(timer);
            if (!res.ok) continue;
            const data = await res.json();
            if (data?.data?.[0]?.imageUrl && avatarEl) {
              avatarEl.src = data.data[0].imageUrl;
              break;
            }
          } catch (err) {
            // Fallback an toàn tới ảnh assets/roblox_avatar.png cục bộ đã được cập nhật
          }
        }
      }

      syncLiveAvatar();
    }
  }

  /* ==========================================================================
     10. AESTHETIC MONOCHROME RAIN EFFECT (RETINA & LOW-END ADAPTIVE CANVAS)
     ========================================================================== */
  function initRainEffect() {
    if (config.effects?.rain === false || prefersReducedMotion) return;
    const canvas = document.getElementById('rain-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rainRafId = null;
    let isPageVisible = !document.hidden;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      // High-End: 2x DPR for crisp retina rendering. Low-End / Mobile: 1x DPR to save fill-rate
      dpr = isLowEndDevice ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Low-end / mobile: 32-48 drops; High-end desktop: 120-160 drops
    const baseDropCount = isLowEndDevice 
      ? (width < 640 ? 32 : 48)
      : Math.min(160, Math.max(60, Math.floor(width / 9)));

    const drops = [];
    const splashes = [];

    for (let i = 0; i < baseDropCount; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 16 + 12,      // Chiều dài vệt mưa (12px - 28px)
        speedY: Math.random() * 8 + 13,       // Tốc độ rơi
        speedX: -1.2,                         // Độ nghiêng gió nhẹ sang trái
        opacity: Math.random() * 0.35 + 0.15, // Ánh sáng trắng mờ tinh tế
        width: Math.random() * 0.5 + 0.75     // Độ dày nét
      });
    }

    function createSplash(x, y) {
      if (isLowEndDevice || splashes.length > 25) return;
      splashes.push({
        x,
        y,
        radius: 0.5,
        maxRadius: Math.random() * 3 + 2,
        opacity: 0.35,
        speed: Math.random() * 0.4 + 0.3
      });
    }

    function renderRain() {
      if (!isPageVisible) return;

      ctx.clearRect(0, 0, width, height);

      // 1. Vẽ các vệt mưa rơi
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${d.opacity})`;
        ctx.lineWidth = d.width;
        ctx.lineCap = 'round';
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.speedX * (d.length / 5), d.y + d.length);
        ctx.stroke();

        d.y += d.speedY;
        d.x += d.speedX;

        // Khi giọt mưa chạm đáy màn hình
        if (d.y > height) {
          if (!isLowEndDevice && Math.random() < 0.28) {
            createSplash(d.x, height - 2);
          }
          d.y = -d.length;
          d.x = Math.random() * (width + 100);
          d.speedY = Math.random() * 8 + 13;
        }

        if (d.x < -20) {
          d.x = width + 20;
        }
      }

      // 2. Vẽ gợn sóng bắn tóe (splashes - chỉ trên thiết bị đủ khỏe)
      if (!isLowEndDevice) {
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius * 2, s.radius * 0.8, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          s.radius += s.speed;
          s.opacity -= 0.025;

          if (s.opacity <= 0 || s.radius >= s.maxRadius) {
            splashes.splice(i, 1);
          }
        }
      }

      rainRafId = requestAnimationFrame(renderRain);
    }

    function startRain() {
      if (!rainRafId && isPageVisible) {
        rainRafId = requestAnimationFrame(renderRain);
      }
    }

    // Tự động dừng vòng lặp khi tab ẩn (tiết kiệm pin & CPU), chạy lại khi mở lại tab
    document.addEventListener('visibilitychange', () => {
      isPageVisible = !document.hidden;
      if (isPageVisible && (hasEntered || !enterScreen)) {
        if (!rainRafId) {
          rainRafId = requestAnimationFrame(renderRain);
        }
      } else {
        if (rainRafId) {
          cancelAnimationFrame(rainRafId);
          rainRafId = null;
        }
      }
    });

    // Nếu không có enter screen (hoặc đã mở sẵn), chạy ngay
    if (!enterScreen || hasEntered) {
      startRain();
    }

    // Expose để enterExperience kích hoạt ngay khi người dùng nhấn mở web
    window.startBioRain = startRain;
  }

  /* ==========================================================================
     11. REAL-TIME PERSISTENT CLOUD VIEW COUNTER (MULTI-USER SYNC)
     ========================================================================== */
  function initViewCounter() {
    const viewsEl = document.getElementById('views-count');
    if (!viewsEl) return;

    const baseViews = (config.profile && typeof config.profile.views === 'number') 
      ? config.profile.views 
      : 1200;
    const counterKey = (config.profile && config.profile.counterKey) 
      ? config.profile.counterKey 
      : 'yuuta_bio_visits_1200';

    // 1. Hiển thị ngay lập tức từ cache hoặc base views để không giật UI
    const cacheKey = `bio_views_${counterKey}`;
    const cachedCount = localStorage.getItem(cacheKey);
    let startDisplay = cachedCount ? parseInt(cachedCount, 10) : baseViews;
    if (isNaN(startDisplay) || startDisplay < baseViews) startDisplay = baseViews;
    viewsEl.textContent = startDisplay.toLocaleString();

    // 2. Chỉ tính 1 lượt xem mỗi ngày cho một thiết bị (1 view per day per device)
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dailyCountKey = `bio_view_date_${counterKey}`;
    const lastCountedDate = localStorage.getItem(dailyCountKey);
    const alreadyCountedToday = (lastCountedDate === todayStr);

    // Nếu hôm nay thiết bị này đã được tính view: chỉ gọi API /get/ để đọc số mới nhất
    // Nếu hôm nay chưa được tính (ngày mới hoặc lần đầu vào): gọi API /hit/ để tăng +1
    const endpoint = alreadyCountedToday
      ? `https://countapi.mileshilliard.com/api/v1/get/${counterKey}`
      : `https://countapi.mileshilliard.com/api/v1/hit/${counterKey}`;

    let latestTargetViews = startDisplay;

    // Hiệu ứng cuộn số mượt mà (Count-up animation)
    function animateCountUp(target, duration = 800, fromVal = null) {
      latestTargetViews = target;
      const initial = (fromVal !== null) ? fromVal : (parseInt(viewsEl.textContent.replace(/,/g, ''), 10) || startDisplay);
      if (initial === target) return;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing cubic-out
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(initial + (target - initial) * ease);
        viewsEl.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          viewsEl.textContent = target.toLocaleString();
        }
      }
      requestAnimationFrame(update);
    }

    // Kích hoạt hiệu ứng đếm số sống động khi người dùng nhấp Enter reveal bio
    window.triggerViewCounterReveal = () => {
      const target = latestTargetViews || startDisplay;
      const fromVal = Math.max(baseViews, target - 16);
      if (fromVal < target) {
        viewsEl.textContent = fromVal.toLocaleString();
        setTimeout(() => {
          animateCountUp(target, 750, fromVal);
        }, 180);
      }
    };

    // 3. Gửi yêu cầu lên Cloud Counter API
    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && typeof data.value === 'number') {
          if (!alreadyCountedToday) {
            localStorage.setItem(dailyCountKey, todayStr);
          }
          const totalViews = baseViews + Math.max(0, data.value - 1);
          localStorage.setItem(cacheKey, totalViews.toString());
          animateCountUp(totalViews);
        }
      })
      .catch(err => {
        console.warn("Cloud View Counter fallback active:", err);
        // Fallback tự động khi offline hoặc không có mạng
        if (!alreadyCountedToday) {
          localStorage.setItem(dailyCountKey, todayStr);
          const localIncremented = startDisplay + 1;
          localStorage.setItem(cacheKey, localIncremented.toString());
          animateCountUp(localIncremented);
        }
      });
  }

  /* ==========================================================================
     11. ANTI-VIEW-SOURCE & DEVTOOLS PROTECTION
     ========================================================================== */
  function initSecurityProtection() {
    const sec = config.security || {};
    if (sec.antiInspect === false) return;

    // 1. Chặn chuột phải (Context Menu)
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    }, { capture: true });

    // 2. Chặn các tổ hợp phím tắt mở mã nguồn & DevTools
    window.addEventListener('keydown', (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.keyCode;

      // F12 (Inspect DevTools)
      if (key === 'f12' || code === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U / Cmd + U (View Page Source)
      if (isCtrlOrCmd && (key === 'u' || code === 85)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + I / Cmd + Option + I (Inspect)
      if (isCtrlOrCmd && (e.shiftKey || e.altKey) && (key === 'i' || code === 73)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + J / Cmd + Option + J (Console)
      if (isCtrlOrCmd && (e.shiftKey || e.altKey) && (key === 'j' || code === 74)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + C / Cmd + Option + C (Element Selector)
      if (isCtrlOrCmd && (e.shiftKey || e.altKey) && (key === 'c' || code === 67)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S / Cmd + S (Save Web Page)
      if (isCtrlOrCmd && (key === 's' || code === 83)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, { capture: true });

    // 3. Chặn kéo thả hình ảnh / nội dung ra ngoài
    if (sec.disableDrag !== false) {
      document.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
      }, { capture: true });
    }

    // 4. Cảnh báo Console
    try {
      console.clear();
      console.log(
        '%cSTOP!',
        'color: #ff3333; font-family: sans-serif; font-size: 2.5rem; font-weight: bold; text-shadow: 0 0 10px rgba(255,50,50,0.5);'
      );
      console.log(
        '%cViewing source or tampering with this page is prohibited.',
        'color: #ffffff; font-family: sans-serif; font-size: 1rem; font-weight: 500;'
      );
    } catch (err) {}
  }

  // Initialize
  initProfileData();
  initViewCounter();
  initDiscordSync();
  initRobloxWidget();
  initRainEffect();
  initSecurityProtection();
});
