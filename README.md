# 搶票成功率模擬器

完整的搶票成功率模擬系統，包含後端 API (Node.js + Express + MySQL) 和前端應用 (React Native + Expo)。

## 📁 專案資料夾結構

```
--3/
├── backend/               # 後端 API
│   ├── server.js         # Express 伺服器主程式
│   ├── database.js       # MySQL 資料庫連接
│   ├── database.sql      # SQL 建表語法
│   ├── package.json      # 後端套件設定
│   └── .env             # 環境變數設定
│
└── frontend/             # 前端應用
    ├── App.js           # React Native 主程式
    ├── app.json         # Expo 設定檔
    └── package.json     # 前端套件設定
```

## 🚀 安裝與啟動

### 1️⃣ 資料庫設定

1. 安裝 MySQL (如果尚未安裝)
2. 啟動 MySQL 服務
3. 執行資料庫建表語法：

```bash
mysql -u root -p < backend/database.sql
```

或者登入 MySQL 後執行：

```sql
source backend/database.sql;
```

### 2️⃣ 後端設定

1. 進入後端資料夾：
```bash
cd backend
```

2. 安裝依賴套件：
```bash
npm install
```

3. 設定環境變數（編輯 `.env` 檔案）：
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的MySQL密碼
DB_NAME=ticket_simulator
```

4. 啟動後端伺服器：
```bash
npm start
```

伺服器將運行於 `http://localhost:3000`

### 3️⃣ 前端設定

1. 進入前端資料夾：
```bash
cd frontend
```

2. 安裝依賴套件：
```bash
npm install
```

3. 修改 API 網址（在 `App.js` 中）：
   - 如果在模擬器測試：使用 `http://localhost:3000`
   - 如果在實體手機測試：改為電腦的區域網路 IP，例如：`http://192.168.1.100:3000`

4. 啟動 Expo：
```bash
npm start
```

5. 在手機上安裝 Expo Go App，掃描 QR Code 即可執行

## 📱 應用程式畫面

1. **登入頁** - 輸入帳號密碼登入
2. **註冊頁** - 註冊新帳號
3. **主頁** - 選擇搶票參數並進行模擬
4. **歷史紀錄頁** - 查看過往模擬結果

## 📡 API 使用說明

### 基本資訊
- Base URL: `http://localhost:3000`
- Content-Type: `application/json`

### API 端點

#### 1. 使用者註冊
```
POST /register
```

**請求範例：**
```json
{
  "username": "test",
  "password": "123456"
}
```

**回應範例：**
```json
{
  "message": "Register success"
}
```

---

#### 2. 使用者登入
```
POST /login
```

**請求範例：**
```json
{
  "username": "test",
  "password": "123456"
}
```

**回應範例：**
```json
{
  "message": "Login success",
  "user_id": 1
}
```

---

#### 3. 使用者登出
```
POST /logout
```

**回應範例：**
```json
{
  "message": "Logout success"
}
```

---

#### 4. 搶票成功率模擬
```
POST /simulate
```

**請求範例：**
```json
{
  "platform": "KKTIX",
  "entry_time": "early",
  "ticket_type": "4800",
  "network": "fast",
  "user_id": 1
}
```

**參數說明：**
- `platform`: "ibon" | "KKTIX" | "拓元"
- `entry_time`: "early" | "ontime" | "late"
- `ticket_type`: "3800" | "4800" | "6800"
- `network`: "fast" | "normal" | "slow"
- `user_id`: 使用者 ID

**回應範例：**
```json
{
  "success_rate": 38,
  "suggestion": "建議改搶 3800 區"
}
```

**成功率計算公式：**
```
success_rate = (平台分數 × 30) + (進場時間分數 × 25) + (票種分數 × 25) + (網路分數 × 20)
```

**評分標準：**
- 平台：ibon (1.0) > KKTIX (0.8) > 拓元 (0.7)
- 進場時間：early (1.0) > ontime (0.8) > late (0.6)
- 票種：3800 (1.0) > 4800 (0.8) > 6800 (0.6)
- 網路：fast (1.0) > normal (0.8) > slow (0.6)

---

#### 5. 查看歷史紀錄
```
GET /history?user_id=1
```

**回應範例：**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "platform": "KKTIX",
    "entry_time": "early",
    "ticket_type": "4800",
    "network": "fast",
    "success_rate": 83,
    "suggestion": "您的設定非常好！繼續保持！",
    "created_at": "2026-01-13T10:30:00.000Z"
  }
]
```

## 🔧 技術棧

### 後端
- **Node.js** - JavaScript 執行環境
- **Express** - Web 框架
- **mysql2** - MySQL 資料庫驅動
- **bcrypt** - 密碼加密
- **dotenv** - 環境變數管理
- **cors** - 跨域資源共享

### 前端
- **React Native** - 跨平台行動應用框架
- **Expo** - React Native 開發工具
- **React Navigation** - 路由導航
- **Axios** - HTTP 請求庫
- **React Native Picker** - 下拉選單元件

### 資料庫
- **MySQL** - 關聯式資料庫

## 📊 資料庫結構

### users 表（使用者）
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | INT | 主鍵，自動遞增 |
| username | VARCHAR(50) | 使用者名稱，唯一 |
| password | VARCHAR(255) | 加密後的密碼 |
| created_at | TIMESTAMP | 建立時間 |

### strategies 表（模擬紀錄）
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | INT | 主鍵，自動遞增 |
| user_id | INT | 使用者 ID（外鍵） |
| platform | VARCHAR(20) | 購票平台 |
| entry_time | VARCHAR(20) | 進場時間 |
| ticket_type | VARCHAR(10) | 票種 |
| network | VARCHAR(10) | 網路速度 |
| success_rate | INT | 成功率 (0-100) |
| suggestion | VARCHAR(100) | 建議文字 |
| created_at | TIMESTAMP | 建立時間 |

## ⚠️ 注意事項

1. **網路設定**：如果在實體手機上測試，確保手機和電腦在同一個 Wi-Fi 網路下
2. **防火牆**：確保 3000 埠口沒有被防火牆阻擋
3. **MySQL 密碼**：記得在 `.env` 檔案中設定正確的 MySQL 密碼
4. **Node.js 版本**：建議使用 Node.js 16 或以上版本
5. **Expo Go**：需要在手機上安裝 Expo Go App（iOS App Store 或 Android Google Play）

## 🎯 測試流程

1. 啟動 MySQL 資料庫
2. 啟動後端伺服器（`cd backend && npm start`）
3. 啟動前端應用（`cd frontend && npm start`）
4. 在手機上開啟 Expo Go，掃描 QR Code
5. 註冊新帳號
6. 登入後選擇搶票參數
7. 點擊「開始模擬」查看結果
8. 查看歷史紀錄

## 📝 授權

本專案僅供學習和參考使用。
