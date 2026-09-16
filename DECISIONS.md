# Gara tí hon

## 2026-09-16 — Bản mẫu đã thống nhất

- Dành cho bé 6 tuổi: chọn phương tiện → xem 3D → zoom để tách các phần → chạm nghe tên tiếng Việt.
- Phương tiện đầu tiên: sedan trắng lấy cảm hứng từ Hyundai Accent 2021, mô hình đồ chơi có chi tiết, không phải bản sao CAD chính xác.
- Chọn dựng mô hình bằng code, từng bộ phận độc lập. So với asset tải sẵn, chủ động cấu trúc và không phụ thuộc giấy phép; đánh đổi độ tinh xảo của asset do họa sĩ dựng.
- Web frontend Vite + Three.js, không cần tài khoản/backend. Có nút tách–ráp và danh sách bộ phận hỗ trợ thao tác cảm ứng, bàn phím.
- Bản mẫu dùng SpeechSynthesis giọng vi-VN nếu thiết bị hỗ trợ; thông báo khi thiếu giọng Việt. Có thể thay bằng âm thanh thu sẵn khi triển khai bản chính thức.
- Xem lại hướng dựng asset khi thêm phương tiện hoặc cần độ chính xác ngoại hình cao hơn.

## 2026-09-16 — iPad ngang và trẻ chưa đọc chữ

- User xác nhận bé cầm iPad ngang, có thể chưa đọc được. Giữ phong cách UI hiện tại.
- Ưu tiên mô hình bên trái, bảng hình bộ phận bên phải; thanh điều khiển ngay dưới mô hình. Chiều dọc vẫn hoạt động.
- Hình minh họa riêng cho mỗi bộ phận; chạm hình hoặc mô hình đều phát tên. Có nút loa nghe hướng dẫn, tên/replay ngay trên khung xe.
- Chọn âm thanh tiếng Việt đi kèm thay cho phụ thuộc hoàn toàn vào giọng hệ điều hành. 20 file M4A tổng hợp bằng giọng Linh; device SpeechSynthesis là fallback.
- Giữ zoom tự động tách theo yêu cầu ban đầu, thêm nút tách–ráp và góc nhìn để dùng một lần chạm. Không tự xoay xe khi chờ bé chọn.
- Giảm chiều cao cabin, chỉnh grille/đèn và giữ bánh tròn; gộp mesh theo nhóm chuyển động để giảm chi phí render.
- Đánh giá lại âm thanh và kích thước hình sau khi quan sát bé dùng trên iPad thật. Chưa thêm trò chơi, tài khoản hoặc PWA/offline.
