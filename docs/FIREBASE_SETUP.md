# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "toddy-orders")
4. Disable Google Analytics (not needed)
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for now)
4. Select your preferred location
5. Click "Done"

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add web app
4. Enter app nickname (e.g., "Toddy Website")
5. Click "Register app"
6. Copy the firebaseConfig object

## 4. Update Firebase Configuration

Replace the configuration in `js/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## 5. Set Firestore Security Rules (Optional - for production)

In Firestore Database > Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{document} {
      allow read, write: if true; // Change this for production security
    }
  }
}
```

## 6. Test the Integration

1. Open your website
2. Place a test order
3. Check Firestore Database to see if the order appears
4. Check owner dashboard to see if orders load

## What's Fixed

✅ Orders now stored in Firestore (cloud database)
✅ All devices see the same orders
✅ Owner dashboard shows all orders from all devices
✅ No more localStorage dependency for orders
✅ Real-time data synchronization
✅ Free tier supports up to 50,000 reads/day

## Order Data Structure

Each order in Firestore contains:
- `orderId`: Unique identifier
- `customer`: Customer name
- `mobile`: Phone number
- `items`: Array with type, quantity, price
- `totalAmount`: Total cost
- `paymentStatus`: PENDING/SUCCESS/FAILED
- `orderStatus`: INITIATED/CONFIRMED
- `deliveryType`: pickup/delivery
- `address`: Delivery address
- `coordinates`: GPS coordinates
- `createdAt`: Server timestamp
- `updatedAt`: Server timestamp

## Important Notes

- Replace Firebase config with your actual project details
- Test thoroughly before going live
- Consider adding authentication for production use
- Monitor Firestore usage to stay within free limits