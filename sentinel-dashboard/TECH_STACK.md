# Tech Stack & Ekosistem Sentinel Dashboard

## Overview
Sentinel Dashboard adalah aplikasi web modern yang dibangun dengan **Next.js** dan **TypeScript**, menggunakan ekosistem teknologi terkini untuk development, styling, UI components, dan integrasi API.

---

## 🎯 Framework & Runtime

### **Next.js 16.1.4**
- Framework React fullstack untuk production-grade web applications
- Features: App Router, Server Components, API Routes, incremental static regeneration
- Build optimization dan automatic code splitting built-in

### **React 19.2.3 & React DOM 19.2.3**
- Rendering library untuk UI components
- Server Components & Client Components support

---

## 🎨 UI & Styling

### **Tailwind CSS 4**
- Utility-first CSS framework untuk rapid UI development
- PostCSS integration (`tailwindcss/postcss` v4)
- Optimized bundle size dengan JIT compilation

### **Framer Motion 12.29.2**
- Animation library untuk smooth, performant UI animations
- Gesture handling dan interactive motion primitives
- Advanced choreography support

### **Lucide React 0.563.0**
- Icon library dengan 500+ customizable SVG icons
- Tree-shakeable, lightweight icon set

### **Tailwind Merge 3.4.0**
- Utility untuk resolve Tailwind CSS class conflicts
- Ensures proper class precedence dalam dynamic styling

---

## 📊 Data Visualization

### **Recharts 3.7.0**
- React-based charting library untuk data visualization
- Support: line charts, bar charts, pie charts, area charts, radar charts
- Responsive & accessible by default

---

## 🔌 API & Data Integration

### **Axios 1.13.4**
- Promise-based HTTP client untuk API requests
- Request/response interceptors support
- Error handling & timeout management

### **OpenAI 6.17.0**
- Official OpenAI API client library
- Support untuk GPT models dan advanced AI features
- Streaming response handling

---

## 🛠️ Development Tools

### **TypeScript 5**
- Static typing untuk JavaScript
- Strict type checking enabled
- Target: ES2017

### **ESLint 9 + ESLint Config Next 16.1.4**
- Linting dan code quality tool
- NextJS-specific rules: Web Vitals, TypeScript support
- Flat config system (`eslint.config.mjs`)

### **PostCSS**
- CSS transformations via `@tailwindcss/postcss` plugin
- Automated vendor prefixing dan CSS optimization

---

## 📦 Package Management

- **npm** - dependency management
- **Node.js** - runtime environment

---

## 🎯 Development Workflow

### **Scripts**
```json
{
  "dev": "next dev",        // Development server (hot reload)
  "build": "next build",    // Production build
  "start": "next start",    // Production server
  "lint": "eslint"          // Code quality checks
}
```

### **Type Safety**
- TypeScript strict mode
- Path aliases (`@/*` → root directory)
- Next.js type augmentation via `next` plugin

---

## ✨ Key Features Enabled

- **App Router** - Modern file-based routing
- **Server Components** - Reduce client-side JavaScript
- **API Routes** - Backend functionality
- **Image Optimization** - Automatic image processing
- **Font Optimization** - Geist font family
- **Web Vitals Monitoring** - Performance metrics

---

## 🔐 Build Configuration

### **Environment**
- `.env.local` - Local environment variables
- TypeScript strict mode untuk type safety
- ESM + CommonJS module support

### **Performance**
- Incremental builds (`incremental: true`)
- Code splitting per route
- Tree-shaking untuk unused code removal

---

## 📝 Utility Libraries

### **clsx 2.1.1**
- Utility untuk conditional className handling
- Lightweight alternative untuk className merging

### **readline-sync 1.4.10**
- Synchronous readline untuk CLI tools
- Used dalam utility scripts

---

## 🚀 Deployment Ready

- Optimized untuk Vercel (Next.js creators)
- Compatible dengan self-hosted solutions
- Production builds dengan optimization
- Performance monitoring capabilities

---

## Summary
Sentinel Dashboard menggunakan **modern, battle-tested tech stack** yang fokus pada:
- ✅ **Developer Experience** (TypeScript, Next.js, Hot Reload)
- ✅ **Performance** (SSR, Code Splitting, Image Optimization)
- ✅ **Styling Efficiency** (Tailwind CSS, Framer Motion)
- ✅ **Data Visualization** (Recharts)
- ✅ **AI Integration** (OpenAI API)
- ✅ **Code Quality** (ESLint, TypeScript Strict Mode)
