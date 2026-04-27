# 🏞️ Gia Lai Explorer

Gia Lai Explorer là một ứng dụng web cẩm nang du lịch hiện đại dành cho tỉnh Gia Lai, Việt Nam. Ứng dụng cung cấp thông tin chi tiết về các địa điểm nổi bật, lịch trình gợi ý, ẩm thực đặc sản cùng với tích hợp bản đồ và video thực tế.

## 🚀 Tính năng chính

- **📍 Khám phá địa điểm**: Danh sách các địa điểm du lịch nổi tiếng (Biển Hồ, Chư Đăng Ya, Thác Phú Cường,...) với mô tả chi tiết, hình ảnh và thông tin hữu ích.
- **🗺️ Tích hợp Bản đồ & Video**: Mỗi địa điểm đi kèm với vị trí chính xác trên Google Maps và video YouTube quay thực tế.
- **📅 Lịch trình gợi ý**: Cung cấp các lịch trình du lịch tối ưu (1 ngày, 2 ngày 1 đêm) giúp du khách dễ dàng lên kế hoạch.
- **🍜 Ẩm thực đặc sản**: Giới thiệu các món ăn không thể bỏ qua tại Gia Lai như Phở khô, Bún mắm cua, Bò một nắng,...
- **🔐 Quản trị nội dung**: Hệ thống Admin cho phép quản lý địa điểm, món ăn và lịch trình một cách dễ dàng.
- **💾 Lưu địa điểm**: Người dùng có thể lưu lại các địa điểm yêu thích để xem sau (Local Storage).
- **📱 Responsive Design**: Giao diện tối ưu hóa cho cả máy tính và thiết bị di động.

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Full-stack Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/guide/start/overview) (SSR/Hydration)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Infrastructure
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Runtime**: [Bun](https://bun.sh/)

## 📦 Cài đặt và Chạy thử

### Tiền đề
- Đã cài đặt [Bun](https://bun.sh/)
- Tài khoản [Supabase](https://supabase.com/)

### Các bước thực hiện

1. **Clone repository:**
   ```bash
   git clone <your-repo-url>
   cd gia-lai-explorer
   ```

2. **Cài đặt dependencies:**
   ```bash
   bun install
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env` tại thư mục gốc và thêm các thông tin sau:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Chạy server phát triển:**
   ```bash
   bun dev
   ```
   Ứng dụng sẽ chạy tại: `http://localhost:3000`

## 📂 Cấu trúc thư mục

- `src/routes/`: Quản lý routing và các trang của ứng dụng (TanStack Router).
- `src/components/`: Các component dùng chung và UI components (Shadcn UI).
- `src/integrations/supabase/`: Cấu hình client và các types cho Supabase.
- `src/hooks/`: Custom React hooks.
- `src/lib/`: Các tiện ích (utils) và logic nghiệp vụ.
- `supabase/migrations/`: Các file migration của cơ sở dữ liệu.

## 🤖 Công cụ hỗ trợ nội dung

Dự án có đi kèm file `PROMPT_GIOI_THIEU_DIA_DIEM_DU_LICH.md`. Đây là một prompt chuyên dụng để sử dụng với các công cụ AI (như ChatGPT, Gemini) nhằm tạo ra nội dung giới thiệu địa điểm du lịch chuẩn SEO và hấp dẫn cho ứng dụng.

## 🚀 Triển khai

Dự án được cấu hình để triển khai trên **Cloudflare Pages**.

```bash
bun run build
# Sau đó tải thư mục dist lên Cloudflare Pages hoặc cấu hình CI/CD tự động.
```

## 📝 Giấy phép

Dự án này được tạo ra nhằm mục đích giới thiệu vẻ đẹp của Gia Lai. Bạn có thể sử dụng và phát triển thêm.

---
*Phát triển bởi [Tên của bạn/Đội ngũ của bạn]*
