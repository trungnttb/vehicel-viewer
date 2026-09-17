# Gara tí hon

## 2026-09-16 — Hai chế độ giao diện cho gia đình

- Giữ giao diện hiện tại làm mặc định. Nút Giao diện trên header mở cài đặt cho bố mẹ; lựa chọn `standard` / `child` lưu bằng localStorage với key `little-garage:display-mode`.
- Chế độ bé: trang chọn xe bằng hình; detail tự mở toàn khung trình duyệt, bảng bộ phận hình cuộn bên phải khi ngang và bên dưới khi dọc. Nhãn truy cập và tên bộ phận được chọn vẫn giữ.
- Chọn xe bằng bảng hình dạng dialog, không dùng dropdown chữ. Giữ zoom, tách/lắp, reset, các góc nhìn, hướng dẫn và phát lại âm thanh.
- Đổi chế độ không tạo lại renderer/model hay reset góc nhìn, lựa chọn. Nút mở rộng/thu gọn chỉ đổi cách bố trí, không đổi cài đặt đã lưu.
- Đây là toàn khung web, không yêu cầu native Fullscreen API hoặc ẩn thanh Safari. Giữ Vite + Three.js; chưa chuyển React. Nếu storage bị chặn, dùng lựa chọn trong phiên và thông báo chưa lưu được.

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

## 2026-09-16 — Bộ sưu tập bảy xe

- Thêm xe tải, cứu thương, cần cẩu, máy xúc bánh xích, xe trộn bê tông và xe container theo yêu cầu. Đây là mô hình đồ chơi generic, không mô phỏng thương hiệu cụ thể.
- Danh mục chung quản lý factory, route, nhãn và bộ phận; tiến độ riêng từng xe. Dùng chung một renderer, giải phóng model cũ khi chuyển xe.
- Mỗi bộ phận có hình và audio; có 45 file âm thanh dùng chung theo ID có cùng ý nghĩa. Camera tự căn theo bounds để cần cẩu dài và trạng thái tách không bị cắt khỏi khung.
- Bổ sung vô lăng cho các xe đường bộ. Máy xúc bánh xích dùng hai cần điều khiển; tham khảo [Caterpillar về điều khiển joystick](https://www.cat.com/en_US/articles/for-owners/excavator-joystick-controls.html/).
- Theo phản hồi thực tế, kéo dài cần cẩu và đưa đường cáp/móc ra phía trước cabin. Regression kiểm tra khoảng hở ở 0%, 25%, 50%, 75% và 100% độ tách.

## 2026-09-17 — Xe to hơn trong khung xem

- User muốn xe lắp to sát khung hơn. Camera căn theo hình dạng thật của xe thay cho góc nhìn tối thiểu 36°; xe lắp ở chế độ bé 1180×820 chiếm 43–67% bề ngang (trước 36–41%).
- User thấy tách bộ phận làm xe nhỏ đi rõ. Chọn: bộ phận bay ra 75% quãng cũ và xe chỉ nhỏ đi tối đa 15% khi tách, đổi lại xe lắp không to tối đa được.
- User thấy cần cẩu còn bé vì khung phải chứa đầu cần cao. Chọn: hạ đầu cần từ y 4.1 xuống 3.4 (cần thoải hơn, ngắn hơn ~8%; móc hạ theo, vẫn treo trước cabin) và giảm độ nâng cần khi tách từ 1.1 xuống 0.45. Thân xe tải của cần cẩu rộng 36% → 45% khung ở chế độ bé 1180×820.

## 2026-09-17 — Xe cứu hỏa

- Thêm xe cứu hỏa theo yêu cầu: mô hình đồ chơi generic, màu đỏ dịu hợp bảng màu hiện tại, không theo một mẫu xe hay thương hiệu cụ thể. Route `#/xe/fire-truck`.
- 15 bộ phận: 9 phần chung của xe tải, thêm bồn nước, tủ dụng cụ, mâm xoay, thang cứu hỏa, vòi chữa cháy và đèn ưu tiên. Dùng lại ID `turntable` và `beacon` vì cùng nghĩa; 4 ID mới có hình và audio giọng Linh.
- Thang nằm trên giá đỡ phía sau ca-bin và mâm xoay phía sau; bồn nước nằm giữa hai dãy tủ, chọn bồn nước thì xe tự tách để thấy bồn. Regression kiểm tra thang không chạm ca-bin, đèn ưu tiên, mâm xoay và các phần xếp chồng không chạm nhau ở 0–100% độ tách.
- `npm run audio:generate -- <id>...` chỉ tạo audio cho các ID được liệt kê, để thêm xe không phải tạo lại toàn bộ file cũ.

## 2026-09-17 — Xe chở rác và xe lu

- Thêm xe chở rác (`#/xe/garbage-truck`) và xe lu (`#/xe/road-roller`) theo yêu cầu. Mô hình đồ chơi generic, không theo mẫu xe hay thương hiệu cụ thể.
- Xe chở rác là loại ép rác, nạp từ phía sau: đầu xe tải dùng chung, thùng chứa rác, cửa ép rác xiên, tay nâng đang giữ một thùng rác, đèn ưu tiên màu vàng. 14 bộ phận. Khi tách, cửa ép, tay nâng và thùng rác lần lượt lùi ra sau, phần sau đi xa hơn phần trước để không chạm nhau.
- Xe lu một trống thép phía trước và hai lốp to phía sau, ca-bin hở có khung mái, có vô lăng như các xe đường bộ khác. 9 bộ phận, không có cửa, gương hay thân xe tải. Khung giữ trống là tay đòn hẹp để nhìn ngang vẫn thấy trống tròn; bản đầu dùng tấm che lớn làm trống trông như cái hộp.
- 6 ID mới (`garbage-body`, `tailgate`, `bin-lift`, `trash-bin`, `roller-drum`, `exhaust`) có hình và audio giọng Linh. Không dùng lại `drum` cho trống lu vì ID đó đang được đọc là "Bồn trộn".
- Regression kiểm tra các cặp bộ phận không chạm nhau ở 0–100% độ tách, trống lu tròn và chạm đất, ghế và vô lăng luôn nằm dưới mái ca-bin.

## 2026-09-17 — Tám xe mới: tổng 18 xe

- Theo yêu cầu, thêm tất cả các xe đã gợi ý: xe ben, xe bồn chở xăng, xe cứu hộ (sàn chở một chiếc xe hỏng), xe xúc lật, xe nâng hàng, máy kéo, xe buýt, xe máy. Tất cả là mô hình đồ chơi generic.
- Xe máy dùng tay lái (`handlebars`) thay cho vô lăng. Quy tắc điều khiển giờ là: xe đường bộ có vô lăng, máy xúc bánh xích có cần điều khiển, xe máy có tay lái.
- Xe buýt đi đúng chiều giao thông Việt Nam: tài xế bên trái, cửa lên xuống bên phải. Động cơ đặt trong khoang sau; hàng ghế cuối bỏ để có chỗ.
- Xe ben để thùng hơi nâng đầu, để nhìn đã biết là xe ben chứ không phải xe tải.
- 17 ID mới có hình và audio giọng Linh; `roof` dùng lại từ Accent. Không dùng lại `ladder`, `hose` hay `drum` vì tên đọc ra gắn với xe khác. Mô tả của `boom`, `hydraulics`, `stabilizers` viết lại cho dùng chung được (bỏ "khi nâng đồ" để chân chống xe máy cũng đúng).
- Test va chạm chia cặp `apart` / `joined`. Các cặp mà hộp bao chồng nhau dù bộ phận không chạm (vỏ xe buýt quanh cửa, khung xe máy quanh động cơ, tay nâng xe xúc lật đi chéo trên bánh, thùng ben nghiêng với cát) được bỏ khỏi test và kiểm tra bằng ảnh render.
