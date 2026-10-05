/**
 * YUUTA MONOCHROME BIO PROFILE CONFIGURATION
 * 
 * HƯỚNG DẪN THAY THẾ TÀI NGUYÊN (ASSETS):
 * 1. Ảnh đại diện: Copy ảnh của bạn vào thư mục "assets/" rồi đổi đường dẫn tại `avatar` bên dưới.
 * 2. Video nền: Copy file video mp4 vào thư mục "assets/" rồi đổi đường dẫn tại `backgroundVideo`.
 * 3. Nhạc nền: Copy file nhạc mp3 hoặc m4a vào "assets/" rồi đổi đường dẫn tại `song.src`.
 * 4. Ảnh bìa bài hát: Copy file ảnh vuông vào "assets/" rồi đổi đường dẫn tại `song.cover`.
 */
window.BIO_CONFIG = {
  // ================= THÔNG TIN CÁ NHÂN =================
  profile: {
    displayName: "Yuuta.",
    
    // Hiệu ứng chữ màu gradient trắng bạc monochrome
    nameGradient: {
      from: "#ffffff",
      via: "#e4e4e7",
      to: "#a1a1aa"
    },

    // Đường dẫn ảnh đại diện (bạn có thể thay bằng file ảnh của bạn trong assets/)
    avatar: "assets/avatar.png",
    
    location: "saigon",
    views: 1200, // Base views bắt đầu từ 1200
    counterKey: "yuuta_bio_visits_1200", // Mã lưu lượt xem trực tuyến trên Cloud Counter
    
    // Trích dẫn / tiểu sử
    bioText: "Cruel Fate"
  },

  // ================= MÀN HÌNH CLICK TO ENTER (SHATTERED GLASS) =================
  enterScreen: {
    enabled: true,
    enterPrompt: "click to enter"
  },

  // ================= VIDEO NỀN & NHẠC =================
  media: {
    // Video nền (có thể đổi thành file .mp4 khác của bạn)
    backgroundVideo: "assets/background.mp4",
    fallbackVideo: "assets/background.mp4",
    
    // Tùy chọn phát ngẫu nhiên (random / shuffle) danh sách bài hát khi vào trang:
    random: false,

    // Danh sách bài hát (Playlist)
    playlist: [
      {
        id: "poison",
        title: "poison",
        artist: "Zape$",
        cover: "assets/poison_cover.jpg",
        src: "assets/poison.mp3",
        fallbackSrc: "assets/poison.mp3",
        lyrics: {
          enabled: true,
          source: "lrclib",
          trackName: "poison",
          artistName: "Zape$"
        }
      }
    ],

    // Trình phát nhạc mặc định
    song: {
      title: "poison",
      artist: "Zape$",
      cover: "assets/poison_cover.jpg", // Ảnh bìa bài hát Spotify
      src: "assets/poison.mp3",      // File nhạc (hỗ trợ .mp3, .m4a, .wav, .ogg)
      fallbackSrc: "assets/poison.mp3",
      initialVolume: 0.6,
      autoplayAfterEnter: true,

      // Đồng bộ lời bài hát thời gian thực từ LRCLIB (lrclib.net)
      lyrics: {
        enabled: true,
        source: "lrclib",
        trackName: "poison",
        artistName: "Zape$"
      }
    }
  },

  // ================= MẠNG XÃ HỘI (TAB SOCIALS) =================
  socialLinks: [
    {
      id: "facebook",
      platform: "Facebook",
      handle: "Yuuta.nzz",
      url: "https://www.facebook.com/Yuuta.nzz/",
      icon: "fa-brands fa-facebook",
      color: "#ffffff",
      type: "link"
    },
    {
      id: "spotify",
      platform: "Spotify",
      handle: "uyen.",
      url: "https://open.spotify.com/user/31gfd7vl5knhxtxtiojecogdd62q?si=ac4908ee1a7843d8",
      icon: "fa-brands fa-spotify",
      color: "#ffffff",
      type: "link"
    },
    {
      id: "discord",
      platform: "Discord",
      handle: "aspharagus",
      valueToCopy: "aspharagus",
      icon: "fa-brands fa-discord",
      color: "#ffffff",
      type: "copy", // Nhấp vào sẽ tự động sao chép username
      hint: "Click to copy username"
    },
    {
      id: "roblox",
      platform: "Roblox",
      handle: "AngelxxxxxWings312",
      valueToCopy: "AngelxxxxxWings312",
      icon: "roblox",
      color: "#ffffff",
      type: "copy", // Nhấp vào sẽ tự động sao chép username Roblox
      hint: "Click to copy Roblox username"
    }
  ],

  // ================= WIDGETS (TAB WIDGETS) =================
  widgets: {
    discord: {
      enabled: true,
      
      // 👉 NHẬP DISCORD USER ID CỦA BẠN VÀO ĐÂY ĐỂ ĐỒNG BỘ TRỰC TIẾP:
      // (Ví dụ: "7118709360" hoặc chuỗi 18-19 chữ số ID Discord của bạn)
      // Cách lấy ID Discord:
      // 1. Mở Discord -> Cài đặt người dùng (User Settings) -> Nâng cao (Advanced) -> Bật "Chế độ nhà phát triển" (Developer Mode).
      // 2. Nhấp chuột phải vào Avatar của bạn ở góc dưới bên trái -> Chọn "Sao chép ID người dùng" (Copy User ID).
      // 3. Dán ID đó vào giữa 2 dấu ngoặc kép bên dưới:
      userId: "956704006456094860", 

      // Không đồng bộ Avatar thẻ chính theo Discord (giữ cố định avatar tùy chỉnh)
      syncMainAvatar: false,
      syncMainAvatarAndStatus: false,
      syncMainStatus: true,

      // Danh sách huy hiệu hiển thị trên Discord Widget (đúng trọn bộ 8 huy hiệu của bạn):
      badges: [
        "nitro",           // Evolving Discord Nitro (Subscriber)
        "bravery",         // HypeSquad Bravery
        "boost_24m",       // Server Booster (24 Months Diamond)
        "legacy_username", // Originally known as (#)
        "quest",           // Completed a Quest (Laurel Wreath)
        "last_meadow",     // The Last Meadow Online (Green Leaf)
        "orbs",            // Orbs Apprentice
        "gifting"          // Passionate Gifter (Pink Gift Box)
      ],

      // Dữ liệu hiển thị dự phòng (khi chưa kết nối hoặc tài khoản offline)
      fallback: {
        username: "4zmq",
        displayName: "Yuuta",
        status: "online",
        customStatus: "Cruel Fate",
        activity: "Playing ~~",
        badges: [
          "nitro",
          "bravery",
          "boost_24m",
          "legacy_username",
          "quest",
          "last_meadow",
          "orbs",
          "gifting"
        ],
        clan: {
          tag: "k1ng",
          badge: "assets/discord_clan_badge.png"
        }
      },

      // Discord Server liên kết (hiển thị cùng một hàng với Discord Profile)
      server: {
        enabled: true,
        inviteUrl: "https://discord.gg/arsontop",
        inviteCode: "arsontop",
        name: "Ars Pauline",
        tag: "k1ng",
        icon: "assets/discord_server_icon.png",
        clanBadge: "assets/discord_clan_badge.png",
        approximateMembers: 3112,
        approximateOnline: 410,
        syncCounts: true
      }
    },

    roblox: {
      enabled: true,
      
      // 👉 DÁN ĐƯỜNG LINK TRANG CÁ NHÂN ROBLOX HOẶC USER ID CỦA BẠN VÀO ĐÂY:
      // Hệ thống sẽ tự động đồng bộ Avatar, Display Name, Username và Bio theo link!
      profileUrl: "https://www.roblox.com/users/4282487160/profile",
      
      // Thông tin chi tiết (tự động đồng bộ theo link hoặc dùng làm fallback):
      userId: "4282487160",
      username: "AngelxxxxxWings312",
      displayName: "rust",
      description: "The night we met.?",
      avatar: "assets/roblox_avatar.png", // Avatar headshot chất lượng cao
      joinDate: "Jan 2023"
    }
  },

  // ================= BẢO VỆ MÃ NGUỒN & ANTI-DEVTOOLS =================
  security: {
    antiInspect: true,    // Chặn chuột phải, F12, Ctrl+U, Ctrl+Shift+I, Ctrl+S, Ctrl+P
    antiDevTools: true,   // Tự động nhận diện khi mở DevTools qua console probe (chính xác 100%, không bị nhận diện nhầm do tỷ lệ màn hình)
    shieldOverlay: true,  // Hiển thị màn chắn cảnh báo khi phát hiện mở DevTools
    disableDrag: true,    // Chặn kéo thả hình ảnh / nội dung ra ngoài
    disableSelect: true   // Chặn bôi đen / sao chép nội dung văn bản
  },

  // ================= TỐI ƯU HIỆU NĂNG CHO MÁY YẾU (LOW-END PC & MOBILE) =================
  performance: {
    lowEndAutoDetect: true,        // Tự động nhận diện thiết bị yếu (CPU <= 4 core, RAM <= 4GB)
    forceLowEnd: false,            // Đặt là true nếu muốn ép chế độ siêu nhẹ mọi lúc
    maxGhostFibersLayersLowEnd: 2, // Giảm từ 4 xuống 2 layer WebGL trên máy yếu (tiết kiệm GPU ~60%)
    maxFpsLowEnd: 30,              // Giới hạn 30 FPS trên máy yếu để máy luôn mát
    dprLowEnd: 0.75,               // Render WebGL ở độ phân giải 0.75x trên máy yếu
    disableFloatingLowEnd: true,   // Tắt chuyển động lơ lửng liên tục của card trên máy yếu (về 0% CPU khi idle)
    lightweightMouseTrails: true   // Giảm 75% số lượng hạt vệt chuột trên máy yếu
  },

  // ================= HIỆU ỨNG TƯƠNG TÁC =================
  effects: {
    cardTilt: true,        // Nghiêng 3D khi di chuột lên card (tự phẳng lại khi rời chuột)
    ambientFloating: true, // Hiệu ứng lơ lửng không trọng lực 3D (tự nhấp nhô êm ái khi không rê chuột)
    mouseCanvas: true,     // Hiệu ứng dải lụa sóng Canvas mềm mại theo chuột giống hệt rui2.oneapp.dev
    mouseCanvasColor: "#ffffff", // Màu vệt lụa chuột trắng bạc thuần monochrome (#ffffff)
    followingDot: false,   // Chấm tròn đơn (tắt để kích hoạt hiệu ứng Canvas)
    crtScanlines: true,    // Hiệu ứng màn hình scanlines cổ điển
    audioVisualizer: true, // Sóng âm thanh nhảy theo nhạc
    rain: false,           // Tắt hiệu ứng mưa theo yêu cầu
    ghostFibers: {
      enabled: true,       // Hiệu ứng dải sợi ánh sáng GhostFibers (React Bits WebGL2)
      lineColor: "#ffffff",// 100% màu trắng thuần monochrome
      glowColor: "#ffffff",// 100% màu trắng thuần monochrome
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
      brightness: 1.8,
      blueBoost: 1.0,      // 1.0 = 100% trắng trung tính, không ám sắc xanh/tím
      centerBrightness: 0.05, // Giảm độ sáng phần chính giữa xuống (khử quầng sáng chói giữa màn hình)
      vignette: 0.8,
      grain: 0.05,
      dpr: 1
    }
  }
};
