/**
 * FRAIL.LOL / MONOCHROME BIO PROFILE CONFIGURATION
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
    avatar: "assets/avatar.jpeg",
    
    location: "saigon",
    views: 1200, // Base views bắt đầu từ 1200
    counterKey: "yuuta_bio_visits_1200", // Mã lưu lượt xem trực tuyến trên Cloud Counter
    
    // Trích dẫn / tiểu sử
    bioText: "Cruel Fate"
  },

  // ================= MÀN HÌNH CLICK TO ENTER (RIPPLE & PULSE) =================
  enterScreen: {
    enabled: true,
    enterPrompt: "CLICK TO ENTER",
    subtitle: "sound on • experience"
  },

  // ================= VIDEO NỀN & NHẠC =================
  media: {
    // Video nền (có thể đổi thành file .mp4 khác của bạn)
    backgroundVideo: "assets/background.mp4",
    fallbackVideo: "https://cdn.frail.lol/backgrounds/742/7f9985fb-2f84-44fa-aff6-9047ce903ea9.mp4",
    
    // Tùy chọn phát ngẫu nhiên (random / shuffle) danh sách bài hát khi vào trang:
    random: true,

    // Danh sách bài hát (Playlist) hỗ trợ chuyển bài tới / lùi (Skip Next / Prev)
    playlist: [
      {
        id: "think",
        title: "think",
        artist: "plaxz, kelestiial",
        cover: "assets/cover.jpg",
        src: "assets/song.mp3",
        fallbackSrc: "assets/song.mp3",
        lyrics: {
          enabled: true,
          source: "lrclib",
          trackName: "think",
          artistName: "plaxz"
        }
      },
      {
        id: "foreign_girl",
        title: "foreign girl",
        artist: "lociffer",
        cover: "assets/foreign_girl_cover.jpg",
        src: "assets/foreign_girl.m4a",
        fallbackSrc: "assets/foreign_girl.mp4",
        lyrics: {
          enabled: true,
          source: "lrclib",
          trackName: "foreign girl",
          artistName: "lociffer"
        }
      }
    ],

    // Trình phát nhạc mặc định
    song: {
      title: "think",
      artist: "plaxz, kelestiial",
      cover: "assets/cover.jpg", // Ảnh bìa bài hát Spotify
      src: "assets/song.mp3",      // File nhạc (hỗ trợ .mp3, .m4a, .wav, .ogg)
      fallbackSrc: "assets/song.mp3",
      initialVolume: 0.6,
      autoplayAfterEnter: true,

      // Đồng bộ lời bài hát thời gian thực từ LRCLIB (lrclib.net)
      lyrics: {
        enabled: true,
        source: "lrclib",
        trackName: "think",
        artistName: "plaxz"
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

      // Tự động đồng bộ Avatar và trạng thái online của thẻ chính theo Discord
      syncMainAvatarAndStatus: true,

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
          badge: "https://cdn.discordapp.com/clan-badges/1229081150517936311/7958220790fd104fa019bba71852896d.png?size=32"
        }
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

  // ================= BÌNH LUẬN TRỰC TIẾP (YOUTUBE LIVE STYLE) =================
  liveChat: {
    enabled: true,
    title: "Chat",
    seedComments: []
  },

  // ================= BẢO VỆ MÃ NGUỒN (ANTI-VIEW-SOURCE) =================
  security: {
    antiInspect: true,    // Chặn chuột phải, F12, Ctrl+U, Ctrl+Shift+I, Ctrl+S
    disableDrag: true     // Chặn kéo thả hình ảnh / nội dung ra ngoài
  },

  // ================= HIỆU ỨNG TƯƠNG TÁC =================
  effects: {
    cardTilt: true,        // Nghiêng 3D khi di chuột lên card (tự phẳng lại khi rời chuột)
    ambientFloating: true, // Hiệu ứng lơ lửng không trọng lực 3D (tự nhấp nhô êm ái khi không rê chuột)
    followingDot: true,    // Hiệu ứng con trỏ chuột Following Dot với chấm trôi mượt mà
    crtScanlines: true,    // Hiệu ứng màn hình scanlines cổ điển
    audioVisualizer: true, // Sóng âm thanh nhảy theo nhạc
    rain: true             // Hiệu ứng mưa rơi nền aesthetic monochrome
  }
};
