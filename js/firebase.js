// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyACtkNvY3wfOmBp34Ddj8MDecw0rXSWLUc",
  authDomain: "toddy-orders.firebaseapp.com",
  projectId: "toddy-orders",
  storageBucket: "toddy-orders.firebasestorage.app",
  messagingSenderId: "199463515144",
  appId: "1:199463515144:web:4211e7276ac01a61288dbd"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  setDoc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export firestore instance for use in other files
window.db = db;

// Firestore Helper Functions
const firestore = {
  // Create Order
  async createOrder(orderData) {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, orderId: docRef.id };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  },

  // Update Order Status
  async updateOrder(orderId, updateData) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating order:', error);
      return { success: false, error: error.message };
    }
  },

  // Get All Orders (for Owner Dashboard)
  async getAllOrders() {
    try {
      const q = query(
        collection(db, 'orders'), 
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, orders };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.message, orders: [] };
    }
  },

  // Real-time Orders Listener (for Owner Dashboard)
  onOrdersChange(callback) {
    const q = query(
      collection(db, 'orders'), 
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      callback(orders);
    });
  },

  // Update Shop Settings (Prices & Inventory)
  async updateShopSettings(settingsData) {
    try {
      const settingsRef = doc(db, 'settings', 'shop');
      await setDoc(settingsRef, {
        ...settingsData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }
  },

  // Get Shop Settings (Prices & Inventory)
  async getShopSettings() {
    try {
      const settingsRef = doc(db, 'settings', 'shop');
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        return { success: true, settings: docSnap.data() };
      } else {
        return { success: true, settings: null };
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { success: false, error: error.message, settings: null };
    }
  },

  // Store Owner Authentication
  async setOwnerAuth(authData) {
    try {
      const authRef = doc(db, 'settings', 'auth');
      await setDoc(authRef, {
        ...authData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error storing auth:', error);
      return { success: false, error: error.message };
    }
  },

  // Get Owner Authentication
  async getOwnerAuth() {
    try {
      const authRef = doc(db, 'settings', 'auth');
      const docSnap = await getDoc(authRef);
      
      if (docSnap.exists()) {
        return { success: true, auth: docSnap.data() };
      } else {
        return { success: true, auth: null };
      }
    } catch (error) {
      console.error('Error fetching auth:', error);
      return { success: false, error: error.message, auth: null };
    }
  }
};

// Export firestore helpers globally
window.firestore = firestore;