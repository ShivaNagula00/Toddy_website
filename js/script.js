// ===== CONFIGURATION =====
async function getPrices() {
    try {
        // Wait for Firebase to load
        let attempts = 0;
        while (!window.firestore && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.firestore) {
            const result = await window.firestore.getShopSettings();
            if (result.success && result.settings && result.settings.prices) {
                return result.settings.prices;
            }
        }
    } catch (error) {
        console.log('Using default prices - Firestore not available');
    }
    
    // Fallback to default prices
    const defaultPrices = {eetha: 60, thati: 75, neera: 90};
    return defaultPrices;
}

async function updatePrices(newPrices) {
    try {
        const result = await window.firestore.updateShopSettings({ prices: newPrices });
        if (result.success) {
            console.log('Prices updated in Firestore');
        }
    } catch (error) {
        console.error('Failed to update prices in Firestore:', error);
    }
}

let deliveryCharge = 0;

// ===== INVENTORY MANAGEMENT =====
async function getInventory() {
    try {
        // Wait for Firebase to load
        let attempts = 0;
        while (!window.firestore && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.firestore) {
            const result = await window.firestore.getShopSettings();
            if (result.success && result.settings && result.settings.inventory) {
                return result.settings.inventory;
            }
        }
    } catch (error) {
        console.log('Using default inventory - Firestore not available');
    }
    
    // Fallback to default inventory
    const defaultInventory = {eetha: 50, thati: 50, neera: 50};
    return defaultInventory;
}

async function updateInventory(type, quantity) {
    try {
        const inventory = await getInventory();
        inventory[type] = Math.max(0, inventory[type] - quantity);
        
        const result = await window.firestore.updateShopSettings({ inventory });
        if (result.success) {
            console.log('Inventory updated in Firestore');
        }
    } catch (error) {
        console.error('Failed to update inventory in Firestore:', error);
    }
}

async function checkAvailability(type, quantity) {
    try {
        const inventory = await getInventory();
        return inventory[type] >= quantity;
    } catch (error) {
        console.error('Error checking availability:', error);
        // Return true as fallback to allow order (will be validated again on server)
        return true;
    }
}

// ===== UPI PAYMENT CONFIGURATION =====
const UPI_ID = "6302564464@pthdfc"; // CHANGE TO YOUR ACTUAL UPI ID
const MERCHANT_NAME = "Nagula Shiva Sai"; // CHANGE TO YOUR SHOP NAME

// ===== FIXED SHOP LOCATION (ACCURATE COORDINATES FOR SANDRALAPALLY) =====
const shopLat = 18.64110; // Correct latitude for Sandralapally
const shopLng = 78.87335; // Correct longitude for Sandralapally
const shopAddress = "JVRF+996 Kallu manduva kodimial, Sandralapally X Rd, Sandralapally, Telangana 505501";
const shopGoogleMapsUrl = `https://www.google.com/maps?q=${shopLat},${shopLng}`;

// ===== GLOBAL VARIABLES =====
let map;
let marker;
let customerLat = null;
let customerLng = null;

// ===== LANGUAGE TOGGLE =====
function setLang(l) {
    document.querySelectorAll('[data-en]').forEach(e => 
        e.innerText = e.getAttribute('data-' + l)
    );
}

// ===== VALIDATION FUNCTIONS =====
function validateCustomerName() {
    const name = document.getElementById('customerName').value.trim();
    const error = document.getElementById('nameError');
    
    if (!name) {
        error.textContent = 'Name is required';
        return false;
    }
    if (name.length < 2) {
        error.textContent = 'Name must be at least 2 characters';
        return false;
    }
    error.textContent = '';
    return true;
}

function validateMobileNumber() {
    const mobile = document.getElementById('mobileNumber').value.trim();
    const error = document.getElementById('mobileError');
    
    if (!mobile) {
        error.textContent = 'Mobile number is required';
        return false;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
        error.textContent = 'Enter valid 10-digit mobile number';
        return false;
    }
    error.textContent = '';
    return true;
}

function validateLocation() {
    const error = document.getElementById('locationError');
    
    if (deliveryOption.value === 'delivery' && (!customerLat || !customerLng)) {
        error.textContent = 'Please select delivery location';
        return false;
    }
    error.textContent = '';
    return true;
}

// ===== DELIVERY TOGGLE =====
function toggleDelivery() {
    const deliverySection = document.getElementById('deliverySection');
    const isDelivery = deliveryOption.value === 'delivery';
    
    deliverySection.classList.toggle('hidden', !isDelivery);
    
    if (!isDelivery) {
        // Reset delivery charge for pickup
        deliveryCharge = 0;
        customerLat = null;
        customerLng = null;
        document.getElementById('address').value = '';
        document.getElementById('mapContainer').classList.add('hidden');
    }
    
    calculateTotal();
}

// ===== LOCATION ERROR HANDLING =====
function showLocationError(message) {
    const error = document.getElementById('locationError');
    if (error) {
        error.textContent = message;
    }
    console.error('Location Error:', message);
}

function resetLocationButton() {
    const btn = document.getElementById('useLocationBtn');
    if (btn) {
        btn.textContent = '📍 Use Current Location';
        btn.disabled = false;
    }
}

// ===== AUTOMATIC GPS LOCATION FETCHING =====
function getCurrentLocation() {
    const btn = document.getElementById('useLocationBtn');
    const addressField = document.getElementById('address');
    
    // Show loading state
    btn.textContent = 'Fetching your location...';
    btn.disabled = true;
    
    // Set temporary placeholder to prevent jumping
    if (!addressField.value.trim()) {
        addressField.placeholder = 'Getting your location...';
    }
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        showLocationError('Geolocation is not supported by this browser');
        resetLocationButton();
        return;
    }
    
    // Request user's current position
    navigator.geolocation.getCurrentPosition(
        // Success callback - GPS location found
        (position) => {
            customerLat = position.coords.latitude;
            customerLng = position.coords.longitude;
            
            console.log('GPS Location found:', customerLat, customerLng);
            
            // Convert coordinates to readable address
            reverseGeocode(customerLat, customerLng);
            
            // Show map with both shop and customer location
            document.getElementById('mapContainer').classList.remove('hidden');
            initMap();
            
            // Initialize Google Maps only if API is loaded
            if (typeof google !== 'undefined' && google.maps) {
                initGoogleMap();
            } else {
                console.log('Google Maps API not loaded - using Leaflet map only');
            }
            
            // Update button state
            btn.textContent = '✅ Location Found';
            btn.disabled = false;
            
            // Reset placeholder
            addressField.placeholder = 'Your address will appear here';
            
            // Calculate delivery charges automatically
            calculateDeliveryCharge();
        },
        // Error callback - GPS failed
        (error) => {
            console.error('Geolocation error:', error);
            
            let errorMessage;
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Please allow location access to use this feature';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    break;
                default:
                    errorMessage = 'An unknown error occurred while fetching location';
                    break;
            }
            
            showLocationError(errorMessage);
            resetLocationButton();
            
            // Reset placeholder
            addressField.placeholder = 'Type your full delivery address (area, landmark, city)';
        },
        // Options for high accuracy
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        }
    );
}

// ===== REVERSE GEOCODING - CONVERT COORDINATES TO ADDRESS =====
function reverseGeocode(lat, lng) {
    // Use Nominatim (OpenStreetMap's free reverse geocoding service)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                // Only update address if field is empty or contains coordinates
                const addressField = document.getElementById('address');
                const currentValue = addressField.value.trim();
                
                // Don't overwrite if user has manually entered an address
                if (!currentValue || currentValue.includes('Lat:') || currentValue.includes('Getting location')) {
                    addressField.value = data.display_name;
                    console.log('Address auto-filled:', data.display_name);
                } else {
                    console.log('Address not updated - user has custom address');
                }
            } else {
                // Only set coordinates if no address exists
                const addressField = document.getElementById('address');
                if (!addressField.value.trim()) {
                    addressField.value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
                }
            }
            
            // Update pay button state after address handling
            updatePayButtonState();
        })
        .catch(error => {
            console.error('Reverse geocoding error:', error);
            // Only fallback to coordinates if address field is empty
            const addressField = document.getElementById('address');
            if (!addressField.value.trim()) {
                addressField.value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            }
            updatePayButtonState();
        });
}

// ===== SEARCH ADDRESS AND SET LOCATION =====
function searchAddress() {
    const address = document.getElementById('address').value.trim();
    
    if (!address) {
        alert('Please enter your delivery address');
        return;
    }
    
    // Store the original address to prevent overwriting
    const originalAddress = address;
    
    // Use Nominatim to convert address to coordinates
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                customerLat = parseFloat(data[0].lat);
                customerLng = parseFloat(data[0].lon);
                
                // Keep the user's original address, don't overwrite with API response
                document.getElementById('address').value = originalAddress;
                
                // Show map
                document.getElementById('mapContainer').classList.remove('hidden');
                initMap();
                
                // Initialize Google Maps only if API is loaded
                if (typeof google !== 'undefined' && google.maps) {
                    initGoogleMap();
                } else {
                    console.log('Google Maps API not loaded - using Leaflet map only');
                }
                
                alert('Location found! You can drag the marker to adjust if needed.');
            } else {
                alert('Address not found. Please try a different address or be more specific.');
            }
        })
        .catch(error => {
            console.error('Geocoding error:', error);
            alert('Error finding address. Please try again.');
        });
}

// ===== GOOGLE MAPS INTEGRATION =====
let googleMap;
let googleMapMarker;

// Initialize Google Maps when API loads
function initGoogleMap() {
    if (!customerLat || !customerLng) return;
    
    const mapOptions = {
        zoom: 13,
        center: { lat: (shopLat + customerLat) / 2, lng: (shopLng + customerLng) / 2 },
        // Mobile-friendly options
        gestureHandling: 'cooperative',
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
    };
    
    googleMap = new google.maps.Map(document.getElementById('googleMap'), mapOptions);
    
    // Shop marker (red)
    new google.maps.Marker({
        position: { lat: shopLat, lng: shopLng },
        map: googleMap,
        title: 'Toddy Shop',
        icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });
    
    // Customer marker (blue, draggable)
    googleMapMarker = new google.maps.Marker({
        position: { lat: customerLat, lng: customerLng },
        map: googleMap,
        title: 'Your Location',
        draggable: true
    });
    
    // Update location when marker is dragged
    googleMapMarker.addListener('dragend', function() {
        const position = googleMapMarker.getPosition();
        customerLat = position.lat();
        customerLng = position.lng();
        reverseGeocode(customerLat, customerLng);
        calculateDeliveryCharge();
    });
    
    // Add click listener to open in Google Maps app on mobile
    googleMap.addListener('click', () => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            window.open(`https://www.google.com/maps/dir/${shopLat},${shopLng}/${customerLat},${customerLng}`, '_blank');
        }
    });
}

// Show fixed shop location on Google Maps
function showShopLocationMap() {
    const mapContainer = document.getElementById('shopMapContainer');
    if (!mapContainer) return;
    
    // Check if Google Maps is available
    if (typeof google !== 'undefined' && google.maps) {
        const shopMapOptions = {
            zoom: 15,
            center: { lat: shopLat, lng: shopLng },
            // Mobile-friendly options
            gestureHandling: 'cooperative',
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true
        };
        
        const shopMap = new google.maps.Map(document.getElementById('shopMap'), shopMapOptions);
        
        new google.maps.Marker({
            position: { lat: shopLat, lng: shopLng },
            map: shopMap,
            title: 'Toddy Shop - Pickup Location',
            icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
        
        // Add click listener for mobile devices
        shopMap.addListener('click', () => {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                window.open(`https://www.google.com/maps?q=${shopLat},${shopLng}`, '_blank');
            }
        });
    } else {
        // Fallback for when Google Maps is not available
        mapContainer.innerHTML = `
            <div style="background:#f8f9fa;padding:20px;border-radius:8px;text-align:center;border:1px solid #ddd">
                <h4 style="color:#28a745;margin-bottom:15px">📍 Shop Location</h4>
                <p style="margin-bottom:15px;color:#666">Map not available. Use the button below to open location.</p>
                <a href="https://www.google.com/maps?q=${shopLat},${shopLng}" 
                   target="_blank" 
                   style="background:#4285f4;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold">
                   🗺️ Open in Google Maps
                </a>
            </div>
        `;
    }
}

// ===== LEAFLET MAP INTEGRATION =====
function initMap() {
    if (!customerLat || !customerLng) return;
    
    // Clear existing map if it exists
    if (map) {
        map.remove();
    }
    
    // Create map centered between shop and customer location
    const centerLat = (shopLat + customerLat) / 2;
    const centerLng = (shopLng + customerLng) / 2;
    
    map = L.map('map').setView([centerLat, centerLng], 13);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add shop marker (red)
    const shopMarker = L.marker([shopLat, shopLng], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map).bindPopup('Toddy Shop').openPopup();
    
    // Add customer marker (blue, draggable for fine-tuning)
    marker = L.marker([customerLat, customerLng], {
        draggable: true,
        title: 'Your delivery location (drag to adjust if needed)'
    }).addTo(map).bindPopup('Your Location');
    
    // Update when marker is dragged (for fine-tuning)
    marker.on('dragend', function() {
        const position = marker.getLatLng();
        customerLat = position.lat;
        customerLng = position.lng;
        
        // Update address when manually adjusted
        reverseGeocode(customerLat, customerLng);
        calculateDeliveryCharge();
    });
    
    // Fit map to show both markers
    const group = new L.featureGroup([shopMarker, marker]);
    map.fitBounds(group.getBounds().pad(0.1));
}

// ===== ADDRESS GEOCODING (FREE USING NOMINATIM) =====
function updateAddressFromCoords(lat, lng) {
    // Use Nominatim (OpenStreetMap's free geocoding service)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                document.getElementById('address').value = data.display_name;
            } else {
                document.getElementById('address').value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            }
        })
        .catch(error => {
            console.error('Geocoding error:', error);
            document.getElementById('address').value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        });
}

// ===== ACCURATE DISTANCE CALCULATION USING HAVERSINE FORMULA =====
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
}

// ===== ACCURATE DELIVERY CHARGE CALCULATION =====
function calculateDeliveryCharge() {
    if (deliveryOption.value !== 'delivery' || !customerLat || !customerLng) {
        deliveryCharge = 0;
        document.getElementById('distanceInfo').textContent = '';
        document.getElementById('deliveryChargeInfo').textContent = '';
        calculateTotal();
        return;
    }
    
    // Calculate accurate distance using fixed shop coordinates
    const distance = calculateDistance(shopLat, shopLng, customerLat, customerLng);
    
    // Delivery charge: ₹30 for first 3km, ₹10 per additional km
    if (distance <= 3) {
        deliveryCharge = 30;
    } else {
        const extraKm = Math.ceil(distance - 3);
        deliveryCharge = 30 + (extraKm * 10);
    }
    
    // Update UI with accurate distance and charge
    document.getElementById('distanceInfo').textContent = 
        `Distance: ${distance.toFixed(1)} km from shop`;
    document.getElementById('deliveryChargeInfo').textContent = 
        `Delivery Charge: ₹${deliveryCharge}`;
    
    calculateTotal();
    
    console.log(`Accurate Distance: ${distance.toFixed(1)}km, Delivery: ₹${deliveryCharge}`);
}

// ===== INVENTORY DISPLAY AND VALIDATION =====
async function updateAvailabilityAndCalculate() {
    const type = toddyType.value;
    const inventory = await getInventory();
    const prices = await getPrices();
    const available = inventory[type];
    const currentPrice = prices[type];
    
    document.getElementById('availabilityInfo').textContent = `Available: ${available}L`;
    document.getElementById('priceInfo').textContent = `Price: ₹${currentPrice}/L`;
    
    // Update max attribute for quantity input
    const litresInput = document.getElementById('litres');
    litresInput.max = available;
    
    // Validate current quantity
    await validateQuantityAndCalculate();
}

async function validateQuantityAndCalculate() {
    const type = toddyType.value;
    const quantity = parseInt(document.getElementById('litres').value);
    const inventory = await getInventory();
    const available = inventory[type];
    const errorDiv = document.getElementById('quantityError');
    
    if (quantity > available) {
        errorDiv.textContent = `Only ${available}L available for ${type.toUpperCase()}`;
        document.getElementById('priceDetails').innerText = 'Total: ₹0';
        document.getElementById('paymentTotal').innerText = 'Total: ₹0';
        updatePayButtonState();
        return false;
    } else {
        errorDiv.textContent = '';
        await calculateTotal();
        return true;
    }
}

// ===== PRICE CALCULATION =====
async function calculateTotal() {
    const type = toddyType.value;
    const litres = +document.getElementById('litres').value;
    const prices = await getPrices(); // Get current prices from Firestore
    
    if (litres < 2) {
        document.getElementById('priceDetails').innerText = 'Total: ₹0';
        document.getElementById('paymentTotal').innerText = 'Total: ₹0';
        return;
    }
    
    let total = prices[type] * litres;
    
    // Add delivery charge only for delivery option
    if (deliveryOption.value === 'delivery') {
        total += deliveryCharge;
    }
    
    document.getElementById('priceDetails').innerText = `Total: ₹${total}`;
    document.getElementById('paymentTotal').innerText = `Total: ₹${total}`;
    
    // Update pay button state
    updatePayButtonState();
}

// ===== UPDATE PAY BUTTON STATE =====
function updatePayButtonState() {
    const payBtn = document.getElementById('payBtn');
    const isNameValid = document.getElementById('customerName').value.trim().length >= 2;
    const isMobileValid = /^[6-9]\d{9}$/.test(document.getElementById('mobileNumber').value.trim());
    const isDeliveryValid = deliveryOption.value === 'pickup' || 
                           (deliveryOption.value === 'delivery' && document.getElementById('address').value.trim());
    
    const isFormValid = isNameValid && isMobileValid && isDeliveryValid;
    
    payBtn.disabled = !isFormValid;
    payBtn.style.opacity = isFormValid ? '1' : '0.5';
    payBtn.style.cursor = isFormValid ? 'pointer' : 'not-allowed';
}

// ===== UPI COPY FUNCTIONALITY =====
function copyUPI() {
    const upi = document.getElementById("upiId").innerText;
    const copyBtn = document.getElementById("copyBtn");
    
    navigator.clipboard.writeText(upi).then(() => {
        copyBtn.innerHTML = "✓";
        copyBtn.style.background = "#28a745";
        setTimeout(() => {
            copyBtn.innerHTML = "📋";
            copyBtn.style.background = "#28a745";
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = upi;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copyBtn.innerHTML = "✓";
        copyBtn.style.background = "#28a745";
        setTimeout(() => {
            copyBtn.innerHTML = "📋";
            copyBtn.style.background = "#28a745";
        }, 2000);
    });
}

// ===== iOS UPI APP HANDLER =====
function tryIOSUpiApps(upiUrls, index) {
    if (index >= upiUrls.length) {
        // If all UPI apps fail, show manual payment option
        alert('No UPI apps found. Please use the "Copy UPI ID" option above to pay manually.');
        return;
    }
    
    const currentUrl = upiUrls[index];
    
    // Create a temporary iframe to test if the app can handle the URL
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = currentUrl;
    document.body.appendChild(iframe);
    
    // Set a timeout to try the next app if current one doesn't respond
    setTimeout(() => {
        document.body.removeChild(iframe);
        
        // Check if we're still on the same page (app didn't open)
        if (document.hasFocus()) {
            tryIOSUpiApps(upiUrls, index + 1);
        }
    }, 1000);
    
    // Also try direct window.location as fallback
    setTimeout(() => {
        if (document.hasFocus()) {
            window.location.href = currentUrl;
        }
    }, 500);
}

// ===== GENERATE UPI PAYMENT URL =====
function generateUpiUrl(amount, customerName) {
    const transactionNote = `Toddy Order - ${customerName}`;
    
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
        // For iOS, try multiple UPI schemes
        const upiSchemes = [
            `gpay://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
            `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
            `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
            `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
        ];
        return upiSchemes;
    } else {
        // For Android, use standard UPI intent
        const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
        return upiUrl;
    }
}

// ===== UPI PAYMENT PROCESSING =====
async function payNow() {
    // Validate all fields
    const isNameValid = validateCustomerName();
    const isMobileValid = validateMobileNumber();
    
    if (!isNameValid || !isMobileValid) {
        alert('Please fill all required fields correctly');
        return;
    }
    
    // For delivery, check if location is set
    if (deliveryOption.value === 'delivery') {
        const address = document.getElementById('address').value.trim();
        if (!address) {
            alert('Please enter your delivery address');
            return;
        }
    }
    
    // Get order details
    const customerName = document.getElementById('customerName').value.trim();
    const totalAmountText = document.getElementById('paymentTotal').innerText;
    const totalAmount = totalAmountText.replace(/\D/g, '');
    const selectedType = toddyType.value;
    const selectedQuantity = parseInt(document.getElementById('litres').value);
    
    if (!totalAmount || totalAmount === '0') {
        alert('Please select quantity (minimum 2 litres)');
        return;
    }
    
    // Check inventory availability before payment
    const isAvailable = await checkAvailability(selectedType, selectedQuantity);
    if (!isAvailable) {
        const inventory = await getInventory();
        alert(`Sorry, only ${inventory[selectedType]}L of ${selectedType.toUpperCase()} is available`);
        return;
    }
    
    // Create PENDING order
    const pendingOrderId = await createPendingOrder();
    
    if (!pendingOrderId) {
        return; // Error already shown in createPendingOrder
    }
    
    // Generate UPI payment URL
    const upiUrls = generateUpiUrl(totalAmount, customerName);
    
    // Show payment confirmation
    const confirmMsg = `You will be redirected to pay ₹${totalAmount} via UPI.\n\nClick OK to proceed with payment.`;
    
    if (confirm(confirmMsg)) {
        // Handle iOS vs Android differently
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        if (isIOS && Array.isArray(upiUrls)) {
            // For iOS, try multiple UPI apps
            tryIOSUpiApps(upiUrls, 0);
        } else {
            // For Android, use standard UPI intent
            window.location.href = upiUrls;
        }
        
        // Set up payment monitoring
        monitorPaymentStatus(pendingOrderId);
    }
}

// ===== CREATE PENDING ORDER =====
async function createPendingOrder() {
    try {
        // Wait for Firebase to load with timeout
        let attempts = 0;
        while (!window.firestore && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.firestore) {
            console.error('Firebase failed to load after 5 seconds');
            alert('System is loading. Please wait a moment and try again.');
            return null;
        }
        
        const customerName = document.getElementById('customerName').value;
        const mobile = document.getElementById('mobileNumber').value;
        const toddyType = document.getElementById('toddyType').value;
        const litres = document.getElementById('litres').value;
        const deliveryType = deliveryOption.value;
        const address = document.getElementById('address').value;
        const total = document.getElementById('priceDetails').innerText;
        
        const orderId = Date.now().toString();
        
        // Get current prices from Firebase
        const currentPrices = await getPrices();
        
        // Create order data with accurate location info
        const orderData = {
            orderId: orderId,
            customer: customerName,
            mobile: mobile,
            items: [{
                type: toddyType,
                quantity: parseInt(litres),
                price: currentPrices[toddyType]
            }],
            totalAmount: parseInt(total.replace(/\D/g, '')),
            paymentStatus: 'PENDING',
            orderStatus: 'INITIATED',
            deliveryType: deliveryType,
            address: deliveryType === 'delivery' ? address : 'Self Pickup',
            coordinates: (deliveryType === 'delivery' && customerLat && customerLng) ? `${customerLat},${customerLng}` : null,
            mapsLink: (deliveryType === 'delivery' && customerLat && customerLng) ? `https://www.google.com/maps/dir/${shopLat},${shopLng}/${customerLat},${customerLng}` : null,
            deliveryCharge: deliveryCharge,
            distance: (deliveryType === 'delivery' && customerLat && customerLng) ? calculateDistance(shopLat, shopLng, customerLat, customerLng).toFixed(1) : null,
            shopLocation: {
                lat: shopLat,
                lng: shopLng,
                address: shopAddress,
                googleMapsUrl: shopGoogleMapsUrl
            }
        };
        
        console.log('Creating order with data:', orderData);
        
        // Save to Firestore
        const result = await window.firestore.createOrder(orderData);
        
        if (result.success) {
            console.log('PENDING order created in Firestore:', result.orderId);
            return result.orderId;
        } else {
            console.error('Failed to create order:', result.error);
            alert('Failed to create order: ' + result.error);
            return null;
        }
    } catch (error) {
        console.error('Error in createPendingOrder:', error);
        alert('Failed to create order. Please check your connection and try again.');
        return null;
    }
}

// ===== MONITOR PAYMENT STATUS =====
function monitorPaymentStatus(orderId) {
    let paymentCompleted = false;
    
    const handleVisibilityChange = () => {
        if (!document.hidden && !paymentCompleted) {
            setTimeout(() => {
                if (!paymentCompleted) {
                    handlePaymentReturn(orderId);
                }
            }, 1000);
        }
    };
    
    const handleFocus = () => {
        if (!paymentCompleted) {
            setTimeout(() => {
                if (!paymentCompleted) {
                    handlePaymentReturn(orderId);
                }
            }, 1000);
        }
    };
    
    // Auto-fail after 5 minutes of inactivity
    const autoFailTimer = setTimeout(() => {
        if (!paymentCompleted) {
            console.log('Auto-failing payment due to timeout');
            handlePaymentFailure(orderId);
        }
    }, 5 * 60 * 1000); // 5 minutes
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Cleanup function
    window.paymentCompleted = () => {
        paymentCompleted = true;
        clearTimeout(autoFailTimer);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
    };
}

// ===== HANDLE PAYMENT RETURN =====
function handlePaymentReturn(orderId) {
    // Since we can't get actual payment status from UPI in frontend-only,
    // we need to ask user about payment status
    const paymentStatus = confirm(
        'Did you complete the payment successfully?\n\n' +
        '• Click OK if payment was SUCCESSFUL\n' +
        '• Click Cancel if payment FAILED or was CANCELLED'
    );
    
    if (paymentStatus) {
        // Payment SUCCESS
        handlePaymentSuccess(orderId);
    } else {
        // Payment FAILED or CANCELLED
        handlePaymentFailure(orderId);
    }
    
    // Mark payment as completed to stop monitoring
    if (window.paymentCompleted) {
        window.paymentCompleted();
    }
}

// ===== HANDLE PAYMENT SUCCESS =====
async function handlePaymentSuccess(orderId) {
    // Update order status to SUCCESS in Firestore
    const updateData = {
        paymentStatus: 'SUCCESS',
        orderStatus: 'CONFIRMED',
        paymentCompletedAt: new Date().toISOString(),
        status: 'new' // For owner dashboard compatibility
    };
    
    const result = await window.firestore.updateOrder(orderId, updateData);
    
    if (result.success) {
        // Update inventory ONLY on successful payment
        const selectedType = toddyType.value;
        const selectedQuantity = parseInt(document.getElementById('litres').value);
        updateInventory(selectedType, selectedQuantity);
        
        // Show success message
        alert('Order Successful! We will get back to you shortly.');
        
        // Redirect to success page
        window.location.href = 'order-success.html';
        
        console.log('Payment SUCCESS - Order confirmed in Firestore:', orderId);
    } else {
        console.error('Failed to update order status:', result.error);
        alert('Payment successful but failed to update order. Please contact support.');
    }
}

// ===== HANDLE PAYMENT FAILURE =====
async function handlePaymentFailure(orderId) {
    // Update order status to FAILED in Firestore
    const updateData = {
        paymentStatus: 'FAILED',
        orderStatus: 'CANCELLED',
        paymentFailedAt: new Date().toISOString()
    };
    
    const result = await window.firestore.updateOrder(orderId, updateData);
    
    if (result.success) {
        console.log('Payment FAILED - Order cancelled in Firestore:', orderId);
    } else {
        console.error('Failed to update order status:', result.error);
    }
    
    // Show error message
    alert('Payment failed or cancelled. Please try again.');
    
    // DO NOT redirect to success page
    // DO NOT update inventory
    // Keep user on current page to retry
}



// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    // Show iOS note if on iPhone/iPad
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
        document.getElementById('iosNote').style.display = 'block';
    }
    
    // Add real-time validation
    document.getElementById('customerName').addEventListener('blur', validateCustomerName);
    document.getElementById('customerName').addEventListener('input', updatePayButtonState);
    
    document.getElementById('mobileNumber').addEventListener('blur', validateMobileNumber);
    document.getElementById('mobileNumber').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
        updatePayButtonState();
    });
    
    // Update pay button when delivery option changes
    deliveryOption.addEventListener('change', updatePayButtonState);
    
    // Update pay button when address changes
    document.getElementById('address').addEventListener('input', updatePayButtonState);
    
    // Initial calculation and button state
    updateAvailabilityAndCalculate();
    updatePayButtonState();
});

// ===== LEGACY FUNCTION (for backward compatibility) =====
function calculateDelivery() {
    // This function is kept for backward compatibility
    // The new system automatically calculates delivery when location is set
    calculateDeliveryCharge();
}