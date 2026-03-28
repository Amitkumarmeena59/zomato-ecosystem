# 🚀 Bharatpur Bite - Railway Deployment Guide

## Step 1: Create Railway Project (2 minutes)

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub"**
4. Choose repository: **Amitkumarmeena59/zomato-ecosystem**
5. Click **"Deploy Now"**

Railway will automatically detect the configuration and start building.

---

## Step 2: Configure Environment Variables (1 minute)

Once the deployment starts, Railway will ask for environment variables. Add these:

```
DATABASE_URL=<Railway will provide this automatically>
JWT_SECRET=your-super-secret-jwt-key-12345
VITE_APP_ID=<from Manus OAuth>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=<from Manus OAuth>
NODE_ENV=production
```

**Note:** Railway automatically provides `DATABASE_URL` when you add PostgreSQL. Just copy it.

---

## Step 3: Add PostgreSQL Database (1 minute)

1. In Railway dashboard, click **"Add"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create and link it automatically
4. The `DATABASE_URL` will be auto-populated

---

## Step 4: Get Your Backend URL (1 minute)

After deployment completes:

1. Go to **Railway Dashboard**
2. Click on your deployed service
3. Find **"Deployments"** tab
4. Copy the **Public URL** (looks like: `https://your-railway-url.up.railway.app`)

**This is your Backend API URL!** ✅

---

## Step 5: Deploy Frontend on Vercel (2 minutes)

1. Go to **https://vercel.com**
2. Click **"New Project"**
3. Import GitHub repo: **Amitkumarmeena59/zomato-ecosystem**
4. In **Environment Variables**, add:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app/api/trpc
   ```
5. Click **"Deploy"**

**This is your Frontend URL!** ✅

---

## Step 6: Test Everything (5 minutes)

### Open Your Customer App:
```
https://your-vercel-url.vercel.app
```

### Login:
- Click **"Login with Manus"**
- Authorize with your account

### Go to Admin Panel:
```
https://your-vercel-url.vercel.app/admin-panel
```

### Seed Dummy Data:
- Click **"Seed Dummy Restaurants"**
- Wait for confirmation

### Create Test Order:
1. Go back to home page
2. Click on any restaurant
3. Add items to cart
4. Checkout with dummy data

### Check All Dashboards:
- **Restaurant Dashboard:** `/restaurant-dashboard`
- **Rider Dashboard:** `/rider-dashboard`
- **Admin Panel:** `/admin-panel`

---

## 🎯 Final URLs

After deployment, you'll have:

| Module | URL |
|--------|-----|
| 🛍️ Customer App | `https://your-vercel-url.vercel.app` |
| 🏪 Restaurant Dashboard | `https://your-vercel-url.vercel.app/restaurant-dashboard` |
| 🚴 Rider App | `https://your-vercel-url.vercel.app/rider-dashboard` |
| 👨‍💼 Admin Panel | `https://your-vercel-url.vercel.app/admin-panel` |
| 🔌 Backend API | `https://your-railway-url.up.railway.app/api/trpc` |

---

## 🔐 Admin Credentials

```
Email: admin@bharatpurbite.com
Password: Admin@123456
```

---

## ✅ Verification Checklist

- [ ] Railway deployment completed successfully
- [ ] PostgreSQL database connected
- [ ] Vercel frontend deployed
- [ ] Environment variables set correctly
- [ ] Can login with Manus OAuth
- [ ] Dummy restaurants seeded
- [ ] Can create and track orders
- [ ] Admin panel accessible
- [ ] Restaurant dashboard working
- [ ] Rider app working

---

## 🆘 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** Check `DATABASE_URL` in Railway environment variables. Should be provided automatically.

### Issue: "API not responding"
**Solution:** Make sure `VITE_API_URL` in Vercel matches your Railway backend URL exactly.

### Issue: "Login not working"
**Solution:** Verify `VITE_APP_ID` and `OAUTH_SERVER_URL` are correct in environment variables.

### Issue: "Dummy data not seeding"
**Solution:** Make sure you're logged in as admin before clicking seed button.

---

## 📞 Support

If you face any issues:
1. Check Railway logs: Railway Dashboard → Logs tab
2. Check Vercel logs: Vercel Dashboard → Deployments → Logs
3. Check browser console: Press F12 in browser

---

**Your Bharatpur Bite is now LIVE! 🎉**

Share the Customer App URL with your customers and start taking orders!
