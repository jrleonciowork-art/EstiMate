# EstiMate — Pocket Quantity Surveying & Cost Estimation Suite

> **The count-tractor you can actually count on.**  
> An offline-first, browser-based Quantity Surveying (QS) web platform engineered for Philippine site engineers, quantity surveyors, and residential contractors.

![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=flat&logo=vercel)
![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat&logo=vite)

---

## 🏗️ Core Features

- **Multi-Project Management Dashboard (`/dashboard`)**:
  - Create, edit, clone, and manage isolated construction projects.
  - Live portfolio aggregate valuation and real-time project search.
  - 100% offline-first local persistence via browser `localStorage`.
- **4 Dedicated Field Takeoff Modules (`/project/:id`)**:
  1. **Structural Concrete & Rebar**: Slabs, columns, footings, mix classes (AA to C), 40kg/50kg cement bag yields, gravel/sand volumes, and rebar kg/m³ density.
  2. **CHB Masonry & Plaster**: Net wall deductions (doors & windows), 400x200mm block quantities, 1:3 mortar factors, and 16-25mm plaster coats.
  3. **Architectural Finishes**: Floor tile coverage + wastage allowance, multi-coat paint coverage down to 4L gallon cans.
  4. **Master Material & DOLE Wage Database**: Centralized price basket with Metro Manila benchmark rates and statutory DOLE NCR Wage Order (NCR-27) regional baselines.
- **Client-Ready BOQ PDF Generator**:
  - One-click export of formal, itemized Master Bill of Quantities (BOQ) with custom company letterheads and logos.
- **GSAP-Powered Parallax Hero**:
  - High-performance 1:1 hardware-accelerated parallax hero featuring the Metro Manila skyline sunset.
- **Dynamic Authentication & Route Protection (`/login`)**:
  - Google OAuth & magic link email authentication architecture.
  - Route guards protecting project workspaces and user settings.
- **Account & Output Preferences (`/settings`)**:
  - Personal credentials and construction role selection.
  - Drag-and-drop company logo upload encoded directly in local state.
  - Default DOLE regional labor rate baselines across all 17 Philippine regions.

---

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + custom architectural blueprint theme (`#11224D` / `#F98125`)
- **Animation**: [GSAP](https://greensock.com/gsap/) + [Framer Motion](https://www.framer.com/motion/)
- **PDF Engine**: [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 💻 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/jrleonciowork-art/EstiMate.git
cd EstiMate
```

### 2. Install dependencies
```bash
pnpm install
# or
npm install
```

### 3. Start local development server
```bash
pnpm run dev
# or
npm run dev
```

### 4. Build for production
```bash
pnpm run build
# or
npm run build
```

---

## 🌐 Deploying to Vercel

1. Push your changes to GitHub:
   ```bash
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New" > "Project"**.
3. Import the `EstiMate` repository from your GitHub account (`jrleonciowork-art/EstiMate`).
4. Vercel will automatically detect **Vite** as the framework and use:
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install` (or `npm install`)
5. Click **"Deploy"**!

The included `vercel.json` ensures that client-side SPA routing works across all deep routes (`/dashboard`, `/project/:id`, `/settings`, `/pricing`, `/login`).

---

## 📄 License

Private repository © EstiMate. All rights reserved.
