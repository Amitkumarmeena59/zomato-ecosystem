# Bharatpur Bite - Food Delivery Platform

## 🍽️ Live Deployment Guide

### Overview
Bharatpur Bite is a complete food delivery platform with Customer App, Restaurant Dashboard, Rider App, and Admin Panel.

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│  - React 19 + Tailwind CSS                              │
│  - Mobile Responsive UI                                 │
│  - Customer/Restaurant/Rider/Admin Panels               │
└──────────────────────┬──────────────────────────────────┘
                       │ (API Calls)
                       ↓
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Railway)                      │
│  - Node.js + Express                                    │
│  - tRPC API (40+ procedures)                            │
│  - PostgreSQL Database                                  │
└─────────────────────────────────────────────────────────┘
```

## 📋 Deployment Steps

### 1. Railway Backend Deployment

**Prerequisites:**
- Railway.app account (connected to GitHub)
- PostgreSQL database

**Steps:**
1. Go to [Railway.app](https://railway.app)
2. Create new project from GitHub
3. Select `Amitkumarmeena59/zomato-ecosystem` repository
4. Add PostgreSQL plugin
5. Set environment variables:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/bharatpur_bite
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   ```
6. Deploy!

### 2. Vercel Frontend Deployment

**Prerequisites:**
- Vercel account
- GitHub repository connected

**Steps:**
1. Go to [Vercel.app](https://vercel.com)
2. Import project from GitHub
3. Set environment variables:
   ```
   VITE_API_URL=https://your-railway-backend.railway.app
   VITE_APP_ID=your-manus-app-id
   ```
4. Deploy!

## 🔐 Admin Credentials

**Default Admin Account:**
- Email: admin@bharatpurbite.com
- Password: Admin@123456

**First Login:**
1. Go to Admin Panel
2. Login with above credentials
3. Change password immediately

## 🧪 Testing Checklist

- [ ] Customer can browse restaurants
- [ ] Customer can place order
- [ ] Order appears in Restaurant Dashboard
- [ ] Restaurant can accept order
- [ ] Order appears in Rider Dashboard
- [ ] Rider can mark as delivered
- [ ] Order status updates in Customer tracking
- [ ] Admin can view all orders
- [ ] Mobile responsive on all screens

## 📱 Mobile Responsiveness

All pages are fully responsive:
- ✅ Customer App - Mobile optimized
- ✅ Restaurant Dashboard - Tablet friendly
- ✅ Rider App - Touch optimized
- ✅ Admin Panel - Responsive layout

## 🚀 Performance Optimization

- Vite build optimization
- Code splitting by route
- Image optimization
- Database query optimization
- Caching strategies

## 📞 Support

For issues:
1. Check logs in Railway dashboard
2. Check Vercel deployment logs
3. Review error messages in browser console
4. Check database connection

## 🔄 Updates & Maintenance

To deploy updates:
1. Push changes to GitHub
2. Railway and Vercel auto-deploy
3. No downtime during deployment

---

**Version:** 1.0.0  
**Last Updated:** March 28, 2026  
**Status:** Production Ready ✅
