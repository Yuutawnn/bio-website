# frail.lol / shu - Bio Website Template

Trang web Bio Profile cá nhân được thiết kế tỉ mỉ, tái hiện đầy đủ giao diện, phong cách aesthetic, hiệu ứng âm thanh và hình ảnh từ [frail.lol/shu](https://frail.lol/shu).

---

## 🌟 Tính Năng Nổi Bật

1. **Màn hình khởi động Retro BIOS Boot (Click-to-enter)**:
   - Giao diện giả lập khởi động hệ điều hành cổ điển với hiệu ứng CRT Scanlines, terminal text, logo frail.lolOS Reborn và thanh tiến trình 3 khối chuyển động.
   - Cơ chế nhấp chuột để bắt đầu phát nhạc tự động và chuyển cảnh mượt mà vào bio card.
2. **Video Nền & Không Gian Aesthetic**:
   - Video nền looping chất lượng cao kèm lớp phủ vignette huyền ảo.
   - Hiệu ứng vệt sáng lấp lánh (sparkle trail) nhẹ nhàng bay theo con trỏ chuột.
3. **Thẻ Bio Card 3D Glassmorphism**:
   - Thẻ kính mờ trong suốt bo góc tròn cao cấp (`backdrop-filter: blur(24px)`).
   - Tự động nghiêng 3D (tilt effect) đa chiều theo chuyển động của chuột.
   - Chuyển đổi giữa 3 Tab nội dung:
     - **Journal**: Tiểu sử cá nhân, trích dẫn bio, ngày tham gia, UID.
     - **Socials**: Các nút liên kết mạng xã hội (Instagram, Pinterest, Spotify, Discord). Đặc biệt với Discord, nhấp vào sẽ tự động sao chép username kèm thông báo Toast nổi!
     - **Widgets**: Khối hiển thị thông tin Roblox profile và Discord live presence.
   - Bộ đếm lượt xem (Views counter) với biểu tượng mắt phát sáng.
4. **Trình Phát Nhạc Tích Hợp (Music Player)**:
   - Bài hát mặc định: *"AfterParty (Acoustic) - Gezebelle Gaburgably"*.
   - Sóng âm thanh nhảy theo nhịp (Audio Visualizer).
   - Đầy đủ nút Play/Pause, thanh tua tiến trình (scrubber), thời gian thực và thanh điều chỉnh âm lượng.
5. **Đầy đủ dữ liệu Offline**:
   - Toàn bộ video nền, file nhạc m4a, ảnh bìa, avatar đã được tải về sẵn trong thư mục `assets/` nên trang web có thể hoạt động hoàn toàn offline mà không lo link ngoài bị lỗi.

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
