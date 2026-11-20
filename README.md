# Aruvi Collections (Aruvi.in) 🌿🥻

> **Tradition In Every Thread** — Handcrafted South Indian Luxury Ethnic Wear & AI Couture Experience.
> Full-Stack E-Commerce Application: **React 18 + Tailwind CSS (Frontend)** and **Python Django REST Framework (Backend)**.

---

## 📁 Project Architecture (Split Frontend & Backend)

```
aruvi collection/
├── frontend/                     # React.js + Vite Client Application
│   ├── src/
│   │   ├── components/           # UI Components (Header, Footer, ProductCard, Admin, etc.)
│   │   ├── context/              # Global StoreContext & Central State Sync
│   │   ├── pages/                # Pages (HomePage, ShopPage, AdminPage, Account, etc.)
│   │   ├── services/             # API Client (Axios) & Firebase Services
│   │   ├── styles/               # Tailwind & Custom CSS Styles
│   │   └── utils/                # PDF Invoice Generator & WhatsApp Helper
│   ├── public/                   # Static assets & brand media
│   ├── assets/                   # High-resolution boutique imagery
│   ├── index.html                # Vite HTML Template
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind CSS styling configuration
│   ├── postcss.config.js         # PostCSS configuration
│   └── package.json              # Frontend dependencies & scripts
│
├── backend/                      # Python Django REST Framework API
│   ├── apps/
│   │   ├── accounts/             # Authentication & Role-based Access (Admin vs Customer)
│   │   ├── products/             # Central Products, Categories & Image Upload API
│   │   ├── orders/               # Orders, Status Tracking & Internal Notes API
│   │   └── website_settings/     # Business Settings & WhatsApp Integration API
│   ├── aruvi_backend/            # Core Django Settings & URL Routing
│   ├── media/                    # Persistent product image uploads
│   ├── manage.py                 # Django CLI management script
│   └── requirements.txt          # Python dependencies
│
├── .github/workflows/deploy.yml  # Automated GitHub Pages CI/CD workflow
├── package.json                  # Monorepo root runner (dev, build, backend)
├── verify-app.mjs                # Comprehensive 115-point architecture QA suite
└── test-critical-bug-fix.mjs     # 8 Mandatory synchronization tests
```

---

## 🚀 Quick Start Guide

### 1. Run the Frontend (React.js + Vite)

From the project root:
```bash
npm run dev
# Or explicitly:
npm run dev:frontend
```
Or directly inside `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs locally on **`http://localhost:5173/`**.

### 2. Run the Backend (Django REST Framework)

From the project root:
```bash
npm run dev:backend
```
Or directly inside `backend/`:
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```
Backend API runs locally on **`http://localhost:8000/api/`**.

### 3. Build for Production

```bash
npm run build
```
Generates production build bundle in `frontend/dist/`.

---

## 🛡️ Security & Authentication

* **Authorized Admin Email**: `aruvicollections.25@gmail.com`
* **Server-Side Protected Endpoints**: `/api/admin/products/`, `/api/auth/verify-admin/`
* **Zero Fake Success**: All product additions, edits, and deletions require database confirmation.
* **Auto-Token Recovery**: The frontend Axios client automatically acquires and refreshes tokens so admins never experience credential expiration interruptions.

---

## 👗 The 9 Boutique Services & Collections

1. **Salwar** — Hand-embroidered Anarkali suits, straight cuts, and festive palazzo suits.
2. **Sharara** — Royal flared festive sharara sets with intricate zari and mirror work.
3. **Ethnic Wear** — Pattu pavadai, lehenga sets, and traditional celebration wear.
4. **Maxi's** — Flowing artisanal dresses and graceful long drapes.
5. **Co-ordsets** — Fusion printed silk, cotton, and contemporary ethnic co-ords.
6. **Casual Tops** — Hand-block printed tunics, short kurtis, and everyday chic tops.
7. **Western Wear** — Modern silhouettes blended with handcrafted Indian textiles.
8. **Jeans & Pants** — Baggy pants, straight-fit pants, and palazzos.
9. **Kids Wear** — Festive pattu pavadai sets, dhoti sets, and children's ethnic fashion.
