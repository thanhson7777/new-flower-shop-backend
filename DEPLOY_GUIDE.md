# Hướng Dẫn Deploy Backend Shop Hoa Tươi Lên Render

## Mục Lục
1. [Chuẩn bị MongoDB Atlas](#1-chuẩn-bị-mongodb-atlas)
2. [Cập nhật code cho Production](#2-cập-nhật-code-cho-production)
3. [Push code lên GitHub](#3-push-code-lên-github)
4. [Deploy trên Render](#4-deploy-trên-render)
5. [Cấu hình sau khi Deploy](#5-cấu-hình-sau-khi-deploy)

---

## 1. Chuẩn bị MongoDB Atlas

### 1.1 Cập nhật Connection String

Đảm bảo `MONGODB_URI` trong `.env` có format đúng:

```env
MONGODB_URI='mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flower-shop?retryWrites=true&w=majority'
```

**Lưu ý:** Thay `flower-shop` bằng tên database của bạn.

### 1.2 Cấu hình Network Access

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Chọn project của bạn
3. Vào **Security** → **Network Access**
4. Click **"Add IP Address"**
5. Thêm IP: `0.0.0.0/0` (cho phép tất cả IP)
6. Click **Confirm**

### 1.3 Cấu hình Database User

1. Vào **Security** → **Database Access**
2. Tạo user mới hoặc cập nhật user hiện tại
3. Đảm bảo user có quyền **Read and write to any database**

---

## 2. Cập nhật Code cho Production

### 2.1 File đã được cập nhật

Các file sau đã được sửa để hỗ trợ Render:

- `src/server.js` - Hỗ trợ PORT từ environment variable
- `src/utils/constants.js` - Cập nhật CORS whitelist

### 2.2 Tạo file `.env.production` (tùy chọn)

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://your_user:your_password@cluster0.xxxxx.mongodb.net/flower-shop
# ... các biến khác
```

### 2.3 Cập nhật CORS (nếu cần)

Sau khi deploy frontend lên Vercel, thêm domain vào whitelist:

File: `src/utils/constants.js`

```javascript
export const WHITELIST_DOMAINS = [
  'http://localhost:5173',
  'https://your-frontend.vercel.app',  // Thêm sau khi deploy frontend
]
```

---

## 3. Push Code lên GitHub

### 3.1 Khởi tạo Git Repository

```bash
cd backend

# Khởi tạo Git
git init

# Thêm tất cả files
git add .

# Tạo commit
git commit -m "Initial commit - Backend Shop Hoa Tươi"

# Thêm remote (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/backend-flower-shop.git

# Push lên GitHub
git branch -M main
git push -u origin main
```

### 3.2 File `.gitignore`

Đảm bảo có `.gitignore` với nội dung:

```
node_modules/
build/
.env
.env.local
.env.*.local
*.log
npm-debug.log*
.DS_Store
```

---

## 4. Deploy trên Render

### 4.1 Tạo tài khoản Render

1. Truy cập [https://render.com](https://render.com)
2. Click **Sign Up** → Đăng nhập bằng **GitHub**
3. Hoàn tất xác minh email

### 4.2 Tạo Web Service

1. Trên dashboard Render, click **"New +"**
2. Chọn **"Web Service"**
3. Connect repository **backend-flower-shop** từ GitHub
4. Cấu hình như bảng dưới:

| Setting | Value |
|---------|-------|
| **Name** | `flower-shop-backend` |
| **Region** | Singapore |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 4.3 Thêm Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Thêm **từng biến một**:

```
NODE_ENV = production
PORT = 10000
MONGODB_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flower-shop
DATABASE_NAME = flower-shop
ACCESS_TOKEN_SECRET_SIGNATURE = your_access_token_secret
REFRESH_TOKEN_SECRET_SIGNATURE = your_refresh_token_secret
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY = your_api_key
CLOUDINARY_API_SECRET = your_api_secret
BREVO_API_KEY = your_brevo_api_key
ADMIN_EMAIL_ADDRESS = your_email@gmail.com
ADMIN_EMAIL_NAME = Your Name
VNP_TMN_CODE = your_vnp_code
VNP_HASH_SECRET = your_vnp_secret
VNP_URL = https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL = https://flower-shop-backend.onrender.com/v1/payments/vnpay_return
MOMO_PARTNER_CODE = MOMO
MOMO_ACCESS_KEY = your_momo_key
MOMO_SECRET_KEY = your_momo_secret
AUTHOR = Your Name
```

### 4.4 Hoàn tất Deploy

1. Click **"Create Web Service"**
2. Đợi build (3-5 phút)
3. Kiểm tra log để đảm bảo không có lỗi
4. Sau khi thành công, URL sẽ hiển thị: `https://flower-shop-backend.onrender.com`

---

## 5. Cấu hình sau khi Deploy

### 5.1 Test API

Test endpoint health check:
```
GET https://flower-shop-backend.onrender.com/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-22T12:00:00.000Z"
}
```

### 5.2 Cập nhật VNP_RETURN_URL

Nếu dùng VNPAY, cập nhật `VNP_RETURN_URL` trong Render:

```
VNP_RETURN_URL = https://flower-shop-backend.onrender.com/v1/payments/vnpay_return
```

### 5.3 Cập nhật Frontend

Thêm base URL vào frontend:

File: `frontend/src/utils/api.js` hoặc `apiConfig.js`

```javascript
const API_BASE_URL = 'https://flower-shop-backend.onrender.com'
```

### 5.4 Cập nhật CORS

Thêm domain frontend vào whitelist:

```javascript
export const WHITELIST_DOMAINS = [
  'http://localhost:5173',
  'https://your-frontend.vercel.app',  // Thay bằng URL thật của frontend
]
```

---

## Troubleshooting

### Lỗi "Cannot find module"

Kiểm tra build command đã chạy đúng chưa:
```
npm install && npm run build
```

### Lỗi kết nối MongoDB

1. Kiểm tra `MONGODB_URI` đúng format
2. Kiểm tra Network Access đã thêm `0.0.0.0/0`
3. Kiểm tra username/password đúng

### Lỗi CORS

1. Kiểm tra domain đã có trong `WHITELIST_DOMAINS`
2. Kiểm tra `credentials: true` trong cors options

### Free Tier Limitations

- Server ngủ sau 15 phút không activity
- Lần đầu wake up có thể chậm 30-60 giây
- 750 giờ/month (đủ cho 1 tháng)

---

## Liên hệ & Hỗ trợ

Nếu gặp lỗi, kiểm tra:
1. Render Dashboard → Logs
2. MongoDB Atlas → Logs
3. Console trên trình duyệt
