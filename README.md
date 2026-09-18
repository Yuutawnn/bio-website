# Bio Website

Trang web Bio Profile cá nhân phong cách đen trắng tối giản.

---

## 🌟 Tính Năng Chính

1. **Màn hình Click-to-enter**: hiệu ứng ripple, nhấp để mở nhạc và vào trang.
2. **Bio Card 3D**: thẻ kính mờ, nghiêng 3D theo chuột, 3 tab Journal / Socials / Widgets.
3. **Discord & Roblox Widgets**: hiển thị trạng thái Discord trực tiếp, thông tin Roblox.
4. **Trình phát nhạc**: Play/Pause, tua tiến trình, chỉnh âm lượng, sóng nhạc mini.

---

## 🚀 Hướng Dẫn Sử Dụng & Mở Trang Web

### Cách 1: Mở trực tiếp
Bạn chỉ cần nhấp đúp chuột vào file **`index.html`** để mở trực tiếp trên bất kỳ trình duyệt nào (Chrome, Edge, Firefox, Brave, Safari).

### Cách 2: Chạy bằng máy chủ nội bộ (Khuyên dùng để tối ưu trải nghiệm âm thanh/video)
Nếu bạn có sẵn Python hoặc Node.js, bạn có thể mở terminal trong thư mục này và chạy:

**Dùng Python:**
```bash
python -m http.server 3000
```
Sau đó truy cập: [http://localhost:3000](http://localhost:3000)

**Dùng Node (npx):**
```bash
npx serve .
```

---

## ⚙️ Hướng Dẫn Tùy Chỉnh Thông Tin Của Bạn

Mọi thông tin của trang web đều được đặt tập trung trong file **[`config.js`](file:///c:/Users/nguye/Downloads/bio/config.js)**. Bạn chỉ cần mở file này bằng Notepad hoặc VS Code để chỉnh sửa:

```javascript
window.BIO_CONFIG = {
  profile: {
    displayName: "Tên của bạn",
    avatar: "assets/avatar.jpeg", // Đường dẫn ảnh avatar
    location: "Vietnam",          // Vị trí
    occupation: "Developer",      // Nghề nghiệp
    views: 999,                   // Số lượt xem
    bioText: "Lời giới thiệu hoặc câu quote yêu thích của bạn...",
    joinedDate: "2026",
    uid: "001"
  },
  
  // Thay đổi bài hát
  media: {
    backgroundVideo: "assets/background.mp4",
    song: {
      title: "Tên bài hát",
      artist: "Tên ca sĩ",
      cover: "assets/cover.webp",
      src: "assets/song.m4a" // Đổi thành file mp3/m4a của bạn
    }
  },

  // Danh sách link mạng xã hội
  socialLinks: [
    {
      platform: "Instagram",
      handle: "@yourname",
      url: "https://instagram.com/yourname",
      icon: "fa-brands fa-instagram",
      color: "#e1306c",
      type: "link"
    },
    {
      platform: "Discord",
      handle: "yourusername",
      valueToCopy: "yourusername",
      icon: "fa-brands fa-discord",
      color: "#5865f2",
      type: "copy" // Nhấp vào sẽ copy
    }
    // Bạn có thể thêm bao nhiêu link tuỳ thích!
  ]
};
```

---

## 🌐 Hướng Dẫn Đưa Lên Mạng (Deploy Miễn Phí)

Bạn có thể đưa trang bio này lên mạng Internet hoàn toàn miễn phí trong 1 phút bằng các dịch vụ:
- **Vercel**: Kéo thả toàn bộ thư mục này vào trang [vercel.com](https://vercel.com) là xong.
- **GitHub Pages**: Đẩy code lên một repository trên GitHub và kích hoạt GitHub Pages trong mục Settings.
- **Netlify**: Kéo thả thư mục vào [app.netlify.com/drop](https://app.netlify.com/drop).
