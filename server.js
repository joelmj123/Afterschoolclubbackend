// Import dependencies
const express = require('express');
const { MongoClient,ObjectId } = require('mongodb');

// Initialize the Express application
const app = express();

// Middleware configuration
app.use(express.json());
app.set('port', 3000);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next();
});

// Root endpoint
app.get('/api', (req, res) => {
    res.send('Welcome to the Webstore API! Use endpoints like /products');
});

let db;

// MongoDB connection
const uri = 'mongodb+srv://mathj7671:joelmj123@cluster0.ac4qs.mongodb.net/'; // Local MongoDB Compass connection string

MongoClient.connect(uri, (err, client) => {
    if (err) {
        console.error('MongoDB connection error:', err.message);
        console.error('Full Error:', err);
        process.exit(1); // Exit if connection fails
    } else {
        console.log('Connected to MongoDB successfully');
        db = client.db('webstore'); // Use the 'webstore' database

        app.listen(app.get('port'), () => {
            console.log(`Server is running on http://localhost:${app.get('port')}`);
        });
    }
});

// Example endpoint to fetch all documents from the products collection
// Endpoint to fetch all products
// Example endpoint to fetch all products
app.get('/products', async (req, res) => {
    try {
        const collection = db.collection('products'); // Access the 'products' collection
        const documents = await collection.find({}).toArray(); // Fetch all products

        // Log the retrieved products (for debugging)
        console.log('Retrieved products:', documents); // Change from products to documents

        // Return products as JSON
        res.status(200).json(documents); // Change from products to documents
    } catch (error) {
        // Log error message
        console.error('Error fetching products:', error.message);
        
        // Send error response with status and message
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to place an order
app.post('/orders', async (req, res) => {
    const orderData = req.body;  // Retrieve the order data from the request body

    console.log('Received order data:', orderData); // Log the received data for debugging

    try {
        const collection = db.collection('orders'); // Access the 'orders' collection

        // Insert the order into the 'orders' collection
        const result = await collection.insertOne(orderData);

        // Send a success response with the inserted order ID
        res.status(200).json({
            message: 'Order placed successfully',
            orderId: result.insertedId,
        });
    } catch (error) {
        console.error('Error inserting order:', error);
        res.status(500).json({ message: 'Error placing order' });
    }
});

// Endpoint to update product availability
app.put('/products/:id/availability', async (req, res) => {
    const productId = req.params.id; // Retrieve the product ID from the URL
    const { availableInventory } = req.body; // Extract the new availability value from the request body

    if (availableInventory === undefined || typeof availableInventory !== 'number') {
        return res.status(400).json({ message: 'Invalid or missing availableInventory value' });
    }

    try {
        const collection = db.collection('products'); // Access the 'products' collection

        // Update the availability of the product
        const result = await collection.updateOne(
            { _id: new ObjectId(productId) }, // Match the product by its ID
            { $set: { availableInventory } }  // Update the availableInventory field
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Send a success response
        res.status(200).json({ message: 'Product availability updated successfully' });
    } catch (error) {
        console.error('Error updating availability:', error.message);
        res.status(500).json({ message: 'Error updating availability' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.message);
    res.status(500).json({ message: 'Something went wrong!' });
});
