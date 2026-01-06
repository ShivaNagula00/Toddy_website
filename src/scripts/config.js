// Configuration loader for client-side application
// Since .env files don't work directly in browsers, this file serves as the config bridge

class ConfigLoader {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  // Load configuration from environment or defaults
  loadConfig() {
    // In a real production environment, these would come from environment variables
    // For client-side apps, you might use build-time environment variable injection
    this.config = {
      FIREBASE: {
        API_KEY: process.env.FIREBASE_API_KEY || "AIzaSyACtkNvY3wfOmBp34Ddj8MDecw0rXSWLUc",
        AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || "toddy-orders.firebaseapp.com",
        PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "toddy-orders",
        STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || "toddy-orders.firebasestorage.app",
        MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || "199463515144",
        APP_ID: process.env.FIREBASE_APP_ID || "1:199463515144:web:4211e7276ac01a61288dbd",
        CDN_VERSION: process.env.FIREBASE_CDN_VERSION || "10.7.1"
      },
      BUSINESS: {
        UPI_ID: process.env.UPI_ID || "6302564464@pthdfc",
        MERCHANT_NAME: process.env.MERCHANT_NAME || "Nagula Shiva Sai",
        SHOP_LATITUDE: parseFloat(process.env.SHOP_LATITUDE) || 18.64110,
        SHOP_LONGITUDE: parseFloat(process.env.SHOP_LONGITUDE) || 78.87335,
        SHOP_ADDRESS: process.env.SHOP_ADDRESS || "JVRF+996 Kallu manduva kodimial, Sandralapally X Rd, Sandralapally, Telangana 505501",
        SHOP_PHONE: process.env.SHOP_PHONE || "6302564464"
      },
      PRICES: {
        EETHA: parseInt(process.env.PRICE_EETHA) || 60,
        THATI: parseInt(process.env.PRICE_THATI) || 75,
        NEERA: parseInt(process.env.PRICE_NEERA) || 90
      },
      INVENTORY: {
        EETHA: parseInt(process.env.INVENTORY_EETHA) || 50,
        THATI: parseInt(process.env.INVENTORY_THATI) || 50,
        NEERA: parseInt(process.env.INVENTORY_NEERA) || 50
      },
      AUTH: {
        OWNER_USERNAME: process.env.OWNER_USERNAME || "owner",
        OWNER_PASSWORD: process.env.OWNER_PASSWORD || "toddy123"
      },
      EXTERNAL_APIS: {
        NOMINATIM_URL: process.env.NOMINATIM_API_URL || "https://nominatim.openstreetmap.org",
        LEAFLET_CSS: process.env.LEAFLET_CDN_CSS || "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
        LEAFLET_JS: process.env.LEAFLET_CDN_JS || "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
        OPENSTREETMAP_TILES: process.env.OPENSTREETMAP_TILES || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      }
    };
  }

  // Get Firebase configuration
  getFirebaseConfig() {
    return {
      apiKey: this.config.FIREBASE.API_KEY,
      authDomain: this.config.FIREBASE.AUTH_DOMAIN,
      projectId: this.config.FIREBASE.PROJECT_ID,
      storageBucket: this.config.FIREBASE.STORAGE_BUCKET,
      messagingSenderId: this.config.FIREBASE.MESSAGING_SENDER_ID,
      appId: this.config.FIREBASE.APP_ID
    };
  }

  // Get business configuration
  getBusinessConfig() {
    return {
      PAYMENT: {
        UPI_ID: this.config.BUSINESS.UPI_ID,
        MERCHANT_NAME: this.config.BUSINESS.MERCHANT_NAME
      },
      SHOP: {
        LATITUDE: this.config.BUSINESS.SHOP_LATITUDE,
        LONGITUDE: this.config.BUSINESS.SHOP_LONGITUDE,
        ADDRESS: this.config.BUSINESS.SHOP_ADDRESS,
        PHONE: this.config.BUSINESS.SHOP_PHONE
      },
      PRICES: {
        eetha: this.config.PRICES.EETHA,
        thati: this.config.PRICES.THATI,
        neera: this.config.PRICES.NEERA
      },
      INVENTORY: {
        eetha: this.config.INVENTORY.EETHA,
        thati: this.config.INVENTORY.THATI,
        neera: this.config.INVENTORY.NEERA
      }
    };
  }

  // Get authentication configuration
  getAuthConfig() {
    return {
      username: this.config.AUTH.OWNER_USERNAME,
      password: this.config.AUTH.OWNER_PASSWORD
    };
  }

  // Get external API URLs
  getExternalAPIs() {
    return this.config.EXTERNAL_APIS;
  }

  // Get Firebase CDN URLs
  getFirebaseCDNUrls() {
    const version = this.config.FIREBASE.CDN_VERSION;
    return {
      app: `https://www.gstatic.com/firebasejs/${version}/firebase-app.js`,
      firestore: `https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`
    };
  }
}

// Create global config instance
const configLoader = new ConfigLoader();

// Export for use in other files
window.CONFIG = configLoader.getBusinessConfig();
window.FIREBASE_CONFIG = configLoader.getFirebaseConfig();
window.AUTH_CONFIG = configLoader.getAuthConfig();
window.EXTERNAL_APIS = configLoader.getExternalAPIs();
window.FIREBASE_CDN = configLoader.getFirebaseCDNUrls();

// Legacy support
window.getConfig = () => configLoader.getBusinessConfig();