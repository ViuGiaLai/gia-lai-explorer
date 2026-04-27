
# Website Du Lịch Gia Lai — Plan v1

## Tổng quan
Xây dựng website du lịch Gia Lai hoàn chỉnh gồm 2 phần:
- **Frontend công khai**: trang chủ, chi tiết địa điểm, lịch trình, ẩm thực
- **Admin CMS**: dashboard + CRUD địa điểm, có đăng nhập bảo vệ

Stack: TanStack Start (React 19, SSR) + Tailwind + shadcn/ui + Lovable Cloud (Supabase: Postgres + Auth + Storage).

> Ghi chú stack: Lovable không hỗ trợ Next.js — TanStack Start tương đương về SSR, file-based routing, server functions, API routes. Database mặc định là Lovable Cloud (Supabase) thay cho MongoDB. Admin UI sẽ build theo phong cách TailAdmin (sidebar tối, cards, tables) bằng shadcn/ui — không thể nhúng template TailAdmin trực tiếp.

---

## 1. Cấu trúc routes

```text
/ (index)                     Trang chủ — hero, 5 địa điểm nổi bật, CTA
/dia-diem                     Danh sách tất cả địa điểm
/dia-diem/$slug               Chi tiết: gallery, video, map, tips, gợi ý gần đó
/lich-trinh                   Gợi ý lịch trình 1 ngày & 2 ngày
/am-thuc                      Món ăn đặc sản + nơi ăn

/login                        Trang đăng nhập admin
/admin                        Dashboard (tổng số địa điểm, hoạt động gần đây)
/admin/dia-diem               Quản lý danh sách (table, search, filter)
/admin/dia-diem/moi           Tạo địa điểm mới
/admin/dia-diem/$id           Sửa địa điểm
```

Mỗi route có `head()` riêng (title, description, og:title, og:description, og:image) để tối ưu SEO và share mạng xã hội.

---

## 2. Database (Supabase)

**Bảng `locations`**
- id (uuid, pk)
- name, slug (unique), short_description, description (markdown)
- images (text[]) — mảng URL ảnh
- video_url (text) — link YouTube
- map_embed (text) — iframe src của Google Maps
- latitude, longitude (numeric)
- tips (text) — mẹo du lịch
- featured (bool) — hiện ở trang chủ
- created_at, updated_at

**Bảng `user_roles`** (theo chuẩn bảo mật)
- user_id (fk auth.users), role (enum: 'admin')
- Hàm `has_role()` SECURITY DEFINER để check trong RLS

**Bảng `itineraries`**
- id, title, duration_days, content (jsonb: stops theo giờ), cover_image

**Bảng `foods`**
- id, name, description, image, where_to_eat, address

**Storage bucket `location-images`** (public read) — admin upload ảnh.

**RLS policies**
- locations / itineraries / foods: SELECT public, INSERT/UPDATE/DELETE chỉ admin (`has_role(auth.uid(), 'admin')`)
- user_roles: chỉ user xem role của chính mình; không cho client tự gán role

---

## 3. Frontend features

### Trang chủ `/`
- Hero full-bleed: ảnh Biển Hồ + tagline "Khám phá vẻ đẹp Gia Lai"
- Nút CTA "Khám phá ngay" → `/dia-diem`
- Section "Địa điểm nổi bật" — 5 card (ảnh, tên, mô tả ngắn)
- Section "Lịch trình gợi ý" — 2 card (1 ngày / 2 ngày)
- Section "Ẩm thực Gia Lai" — preview 3-4 món
- Footer

### Chi tiết địa điểm `/dia-diem/$slug`
- Gallery ảnh (carousel) ở đầu
- Tên, mô tả đầy đủ
- Video YouTube embed
- Google Maps embed
- Tips du lịch
- Hàng nút: **Xem đường đi** (mở Google Maps native), **Lưu địa điểm** (localStorage), **Chia sẻ** (Web Share API + fallback copy link)
- Section "Địa điểm gần đó" — 3 card cùng khu vực (sắp theo khoảng cách haversine từ lat/lng)

### `/dia-diem` — danh sách
- Grid card responsive (1 cột mobile, 2-3 cột desktop)
- Hover animation: scale ảnh, overlay gradient

### `/lich-trinh`
- Tab "1 ngày" / "2 ngày"
- Timeline dọc theo giờ (8:00 → Biển Hồ, 11:00 → ăn trưa…)
- Mỗi stop link đến chi tiết địa điểm

### `/am-thuc`
- Grid món ăn: phở khô, bún mắm cua, bò một nắng, cơm lam gà nướng…
- Mỗi card có ảnh, mô tả, gợi ý quán

### Tính năng "Lưu địa điểm"
- Lưu slug vào `localStorage` (không cần đăng nhập user)
- Trang nhỏ `/da-luu` hiển thị danh sách đã lưu

---

## 4. Admin CMS

### Auth
- 1 admin duy nhất. Sau khi bạn đăng ký lần đầu qua `/login`, tôi sẽ chạy migration seed gán role admin cho user_id của bạn.
- Trang `/login`: email + password (Supabase auth, auto-confirm bật để khỏi confirm email)
- Layout `/admin/*` được bảo vệ bằng `beforeLoad` — kiểm tra session + role admin, không thì redirect `/login`

### Layout admin
- Sidebar trái tối màu (style TailAdmin): logo, menu (Dashboard, Địa điểm, Đăng xuất)
- Topbar: tên admin, nút logout
- Main content trắng với cards bo góc nhẹ

### `/admin` — Dashboard
- 3 card thống kê: tổng địa điểm, tổng lịch trình, tổng món ăn
- Bảng "Địa điểm mới nhất" (5 dòng)

### `/admin/dia-diem` — danh sách
- Bảng: ảnh thumbnail, tên, slug, featured, ngày tạo, actions (Sửa / Xóa với confirm)
- Search theo tên, filter featured
- Nút "Thêm địa điểm" → `/admin/dia-diem/moi`

### Form tạo/sửa
Fields: name, slug (auto từ name, có thể edit), short_description, description (textarea markdown), video_url, map_embed, latitude, longitude, tips, featured (switch).

**Upload ảnh**:
- Multi-upload vào Storage bucket
- Preview thumbnail có nút xóa
- Drag-to-reorder
- Lưu mảng URL vào `images[]`

Validation bằng Zod (cả client và server function).

---

## 5. Server functions & API

- `getLocations`, `getLocationBySlug`, `getNearbyLocations(lat, lng)` — public
- `createLocation`, `updateLocation`, `deleteLocation` — admin (middleware `requireSupabaseAuth` + check role)
- `uploadImage` — admin, upload vào bucket
- `getDashboardStats` — admin

Tất cả mutation validate bằng Zod (length, format, regex slug).

---

## 6. Nội dung seed

5 địa điểm với mô tả tiếng Việt tự generate + ảnh Unsplash phù hợp:
1. **Biển Hồ (T'Nưng)** — hồ nước ngọt núi lửa
2. **Núi lửa Chư Đăng Ya** — mùa hoa dã quỳ
3. **Thác Phú Cường** — thác bazan hùng vĩ
4. **Chùa Minh Thành** — kiến trúc Nhật–Đài
5. **Hồ Ia Ly** — hồ thủy điện

Cộng với:
- Video YouTube embed thực tế (search ID phổ biến cho mỗi địa điểm)
- Google Maps embed iframe + tọa độ chính xác
- 2 lịch trình mẫu (1 ngày Pleiku, 2 ngày Pleiku–Chư Păh)
- 6 món ăn đặc sản

Sau khi build xong bạn login admin và edit/thêm tự do.

---

## 7. SEO & Performance

- `head()` riêng cho mỗi route với title, description, og:* đầy đủ
- URL tiếng Việt không dấu: `/dia-diem/bien-ho`, `/dia-diem/chu-dang-ya`
- JSON-LD `TouristAttraction` schema cho trang chi tiết
- Sitemap động `/sitemap.xml` (server route)
- `robots.txt`
- Ảnh: `loading="lazy"`, `width`/`height` để tránh CLS
- Preconnect tới YouTube + Google Maps

---

## 8. UI/UX

- Mobile-first, breakpoints Tailwind chuẩn
- Bảng màu: xanh rừng (#0f766e teal) + nâu đất + kem — gợi cao nguyên
- Font: Inter (body) + một font display đậm cho hero
- Card hover: lift + scale ảnh nhẹ
- Skeleton loading khi fetch
- Toast (sonner) cho hành động admin

---

## 9. Marketing — gợi ý sau khi launch

Tôi sẽ kèm 1 trang `/admin/marketing-tips` (chỉ admin xem) liệt kê:
1. **Facebook**: post pattern cho group "Gia Lai Tôi Yêu", "Phượt Tây Nguyên" — kèm OG image đẹp
2. **SEO keywords**: "du lịch Gia Lai", "địa điểm Pleiku", "Biển Hồ ở đâu"…
3. **Viral content ý tưởng**: reel 15s chuyển cảnh 5 địa điểm, ảnh check-in mùa dã quỳ
4. **Retention**: lưu địa điểm + chia sẻ sẵn có
5. **Monetization**: chỗ trống để gắn AdSense/affiliate booking sau

---

## Sau khi bạn duyệt plan

1. Setup Lovable Cloud + bảng + RLS + storage bucket
2. Build frontend (5 trang public)
3. Build admin (login + layout + CRUD + upload)
4. Seed dữ liệu 5 địa điểm + lịch trình + ẩm thực
5. SEO meta + sitemap
6. Hướng dẫn bạn: đăng ký account → tôi gán role admin → bạn login `/admin`

Đây là phạm vi v1 lớn — tôi sẽ build trong 1 lượt nhưng có thể mất vài phút và tốn credit hơn task thường.
