# Aruvi Collections (Aruvi.in) 🌿🥻

> **Tradition In Every Thread** — Handcrafted South Indian Luxury Ethnic Wear & AI Couture Experience.

Aruvi Collections is a bespoke e-commerce boutique designed for South Indian ethnic couture, featuring authentic Kanjivaram pure silk sarees, designer salwar suits, shararas, ethnic fusion wear, and an innovative **AI Virtual Fitting Room**.

---

## ✨ Features & Highlights

### 👗 1. The 7 Signature Collections
Strictly curated collections featuring:
1. **Sarees** — Pure Kanjivaram silk, Banarasi gold zari, Chanderi festive weaves, and lightweight handlooms.
2. **Salwar** — Hand-embroidered Anarkali suits, straight cuts, and festive palazzo suits.
3. **Sharara** — Royal festive flared sharara sets with intricate zari and mirror work.
4. **Ethnic Wears** — Pattu pavadai, lehenga sets, and traditional South Indian celebration wear.
5. **Co-ord Sets** — Fusion printed silk, cotton, and contemporary ethnic co-ords.
6. **Western Tops** — Hand-block printed tunics, short kurtis, and Indo-western tops.
7. **Kids** — Traditional pattu pavadai sets, dhoti sets, and ethnic festive wear for children.

### 🪞 2. AI Virtual Fitting Room
* **Step 1: Choose Garment** — Select any outfit across the 7 collections.
* **Step 2: Model Avatar or Photo Upload** — Upload a personal full-body photo or select a diverse studio model silhouette.
* **Step 3: Neural AI Drape** — Photorealistic AI fabric synthesis with interactive Before/After split comparison slider.
* **Direct Integration** — Share your try-on on WhatsApp or add to bag with your silhouette measurements!

### 🔥 3. Firebase Cloud Storage & Auth
* **Live Storage**: Direct upload of product media and fitting room photos to Firebase Cloud Storage (`ssvvallarasubillsystem.firebasestorage.app`).
* **Customer Authentication**: Integrated Firebase Google Sign-In and Email/Password registration/login on "My Account".

### 👑 4. Boutique Admin Management
* **Owner Authentication**: Strictly protected via Google Login for **`aruvicollections.25@gmail.com`**.
* **Storefront Control**: Top Admin Bar appears automatically when the admin logs in, enabling instant product additions, real-time in-page editing, and deletions dynamically synced across Home and Service pages.
* **Admin Portal**: Full dashboard for product catalog management, order tracking, and inventory status.

### 📱 5. 100% Multi-Device Responsive
* Optimized for all screen sizes: Desktop (1440px+), Laptops (1024px-1439px), Tablets (769px-1023px), and Mobile Phones (320px-768px).
* 2-column mobile product grid with touch-friendly navigation drawer, horizontal category pill bar, and sticky mobile purchase bar on product details.

---

## 🚀 Tech Stack

* **Frontend**: HTML5, Vanilla JavaScript (ES6+), CSS3 with CSS Custom Properties
* **Styling**: Responsive Grid & Flexbox, 3D Tilt Cards, Luxury Glassmorphism & Gold Theme
* **Backend / Cloud**: Firebase v10 SDK (Authentication & Cloud Storage)
* **Fonts**: Playfair Display (Serif) & Montserrat (Sans-serif) via Google Fonts

---

## 📂 Project Structure

```
aruvi-collection/
├── index.html                  # Boutique Home Page & Hero Showcase
├── shop.html                   # 7 Collections Catalog with Filters & Pills
├── product-detail.html         # Product Details with Gallery & Sticky Buy Bar
├── virtual-fitting-room.html   # Dedicated AI Fitting Room Studio Page
├── cart.html                   # Shopping Bag & Order Summary
├── checkout.html               # Multi-step Delivery & Payment Checkout
├── account.html                # Patron Account & Firebase Authentication
├── wishlist.html               # Saved Favorites Wishlist
├── admin.html                  # Boutique Owner Admin Portal
├── scripts/
│   ├── firebase-config.js      # Live Firebase Storage & Auth Configuration
│   ├── customer-auth.js        # Firebase Google & Email/Password Engine
│   ├── store-data.js           # Dynamic Catalog & Storage State Manager
│   ├── app-main.js             # Storefront UI Controller & Admin Bar
│   ├── fitting-room.js         # AI Virtual Fitting Room Engine & Canvas
│   └── effects.js              # Ambient Animations & Micro-interactions
├── styles/
│   ├── main.css                # Core Design System & Multi-Device Responsive CSS
│   ├── auth.css                # Firebase Auth Modal & Cards
│   ├── fitting-room.css        # AI Fitting Room Modal & Split Slider
│   ├── admin.css               # Admin Dashboard Styling
│   └── animations.css          # Ambient Glow & Shimmer Transitions
└── assets/                     # Curated Silk & Ethnic Images & Brand Logo
```

---

## 📄 License

© 2026 Aruvi Collections. All Rights Reserved.
Tradition In Every Thread.
