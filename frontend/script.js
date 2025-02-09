// Menu items data
const menuItems = {
    appetizers: [
        { name: 'Bruschetta', price: 8.99, description: 'Toasted bread with tomatoes and herbs' },
        { name: 'Calamari', price: 12.99, description: 'Crispy fried squid rings' },
        { name: 'Spring Rolls', price: 7.99, description: 'Vegetable filled crispy rolls' }
    ],
    mainCourse: [
        { name: 'Grilled Salmon', price: 24.99, description: 'Fresh salmon with seasonal vegetables' },
        { name: 'Beef Tenderloin', price: 29.99, description: 'Premium cut with red wine sauce' },
        { name: 'Pasta Primavera', price: 18.99, description: 'Fresh pasta with garden vegetables' }
    ],
    desserts: [
        { name: 'Tiramisu', price: 8.99, description: 'Classic Italian coffee dessert' },
        { name: 'Chocolate Lava Cake', price: 9.99, description: 'Warm chocolate cake with ice cream' },
        { name: 'Cheesecake', price: 7.99, description: 'New York style cheesecake' }
    ]
};

// Handle reservation form submission
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.querySelector('input[type="text"]').value,
        email: document.querySelector('input[type="email"]').value,
        phone: document.querySelector('input[type="tel"]').value,
        date: document.querySelector('input[type="date"]').value,
        time: document.querySelector('select').value
    };

    // Validate form data
    if (!formData.name || !formData.email || !formData.phone || !formData.date || formData.time === 'Select Time') {
        alert('Please fill in all fields');
        return;
    }

    // Send reservation data to server (mock function)
    saveReservation(formData);
});

// Mock function to save reservation
function saveReservation(data) {
    console.log('Reservation saved:', data);
    alert('Thank you for your reservation! We will contact you shortly.');
    document.querySelector('form').reset();
}

// Dynamic menu rendering
function renderMenu() {
    const menuSection = document.querySelector('#menu .row');
    
    Object.entries(menuItems).forEach(([category, items]) => {
        items.forEach(item => {
            const menuCard = document.createElement('div');
            menuCard.className = 'col-md-4 mb-4';
            menuCard.innerHTML = `
                <div class="card menu-item">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">${item.description}</p>
                        <p class="price">$${item.price}</p>
                        <button class="btn btn-primary order-btn">Order Now</button>
                    </div>
                </div>
            `;
            menuSection.appendChild(menuCard);
        });
    });
}

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    renderMenu();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Handle order buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('order-btn')) {
        const itemName = e.target.parentElement.querySelector('.card-title').textContent;
        alert(`Thank you for ordering ${itemName}! Your order has been placed.`);
    }
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flipkart_clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Order Schema
const orderSchema = new mongoose.Schema({
    itemName: String,
    price: Number,
    customerName: String,
    customerEmail: String,
    orderDate: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' }
});

const Order = mongoose.model('Order', orderSchema);

// Routes
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        res.status(400).json({ message: 'Error placing order', error: error.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching orders', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// ... existing code ...

// Update the order button handler
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('order-btn')) {
        const card = e.target.closest('.card');
        const itemName = card.querySelector('.card-title').textContent;
        const price = parseFloat(card.querySelector('.price').textContent.replace('$', ''));
        
        // Show order form modal
        showOrderModal(itemName, price);
    }
});

// Add these new functions
function showOrderModal(itemName, price) {
    const modalHTML = `
        <div class="modal fade" id="orderModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Complete Your Order</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="orderForm">
                            <div class="mb-3">
                                <label class="form-label">Item: ${itemName}</label>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Price: $${price}</label>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Your Name</label>
                                <input type="text" class="form-control" name="customerName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Your Email</label>
                                <input type="email" class="form-control" name="customerEmail" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="submitOrder('${itemName}', ${price})">Place Order</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();

    // Remove modal from DOM after it's hidden
    document.getElementById('orderModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

async function submitOrder(itemName, price) {
    const form = document.getElementById('orderForm');
    const customerName = form.querySelector('[name="customerName"]').value;
    const customerEmail = form.querySelector('[name="customerEmail"]').value;

    if (!customerName || !customerEmail) {
        alert('Please fill in all fields');
        return;
    }

    const orderData = {
        itemName,
        price,
        customerName,
        customerEmail
    };

    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Order placed successfully!');
            bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        alert('Error placing order: ' + error.message);
    }
}

// ... existing code ...

// Add this new route for updating order status
app.put('/api/orders/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: 'Error updating order status', error: error.message });
    }
});

const order = new mongoose.Schema({
    itemName: String,
    price: Number,
    customerName: String,
    customerEmail: String,
    orderDate: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    }
});
