# Aruvi Collections (Aruvi.in) 🌿🥻

> **Tradition In Every Thread** — Handcrafted South Indian Luxury Ethnic Wear & AI Couture Experience.
> Built as a modern Single Page Application (SPA) powered by **React 18 + Vite**.

Aruvi Collections is a bespoke e-commerce boutique designed for South Indian ethnic couture, featuring authentic Salwars, Shararas, regal Ethnic Wear, Maxis, Co-ordsets, Western Wear, Jeans & Pants, Kids Wear, and an interactive **AI Virtual Fitting Room**.

---

## 🚀 Tech Stack

* **Frontend Framework**: React 18, React DOM
* **Build Tool & Bundler**: Vite 5
* **Routing**: React Router v6 (`HashRouter` for zero-404 GitHub Pages routing)
* **Cloud & Auth**: Firebase v10 Modular SDK (Authentication & Cloud Storage)
* **Styling**: Pure CSS with Custom Properties, Glassmorphism, Responsive Grid & 3D Cards
* **Deployment**: Automated GitHub Actions CI/CD to GitHub Pages

---

## 👗 The 9 Boutique Services & Collections

1. **Salwar** (`#/shop?category=salwar`) — Hand-embroidered Anarkali suits, straight cuts, and festive palazzo suits.
2. **Sharara** (`#/shop?category=sharara`) — Royal flared festive sharara sets with intricate zari and mirror work.
3. **Ethnic Wear** (`#/shop?category=ethnic-wear`) — Pattu pavadai, lehenga sets, and traditional heritage celebration wear.
4. **Maxi's** (`#/shop?category=maxis`) — Flowing artisanal dresses and graceful long drapes.
5. **Co-ordsets** (`#/shop?category=co-ordsets`) — Fusion printed silk, cotton, and contemporary ethnic co-ords.
6. **Casual Tops** (`#/shop?category=casual-tops`) — Hand-block printed tunics, short kurtis, and everyday chic tops.
7. **Western Wear** (`#/shop?category=western-wear`) — Modern silhouettes blended with handcrafted Indian textiles.
8. **Jeans & Pants** (`#/shop?category=jeans-pants`) — Baggy pants, straight-fit pants, and palazzos.
9. **Kids Wear** (`#/shop?category=kids-wear`) — Festive pattu pavadai sets, dhoti sets, and children's ethnic fashion.

---

## 🪞 AI Virtual Fitting Room

* **Studio Models**: Pooja, Meera, Ananya, Diya & Aarav (Kids).
* **Custom Photo Upload**: Try outfits on your personal photo.
* **Fabric Drape Simulation**: Adjust opacity and lighting presets (Boutique, Daylight, Evening Gala).
* **Direct Bag Integration**: Add draped outfits straight to the shopping bag.

---

## 🔥 Firebase Authentication & Cloud Storage

* **Cloud Storage Bucket**: `aruvicollections-fb961.firebasestorage.app`
* **Google Authentication**: Instant OAuth pop-up login.
* **Owner Admin Access**: Strictly gated for **`aruvicollections.25@gmail.com`**.
* **Owner Dashboard**:
  - Live revenue and order metrics.
  - Direct garment image uploads to Firebase Cloud Storage.
  - Product catalog management (Add, Edit, Delete).
  - Customer order status tracking (Confirmed, In Loom, Dispatched, Delivered).

---

## 🛠️ Development & Build Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment

Every push to the `main` branch triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`, which automatically builds and deploys the React SPA to GitHub Pages.
