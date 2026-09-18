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
  const currentTimeEl = document.getElementById('current-time');
  const totalDurationEl = document.getElementById('total-duration');
  const progressBarTrack = document.getElementById('progress-bar-container');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressThumb = document.getElementById('progress-thumb');
  const visualizerBars = document.getElementById('visualizer-bars');
  const muteBtn = document.getElementById('mute-btn');
  const volumeIcon = document.getElementById('volume-icon');
  const volumeSlider = document.getElementById('volume-slider');

  // Track state
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
    if (media.song) {
      document.getElementById('track-title').textContent = media.song.title || 'Untitled Track';
      document.getElementById('track-artist').textContent = media.song.artist || 'Unknown Artist';
      if (media.song.cover) {
        document.getElementById('track-cover').src = media.song.cover;
      }
      if (media.song.initialVolume !== undefined) {
        audio.volume = media.song.initialVolume;
        volumeSlider.value = media.song.initialVolume;
      }
    }

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
      const card = document.createElement(item.type === 'copy' ? 'div' : 'a');
      card.className = 'social-card-btn';
      if (item.type !== 'copy') {
        card.href = item.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
      }

      // Left content (icon + details)
      const left = document.createElement('div');
      left.className = 'social-btn-left';

      const iconBox = document.createElement('div');
      iconBox.className = 'social-icon-box';
      
      // Render official Roblox SVG logo or FontAwesome icon
      if (item.id === 'roblox' || item.icon === 'roblox') {
        iconBox.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="display:block;"><path d="M5.165 0 0 18.835 18.835 24 24 5.165 5.165 0ZM13.88 15.534l-5.654-1.55 1.55-5.654 5.654 1.55-1.55 5.654Z"/></svg>`;
      } else {
        iconBox.innerHTML = `<i class="${item.icon}"></i>`;
      }

      const info = document.createElement('div');
      info.className = 'social-info';
      info.innerHTML = `
        <span class="social-platform-title">${item.platform}</span>
        <span class="social-handle">${item.handle}</span>
      `;

      left.appendChild(iconBox);
      left.appendChild(info);

      // Right action icon
      const actionIcon = document.createElement('i');
      actionIcon.className = item.type === 'copy' 
        ? 'fa-regular fa-copy social-action-icon' 
        : 'fa-solid fa-arrow-up-right-from-square social-action-icon';

      card.appendChild(left);
      card.appendChild(actionIcon);

      // Click to Copy action for Discord
      if (item.type === 'copy') {
        card.setAttribute('title', item.hint || 'Click to copy');
        card.addEventListener('click', () => {
          const textToCopy = item.valueToCopy || item.handle;
          navigator.clipboard.writeText(textToCopy).then(() => {
            showToast(`Copied "${textToCopy}" to clipboard!`);
          }).catch(() => {
            showToast(`Username: ${textToCopy}`);
          });
        });
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

    // Remove enter screen from DOM after transition
    setTimeout(() => {
      isEnteringTransition = false;
      if (enterScreen) enterScreen.style.display = 'none';
    }, 650);
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
     4. 3D CARD TILT & SMOOTH HOVER SCALE (PHYSICS LERP) - ADAPTIVE & IDLE SHUTOFF
     ========================================================================== */
  if (config.effects?.cardTilt !== false && !isTouch && !prefersReducedMotion) {
    const cardContainer = document.querySelector('.card-perspective-container') || bioCard;

    let targetRotX = 0, targetRotY = 0, targetScale = 1;
    let currentRotX = 0, currentRotY = 0, currentScale = 1;
    let isTiltRunning = false;
    let tiltRafId = null;

    function startTiltLoop() {
      if (!isTiltRunning) {
        isTiltRunning = true;
        tiltRafId = requestAnimationFrame(animateCard);
      }
    }

    cardContainer.addEventListener('mouseenter', () => {
      if (!hasEntered || isEnteringTransition) return;
      targetScale = 1.025; // Phóng to nhẹ card khi hover theo yêu cầu
      startTiltLoop();
    });

    cardContainer.addEventListener('mousemove', (e) => {
      if (!hasEntered || isEnteringTransition) return;

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

      startTiltLoop();
    });

    cardContainer.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
      targetScale = 1;
      startTiltLoop();
    });

    // Buttery-smooth Lerp rendering loop (60-120fps) with automatic idle pause
    function animateCard() {
      if (!isTiltRunning) return;

      // Damping factor 0.055 tạo độ trôi êm ái, chậm rãi, sang trọng
      currentRotX += (targetRotX - currentRotX) * 0.055;
      currentRotY += (targetRotY - currentRotY) * 0.055;
      currentScale += (targetScale - currentScale) * 0.055;

      bioCard.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(3)}deg) rotateY(${currentRotY.toFixed(3)}deg) scale3d(${currentScale.toFixed(4)}, ${currentScale.toFixed(4)}, 1)`;

      // When settled back to rest state, halt rAF loop to drop CPU/GPU usage to 0%
      const isResting = Math.abs(targetRotX - currentRotX) < 0.002 &&
                        Math.abs(targetRotY - currentRotY) < 0.002 &&
                        Math.abs(targetScale - currentScale) < 0.002;

      if (isResting && targetRotX === 0 && targetRotY === 0 && targetScale === 1) {
        currentRotX = 0;
        currentRotY = 0;
        currentScale = 1;
        bioCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        isTiltRunning = false;
        tiltRafId = null;
        return;
      }

      tiltRafId = requestAnimationFrame(animateCard);
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
        contentArea.style.transition = 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1)';

        // Switch active class on panels
        panels.forEach(panel => {
          panel.classList.remove('active');
        });
        activePanel.classList.add('active');

        // Measure target height after adding active class
        const targetHeight = activePanel.offsetHeight;
        contentArea.style.height = `${targetHeight}px`;

        if (tabTransitionTimer) clearTimeout(tabTransitionTimer);
        tabTransitionTimer = setTimeout(() => {
          contentArea.style.height = 'auto';
          contentArea.style.overflow = 'visible';
        }, 360);
      } else {
        panels.forEach(panel => panel.classList.remove('active'));
        activePanel.classList.add('active');
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

  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => setPlayState(true)).catch(console.error);
    } else {
      audio.pause();
      setPlayState(false);
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
  });

  audio.addEventListener('loadedmetadata', () => {
    totalDurationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    audio.play(); // loop track
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
     8. FOLLOWING DOT CURSOR EFFECT (HIGH-PERFORMANCE GPU COMPOSITING)
     ========================================================================== */
  if (config.effects?.followingDot !== false && !isTouch) {
    const cursorDot = document.getElementById('cursor-dot');

    if (cursorDot) {
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

      // Smooth Lerp Animation Loop with GPU translate3d (No Layout Thrashing)
      function animateDot() {
        if (!isVisible || !isDotAnimating) return;

        dotX += (mouseX - dotX) * 0.16;
        dotY += (mouseY - dotY) * 0.16;
        cursorDot.style.transform = `translate3d(${dotX.toFixed(2)}px, ${dotY.toFixed(2)}px, 0) translate(-50%, -50%)`;

        // When mouse is still and dot catches up, pause loop to save 100% idle CPU
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
    const statusDot = document.getElementById('discord-status-dot');
    const statusLabel = document.getElementById('discord-status-label');
    const customStatusEl = document.getElementById('discord-custom-status');
    const activityEl = document.getElementById('discord-activity');

    // Fallback data
    const fb = discordCfg.fallback || {};
    if (fb.username && usernameEl) usernameEl.textContent = `@${fb.username}`;
    if (fb.displayName && displayNameEl) displayNameEl.textContent = fb.displayName;
    if (fb.customStatus && customStatusEl) customStatusEl.textContent = fb.customStatus;

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

      // 2. Display Name & Username
      if (user) {
        if (displayNameEl) displayNameEl.textContent = user.global_name || user.username;
        if (usernameEl) usernameEl.textContent = `@${user.username}`;

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
      const headshotApi = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`;
      const proxyUrls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(headshotApi)}`,
        `https://corsproxy.io/?${encodeURIComponent(headshotApi)}`
      ];

      async function syncLiveAvatar() {
        for (const pUrl of proxyUrls) {
          try {
            const res = await fetch(pUrl, { cache: 'force-cache' });
            if (!res.ok) continue;
            const data = await res.json();
            if (data?.data?.[0]?.imageUrl && avatarEl) {
              avatarEl.src = data.data[0].imageUrl;
              break;
            }
          } catch (err) {
            // Fallback an toàn tới ảnh cục bộ
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
      : 794;
    const counterKey = (config.profile && config.profile.counterKey) 
      ? config.profile.counterKey 
      : 'yuuta_bio_site_visits';

    // 1. Hiển thị ngay lập tức từ cache hoặc base views để không giật UI
    const cacheKey = `bio_views_${counterKey}`;
    const cachedCount = localStorage.getItem(cacheKey);
    let startDisplay = cachedCount ? parseInt(cachedCount, 10) : baseViews;
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

    // Hiệu ứng cuộn số mượt mà (Count-up animation)
    function animateCountUp(target) {
      if (startDisplay === target) return;
      const duration = 1000;
      const startTime = performance.now();
      const initial = startDisplay;

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
          const totalViews = baseViews + data.value;
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
