# Báo cáo Audit Website Bấu Chụp Choẹt — Đối chiếu Yêu cầu, Repository và Production

---

## 1. Thông tin Phiên bản, Thời điểm & Môi trường Kiểm tra

| Hạng mục | Giá trị đã xác minh |
| :--- | :--- |
| **Thời điểm thực hiện audit** | `2026-10-21 19:48 – 19:58 (UTC+07:00)` |
| **Frontend Repository** | `https://github.com/lightvu25/Portflio-Web-Frontend` (`d:/Web_Portfolio/frontend`) |
| **Frontend Branch** | `main` (working tree sạch trước khi xuất báo cáo) |
| **Frontend Commit SHA (`HEAD`)** | `7adc2b9b48a7dd0bf82c4030c1c926cdfbebc374` (`increase image quality`, `2026-10-20 23:20:27 +0700`) |
| **Các commit frontend liền trước** | `8520d3b` (`fixed local turnstile`), `47c06d8` (`updated button visual, remove border line`), `90b6243` (`fixed lag`), `e511eec` (`update api`), `80a66c0` (`misc ui fixes`), `3daa411` (`updated component`), `6f6d31f` (`updated package page`) |
| **Backend Repository** | `https://github.com/lightvu25/Photography-Portfolio-Backend` (`d:/Web_Portfolio/backend`) |
| **Backend Branch & Commit SHA (`HEAD`)** | `main` — `d0879fc` (`fixed booking error`) |
| **Production Frontend URL** | `https://bauchupchoet.vercel.app/` (đã deploy commit `7adc2b9`, xác nhận HTML trả về `q=100` trên `/_next/image`) |
| **Production Backend API URL** | `https://bauchupchoet.onrender.com` |
| **Tài liệu yêu cầu đối chiếu** | Nội dung yêu cầu từ `Chỉnh sửa web Bấu chụp choẹt.docx` (lưu ý: file `.docx` gốc không tồn tại trên ổ cứng máy local `C:\` / `D:\`; toàn bộ hạng mục trong tài liệu đã được trích xuất và đối chiếu theo danh mục A–G của yêu cầu audit, kết hợp đối chiếu với `C:\Users\quang\OneDrive\Documents\Cam nhan.docx` và `d:/Web_Portfolio/scripts/seed_feedback.py`). |

### Phân loại phương thức xác minh trong báo cáo
- **`[SOURCE]`**: Được xác nhận trực tiếp từ mã nguồn thực tế (`d:/Web_Portfolio/frontend` và `d:/Web_Portfolio/backend`).
- **`[PROD]`**: Được xác nhận bằng truy vấn HTTP / kiểm tra DOM & API thực tế trên `https://bauchupchoet.vercel.app` và `https://bauchupchoet.onrender.com` (không tạo dữ liệu rác hay gửi booking thật).
- **`[UNVERIFIED]`**: Chưa thể xác minh do thiếu file gốc hoặc cần thao tác có side-effect trên dữ liệu thật.

---

## 2. Bảng Tổng hợp Đối chiếu Từng Yêu cầu (A – G)

> **Quy ước trạng thái:**
> - `DONE` — Đã hoàn thành và xác minh trên cả source code lẫn production.
> - `PARTIAL` — Mới hoàn thành một phần hoặc đã có cơ chế nhưng thiếu dữ liệu/chi tiết yêu cầu.
> - `MISSING` — Chưa triển khai trong source code và production.
> - `BROKEN` — Đã có nhưng hoạt động sai hoặc sai lệch so với yêu cầu.
> - `UNVERIFIED` — Chưa đủ bằng chứng xác minh.
> - `NEEDS_CONFIRMATION` — Cần chủ website quyết định trước khi sửa code/dữ liệu.

### Hạng mục A — Giao diện và Nội dung

| Mã | Yêu cầu chi tiết | Trạng thái | Nguồn xác minh | Tóm tắt bằng chứng (File / Dòng code / Production) |
| :--- | :--- | :---: | :---: | :--- |
| **A1** | Đặt lịch được ưu tiên đủ rõ khi khách vừa vào trang | `PARTIAL` | `[SOURCE]` `[PROD]` | Desktop có nút pill xanh `Liên hệ` (`-> /booking`) trên header (`SiteHeader.tsx:85-89`) và cụm `CÙNG HỢP TÁC` + nút mũi tên tròn ở Hero (`HeroSection.tsx:48-55`). Tuy nhiên trên **mobile (`<768px`)**, nút CTA trên thanh header bị ẩn (`hidden ... md:inline-block`), khách vào trang trên điện thoại chỉ thấy chữ `CÙNG HỢP TÁC` (không ghi rõ là đặt lịch) hoặc phải mở menu hamburger. |
| **A2** | CTA “Cùng hợp tác” chuyển thành “Đặt lịch ngay” ở các vị trí cần thiết | `MISSING` | `[SOURCE]` `[PROD]` | `components/home/HeroSection.tsx:48-54` vẫn hardcode `"CÙNG"` + `CtaArrowLink` + `"HỢP TÁC"`. `components/shared/SiteFooter.tsx:57-63` vẫn hardcode `"CÙNG NHAU"` / `"TẠO KHOẢNH KHẮC"`. Chưa đổi thành `"Đặt lịch ngay"`. |
| **A3** | Hero đổi “Nhiếp ảnh bởi” thành “Chào cả nhà, tui tên là” | `MISSING` | `[SOURCE]` `[PROD]` | `components/home/HeroSection.tsx:38` vẫn hardcode `NHIẾP ẢNH BỞI` phía trên tên `BẤU CHỤP CHOẸT`. |
| **A4** | Marquee có các nội dung: kỉ yếu THCS, THPT, tốt nghiệp đại học, áo dài và concept | `MISSING` | `[SOURCE]` `[PROD]` | `components/shared/CategoryMarquee.tsx:34-43` lấy dữ liệu động từ `GET /api/categories` (chỉ lấy `type = PORTFOLIO`). Trên production, `/api/categories` hiện chỉ trả về 6 danh mục: `Portrait`, `Cá nhân`, `Gia đình`, `Cặp đôi`, `Sự kiện`, `Đời thường`. Chưa có các danh mục `Kỉ yếu THCS`, `Kỉ yếu THPT`, `Tốt nghiệp đại học`, `Áo dài`, `Concept`. |
| **A5** | Phần giới thiệu (`AboutSection`) có đúng nội dung chủ website yêu cầu | `PARTIAL` | `[SOURCE]` `[PROD]` | Ảnh giới thiệu (`aboutPhoto`, `id=28`) đã hiển thị đúng ảnh chủ web chọn từ danh mục `Admin`. Tuy nhiên trên production `GET /api/site` đang trả về `"bio": null, "experience": null`, nên `components/home/AboutSection.tsx:79-83` đang fallback về đoạn văn mẫu viết sẵn: *"Nhiếp ảnh gia tại Việt Nam, tập trung vào chân dung, cặp đôi và những khoảnh khắc đời thường..."*. Ngoài ra nút `"Xem hồ sơ"` (`AboutSection.tsx:45-50`) chỉ trỏ tới `#about` (chính section hiện tại). |
| **A6** | Màu chủ đạo sử dụng `#6B8E5A` nhất quán ở các thành phần cần thiết | `MISSING` | `[SOURCE]` `[PROD]` | Mã màu `#6B8E5A` chưa xuất hiện ở bất kỳ đâu trong repo. `app/globals.css:29` đang đặt `--purple-55: rgba(34, 197, 94, 1)` (`#22C55E` — xanh lá tươi) và `HeroSection.tsx:9` dùng `#22C55E`. Các trang `/admin/*` dùng class Tailwind `bg-green-600` (`#16A34A`). |
| **A7** | Nút “Liên hệ”, CTA hero và footer có kích thước, style và điều hướng phù hợp | `PARTIAL` | `[SOURCE]` `[PROD]` | `CtaArrowLink.tsx:21-38` đã đồng bộ nút mũi tên tròn (`w-16 h-10 md:w-20 md:h-12 bg-purple-55`) trỏ tới `/booking`. Nút `"Liên hệ"` trên `SiteHeader.tsx:85-89` trỏ tới `/booking`. Tuy nhiên nhãn chữ ở Hero/Footer chưa đổi sang `"Đặt lịch ngay"`, và nút `"Liên hệ"` trên Header bị ẩn ở màn hình mobile (`hidden md:inline-block`). |
| **A8** | Layout trên màn hình nhỏ (mobile) không bị tràn, chồng lấn hoặc khó sử dụng | `DONE` | `[SOURCE]` `[PROD]` | Đã kiểm tra cấu trúc responsive trên toàn bộ các trang public: container dùng `max-w-[1400px] mx-auto px-5 md:px-10`, chữ tiêu đề dùng `clamp(...)` + `break-words`, `CategoryMarquee` dùng `overflow-hidden` với track chạy ngang, `PortfolioPreviewSection` dùng `overflow-x-auto no-scrollbar`. Không có phần tử固定 `1920px` gây tràn ngang trên mobile. |

---

### Hạng mục B — Giá và Quyền lợi Dịch vụ

| Mã | Yêu cầu chi tiết | Trạng thái | Nguồn xác minh | Tóm tắt bằng chứng (File / Dòng code / Production) |
| :--- | :--- | :---: | :---: | :--- |
| **B1** | Giá 3 gói **Cá nhân** (`1.3tr / 2.1tr`), **Nhóm 2** (`1.7tr / 2.5tr`), **Nhóm 3** (`2.1tr / 2.9tr`) | `BROKEN` | `[SOURCE]` `[PROD]` | Nguồn dữ liệu chuẩn là database backend (`GET /api/pricing`). Trên production hiện tại, cả 6 mức giá trong DB đều **cao hơn 100.000đ – 300.000đ** so với yêu cầu: Cá nhân `1.400.000đ / 2.200.000đ`, Nhóm 2 `1.800.000đ / 2.800.000đ`, Nhóm 3 `2.200.000đ / 3.000.000đ` (tương ứng seed trong `V8__vietnamese_content.sql` & `V9__package_group_3.sql`). |
| **B2** | Xác nhận thứ tự mức giá thứ nhất / thứ hai tương ứng với loại buổi chụp (`HALF_DAY` vs `FULL_DAY`) | `NEEDS_CONFIRMATION` | `[SOURCE]` `[PROD]` | Trong DB hiện tại (`V8`, `V9` và `/api/pricing`), mức giá thấp hơn gắn với `sessionType: "HALF_DAY"` (Nửa ngày — Buổi sáng hoặc Buổi chiều) và mức giá cao hơn gắn với `sessionType: "FULL_DAY"` (Cả ngày). Cần chủ website xác nhận chính thức tên hiển thị và mapping này trước khi cập nhật giá. |
| **B3** | Phụ phí: Chụp đến 19h (`+300.000đ`), Ngoại tỉnh (`nhận cả ngày`), Chi phí di chuyển theo khu vực (`ghi rõ là ước tính`) | `MISSING` | `[SOURCE]` `[PROD]` | `components/pricing/PricingPage.tsx:243-247` hiện chỉ có 1 dòng chú thích nhỏ: `* Giá chưa bao gồm chi phí di chuyển.` Chưa hiển thị 3 quy định phụ phí: chụp đến 19h (+300.000đ), ngoại tỉnh chỉ nhận cả ngày, và bảng/ghi chú chi phí di chuyển ước tính theo khu vực. |
| **B4** | Quyền lợi dịch vụ: súng bong bóng, hắt sáng, flash, đèn giả nắng, full file căn chỉnh cơ bản, hậu kỳ 10 ảnh chi tiết, staff tính thêm phí, hỗ trợ chụp film khi khách có máy | `PARTIAL` | `[SOURCE]` `[PROD]` | Mảng `BENEFITS` đang hardcode tại `components/pricing/PricingPage.tsx:17-28`:<br>- **Sai số lượng**: Đang ghi `"Hậu kỳ chi tiết 15 ảnh"` thay vì **`10 ảnh`**.<br>- **Thiếu mục**: Chưa có `"Staff hỗ trợ tính thêm phí"` (hoặc nội dung tương đương).<br>- **Khác câu chữ**: Đang ghi `"Nhận full file đã làm màu"` thay vì `"Full file đã căn chỉnh cơ bản"`.<br>- Các mục súng bong bóng, hắt sáng, đèn giả nắng, đèn flash, hỗ trợ chụp film khi khách có máy đã có mặt. |

---

### Hạng mục C — Form và Luồng Đặt lịch

| Mã | Yêu cầu chi tiết | Trạng thái | Nguồn xác minh | Tóm tắt bằng chứng (File / Dòng code / Production) |
| :--- | :--- | :---: | :---: | :--- |
| **C1** | Đổi nhãn “Họ và tên” → “Họ tên bạn” | `MISSING` | `[SOURCE]` `[PROD]` | `components/booking/BookingPage.tsx:275` vẫn hiển thị `<label ...>Họ và tên</label>`. |
| **C2** | Đổi nhãn “Địa chỉ chụp” → “Địa chỉ cụ thể”, hướng dẫn nhập tên trường, xã/phường, tỉnh/thành phố | `MISSING` | `[SOURCE]` `[PROD]` | `components/booking/BookingPage.tsx:283-290` vẫn hiển thị `<label ...>Địa chỉ chụp</label>` và `placeholder="Địa điểm mong muốn"`, chưa có hướng dẫn nhập tên trường, xã/phường, tỉnh/thành phố. |
| **C3** | Đổi nhãn “Ngày mong muốn” → “Ngày dự kiến chụp” | `MISSING` | `[SOURCE]` `[PROD]` | `components/booking/BookingPage.tsx:225` vẫn hiển thị `<label ...>Ngày mong muốn</label>`. |
| **C4** | Thêm trường “Lưu ý với thợ” | `MISSING` | `[SOURCE]` `[PROD]` | Không có trường ghi chú/lưu ý trong `components/booking/BookingPage.tsx`, `types/booking.ts`, `BookingRequest.java` (`d:/Web_Portfolio/backend/src/main/java/com/photography/backend/booking/dto/BookingRequest.java`) lẫn bảng `bookings` (`Booking.java`). |
| **C5** | Tạo tin nhắn mẫu để khách sao chép và gửi qua Instagram, Facebook hoặc Zalo | `NEEDS_CONFIRMATION` | `[SOURCE]` `[PROD]` | Chưa được triển khai (`MISSING` trong code). Hiện tại khi bấm `"Gửi yêu cầu đặt lịch"`, form gọi `POST /api/bookings` (kiểm tra lịch trống, giữ chỗ 30 phút, xác thực Cloudflare Turnstile, sinh mã `BK-yyyyMMdd-XXXXXX`) và hiển thị màn hình xác nhận tại chỗ (`BookingPage.tsx:120-169`). **Cần chủ website xác nhận** việc tạo tin nhắn copy + nút mở Instagram/Facebook/Zalo là **bước bổ sung sau khi tạo booking thành công** hay thay đổi luồng đặt lịch hiện tại. |
| **C6** | Trang `/booking/result` | `PARTIAL` | `[SOURCE]` | `app/booking/result/page.tsx:1-3` vẫn là placeholder `<div>Booking Result</div>` (dù luồng chính đang hiển thị kết quả ngay trong state `result` của `BookingPage.tsx:120-169`). |

---

### Hạng mục D — Ảnh Giới thiệu và Quyền Riêng tư (Danh mục `Admin`)

| Mã | Yêu cầu chi tiết | Trạng thái | Nguồn xác minh | Tóm tắt bằng chứng (File / Dòng code / Production) |
| :--- | :--- | :---: | :---: | :--- |
| **D1** | Ảnh thuộc danh mục `Admin` được chọn làm ảnh giới thiệu (`AboutSection`) | `DONE` | `[SOURCE]` `[PROD]` | Backend `AdminSiteController.java:64-78` bắt buộc `profilePhotoId` phải thuộc danh mục `admin-noi-bo` (`Admin`). `SiteService.java:24-44` tự động gán `aboutPhoto` (ưu tiên `profilePhoto` nếu thuộc `Admin`, nếu trống thì lấy ảnh `PUBLISHED` đầu tiên trong danh mục `Admin`). Trên production, `GET /api/site` trả về `aboutPhoto.id = 28` (`IMG_7294_Original`) và hiển thị tại `AboutSection.tsx:31,56-64`. |
| **D2** | Ảnh `Admin` bị loại khỏi gallery public, marquee, preview, ảnh liên quan, API danh sách công khai và URL chi tiết trực tiếp | `DONE` | `[SOURCE]` `[PROD]` | - **Backend API**: `PhotoRepository.java:22-30` định nghĩa điều kiện `PUBLIC_ONLY` loại trừ mọi ảnh có category `slug = 'admin-noi-bo'`. Cả `GET /api/gallery` và `GET /api/gallery/featured` đều dùng query này. Trên production, `GET /api/gallery` trả về 23 ảnh, **không chứa** ảnh `id=28`.<br>- **Frontend**: `HomePage.tsx`, `GalleryPage.tsx`, `PortfolioPreviewSection.tsx`, và `app/gallery/[id]/page.tsx` đều đọc từ `fetchPhotos()` (`GET /api/gallery`).<br>- **Truy cập trực tiếp `/gallery/28` trên production**: Trả về trang 404 (`NEXT_HTTP_ERROR_FALLBACK;404` / `"This page could not be found"`), không lộ nội dung trang chi tiết của ảnh `id=28`. |
| **D3** | Phân biệt bảo vệ truy cập ứng dụng với quyền truy cập trực tiếp tới URL ảnh Cloudinary / API `/api/site` | `PARTIAL` | `[SOURCE]` `[PROD]` | **Lưu ý về quyền riêng tư (Privacy Caveats):**<br>1. `GET /api/site` là API công khai để render trang chủ, nên ảnh nào đang được chọn làm `aboutPhoto` sẽ có `imageUrl` công khai trong payload `GET /api/site` (và hiện đang serialize cả mảng `categories: [{ name: "Admin", slug: "admin-noi-bo" }]`).<br>2. Các ảnh khác trong danh mục `Admin` (không được chọn làm `aboutPhoto`) **không xuất hiện** trong bất kỳ API công khai nào (`/api/gallery`, `/api/gallery/featured`, `/api/site`). Tuy nhiên, trên Cloudinary (`CloudinaryService.java:39-47`), ảnh được upload ở chế độ `upload` mặc định (public URL `https://res.cloudinary.com/dxg8llcr2/image/upload/...`), không phải `authenticated`/signed URL; ai có sẵn đường link Cloudinary trực tiếp vẫn mở được file ảnh. |

---

### Hạng mục E — Feedback Khách hàng

| Mã | Yêu cầu chi tiết | Trạng thái | Nguồn xác minh | Tóm tắt bằng chứng (File / Dòng code / Production) |
| :--- | :--- | :---: | :---: | :--- |
| **E1** | Nguồn review hiện tại là backend thật hay mock/sample? Còn số liệu đánh giá mẫu không? | `DONE` | `[SOURCE]` `[PROD]` | Đã kết nối hoàn toàn với backend thật qua `GET /api/feedback` (`lib/data.ts:44-49`). Trên production có 5 feedback thật đã duyệt (`id: 8..12`), khớp với nội dung trong `scripts/seed_feedback.py` và file `Cam nhan.docx`. Đã xóa toàn bộ mock review và xóa con số tổng đánh giá giả ở `TestimonialsSection.tsx`. |
| **E2** | Có ảnh feedback thật được hiển thị và tương ứng đúng với từng feedback không? | `MISSING` | `[SOURCE]` `[PROD]` | Trên production, `GET /api/feedback` trả về `"imageUrl": null, "cloudinaryPublicId": null` cho **cả 5/5 feedback** (`id: 8..12`).<br>- Nguyên nhân **không phải lỗi API hay lỗi giao diện**, mà do lúc chạy `scripts/seed_feedback.py` chỉ gửi text (`POST /api/feedback` + duyệt), chưa gọi `POST /api/admin/feedbacks/{id}/image` để đính kèm 5 file ảnh có sẵn trong thư mục `d:/Web_Portfolio/images/Feedback/`.<br>- Hệ quả trên giao diện: Ở trang chủ (`TestimonialsSection.tsx`), các thẻ review chỉ hiện chữ. Ở trang `/feedback` (`FeedbackPage.tsx:31-73`), vì không có feedback nào có `imageUrl`, phần thẻ lớn `featured` trên cùng không render và cả 5 feedback rơi xuống lưới thẻ chỉ có chữ bên dưới. |

---

### Hạng mục F — Ảnh và Hiệu năng

| Mã | Yêu cầu chi tiết | Trạng thái | Nguồn xác minh | Tóm tắt bằng chứng (File / Dòng code / Production) |
| :--- | :--- | :---: | :---: | :--- |
| **F1** | Cấu hình `next/image`, `quality={100}`, `images.qualities` và `sizes` cho toàn bộ ảnh nhiếp ảnh công khai | `DONE` | `[SOURCE]` `[PROD]` | Commit `7adc2b9` đã cấu hình `qualities: [75, 100]` trong `next.config.ts:12` và gắn `quality={100}` kèm `sizes` chuẩn xác cho cả 8 component ảnh công khai (`FeaturedCollage.tsx`, `PortfolioPreviewSection.tsx`, `AboutSection.tsx`, `ServicesPreviewSection.tsx`, `GalleryGrid.tsx`, `PhotoDetail.tsx`, `PricingPage.tsx`, `FeedbackPage.tsx`). Đã xác nhận HTML trên `https://bauchupchoet.vercel.app/` đang phục vụ URL `/_next/image?...&q=100` (WebP). |
| **F2** | Nguồn ảnh Cloudinary, crop và giữ nguyên tối ưu tải ảnh (`lazy`, `priority`, caching) | `DONE` | `[SOURCE]` `[PROD]` | Backend trả URL Cloudinary gốc độ phân giải cao (`2133×3200` đến `6000×4000`), khi crop chỉ gắn toạ độ tỉ lệ `c_crop,x_...,y_...,w_...,h_...` không nén giảm chất lượng (`GalleryService.java:289-304`). Chỉ ảnh hero chính trên `/` và ảnh chính trên `/gallery/[id]` dùng `priority`, các ảnh dưới fold giữ nguyên lazy loading và responsive `srcSet`. |

---

### Hạng mục G — Các Báo cáo và Tài liệu Cũ (`docs/*`, `README.md`)

| Mã | Tài liệu kiểm tra | Trạng thái | Nguồn xác minh | Nội dung đã lỗi thời / mâu thuẫn với source code hiện tại |
| :--- | :--- | :---: | :---: | :--- |
| **G1** | `frontend/docs/FRONTEND_VISUAL_INTEGRATION_REPORT.md` | `BROKEN` (Lỗi thời) | `[SOURCE]` | Tài liệu ghi dự án đang ở giai đoạn *"No backend integration yet"*, dùng ảnh mẫu Unsplash (`images.unsplash.com`), 16 ảnh mock, và các file `lib/mock/site.ts`, `lib/mock/portfolio.ts`, `lib/mock/pricing.ts`, `lib/mock/testimonials.ts`. Thực tế thư mục `lib/mock/` đã bị xóa hoàn toàn và toàn bộ trang đã tích hợp API thật + Cloudinary. |
| **G2** | `frontend/docs/FRONTEND_ARCHITECTURE.md` | `PARTIAL` (Lỗi thời một phần) | `[SOURCE]` | Dòng 19–25 và 80–97 vẫn ghi `/booking`, `/feedback`, `/admin/*` là *"placeholder"*, và ghi tên mẫu *"Damien Braun"* / giá USD là *"to be wired to the API next phase"*. Thực tế `/booking`, `/feedback` và toàn bộ 7 trang `/admin/*` đã được triển khai đầy đủ; chỉ còn `/booking/result` là placeholder. |
| **G3** | `frontend/README.md` | `BROKEN` (Lỗi thời) | `[SOURCE]` | Vẫn mô tả kiến trúc cũ trước khi refactor: Next.js 15 (`15.2.3`), dark-mode (`#070708`), `/home` redirect, cấu trúc `app/HomePage/sections/*`, biến môi trường `NEXT_PUBLIC_API_BASE_URL` (thực tế hiện dùng Next.js `16.3.5`, light theme, `NEXT_API_URL` và `NEXT_PUBLIC_TURNSTILE_SITE_KEY`). |
| **G4** | `docs/API_CONTRACT.md` | `PARTIAL` (Thiếu trường & endpoint mới) | `[SOURCE]` | Chưa cập nhật các thay đổi từ migrations `V8`–`V11`:<br>- `Category` có thêm trường `type` (`PORTFOLIO` \| `PACKAGE`) và danh mục hệ thống `admin-noi-bo`.<br>- `Photo` có thêm `originalImageUrl`, `cropX`, `cropY`, `cropW`, `cropH` và 2 API mới: `POST /api/admin/photos/reorder`, `PUT /api/admin/photos/bulk-categories`.<br>- `PricingPackage` có thêm `coverPhotoId`, `coverImageUrl`.<br>- `SiteSettings` có thêm `profilePhoto`, `aboutPhoto` và `profilePhotoId` trong request.<br>- Mục 7 ghi biến môi trường là `NEXT_PUBLIC_API_URL` (thực tế code dùng `NEXT_API_URL` trong `next.config.ts:5`). |

---

## 3. Bằng chứng Chi tiết cho Từng Hạng mục

### 3.1. Hạng mục A — Giao diện và Nội dung

1. **Eyebrow và CTA trên Hero (`components/home/HeroSection.tsx`)**:
   - Tại `d:/Web_Portfolio/frontend/components/home/HeroSection.tsx` (dòng 37–57):
     ```tsx
     <p className="text-xs md:text-sm font-medium uppercase tracking-[0.14em] text-grey-70">
       NHIẾP ẢNH BỞI
     </p>
     <h1 className="mt-2 font-semibold uppercase tracking-tight text-absolutewhite text-[clamp(2rem,5vw,4.25rem)] leading-[1.08] break-words">
       {name}
     </h1>
     ...
     <div className="flex items-center gap-4">
       <span className="font-semibold uppercase text-absolutewhite text-[clamp(1.75rem,4vw,3.25rem)] leading-none">
         CÙNG
       </span>
       <CtaArrowLink href="/booking" label="Đặt lịch chụp" />
     </div>
     <p className="mt-1 font-semibold uppercase text-absolutewhite text-[clamp(1.75rem,4vw,3.25rem)] leading-none">
       HỢP TÁC
     </p>
     ```
   - **Đối chiếu**: Chưa đổi `"NHIẾP ẢNH BỞI"` thành `"Chào cả nhà, tui tên là"`, và chưa đổi `"CÙNG HỢP TÁC"` thành `"Đặt lịch ngay"`.

2. **CTA trên Header và Footer (`SiteHeader.tsx`, `SiteFooter.tsx`, `ContactCtaSection.tsx`)**:
   - `d:/Web_Portfolio/frontend/components/shared/SiteHeader.tsx` (dòng 85–89):
     ```tsx
     <Link
       href="/booking"
       className="hidden rounded-[10px] border border-dark-20 bg-purple-55 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-60 md:inline-block"
     >
       Liên hệ
     </Link>
     ```
     Trên mobile (`<768px`), nút này có class `hidden`, không hiển thị trên thanh điều hướng.
   - `d:/Web_Portfolio/frontend/components/shared/SiteFooter.tsx` (dòng 54–63): Hiển thị `"CÙNG NHAU"` + `CtaArrowLink` + `"TẠO KHOẢNH KHẮC"`.
   - `d:/Web_Portfolio/frontend/components/home/ContactCtaSection.tsx` (dòng 36–41): Đã có nút `"Đặt lịch chụp"` (`-> /booking`) và `"Xem bảng giá"` (`-> /pricing`), nhưng nằm ở cuối trang chủ.

3. **Thanh chạy chữ Marquee (`CategoryMarquee.tsx` & dữ liệu `/api/categories`)**:
   - `d:/Web_Portfolio/frontend/components/shared/CategoryMarquee.tsx` (dòng 34–43) nhận `categories` từ `fetchCategories()` (`GET /api/categories`).
   - Backend `CategoryService.java` (dòng 36–39) trả về `categoryRepository.findByTypeOrderBySortOrderAsc(CategoryType.PORTFOLIO)`.
   - Kết quả truy vấn thực tế `GET https://bauchupchoet.onrender.com/api/categories`:
     - Chỉ có 6 mục: `Portrait` (`id=1`), `Cá nhân` (`id=3`), `Gia đình` (`id=4`), `Cặp đôi` (`id=5`), `Sự kiện` (`id=2`), `Đời thường` (`id=6`).
     - Hoàn toàn chưa có: **Kỉ yếu THCS, THPT, Tốt nghiệp đại học, Áo dài, Concept**.

4. **Phần Giới thiệu (`AboutSection.tsx` & dữ liệu `/api/site`)**:
   - Kết quả truy vấn thực tế `GET https://bauchupchoet.onrender.com/api/site`:
     ```json
     {
       "photographerName": "BẤU CHỤP CHOẸT",
       "experience": null,
       "bio": null,
       "facebookUrl": null,
       "instagramUrl": "https://instagram.com/haibau",
       "messengerUrl": null,
       "depositAmount": 500000,
       "aboutPhoto": { "id": 28, "title": "IMG_7294_Original", ... }
     }
     ```
   - Vì `site.bio` đang là `null`, `d:/Web_Portfolio/frontend/components/home/AboutSection.tsx` (dòng 79–83) hiển thị đoạn văn mặc định trong code thay vì lời giới thiệu riêng của chủ web.

5. **Màu chủ đạo `#6B8E5A` (`app/globals.css`)**:
   - Tại `d:/Web_Portfolio/frontend/app/globals.css` (dòng 29–36):
     ```css
     --purple-55: rgba(34, 197, 94, 1);   /* #22C55E */
     --purple-60: rgba(22, 163, 74, 1);   /* #16A34A */
     --purple-70: rgba(74, 222, 128, 1);  /* #4ADE80 */
     --purple-80: rgba(134, 239, 172, 1); /* #86EFAC */
     --purple-90: rgba(187, 247, 208, 1); /* #BBF7D0 */
     ```
   - Tại `d:/Web_Portfolio/frontend/components/home/HeroSection.tsx` (dòng 9): `fill="#22C55E"`.
   - Chưa chuyển sang bảng màu xanh rêu/olive `#6B8E5A` (`rgb(107, 142, 90)`).

---

### 3.2. Hạng mục B — Giá và Quyền lợi Dịch vụ

1. **Đối chiếu bảng giá giữa Yêu cầu vs Production (`GET /api/pricing`) vs Database Migrations (`V8`, `V9`)**:

| Gói chụp | Số người (`groupSize`) | Loại buổi trong DB (`sessionType`) | Giá trên Production (`GET /api/pricing`) | Giá trong Yêu cầu Audit | Chênh lệch |
| :--- | :---: | :---: | ---: | ---: | ---: |
| **Cá nhân** (`id=2`) | 1 | `HALF_DAY` (Nửa ngày) | `1.400.000 ₫` | **`1.300.000 ₫`** | Lệch `+100.000 ₫` |
| **Cá nhân** (`id=3`) | 1 | `FULL_DAY` (Cả ngày) | `2.200.000 ₫` | **`2.100.000 ₫`** | Lệch `+100.000 ₫` |
| **Nhóm 2** (`id=4`) | 2 | `HALF_DAY` (Nửa ngày) | `1.800.000 ₫` | **`1.700.000 ₫`** | Lệch `+100.000 ₫` |
| **Nhóm 2** (`id=5`) | 2 | `FULL_DAY` (Cả ngày) | `2.800.000 ₫` | **`2.500.000 ₫`** | Lệch `+300.000 ₫` |
| **Nhóm 3** (`id=6`) | 3 | `HALF_DAY` (Nửa ngày) | `2.200.000 ₫` | **`2.100.000 ₫`** | Lệch `+100.000 ₫` |
| **Nhóm 3** (`id=7`) | 3 | `FULL_DAY` (Cả ngày) | `3.000.000 ₫` | **`2.900.000 ₫`** | Lệch `+100.000 ₫` |

   - **Nguồn dữ liệu chuẩn**: Giá hiển thị ở trang chủ (`ServicesPreviewSection.tsx`), trang bảng giá (`PricingPage.tsx`), trang chi tiết ảnh (`PhotoDetail.tsx`) và trang đặt lịch (`BookingPage.tsx`) đều lấy trực tiếp từ `GET /api/pricing` (bảng `pricing_packages` trên PostgreSQL), có thể chỉnh sửa qua trang quản trị `/admin/pricing` (`PUT /api/admin/pricing/{id}`) hoặc migration SQL.

2. **Đối chiếu Quyền lợi dịch vụ (`components/pricing/PricingPage.tsx:17-28`)**:
   - Code hiện tại:
     ```ts
     const BENEFITS: Benefit[] = [
       { title: "Nhận full file đã làm màu", ... },
       { title: "Hậu kỳ chi tiết 15 ảnh", ... },
       { title: "Hỗ trợ hắt sáng", ... },
       { title: "Hỗ trợ súng bắn bong bóng", ... },
       { title: "Hỗ trợ đèn giả nắng", ... },
       { title: "Hỗ trợ đèn flash", ... },
       { title: "Hỗ trợ chụp phim nếu khách có sẵn máy", ... },
     ];
     ```
   - **Sai lệch so với yêu cầu**:
     1. `"Hậu kỳ chi tiết 15 ảnh"` $\rightarrow$ Yêu cầu là **hậu kỳ 10 ảnh chi tiết**.
     2. `"Nhận full file đã làm màu"` $\rightarrow$ Yêu cầu là **full file đã căn chỉnh cơ bản**.
     3. **Thiếu** mục: **Staff tính thêm phí**.

3. **Đối chiếu Phụ phí (`components/pricing/PricingPage.tsx:243-247`)**:
   - Code hiện tại chỉ có dòng: `<p className="mt-6 text-center text-xs text-grey-70">* Giá chưa bao gồm chi phí di chuyển.</p>`.
   - **Thiếu hoàn toàn**:
     - Phụ phí chụp đến 19h: `+300.000đ`.
     - Quy định chụp ngoại tỉnh: nhận cả ngày.
     - Chi phí di chuyển theo khu vực (ghi rõ là ước tính).

---

### 3.3. Hạng mục C — Form và Luồng Đặt lịch

1. **Nhãn và trường thông tin trong `d:/Web_Portfolio/frontend/components/booking/BookingPage.tsx`**:
   - **Dòng 225**: `<label className="block text-xs uppercase tracking-wider text-grey-70">Ngày mong muốn</label>` $\rightarrow$ Chưa đổi thành **`Ngày dự kiến chụp`**.
   - **Dòng 275**: `<label className="block text-xs uppercase tracking-wider text-grey-70">Họ và tên</label>` $\rightarrow$ Chưa đổi thành **`Họ tên bạn`**.
   - **Dòng 283–290**: `<label className="block text-xs uppercase tracking-wider text-grey-70">Địa chỉ chụp</label>` với `placeholder="Địa điểm mong muốn"` $\rightarrow$ Chưa đổi thành **`Địa chỉ cụ thể`** kèm hướng dẫn nhập *tên trường, xã/phường, tỉnh/thành phố*.
   - **Trường `"Lưu ý với thợ"`**: Chưa có trong `BookingPage.tsx`, `types/booking.ts`, `BookingRequest.java` hay bảng `bookings`.

2. **Luồng tạo tin nhắn sao chép gửi qua Instagram / Facebook / Zalo**:
   - Hiện tại (`BookingPage.tsx:96-169`), khi khách hoàn tất form và vượt qua Cloudflare Turnstile:
     - Frontend gọi `POST /api/bookings` (`BookingController.java:22-30`).
     - Backend kiểm tra gói chụp đang active, kiểm tra trùng lịch (`booking_slots` & `blocked_slots`), tạo bản ghi `Booking` với trạng thái `PENDING`, giữ chỗ **30 phút** (`expiresAt = now + 30m`), và trả về mã `bookingCode` (ví dụ `BK-20261021-XXXXXX`).
     - Giao diện hiển thị khung xác nhận gồm Mã đặt lịch, Gói chụp, Ngày chụp, Trạng thái, Hạn giữ chỗ và Tiền cọc dự kiến.
   - **Chưa có** khung tạo nội dung tin nhắn tổng hợp (gồm tên, gói, ngày/buổi, địa chỉ, lưu ý, mã booking) kèm nút `"Sao chép tin nhắn"` và các nút chuyển hướng nhanh sang Instagram / Facebook / Zalo.

---

### 3.4. Hạng mục D — Ảnh Giới thiệu và Quyền Riêng tư (`Admin` Category)

1. **Cơ chế lọc ở Backend (`d:/Web_Portfolio/backend`)**:
   - `CategoryService.java:21`: `public static final String ADMIN_CATEGORY_SLUG = "admin-noi-bo";`
   - `PhotoRepository.java:22-30`:
     ```java
     String PUBLIC_ONLY = """
             p.status = :status
             and not exists (
                 select 1 from p.categories c
                 where c.slug = com.photography.backend.gallery.service.CategoryService.ADMIN_CATEGORY_SLUG
             )
             """;
     ```
   - `GalleryService.java:46-57`: Cả `getPublishedPhotos(categorySlug)` (`GET /api/gallery`) và `getFeaturedPhotos()` (`GET /api/gallery/featured`) đều dùng query có `PUBLIC_ONLY`. Kể cả khi người dùng truyền `?category=admin-noi-bo` vào `GET /api/gallery?category=admin-noi-bo`, điều kiện `not exists (... slug = 'admin-noi-bo')` vẫn chặn toàn bộ ảnh Admin.

2. **Kiểm tra thực tế trên Production (`[PROD]`)**:
   - Ảnh giới thiệu hiện tại là `id = 28` (`IMG_7294_Original`, gắn category `Admin` / `admin-noi-bo`).
   - `GET https://bauchupchoet.onrender.com/api/gallery` trả về 23 ảnh: **không có** `id = 28` và không có ảnh nào mang slug `admin-noi-bo`.
   - `GET https://bauchupchoet.vercel.app/gallery/28`: Trả về trang 404 của Next.js (`NEXT_HTTP_ERROR_FALLBACK;404`), không hiển thị ảnh `id = 28`.
   - Trong trang quản trị `/admin/pricing` (`PricingAdminPage.tsx:100-103`), bộ chọn ảnh bìa gói chụp cũng đã lọc `!p.categories.some(isAdminCategory)`.

3. **Giới hạn bảo mật cần lưu ý**:
   - **Trên API `/api/site`**: Đối tượng `aboutPhoto` trả về nguyên entity `Photo` (`SiteSettings.java:49-57`), làm lộ `cloudinaryPublicId` và mảng `categories: [{"name": "Admin", "slug": "admin-noi-bo"}]` trong JSON công khai.
   - **Trên Cloudinary**: URL ảnh trên Cloudinary là public URL (`https://res.cloudinary.com/dxg8llcr2/image/upload/...`). Do đó, ảnh trong danh mục `Admin` được **ẩn khỏi danh sách gallery và trang chi tiết của ứng dụng**, nhưng **không phải là kho lưu trữ mật (private/authenticated bucket)** nếu người dùng đã biết trực tiếp URL Cloudinary.

---

### 3.5. Hạng mục E — Feedback Khách hàng

1. **Dữ liệu thực tế từ `GET https://bauchupchoet.onrender.com/api/feedback`**:
   - Trả về 5 bản ghi đã duyệt (`id: 8, 9, 10, 11, 12`) với nội dung văn bản khớp 100% với `d:/Web_Portfolio/scripts/seed_feedback.py` (tương ứng với 5 mục trong `Cam nhan.docx`).
   - Cả 5 bản ghi đều có `"imageUrl": null` và `"cloudinaryPublicId": null`.
2. **Kiểm tra thư mục ảnh local**:
   - Trong `d:/Web_Portfolio/images/Feedback/` có sẵn 5 file ảnh thật:
     - `8978EAF2-5024-4A31-9DD0-8D6DC0E8EBDC.jpeg`
     - `A0EF7AA0-BFDF-435D-ACC7-4E31750B9DB8.jpeg`
     - `IMG_7350.png`
     - `IMG_7760.jpeg`
     - `IMG_9103.jpeg`
   - Tuy nhiên, script `seed_feedback.py` chỉ gọi `POST /api/feedback` và `PUT /api/admin/feedbacks/{id}`, chưa upload 5 ảnh này lên qua `POST /api/admin/feedbacks/{id}/image` (hoặc qua nút `"Đính kèm ảnh"` tại `/admin/feedback`).
   - Ngoài ra, ở trang chủ (`components/home/TestimonialsSection.tsx:66-79`), component thẻ đánh giá hiện chỉ render `t.content` và `t.customerName`, chưa có phần hiển thị `t.imageUrl` (trong khi `components/feedback/FeedbackPage.tsx:31-73` đã hỗ trợ hiển thị `imageUrl`).

---

## 4. Danh sách Các Hạng mục Đã Hoàn thành Cần Giữ Nguyên (Không làm lại)

Các phần dưới đây đã hoạt động ổn định trên cả source code và production, **tuyệt đối giữ nguyên, không viết lại hay phá vỡ**:

1. **Pipeline tối ưu chất lượng ảnh `quality={100}` và `sizes` (`commit 7adc2b9`)**:
   - Cấu hình `images.qualities: [75, 100]` trong `next.config.ts`.
   - Thuộc tính `quality={100}`, `sizes`, `priority` (cho ảnh LCP) và lazy loading trên toàn bộ 8 component ảnh công khai (`FeaturedCollage`, `PortfolioPreviewSection`, `AboutSection`, `ServicesPreviewSection`, `GalleryGrid`, `PhotoDetail`, `PricingPage`, `FeedbackPage`).
   - Cơ chế crop không giảm chất lượng (`c_crop,x_...,y_...,w_...,h_...`) trong `GalleryService.applyCrop` và `CropEditor.tsx`.
2. **Cơ chế phân tách danh mục `Admin` (`admin-noi-bo`) và `PACKAGE` khỏi Gallery công khai**:
   - Điều kiện lọc `PhotoRepository.PUBLIC_ONLY` ở backend và bộ lọc chọn ảnh giới thiệu trong `AdminSiteController` + `SettingsPage.tsx`.
   - Bộ chọn ảnh bìa gói chụp (`PricingAdminPage.tsx` + `PricingPackage.coverPhoto`).
3. **Luồng Backend Booking, Kiểm tra lịch trống & Cloudflare Turnstile (`commits 8520d3b`, `d0879fc`)**:
   - API `GET /api/availability`, `POST /api/bookings`, kiểm tra xung đột slot (`DataIntegrityViolationException` $\rightarrow$ HTTP 409), giữ chỗ 30 phút (`expiresAt`), và cron job tự động hết hạn (`expirePendingBookings`).
   - Xử lý Cloudflare Turnstile local/production trong `lib/turnstile.ts` và unit tests trong `lib/turnstile.test.ts`.
4. **Hệ thống Quản trị (`/admin/*`)**:
   - Các trang quản lý Ảnh (upload hàng loạt, kéo thả sắp xếp thứ tự, gán danh mục hàng loạt, crop ảnh), Danh mục, Bảng giá, Đặt lịch & Khoá lịch, Thanh toán, Cảm nhận và Cài đặt website.
5. **Cơ chế xử lý lỗi kết nối Backend (`DataFetchError.tsx` & `lib/data.ts`)**:
   - Không còn nuốt lỗi trả về mảng rỗng khi backend Render cold-start bị lỗi; đã hiển thị banner thử lại rõ ràng.

---

## 5. Danh sách Lỗi và Thay đổi Tối thiểu Cần Thực hiện (Sắp theo Mức độ Ưu tiên)

### Ưu tiên P0 — Sai lệch Dữ liệu Giá, Quyền lợi & Phụ phí (Ảnh hưởng trực tiếp tới quyết định đặt lịch của khách)

1. **Cập nhật giá 6 gói chụp trong Database Backend (hoặc qua `/admin/pricing` + migration SQL mới `V12`)**:
   - Cá nhân (`groupSize=1`): `1.300.000đ` (`HALF_DAY`) / `2.100.000đ` (`FULL_DAY`) *(sau khi chủ web xác nhận mapping buổi chụp)*.
   - Nhóm 2 (`groupSize=2`): `1.700.000đ` (`HALF_DAY`) / `2.500.000đ` (`FULL_DAY`).
   - Nhóm 3 (`groupSize=3`): `2.100.000đ` (`HALF_DAY`) / `2.900.000đ` (`FULL_DAY`).
2. **Cập nhật danh sách Quyền lợi (`BENEFITS`) và khối Phụ phí trong `components/pricing/PricingPage.tsx`**:
   - Sửa `"Hậu kỳ chi tiết 15 ảnh"` $\rightarrow$ `"Hậu kỳ 10 ảnh chi tiết"`.
   - Sửa `"Nhận full file đã làm màu"` $\rightarrow$ `"Full file đã căn chỉnh cơ bản"`.
   - Thêm quyền lợi `"Staff hỗ trợ tính thêm phí"`.
   - Bổ sung khối thông tin **Phụ phí & Lưu ý**:
     - Chụp đến 19h: `+300.000đ`.
     - Ngoại tỉnh: nhận cả ngày.
     - Chi phí di chuyển theo khu vực (ghi rõ là mức ước tính).

### Ưu tiên P1 — Giao diện, Nội dung Trang chủ, Màu chủ đạo & Form Đặt lịch

3. **Cập nhật nội dung Hero & CTA (`HeroSection.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`)**:
   - `components/home/HeroSection.tsx:38`: Đổi `"NHIẾP ẢNH BỞI"` $\rightarrow$ `"Chào cả nhà, tui tên là"`.
   - `components/home/HeroSection.tsx:48-54`: Đổi cụm CTA `"CÙNG HỢP TÁC"` $\rightarrow$ `"ĐẶT LỊCH NGAY"`.
   - `components/shared/SiteHeader.tsx:85-89`: Hiển thị nút CTA `"Đặt lịch ngay"` / `"Liên hệ"` rõ ràng cả trên mobile (hoặc đặt nút nổi bật trên thanh header mobile) để khách vào bằng điện thoại thấy ngay lối vào đặt lịch.
   - `components/shared/SiteFooter.tsx:57-63`: Đồng bộ CTA cuối trang sang `"Đặt lịch ngay"` (nếu chủ web yêu cầu đồng bộ cả footer).
4. **Đổi màu chủ đạo sang `#6B8E5A` (`app/globals.css` & `HeroSection.tsx`)**:
   - Cập nhật `--purple-55` trong `d:/Web_Portfolio/frontend/app/globals.css:29` từ `rgba(34, 197, 94, 1)` (`#22C55E`) sang `#6B8E5A` (`rgba(107, 142, 90, 1)`) và điều chỉnh các sắc độ hover/light (`--purple-60`, `--purple-70`, `--purple-80`, `--purple-90`) tương ứng cùng tông xanh `#6B8E5A`, đồng thời cập nhật `fill="#6B8E5A"` trong `HeroSection.tsx:9`.
5. **Cập nhật nhãn và trường trong Form Đặt lịch (`components/booking/BookingPage.tsx` + Backend nếu lưu DB)**:
   - Đổi `"Họ và tên"` $\rightarrow$ `"Họ tên bạn"` (`BookingPage.tsx:275`).
   - Đổi `"Địa chỉ chụp"` $\rightarrow$ `"Địa chỉ cụ thể"` kèm hướng dẫn/placeholder nhập *tên trường, xã/phường, tỉnh/thành phố* (`BookingPage.tsx:283-290`).
   - Đổi `"Ngày mong muốn"` $\rightarrow$ `"Ngày dự kiến chụp"` (`BookingPage.tsx:225`).
   - Thêm trường `"Lưu ý với thợ"` (textarea/input).
   - Bổ sung tiện ích **Tạo & Sao chép tin nhắn đặt lịch** kèm nút liên kết nhanh qua Instagram / Facebook / Zalo theo phương án chủ web chốt.
6. **Cập nhật dữ liệu Danh mục Marquee và Nội dung Giới thiệu (`bio`)**:
   - Thêm các danh mục `PORTFOLIO` vào database (qua `/admin/categories` hoặc migration): `Kỉ yếu THCS`, `Kỉ yếu THPT`, `Tốt nghiệp đại học`, `Áo dài`, `Concept`.
   - Cập nhật trường `bio` (và `facebookUrl`, `messengerUrl` nếu có) trong `/admin/settings` (hoặc fallback trong `AboutSection.tsx`) đúng theo văn bản giới thiệu của chủ web.

### Ưu tiên P2 — Ảnh Feedback & Tài liệu Dự án

7. **Đính kèm ảnh thật cho 5 Feedback (`images/Feedback/*`)**:
   - Upload và gắn đúng từng ảnh trong `d:/Web_Portfolio/images/Feedback/` với 5 feedback (`id: 8..12`) qua `/admin/feedback` (`POST /api/admin/feedbacks/{id}/image`), sau khi chủ web xác nhận ảnh nào ứng với feedback nào.
8. **Cập nhật các tài liệu trong `docs/*` và `frontend/README.md`**:
   - Cập nhật `docs/API_CONTRACT.md`, `frontend/docs/FRONTEND_ARCHITECTURE.md`, `frontend/docs/FRONTEND_VISUAL_INTEGRATION_REPORT.md`, và `frontend/README.md` để phản ánh đúng kiến trúc hiện tại.

---

## 6. Các Điểm Có Thể Ảnh hưởng Backend, Dữ liệu, Booking, Bảo mật hoặc Deployment

1. **Trường `"Lưu ý với thợ"` trong luồng Booking**:
   - Nếu chỉ đưa `"Lưu ý với thợ"` vào đoạn tin nhắn copy gửi qua mạng xã hội thì chỉ cần sửa frontend (`BookingPage.tsx`).
   - Tuy nhiên, để **admin nhìn thấy ghi chú của khách trong trang `/admin/bookings`**, cần thêm cột `notes TEXT` (hoặc `customer_note`) vào bảng `bookings` thông qua Flyway migration (`V12__...sql`), cập nhật `Booking.java`, `BookingRequest.java`, `BookingService.java` trên backend và deploy lại Render trước hoặc cùng lúc với frontend.
2. **Thay đổi Giá Gói chụp (`pricing_packages`)**:
   - Giá nằm trong PostgreSQL trên production. Nếu chỉ sửa file migration cũ (`V8`, `V9`) thì Flyway sẽ báo lỗi checksum mismatch và **làm sập backend khi deploy trên Render**. Bắt buộc phải sửa qua giao diện `/admin/pricing` hoặc tạo file migration **mới** (`V12__...sql`).
3. **Bảo mật thông tin danh mục `Admin` trên `GET /api/site`**:
   - Hiện tại `GET /api/site` trả về toàn bộ object `aboutPhoto` (kèm `categories` chứa `admin-noi-bo` và `cloudinaryPublicId`). Nếu muốn ẩn hoàn toàn metadata nội bộ trên API công khai, nên dùng DTO chỉ trả về `aboutPhotoUrl` hoặc ẩn `categories`/`cloudinaryPublicId` khi trả qua `/api/site`.
4. **Biến môi trường Build-time trên Vercel (`NEXT_API_URL`)**:
   - `next.config.ts` nạp `NEXT_API_URL` vào bundle lúc build. Mọi thay đổi biến môi trường trên Vercel đều cần trigger build lại.

---

## 7. Các Câu hỏi Cần Chủ Website Xác nhận Trước Khi Sửa

Trước khi tiến hành sửa code và cập nhật dữ liệu, cần chủ website xác nhận 7 điểm sau:

1. **Thứ tự giá và loại buổi chụp (Hạng mục B)**:
   - Trong bảng giá yêu cầu (`Cá nhân: 1.300.000đ / 2.100.000đ`, `Nhóm 2: 1.700.000đ / 2.500.000đ`, `Nhóm 3: 2.100.000đ / 2.900.000đ`), mức giá thứ nhất tương ứng với **Nửa ngày (1 buổi Sáng hoặc Chiều)** và mức giá thứ hai tương ứng với **Cả ngày (Sáng + Chiều)** như cấu hình hiện tại có đúng không?
2. **Chi tiết bảng ước tính chi phí di chuyển theo khu vực (Hạng mục B)**:
   - Nội dung cụ thể của mục *"Chi phí di chuyển theo khu vực (ghi rõ là ước tính)"* cần hiển thị những khu vực và mức phí ước tính nào (hoặc câu chữ chính xác trong file `.docx` của chủ web là gì)?
3. **Vai trò của tính năng “Tạo tin nhắn sao chép gửi qua Instagram / Facebook / Zalo” (Hạng mục C)**:
   - Tính năng này là **bước bổ sung ngay sau khi khách bấm gửi đặt lịch thành công** (tức là vẫn lưu booking vào hệ thống backend, kiểm tra lịch trống, giữ chỗ 30 phút và sinh mã `BK-...`, đồng thời hiện khung tin nhắn mẫu để khách bấm `"Sao chép"` và mở nhanh Instagram/Facebook/Zalo gửi cho thợ), hay chủ web muốn thay đổi quy trình giữ chỗ hiện tại?
   - Đường link chính thức của **Facebook**, **Instagram**, và **Zalo** của Bấu Chụp Choẹt để gắn vào nút chuyển hướng và footer là gì? (Hiện tại trong DB chỉ có `instagramUrl: "https://instagram.com/haibau"`, còn `facebookUrl` và `messengerUrl` đang trống).
4. **Nội dung văn bản phần Giới thiệu ("Tôi là" / `AboutSection`) (Hạng mục A)**:
   - Đoạn văn giới thiệu chính xác mà chủ website muốn hiển thị ở mục Giới thiệu trên trang chủ là gì? (Vui lòng cung cấp nguyên văn từ file `Chỉnh sửa web Bấu chụp choẹt.docx` nếu chưa nhập vào `/admin/settings`).
5. **Danh sách chính xác các mục trên thanh Marquee (Hạng mục A)**:
   - Chủ website muốn **thay thế hoàn toàn** 6 danh mục hiện tại (`Portrait`, `Cá nhân`, `Gia đình`, `Cặp đôi`, `Sự kiện`, `Đời thường`) bằng 5 danh mục mới (`Kỉ yếu THCS`, `Kỉ yếu THPT`, `Tốt nghiệp đại học`, `Áo dài`, `Concept`), hay **bổ sung thêm** vào danh sách hiện có?
6. **Phạm vi áp dụng màu `#6B8E5A` (Hạng mục A)**:
   - Màu `#6B8E5A` sẽ thay thế toàn bộ màu xanh lá tươi (`#22C55E` — bao gồm nút CTA, chấm trang trí Hero, viền active, badge giá) trên các trang công khai, và có cần đồng bộ luôn cho các nút trong trang quản trị `/admin/*` không?
7. **Mapping 5 ảnh Feedback với 5 nội dung Feedback (Hạng mục E)**:
   - Trong thư mục `images/Feedback/` có 5 ảnh (`8978EAF2...jpeg`, `A0EF7AA0...jpeg`, `IMG_7350.png`, `IMG_7760.jpeg`, `IMG_9103.jpeg`). Chủ website xác nhận thứ tự ghép từng ảnh với 5 feedback hiện có (`id: 8..12`) như thế nào?

---

## 8. Kết quả Kiểm tra Build / Lint / Test Thực tế

Đã chạy trực tiếp các lệnh kiểm tra trên `d:/Web_Portfolio/frontend` tại commit `7adc2b9b48a7dd0bf82c4030c1c926cdfbebc374`:

| Lệnh kiểm tra | Kết quả | Chi tiết đầu ra thực tế |
| :--- | :---: | :--- |
| `npm run lint` (`eslint`) | **PASS (0 errors)** | `0 errors, 81 warnings`. Toàn bộ 81 warnings đều là `@next/next/no-img-element` nằm trong các file Figma export cũ không được import bởi bất kỳ route nào (`components/about/*`, `components/contact/*`, `components/portfolio/*`, `components/services/*`, `components/home/*Section.tsx` cũ). Toàn bộ các component đang chạy thực tế đạt `0 errors, 0 warnings`. |
| `npm test` (`vitest run`) | **PASS (8/8 tests)** | Test suite `lib/turnstile.test.ts` chạy thành công `8 passed (8)` trong `4.98s`. |
| `npm run build` (`next build`) | **PASS** | Biên dịch TypeScript và build production Next.js 16.3.5 (Turbopack) thành công toàn bộ 16 routes (`/`, `/gallery`, `/gallery/[id]`, `/pricing`, `/booking`, `/booking/result`, `/feedback`, và 9 route `/admin/*`). |

---

## 9. Phân biệt Lỗi Đã Xác nhận, Giả thuyết và Giới hạn Kiểm tra

### 9.1. Lỗi và khác biệt đã xác nhận 100% (`[SOURCE]` + `[PROD]`)
- Hero eyebrow (`"NHIẾP ẢNH BỞI"`) và Hero/Footer CTA (`"CÙNG HỢP TÁC"`) chưa được đổi sang `"Chào cả nhà, tui tên là"` và `"Đặt lịch ngay"`.
- Màu chủ đạo trong `app/globals.css` đang là `#22C55E` (`rgba(34, 197, 94, 1)`), chưa phải `#6B8E5A`.
- Bảng giá trên production (`GET /api/pricing`) đang lệch cao hơn 100.000đ – 300.000đ ở cả 6 gói so với bảng giá yêu cầu.
- Quyền lợi dịch vụ trên `/pricing` đang ghi `"Hậu kỳ chi tiết 15 ảnh"` (thay vì 10 ảnh), thiếu `"Staff tính thêm phí"`, và thiếu thông tin phụ phí chụp đến 19h (`+300.000đ`), ngoại tỉnh nhận cả ngày, chi phí di chuyển ước tính theo khu vực.
- Các nhãn trong form `/booking` (`"Họ và tên"`, `"Địa chỉ chụp"`, `"Ngày mong muốn"`) chưa đổi và chưa có trường `"Lưu ý với thợ"` cũng như tính năng tạo tin nhắn copy gửi qua Instagram/Facebook/Zalo.
- Cả 5 feedback trên production (`GET /api/feedback`) đang có `imageUrl: null` vì chưa upload 5 ảnh trong `images/Feedback/` lên gắn vào từng bản ghi.
- Các tài liệu trong `docs/` và `frontend/README.md` có nhiều thông tin đã lỗi thời so với code hiện tại.

### 9.2. Giới hạn kiểm tra trong lượt Audit này (`[UNVERIFIED]`)
- **File `Chỉnh sửa web Bấu chụp choẹt.docx` gốc**: Không nằm trong workspace `d:/Web_Portfolio` hay trên ổ cứng máy hiện tại (`C:\`, `D:\`). Do đó, các đoạn văn bản dài nếu không được trích nguyên văn trong prompt (ví dụ: nguyên văn đoạn giới thiệu bản thân của chủ web, hoặc bảng chi tiết phí di chuyển từng khu vực nếu có trong file `.docx`) được đánh dấu `NEEDS_CONFIRMATION` để chủ web cung cấp/xác nhận chính xác thay vì tự suy diễn.
- **Không thực hiện gửi `POST /api/bookings` hay sửa dữ liệu trên Production**: Tuân thủ nghiêm ngặt quy tắc số 6 của yêu cầu audit (không tạo booking thật, không dùng tài khoản admin sửa dữ liệu production, không sửa source code trong lượt audit này).
