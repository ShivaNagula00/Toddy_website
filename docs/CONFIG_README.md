# Configuration Management

## Overview
All hardcoded configurations have been moved to centralized configuration files for easier management and deployment.

## Configuration Files

### 1. `.env` (Environment Variables)
Contains all sensitive and configurable values:
- Firebase credentials
- UPI payment details
- Shop location coordinates
- Default prices and inventory
- API keys

### 2. `js/config.js` (JavaScript Configuration)
Runtime configuration file that JavaScript can access:
- Loads values from environment or uses defaults
- Provides fallback values for all configurations
- Exports CONFIG object globally

## How to Update Configurations

### Method 1: Update config.js directly
Edit `js/config.js` and change the values:
```javascript
const CONFIG = {
  FIREBASE: {
    apiKey: "your-new-api-key",
    // ... other values
  },
  PAYMENT: {
    UPI_ID: "your-new-upi@bank",
    MERCHANT_NAME: "Your Shop Name"
  }
  // ... etc
};
```

### Method 2: Use environment variables (for production)
1. Update `.env` file with new values
2. Use a build process to inject values into config.js
3. Deploy the updated files

## Configuration Categories

### Firebase Settings
- API Key, Auth Domain, Project ID
- Storage Bucket, Messaging Sender ID, App ID

### Payment Settings
- UPI ID for payments
- Merchant/Shop name

### Shop Location
- Latitude and Longitude coordinates
- Physical address
- Phone number

### Business Settings
- Default prices for each toddy type
- Default inventory levels
- Delivery charges and distance calculations

### External APIs
- Google Maps API key
- CDN versions for libraries

## Files Updated to Use Configuration

1. `js/firebase.js` - Uses CONFIG.FIREBASE
2. `js/script.js` - Uses all configuration categories
3. `index.html` - Loads config.js and updates UPI display
4. `order-success.html` - Uses shop location from config

## Benefits

✅ **Centralized Management** - All settings in one place
✅ **Easy Updates** - Change values without searching through code
✅ **Environment Support** - Different configs for dev/prod
✅ **Fallback Values** - Graceful degradation if config fails
✅ **Type Safety** - Structured configuration object
✅ **Version Control** - Track configuration changes

## Deployment Notes

- For static hosting (Vercel), update `js/config.js` directly
- For dynamic environments, implement environment variable injection
- Keep `.env` file secure and don't commit sensitive values to public repos
- Test all configurations after updates

## Migration Complete

All hardcoded values have been successfully moved to configuration files:
- ✅ Firebase credentials
- ✅ UPI payment details  
- ✅ Shop location coordinates
- ✅ Default prices and inventory
- ✅ Phone numbers and addresses
- ✅ CDN URLs and versions