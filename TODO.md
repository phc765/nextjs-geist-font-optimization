# Kế hoạch thực hiện ứng dụng chuyển đổi PDF sang Word

## Trạng thái: Đang thực hiện
## Ngày bắt đầu: Hôm nay

### ✅ Hoàn thành
- [x] Tạo kế hoạch chi tiết
- [x] Phân tích yêu cầu
- [x] **Bước 1: Cập nhật package.json**
  - [x] Thêm react-dropzone
  - [x] Thêm formidable 
  - [x] Thêm docx
  - [x] Thêm pdfjs-dist
  - [x] Thêm tesseract.js
  - [x] Cài đặt dependencies

### 🔄 Đang thực hiện

- [ ] **Bước 2: Tạo giao diện chính**
  - [ ] Tạo src/app/page.tsx
  - [ ] Component upload drag & drop
  - [ ] Thanh tiến trình
  - [ ] Nút download

- [ ] **Bước 3: Tạo API endpoints**
  - [ ] src/app/api/convert/route.ts
  - [ ] Xử lý upload file
  - [ ] Logic chuyển đổi

- [ ] **Bước 4: Tạo thư viện xử lý**
  - [ ] src/lib/pdfConverter.ts
  - [ ] Trích xuất text từ PDF
  - [ ] OCR công thức từ hình ảnh
  - [ ] Tạo file Word

- [ ] **Bước 5: Kiểm tra và hoàn thiện**
  - [ ] Test chức năng upload
  - [ ] Test chuyển đổi PDF
  - [ ] Test download Word
  - [ ] Kiểm tra responsive
  - [ ] Xử lý lỗi

### ⏳ Chờ thực hiện
- [ ] Deploy lên Vercel
- [ ] Tối ưu hiệu suất
- [ ] Thêm tính năng nâng cao

## Ghi chú
- Sử dụng thư viện miễn phí để tránh phí API
- Đảm bảo công thức toán học được bảo toàn
- Giao diện đơn giản, dễ sử dụng
- Hỗ trợ cả desktop và mobile
