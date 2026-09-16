# Gara tí hon trên iPad

## Bối cảnh đã xác nhận

Bé 6 tuổi, có thể chưa đọc chữ, cầm iPad ngang. User thích UI/UX hiện tại: giữ màu kem, xanh trầm, cam, bố cục thoáng và thẻ bo tròn. Mục tiêu là bé tự chọn xe, xem các phần, chạm để nghe tên.

## Nghiên cứu và quyết định

| Vấn đề | Cơ sở | Áp dụng cho project |
|---|---|---|
| Chạm nhầm nút nhỏ | [Apple Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) khuyến nghị kích thước điều khiển iOS/iPadOS 44×44 pt và khoảng cách phù hợp. Native pt không phải định nghĩa CSS px. | Quy ước web của project: tối thiểu 44 CSS px cho hành động chính, ưu tiên 48–56; ô hình bộ phận lớn hơn. |
| Cử chỉ khó nhớ | [W3C Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) yêu cầu phương án một con trỏ không kéo cho thao tác kéo, trừ ngoại lệ. | Nút zoom, tách–ráp và góc nhìn có sẵn; vẫn giữ kéo xoay/pinch. Đây chưa phải tuyên bố đạt toàn bộ WCAG. |
| Giữ máy ngang nhưng có thể xoay | [W3C Orientation](https://www.w3.org/WAI/WCAG21/Understanding/orientation.html) giải thích việc không ép một chiều khi không thiết yếu. | Ngang là bố cục chính; dọc và cửa sổ hẹp vẫn hoạt động. |
| Xung đột cuộn trang và xoay xe | [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) mô tả quyền xử lý cử chỉ của trình duyệt và ứng dụng. | Chỉ canvas chặn cử chỉ mặc định; vùng ngoài canvas vẫn cuộn/zoom trang. |
| Bé chưa đọc | Yêu cầu của phụ huynh; các giải pháp bên phải là quyết định thiết kế của project, chưa phải kết quả thử nghiệm với trẻ. | Chọn bộ phận bằng hình, chạm trực tiếp mô hình, nút loa hướng dẫn và phát tên. Chữ hỗ trợ bố mẹ và quá trình học đọc. |

## Trải nghiệm hiện tại

- Ngang: xe bên trái, bảng hình bên phải. Ở viewport ngang thấp, bảng hình cuộn riêng; phần tên/replay và điều khiển xe ở ngoài vùng cuộn đó.
- Dọc iPad: khung xe phía trên, bảng hình phía dưới; khung xe giữ vị trí khi cuộn để bé thấy phản hồi.
- 12 hình bộ phận: thân, nắp ca-pô, nóc, cửa, bánh, đèn, gương, cốp, động cơ, ghế, vô lăng, trục.
- Chạm nút loa để nghe cách chơi. Chạm một hình hoặc một bộ phận để nghe tên và làm sáng bộ phận đó.
- 20 file âm thanh tiếng Việt: 12 tên, hướng dẫn và 7 hành động/góc nhìn. File được tổng hợp bằng giọng Linh trên macOS, không phải thu âm người thật.
- Phát một âm thanh tại một thời điểm; đổi bộ phận, tắt âm thanh hoặc rời trang sẽ ngắt âm cũ. Nếu file lỗi, thử giọng thiết bị; nếu cả hai lỗi, hiện thông báo để phụ huynh hỗ trợ.
- Kéo ra xa rồi trở lại, pinch thả từng ngón và pointer cancel không được coi là tap.
- Không tự xoay xe trong lúc bé quan sát. Reduced-motion áp dụng cả cho chuyển động tách.

## Hình dáng và tải render

Tham khảo tỷ lệ sedan từ [catalogue Accent 2021 Việt Nam](https://www.hyundaihadong.com.vn/ckfinder/userfiles/images/product/Accent-2021-catalogue-preview.pdf). Mô hình là phiên bản đồ chơi có cách điệu, không phải CAD chính xác.

Sau chỉnh: cabin thấp, mui cong, kính nghiêng, grille thuôn, đèn vuốt, đèn hậu vòng sang hông. Bánh giữ tiết diện tròn. Geometry được gộp theo vật liệu trong cùng nhóm tách, không gộp các bánh hay cửa chuyển động độc lập. Mô hình hiện có 50 mesh, khoảng 69.628 tam giác; đây là số đếm geometry, không phải số đo FPS hay chứng nhận hiệu năng iPad.

## Ma trận kiểm tra

- Desktop/browser viewport: 1024×768, 1180×820, 1024×650 ngang; 820×1180 dọc; 390×844 hẹp.
- Kiểm tra thao tác: chạm mô hình, chọn hình, tách–ráp, zoom tự tách, đặt lại, góc nhìn, phát lại, về trang chủ; hình lắp/tách không ra ngoài khung.
- Regression tự động: tỷ lệ sedan, bánh tròn, part ID đầy đủ, không drift sau tách–ráp, highlight khôi phục, pinch/drag/cancel không chọn nhầm, audio asset đầy đủ.
- Kiểm tra trên iPad Safari thật còn cần thực hiện: pinch hai ngón, palm/edge touches khi cầm máy, thay đổi thanh công cụ Safari, nghe phát âm/âm lượng, VoiceOver và hiệu năng sau 10–15 phút. Mô phỏng viewport desktop không thay thế các kiểm tra này.

## Quan sát bé dùng lần đầu

Đưa máy cho bé ở trang chọn xe, không đọc hộ các nút ngay. Quan sát bé có tự vào xe, bấm loa, tìm bánh, tách xe và ráp lại không. Nếu bé không nhận ra hình, chỉnh hình trước khi thêm chữ. Nếu chưa hiểu ký hiệu tách, bổ sung minh họa hai trạng thái hoặc lời nhắc ngắn; chưa tự động thêm trò chơi thưởng/đếm giờ.
