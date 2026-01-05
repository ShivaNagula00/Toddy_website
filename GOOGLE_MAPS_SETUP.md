# 🗺️ Google Maps API Setup Guide

## 📋 **Setup Steps for Vercel Deployment**

### 1. **Get Google Maps API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Maps JavaScript API" and "Places API"
4. Create API key in "Credentials" section
5. Restrict the API key to your domain (e.g., `yoursite.vercel.app`)

### 2. **Update HTML Files**
Replace `YOUR_API_KEY` in these files with your actual API key:

**In `index.html`:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places" async defer></script>
```

**In `order-success.html`:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places" async defer></script>
```

### 3. **Features Implemented**

#### **For Delivery Orders:**
- Dual map display (Leaflet + Google Maps)
- Draggable customer location marker
- Shop location marker (red)
- Distance calculation between shop and customer

#### **For Pickup Orders:**
- Fixed shop location map on success page
- Red marker at exact shop coordinates (18.64110, 78.87335)
- "Open in Google Maps" button
- Direct call button

### 4. **Shop Location Details**
- **Coordinates:** 18.64110, 78.87335
- **Address:** JVRF+996 Kallu manduva kodimial, Sandralapally X Rd, Sandralapally, Telangana 505501
- **Google Maps URL:** https://www.google.com/maps?q=18.64110,78.87335

### 5. **Deployment to Vercel**
1. Upload your project folder to Vercel
2. The static HTML files will work automatically
3. Google Maps will load once API key is added
4. No environment variables needed (direct script tag approach)

### 6. **Testing**
- Test delivery orders: Maps should show both shop and customer locations
- Test pickup orders: Success page should display shop location map
- Verify markers are clickable and draggable (for customer location)

## ✅ **Ready for Production**
Your website is now configured for Google Maps integration on Vercel static hosting.