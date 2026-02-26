# 🌿 AgroMart 2.0

> **Smarter, Faster, Agricultural Trading**  
> *Grow Connection, Prosper Together!!*

**AgroMart 2.0** is a full-stack, AI-powered agricultural marketplace platform built to digitize and streamline the entire agricultural supply chain — connecting **Farmers**, **Collectors**, **Suppliers**, **Buyers**, and **Administrators** in one unified ecosystem.

---

## 🖼️ Landing Page Background Image

The hero section of the AgroMart landing page features a **stunning, full-viewport background photograph** of a lush, vivid green **tea plantation terraced across rolling hillsides**, shrouded in soft morning mist with distant misty mountains in the background. A **female farmer wearing a traditional white conical hat (nón lá)** is pictured picking leaves by hand from the vibrant green bushes, evoking the spirit of traditional, hardworking agriculture.

### 📸 Image Details

| Property      | Value                                                        |
|---------------|--------------------------------------------------------------|
| **File**      | `frontend/src/assets/products/herosection1.jpg`              |
| **Type**      | JPEG photograph                                              |
| **File Size** | ~408 KB                                                      |
| **Resolution**| High-resolution, widescreen landscape                        |
| **Scene**     | Lush green tea plantation, terraced hillside, misty mountains |
| **Subject**   | Farmer in traditional conical hat picking crops by hand       |
| **Mood**      | Serene, natural, hopeful, and culturally authentic            |

### 🎨 CSS Treatment Applied

The image is referenced in `LandingPage.css` via the `.hero::before` pseudo-element:

```css
.hero::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: url("../../assets/products/herosection1.jpg") center / cover no-repeat;
  filter: saturate(1.4) contrast(1.05); /* Enhanced greens for more vibrant agricultural feel */
  z-index: -2;
}

.hero::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent dark overlay for text legibility */
  z-index: -1;
}
```

**Effect Summary:**
- `saturate(1.4)` — Boosts the vibrancy of the plantation greens by 40%, making them appear richer and more lush.
- `contrast(1.05)` — Slightly enhances depth and crispness for a professional, polished look.
- **50% dark overlay (`rgba(0,0,0,0.5)`)** — Ensures all white hero text (headings, taglines, buttons) remains crisp and readable against any background variation.
- The image is **fixed at the center, scaled to fully cover** the full viewport height (100vh) at all screen sizes.

### 🖋️ Hero Section Text Over the Background

Layered on top of this image are:

| Element | Content |
|---------|---------|
| **Welcome Badge** | `WELCOME TO` (green gradient pill badge) |
| **Main Heading** | `AGROMART` (900 weight, 5.5rem, white) |
| **Subtitle** | `Smarter, Faster, Agricultural Trading` (primary green, italic) |
| **Tagline** | `Grow Connection, Prosper Together !!` |
| **Description** | `Connect farmers, suppliers, and buyers with AI-powered insights and seamless trading.` |
| **CTA Buttons** | `Login` & `Sign Up` (green gradient, pill-shaped) |

---

## 🚀 Project Overview

AgroMart 2.0 solves the fragmentation of traditional agricultural markets by providing a **centralized digital platform** where agricultural produce can be listed, ordered, tracked, paid for, and analyzed — all in one place. It replaces the need for physical wholesale markets and removes inefficiencies caused by multiple intermediaries.

### Key Problem Solved
- Farmers lack direct access to transparent buyers and fair pricing.
- Physical wholesale markets are time-consuming, opaque, and geographically limited.
- No real-time market intelligence for pricing or demand forecasting is available to farmers.

### Solution
A multi-role, real-time, AI-assisted platform where every stakeholder gets their own tailored dashboard and tools.

---

## 🏗️ Architecture

```
Agromart 2.O/
├── frontend/          # React.js SPA (Vite)
│   └── src/
│       ├── Components/
│       │   ├── Landing Page/   # Public homepage
│       │   ├── Auth/           # Login, Signup, OTP
│       │   ├── Common/         # Shared components
│       │   └── Dashboards/
│       │       ├── Farmer Dashboard/
│       │       ├── Collector Dashboard/
│       │       ├── Supplier Dashboard/
│       │       ├── Buyer Dashboard/
│       │       ├── Admin Dashboard/
│       │       └── Common/
│       ├── assets/             # Images & media
│       ├── api/                # Axios API config
│       ├── context/            # React Context (Auth, Socket)
│       └── utils/              # Utility helpers
│
├── backend/           # Node.js + Express REST API
│   ├── server.js      # Entry point with HTTP + Socket.IO
│   ├── socket.js      # Real-time event handlers
│   ├── config/        # DB connection, environment
│   ├── controllers/   # Business logic (9 controllers)
│   ├── routes/        # API route definitions (9 groups)
│   ├── models/        # Mongoose schemas (28 models)
│   ├── middleware/    # JWT auth, file upload
│   └── utils/         # Helpers, mailer, etc.
│
├── chatapp/           # Integrated chat module
└── price_prediction/  # AI price forecasting service (Python)
```

---

## 👥 User Roles & Dashboards

AgroMart 2.0 supports **5 distinct user roles**, each with a purpose-built dashboard:

### 🌾 Farmer
- List and manage agricultural products (vegetables, fruits)
- Manage inventory levels
- Receive and process orders from Collectors/Suppliers
- Track payments via COD (Cash on Delivery) ledger
- View wallet balance and request withdrawals (E-sewa / Khalti / Bank)
- Access AI-powered demand insights and price predictions
- Raise and manage disputes

### 🧺 Collector
- Browse and purchase produce from Farmers
- Manage and track their own orders in real time
- Handle COD payment flows and withdrawal requests
- View wallet and transaction history
- Access detailed analytics dashboard

### 🏪 Supplier
- Source agricultural produce from Farmers/Collectors
- Manage product listings and inventory
- Track and fulfill orders
- Manage payments, withdrawals, and wallet balance
- View demand trends and analytics

### 🛒 Buyer
- Browse the marketplace for fresh produce
- Place and track orders with full status lifecycle
- Review order details and payment history

### 🛡️ Admin
- Full platform oversight and user management
- Verify, approve, or reject user registrations and documents (`docStatus`)
- Freeze/unfreeze user wallets
- Approve or reject withdrawal requests (balance deducted only on "Verified" status)
- View platform-wide analytics
- Manage disputes between users

---

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **Price Prediction** — A dedicated `price_prediction/` Python module forecasting produce prices using historical market data (Kalimati Price Index).
- **Demand Forecasting** — AI insights to help users plan inventory and orders.
- **Google Gemini AI** — Integrated via `@google/genai` for intelligent chatbot and advisory features.
- **NLP** — `natural` library used for text-based analytics and query processing.

### ⚡ Real-Time Updates (Socket.IO)
- Live dashboard refresh on new orders (`order:new`)
- Real-time notifications for order status changes (`dashboard:update`)
- Role-based Socket.IO room joining (e.g., `farmer-<id>`, `buyer-<id>`)
- Farmer and Collector dashboards receive instant background sync without page reload

### 💳 Wallet & Payment System
- Digital wallet for Farmers, Collectors, and Suppliers
- Withdrawal requests via **E-sewa**, **Khalti**, or **Bank Account**
- Admin-controlled withdrawal approval flow:
  - Balance is **only deducted** when status changes to `Verified`
  - **Refund** applied if a previously `Verified` withdrawal is `Rejected`
- Frozen wallet detection — blocks withdrawal requests and shows warning UI
- COD ledger distinguishing `Cash Received` vs. `Cash Paid`
- `Remarks` column on withdrawal history for transparency

### 📦 Order Management
- Full order lifecycle: `Pending → Accepted → Processing → Shipping → Delivered`
- **Active Orders** category (Accepted + Processing + Shipping) tracked in analytics
- Role-specific order views and action permissions
- Dispute resolution system for contested orders

### 📊 Analytics Dashboard
- Interactive charts for order status breakdown (pie)
- Top demand products (horizontal bar chart)
- Revenue and COD flow metrics
- Empty-state placeholders for zero-data scenarios
- Detailed Analytics view with extended charts and export

### 📧 Notifications & OTP
- Email notifications via **Nodemailer**
- OTP-based user verification flow (via email)
- Signup document upload (citizenship, license, etc.) with preview

### 🖼️ Media Management
- **Cloudinary** for cloud-based image storage
- Product and profile photo uploads via **Multer**
- `multer-storage-cloudinary` adapter for seamless upload pipeline

### 🔐 Security
- JWT-based authentication (`jsonwebtoken`)
- Password hashing with `bcryptjs`
- Route-level middleware for role protection
- CORS configuration for controlled API access

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js** (Vite) | UI framework & SPA routing |
| **React Router DOM** | Client-side navigation |
| **React Icons** | Icon library (FaLeaf, FaChartLine, etc.) |
| **Socket.IO Client** | Real-time event listening |
| **Recharts / Chart.js** | Dashboard analytics charts |
| **Axios** | HTTP API client |
| **Google Fonts** | Urbanist, Plus Jakarta Sans |
| **CSS (Vanilla)** | Full custom styling, responsive design |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js v5** | REST API framework |
| **MongoDB** | NoSQL database |
| **Mongoose v9** | ODM for MongoDB |
| **Socket.IO v4** | Real-time bidirectional events |
| **Cloudinary** | Cloud image storage |
| **Multer** | File upload middleware |
| **JWT** | Stateless authentication tokens |
| **bcryptjs** | Secure password hashing |
| **Nodemailer** | Email sending (OTP, notifications) |
| **@google/genai** | Google Gemini AI integration |
| **natural** | NLP / text analytics |
| **uuid** | Unique ID generation |
| **dotenv** | Environment variable management |
| **Nodemon** | Development auto-reload |

### AI / ML Service
| Technology | Purpose |
|------------|---------|
| **Python** | Price prediction model runtime |
| **pandas** | Data processing & CSV analysis |
| **Kalimati Price Data** | Historical market price dataset |

---

## 📡 API Endpoints

| Route Group | Base Path | Description |
|-------------|-----------|-------------|
| Auth | `/api/auth` | Register, Login, OTP verification |
| Products | `/api/products` | CRUD for product listings |
| Inventory | `/api/inventory` | Inventory management |
| Users | `/api/users` | User profile, document upload |
| Orders | `/api/orders` | Order lifecycle management |
| Wallet | `/api/wallet` | Balance, transactions, withdrawals |
| Admin | `/api/admin` | Admin actions, user management |
| Forecast | `/api/forecast` | AI price & demand predictions |
| Disputes | `/api/disputes` | Dispute creation & resolution |

---

## 🗄️ Database Models

The platform has **28 Mongoose models** covering both active and soft-deleted (archived) data:

| Active Models | Deleted (Archive) Models |
|---|---|
| `User` | `DeletedUser` |
| `Farmer` | `DeletedFarmer` |
| `Collector` | `DeletedCollector` |
| `Supplier` | `DeletedSupplier` |
| `Buyer` | `DeletedBuyer` |
| `Product` | `DeletedProduct` |
| `Inventory` | `DeletedInventory` |
| `Order` | `DeletedOrder` |
| `Transaction` | `DeletedTransaction` |
| `Wallet` | `DeletedWallet` |
| `Withdrawal` | `DeletedWithdrawal` |
| `Dispute` | `DeletedDispute` |
| `Activity` | `DeletedActivity` |
| `OTP` | `DeletedOTP` |

---

## 🖥️ Landing Page Sections

The public landing page (`LandingPage.jsx`) is a single-page scroll experience with the following sections:

### 1. 🧭 Navbar (Fixed)
- AgroMart logo with leaf icon
- Navigation links: Home, About, Services, Contact
- Login & Sign Up buttons
- Responsive with hamburger menu on mobile (≤ 968px)
- Active section highlight with scroll tracking

### 2. 🌟 Hero Section (`#home`)
- **Full-viewport** with the tea plantation background image (described above)
- Tagline: *"Grow Connection, Prosper Together !!"*
- Subtitle: *"Smarter, Faster, Agricultural Trading"*
- Call-to-action: Login & Sign Up buttons

### 3. ℹ️ About Section (`#about`)
- Mission statement: AI-powered digital platform for agricultural trade
- Side-by-side layout: text + `farming.jpg` image
- Five key value propositions of AgroMart

### 4. 🛎️ Services Section (`#services`)
- 6 service cards in a responsive grid:
  1. **AI-Powered Insights** — Demand forecasting & price prediction
  2. **Fast Delivery** — Efficient fresh-produce logistics
  3. **Secure Transactions** — Bank-grade payment security
  4. **Mobile Access** — Fully responsive on all devices
  5. **Real-Time Data** — Live market, inventory & order tracking
  6. **Direct Connect** — No intermediaries between stakeholders

### 5. 📞 Footer (`#contact`)
- Contact info: Pokhara, Kaski, Nepal | Phone: 9800000000 | Email: info@agromart.com
- Social icons: Facebook, Twitter, Instagram, LinkedIn
- Quick links
- Copyright: © 2028 AgroMart

---

## ⚙️ Local Setup & Installation

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** (local or Atlas cloud)
- **Python 3.8+** (for price prediction service)
- **Cloudinary account** (for image uploads)
- **Nodemailer email credentials**

### 1. Clone the Repository

```bash
git clone https://github.com/koiralabishal/Agromart-2.O.git
cd "Agromart 2.O"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the backend server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The backend API will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Price Prediction Service (Optional)

```bash
cd price_prediction
pip install pandas
python loadData.py
```

---

## 📂 Project Structure (Detailed)

```
Agromart 2.O/
├── README.md
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── api/
│       │   └── axios.js
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── utils/
│       │   ├── analyticsExport.jsx
│       │   └── ...
│       ├── assets/
│       │   ├── bg.png
│       │   ├── farming.jpg        ← Used in About section
│       │   └── products/
│       │       ├── herosection1.jpg  ← HERO BACKGROUND IMAGE
│       │       ├── apple-fruit.jpg
│       │       ├── broccoli.jpeg
│       │       └── ... (16 product images)
│       └── Components/
│           ├── Landing Page/
│           │   ├── LandingPage.jsx
│           │   ├── LandingPage.css
│           │   ├── LoginPopup.jsx
│           │   ├── SignupModal.jsx
│           │   ├── OTPPopup.jsx
│           │   ├── SuccessPopup.jsx
│           │   └── forms/
│           ├── Auth/
│           ├── Common/
│           └── Dashboards/
│               ├── Farmer Dashboard/
│               ├── Collector Dashboard/
│               ├── Supplier Dashboard/
│               ├── Buyer Dashboard/
│               ├── Admin Dashboard/
│               └── Common/
│
├── backend/
│   ├── server.js
│   ├── socket.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── inventoryController.js
│   │   ├── userController.js
│   │   ├── orderController.js
│   │   ├── walletController.js
│   │   ├── adminController.js
│   │   ├── forecastController.js
│   │   └── disputeController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── userRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── walletRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── forecastRoutes.js
│   │   └── disputeRoutes.js
│   ├── models/          (28 Mongoose models)
│   ├── middleware/
│   └── utils/
│
├── chatapp/
└── price_prediction/
    └── loadData.py
```

---

## 🌐 Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_USER` | Gmail address for Nodemailer |
| `EMAIL_PASS` | Gmail app password |
| `GEMINI_API_KEY` | Google Gemini AI API key |

---

## 📋 User Registration Flow

1. User visits Landing Page and clicks **Sign Up**
2. Selects their **role**: Farmer / Collector / Supplier / Buyer
3. Fills in role-specific information (name, address, payment gateway)
4. Uploads verification documents (for Farmer, Collector, Supplier)
5. Receives **OTP via email** for identity verification
6. Admin reviews uploaded documents and sets `docStatus`:
   - `Verified` — Full platform access
   - `Rejected` — Account locked with reason
7. Approved users can log in and access their dashboard

---

## 🔒 Authentication Flow

1. POST `/api/auth/login` with credentials
2. Server validates password using `bcryptjs`
3. Returns a **JWT token** + user role
4. Frontend stores token in `localStorage`
5. All subsequent API requests include `Authorization: Bearer <token>`
6. Protected routes verify the token via middleware
7. Role-based access control enforced server-side

---

## 📞 Contact

| Field | Details |
|-------|---------|
| **Platform** | AgroMart 2.0 |
| **Address** | Pokhara, Kaski, Nepal |
| **Phone** | 9800000000 |
| **Email** | info@agromart.com |
| **GitHub** | [koiralabishal/Agromart-2.O](https://github.com/koiralabishal/Agromart-2.O) |

---

## 📜 License

This project is developed for academic and demonstration purposes.  
© 2028 AgroMart. All rights reserved.

---

<div align="center">

**🌿 AgroMart 2.0 — Connecting Farms to Families, Sustainably 🌿**

*Built with ❤️ for the agricultural community of Nepal*

</div>
