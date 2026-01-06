# Toddy Milk - Fresh & Natural 🥥

A modern web application for ordering fresh toddy milk with real-time inventory management, location-based delivery, and secure payment processing.

## 🚀 Features

- **Real-time Ordering System** - Live inventory tracking and order management
- **Location-based Delivery** - GPS integration with accurate distance calculation
- **Multiple Payment Options** - UPI integration with multiple app support
- **Owner Dashboard** - Complete order management and analytics
- **Mobile Responsive** - Optimized for all devices
- **Secure Authentication** - Environment-based configuration

## 📁 Project Structure

```
Toddy-Website/
├── src/
│   ├── pages/           # HTML pages
│   │   ├── index.html   # Main customer interface
│   │   ├── login.html   # Owner authentication
│   │   ├── owner.html   # Owner dashboard
│   │   └── order-success.html
│   ├── scripts/         # JavaScript files
│   │   ├── config.js    # Configuration management
│   │   ├── firebase.js  # Database operations
│   │   └── script.js    # Main application logic
│   ├── styles/          # CSS stylesheets
│   │   └── style.css    # Main stylesheet
│   ├── assets/          # Static assets
│   │   └── qr.png       # QR code for payments
│   └── config/          # Configuration files
│       ├── .env         # Environment variables
│       └── .env.example # Environment template
├── docs/                # Documentation
├── tests/               # Test files
├── index.html          # Entry point (redirects to src/pages/)
├── package.json        # Project metadata
└── README.md          # This file
```

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Toddy-Website
```

### 2. Configure Environment Variables
```bash
cp src/config/.env.example src/config/.env
# Edit .env with your actual values
```

### 3. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Copy your Firebase config to `.env` file
4. Set up Firestore security rules

### 4. Deploy
- For local development: Open `index.html` in a web server
- For production: Deploy to any static hosting service

## 🔧 Configuration

All sensitive data is stored in environment variables:

- **Firebase Configuration** - Database connection
- **Business Settings** - UPI ID, shop location, prices
- **Authentication** - Owner login credentials
- **External APIs** - Nominatim, OpenStreetMap

See `src/config/.env.example` for all available options.

## 📱 Usage

### For Customers:
1. Visit the website
2. Select toddy type and quantity
3. Choose pickup or delivery
4. Complete payment via UPI
5. Receive confirmation call

### For Owners:
1. Login at `/login.html`
2. View real-time orders
3. Manage inventory and prices
4. Track deliveries and payments

## 🔒 Security Features

- Environment-based configuration
- Secure Firebase rules
- Input validation and sanitization
- Protected owner dashboard
- Payment verification system

## 🧪 Testing

Test files are located in the `tests/` directory:
- `test-distance.html` - Distance calculation verification
- `test-mobile-map.html` - Mobile map functionality

## 📊 Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: Firebase Firestore
- **Maps**: Leaflet.js, OpenStreetMap
- **Payments**: UPI Deep Linking
- **Geocoding**: Nominatim API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and queries, contact the development team or create an issue in the repository.

---

**Made with ❤️ for fresh toddy milk delivery**