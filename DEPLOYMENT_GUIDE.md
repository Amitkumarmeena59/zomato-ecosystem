# 🍽️ Bharatpur Bite - Complete Deployment Guide

## Quick Start (5 Minutes)

### What You Need
1. GitHub Account ✅ (आपके पास है)
2. Railway Account ✅ (आपके पास है)
3. Vercel Account ✅ (आपके पास है)

### Step 1: Deploy Backend on Railway (2 minutes)

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `Amitkumarmeena59/zomato-ecosystem`
5. Railway automatically detects Node.js project
6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Copy the Railway URL (e.g., `https://bharatpur-bite-production.up.railway.app`)

### Step 2: Deploy Frontend on Vercel (2 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import GitHub repository `Amitkumarmeena59/zomato-ecosystem`
4. Set Environment Variables:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
5. Click "Deploy"
6. Wait for deployment (1-2 minutes)
7. Copy the Vercel URL (e.g., `https://bharatpur-bite.vercel.app`)

### Step 3: Test Everything (1 minute)

1. Open Vercel URL in browser
2. Click "Login with Manus"
3. Go to Admin Panel (`/admin-panel`)
4. Click "Seed Dummy Restaurants"
5. Create test order
6. Check if it appears in all dashboards

---

## 🔐 Admin Credentials

**Email:** admin@bharatpurbite.com  
**Password:** Admin@123456

---

## 📱 Live URLs (After Deployment)

| Module | URL |
|--------|-----|
| 🛍️ Customer App | https://bharatpur-bite.vercel.app |
| 🏪 Restaurant Dashboard | https://bharatpur-bite.vercel.app/restaurant-dashboard |
| 🚴 Rider App | https://bharatpur-bite.vercel.app/rider-dashboard |
| 👨‍💼 Admin Panel | https://bharatpur-bite.vercel.app/admin-panel |
| 🔌 Backend API | https://your-railway-url.up.railway.app/api/trpc |

---

## 🧪 Testing Workflow

### Test 1: Customer Order
```
1. Open Customer App
2. Login with Manus OAuth
3. See restaurants (seeded data)
4. Click on restaurant
5. Add items to cart
6. Checkout with address
7. Place order
```

### Test 2: Restaurant Management
```
1. Go to Restaurant Dashboard
2. See pending orders
3. Click "Accept"
4. Click "Mark as Ready"
5. See order status change
```

### Test 3: Rider Delivery
```
1. Go to Rider Dashboard
2. Click "Go Online"
3. See available orders
4. Click "Accept & Navigate"
5. Click "Mark as Delivered"
```

### Test 4: Admin Control
```
1. Go to Admin Panel
2. See all restaurants
3. See all orders
4. Manage commissions
5. Process payouts
```

---

## 📊 Database Setup (Automatic)

Railway automatically creates PostgreSQL database:
- Database name: `bharatpur_bite`
- Tables created automatically on first run
- No manual setup needed!

---

## 🚀 Performance Tips

1. **Caching**: Use browser cache for images
2. **CDN**: Vercel uses global CDN automatically
3. **Database**: Railway optimizes queries automatically
4. **Monitoring**: Check Railway dashboard for performance

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"
**Solution:**
1. Check if Railway backend is running
2. Copy correct Railway URL
3. Update VITE_API_URL in Vercel environment

### Issue: "Database connection error"
**Solution:**
1. Railway creates database automatically
2. Check DATABASE_URL in Railway dashboard
3. Restart Railway deployment

### Issue: "Login not working"
**Solution:**
1. Manus OAuth is pre-configured
2. Check browser console for errors
3. Clear cookies and try again

---

## 📞 Support

**For Railway Issues:**
- Check Railway Dashboard → Logs
- Look for error messages
- Restart deployment if needed

**For Vercel Issues:**
- Check Vercel Dashboard → Deployments
- Look for build errors
- Check browser console (F12)

---

## ✅ Deployment Checklist

- [ ] GitHub repository synced
- [ ] Railway backend deployed
- [ ] Vercel frontend deployed
- [ ] Environment variables set
- [ ] Database created
- [ ] Dummy data seeded
- [ ] Customer app working
- [ ] Restaurant dashboard working
- [ ] Rider app working
- [ ] Admin panel working
- [ ] Mobile responsive tested
- [ ] All URLs documented

---

## 🎉 You're Live!

Your Bharatpur Bite platform is now live and ready for customers!

**Share these URLs:**
- 🛍️ **Customer App**: https://bharatpur-bite.vercel.app
- 👨‍💼 **Admin Panel**: https://bharatpur-bite.vercel.app/admin-panel

**Admin Login:**
- Email: admin@bharatpurbite.com
- Password: Admin@123456

---

**Version:** 1.0.0  
**Last Updated:** March 28, 2026  
**Status:** Production Ready ✅
