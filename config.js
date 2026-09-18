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
    views: 794, // Lượt xem khởi đầu (base views)
    counterKey: "yuuta_bio_site_visits", // Mã lưu lượt xem trực tuyến trên Cloud Counter
    
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
    
    // Trình phát nhạc
    song: {
      title: "think",
      artist: "plaxz, kelestiial",
      cover: "assets/cover.jpg", // Ảnh bìa bài hát Spotify
      src: "assets/song.mp3",      // File nhạc (hỗ trợ .mp3, .m4a, .wav, .ogg)
      fallbackSrc: "assets/song.mp3",
      initialVolume: 0.6,
      autoplayAfterEnter: true
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

      // Dữ liệu hiển thị dự phòng (khi chưa nhập ID hoặc tài khoản offline)
      fallback: {
        username: "aspharagus",
        displayName: "aspharagus",
        status: "online",
        customStatus: "darling, it's okay.",
        activity: "Listening to Spotify"
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

  // ================= HIỆU ỨNG TƯƠNG TÁC =================
  effects: {
    cardTilt: true,       // Nghiêng 3D khi di chuột lên card (tự phẳng lại khi rời chuột)
    followingDot: true,   // Hiệu ứng con trỏ chuột Following Dot với chấm trôi mượt mà
    crtScanlines: true,   // Hiệu ứng màn hình scanlines cổ điển
    audioVisualizer: true,// Sóng âm thanh nhảy theo nhạc
    rain: true            // Hiệu ứng mưa rơi nền aesthetic monochrome
  }
};
