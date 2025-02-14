require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/shopcart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    image: String,
    description: String
});

// Order Schema
const orderSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    price: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    location: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// Product Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Order Routes
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = {
            itemName: req.body.itemName,
            price: req.body.price,
            customerName: req.body.customerName,
            customerEmail: req.body.customerEmail,
            phoneNumber: req.body.phoneNumber,
            location: req.body.location,
            status: req.body.status || 'pending'
        };

        // Validate required fields
        const requiredFields = ['itemName', 'price', 'customerName', 'customerEmail', 'phoneNumber', 'location'];
        const missingFields = requiredFields.filter(field => !orderData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const order = new Order(orderData);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        console.log('Fetching orders...'); // Debug log
        const orders = await Order.find().sort({ orderDate: -1 });
        console.log('Orders found:', orders.length); // Debug log
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
            message: 'Error fetching orders',
            error: error.message 
        });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
});

// Add sample products
async function addSampleProducts() {
    try {
        await Product.deleteMany({}); // Clear existing products
        
        const products = [
            {
                name: 'iPhone 13 Pro',
                category: 'Smartphones',
                price: 999.99,
                image: 'https://example.com/iphone13.jpg',
                description: 'Latest Apple iPhone with pro camera system'
            },
            // Add more products for each category
        ];

        await Product.insertMany(products);
        console.log('Sample products added');
    } catch (error) {
        console.error('Error adding sample products:', error);
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    addSampleProducts();
});