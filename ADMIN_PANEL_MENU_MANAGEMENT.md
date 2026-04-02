# Bharatpur Bites - Admin Panel Menu Management Guide

**Version:** 1.0.0  
**Status:** ✅ Production-Ready  
**Last Updated:** 2026-04-02

---

## 📋 Overview

This guide explains how to manage food prices, menu items, and restaurant details from the Admin Panel.

---

## 🔐 Admin Panel Access

### Step 1: Login to Admin Panel

1. Go to: `https://your-domain.com/admin`
2. Enter admin credentials:
   - **Email:** admin@bharatpurbites.com
   - **Password:** Your admin password
3. Click "Login"

### Step 2: Dashboard Overview

The admin dashboard shows:
- Total orders today
- Total revenue
- Active riders
- Active restaurants
- Recent orders
- System alerts

---

## 🍽️ Managing Menu Items

### Add New Menu Item

**Steps:**

1. Click "Menu Management" in sidebar
2. Select restaurant from dropdown
3. Click "Add New Item" button
4. Fill in item details:

   | Field | Description | Example |
   |-------|-------------|---------|
   | **Item Name** | Name of the dish | Butter Chicken |
   | **Category** | Food category | Non-Veg Curries |
   | **Description** | Item description | Tender chicken in creamy tomato sauce |
   | **Price** | Original price in ₹ | 250 |
   | **Discounted Price** | Sale price (optional) | 200 |
   | **Preparation Time** | Minutes to prepare | 30 |
   | **Is Vegetarian** | Toggle for veg/non-veg | ✓ No |
   | **Image** | Upload food photo | [Upload] |

5. Click "Save Item"

**Example:**
```
Item Name: Paneer Tikka
Category: Appetizers
Description: Cottage cheese marinated in yogurt and spices
Price: ₹180
Discounted Price: ₹150
Preparation Time: 20 minutes
Is Vegetarian: Yes
```

### Edit Menu Item

**Steps:**

1. Go to "Menu Management"
2. Select restaurant
3. Find item in list
4. Click "Edit" button
5. Update details
6. Click "Save Changes"

**What you can edit:**
- ✅ Price
- ✅ Discounted price
- ✅ Description
- ✅ Preparation time
- ✅ Availability status
- ✅ Item image
- ❌ Item name (create new item instead)

### Delete Menu Item

**Steps:**

1. Go to "Menu Management"
2. Find item to delete
3. Click "Delete" button
4. Confirm deletion
5. Item removed from menu

**Note:** Deleted items cannot be recovered. Archive instead if unsure.

### Bulk Price Update

**Update prices for multiple items:**

1. Go to "Menu Management" > "Bulk Actions"
2. Select items to update
3. Choose action:
   - Increase by % (e.g., +10%)
   - Decrease by % (e.g., -10%)
   - Set fixed price
4. Enter value
5. Click "Apply"
6. Review changes
7. Confirm

**Example:**
```
Action: Increase by percentage
Value: 5%
Items selected: 15
New prices calculated...
[Confirm] [Cancel]
```

---

## 💰 Managing Prices

### Update Single Item Price

**Quick update:**

1. Go to "Menu Management"
2. Find item
3. Click price field
4. Enter new price
5. Press Enter or click checkmark
6. Price updated instantly

**Example:**
```
Before: Butter Chicken - ₹250
After: Butter Chicken - ₹280
```

### Create Discount

**Steps:**

1. Go to "Discounts" section
2. Click "Create Discount"
3. Fill details:

   | Field | Description |
   |-------|-------------|
   | **Discount Name** | Summer Special |
   | **Discount Type** | Percentage / Fixed Amount |
   | **Discount Value** | 20 / ₹50 |
   | **Max Discount** | ₹100 (max per order) |
   | **Min Order Value** | ₹500 (minimum to apply) |
   | **Valid From** | Start date |
   | **Valid Till** | End date |
   | **Applicable Items** | Select specific items or "All" |

4. Click "Create Discount"

**Example:**
```
Discount Name: Weekend Special
Type: Percentage
Value: 15%
Max Discount: ₹150
Min Order: ₹300
Valid: 01-Apr to 30-Apr
Items: All items from Taj Express
```

### View Active Discounts

1. Go to "Discounts" > "Active"
2. See all running discounts
3. Click discount to edit or deactivate

---

## 🏪 Managing Restaurants

### Add New Restaurant

**Steps:**

1. Go to "Restaurants" > "Add New"
2. Fill restaurant details:

   | Field | Description |
   |-------|-------------|
   | **Restaurant Name** | Taj Express |
   | **Owner Name** | Rajesh Kumar |
   | **Owner Phone** | 9876543210 |
   | **Email** | taj@example.com |
   | **Cuisine Type** | Indian, Chinese |
   | **Address** | Agra, Uttar Pradesh |
   | **Latitude** | 27.1767 |
   | **Longitude** | 78.0081 |
   | **Opening Time** | 10:00 AM |
   | **Closing Time** | 11:00 PM |
   | **Delivery Fee** | ₹30 |
   | **Min Order Value** | ₹200 |
   | **Logo** | [Upload] |
   | **Banner** | [Upload] |

3. Click "Create Restaurant"

### Edit Restaurant Details

**Steps:**

1. Go to "Restaurants"
2. Find restaurant
3. Click "Edit"
4. Update details
5. Click "Save"

**Editable fields:**
- Restaurant name
- Cuisine type
- Description
- Opening/closing times
- Delivery fee
- Min order value
- Logo and banner
- Address and location

### Verify Restaurant Documents

**Steps:**

1. Go to "Restaurants" > "Verification"
2. Find restaurant with pending verification
3. Review documents:
   - Business license
   - FSSAI certificate
   - Owner ID
   - Address proof
4. Click "Approve" or "Reject"
5. Add comment if rejecting

---

## 📊 Analytics & Reports

### View Restaurant Performance

**Steps:**

1. Go to "Analytics" > "Restaurants"
2. Select restaurant
3. View metrics:

   | Metric | Description |
   |--------|-------------|
   | **Total Orders** | Orders received |
   | **Total Revenue** | Money earned |
   | **Avg Rating** | Customer rating (1-5) |
   | **Completion Rate** | % of delivered orders |
   | **Avg Delivery Time** | Minutes to deliver |

### View Menu Performance

**Steps:**

1. Go to "Analytics" > "Menu Items"
2. See top-selling items:

   | Item | Orders | Revenue | Rating |
   |------|--------|---------|--------|
   | Butter Chicken | 156 | ₹39,000 | 4.8 |
   | Paneer Tikka | 142 | ₹25,560 | 4.7 |
   | Dal Makhani | 128 | ₹23,040 | 4.6 |

### Generate Reports

**Steps:**

1. Go to "Reports"
2. Select report type:
   - Daily sales
   - Weekly summary
   - Monthly revenue
   - Item performance
   - Rider performance
3. Select date range
4. Click "Generate"
5. Download as PDF/Excel

---

## 🎯 Best Practices for Menu Management

### 1. Price Strategy

- **Peak Hours:** Increase prices by 10-15% during lunch/dinner
- **Off-Peak:** Offer discounts during slow hours
- **Seasonal:** Adjust prices based on ingredient costs
- **Competitor Analysis:** Monitor competitor prices

**Example:**
```
Lunch (12-2 PM): +15% surge pricing
Dinner (7-10 PM): +10% surge pricing
Midnight (11 PM-6 AM): -20% discount
```

### 2. Menu Organization

- **Categorize items:** Appetizers, Mains, Desserts, Beverages
- **Highlight bestsellers:** Mark top 5 items
- **Remove slow items:** Delete items with <5 orders/month
- **Update descriptions:** Use appetizing language

**Example:**
```
❌ Bad: Chicken curry
✅ Good: Tender chicken cooked in aromatic spices with creamy tomato sauce
```

### 3. Image Quality

- **High resolution:** 1200x800px minimum
- **Good lighting:** Natural light, no shadows
- **Consistent style:** Same background and angles
- **Appetizing:** Make food look delicious

### 4. Inventory Management

- **Mark unavailable:** If item is out of stock
- **Set preparation time:** Accurate delivery estimates
- **Update daily:** Remove items not available today

**Example:**
```
Item: Biryani
Status: Available
Preparation Time: 45 minutes
Note: Fresh stock available until 9 PM
```

---

## 🔔 Notifications & Alerts

### Restaurant Status Alerts

The admin panel shows alerts for:

| Alert | Action |
|-------|--------|
| **Low Stock** | Reorder items |
| **High Cancellation** | Review quality |
| **Negative Reviews** | Respond to feedback |
| **Document Expiry** | Renew licenses |
| **Payment Pending** | Process payment |

### Configure Alerts

1. Go to "Settings" > "Alerts"
2. Enable/disable alert types
3. Set alert thresholds
4. Choose notification method (Email, SMS, Push)

---

## 📱 Mobile App for Restaurants

Restaurants can also manage menu from their mobile app:

1. Download "Bharatpur Bites Restaurant" app
2. Login with restaurant account
3. Go to "Menu" tab
4. Update prices and items
5. Changes sync to web and customer app instantly

---

## 💡 Quick Tips

### Tip 1: Seasonal Menu Updates

Update menu items based on seasons:
- **Summer:** Cold drinks, salads, light meals
- **Winter:** Hot dishes, soups, heavy meals
- **Festivals:** Special items for celebrations

### Tip 2: Flash Sales

Create limited-time offers:
```
Flash Sale: 50% off on selected items
Valid: Today only, 6 PM - 9 PM
Items: Butter Chicken, Paneer Tikka, Dal Makhani
```

### Tip 3: Bundle Offers

Create combo meals:
```
Combo Name: Family Pack
Items: 2 Curries + 1 Rice + 1 Bread + 1 Dessert
Price: ₹599 (Save ₹100)
```

### Tip 4: Price Testing

Test different prices to find optimal:
```
Week 1: ₹250 - 50 orders
Week 2: ₹280 - 45 orders
Week 3: ₹220 - 65 orders
→ Optimal price: ₹220
```

---

## 🆘 Troubleshooting

### Issue: Price not updating

**Solution:**
1. Refresh page (Ctrl+R)
2. Clear browser cache
3. Try different browser
4. Contact support

### Issue: Image not uploading

**Solution:**
- Check file size (<5 MB)
- Use supported format (JPG, PNG)
- Check internet connection
- Try different image

### Issue: Discount not applying

**Solution:**
- Verify discount is active
- Check minimum order value
- Verify item is selected
- Check discount date range

---

## 📞 Support

For help with menu management:
- **Email:** support@bharatpurbites.com
- **Phone:** +91-XXXX-XXXX-XXXX
- **Chat:** In-app support chat
- **Docs:** [Full Documentation](https://docs.bharatpurbites.com)

---

## 🎓 Training Videos

Watch these videos for detailed guidance:

1. **Adding Menu Items** - 5 minutes
2. **Managing Prices** - 3 minutes
3. **Creating Discounts** - 4 minutes
4. **Analytics & Reports** - 6 minutes
5. **Best Practices** - 8 minutes

Available at: https://training.bharatpurbites.com

---

## 📋 Checklist for Restaurant Owners

- [ ] All menu items added
- [ ] Prices verified and updated
- [ ] Item images uploaded
- [ ] Descriptions written
- [ ] Preparation times set
- [ ] Discounts created
- [ ] Opening/closing times set
- [ ] Delivery fee configured
- [ ] Documents verified
- [ ] Analytics reviewed

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0
