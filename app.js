require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());

// Configuration
const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 3000;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// In-memory database
const users = [];
let products = [
    { id: 1, name: "Laptop", category: "Electronics", price: 999.99, inStock: true },
    { id: 2, name: "T-Shirt", category: "Apparel", price: 19.99, inStock: true },
    { id: 3, name: "Coffee Mug", category: "Home", price: 9.99, inStock: false }
];

// Helper function to check for duplicates (case-insensitive)
function isDuplicate(array, field, value) {
    return array.some(item => String(item[field]).toLowerCase() === String(value).toLowerCase());
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please include a valid JWT token in the Authorization header'
        });
    }
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                error: 'Invalid token',
                message: 'The provided token is invalid or expired'
            });
        }
        req.user = user;
        next();
    });
}

// Public Auth Routes
app.post('/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        // Check for duplicate username (case-insensitive)
        if (isDuplicate(users, 'username', username)) {
            return res.status(409).json({ 
                error: 'Duplicate username',
                message: 'Username already exists (case-insensitive check)'
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length + 1,
            username,
            password: hashedPassword
        };
        
        users.push(newUser);
        
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                username: newUser.username
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { username: user.username, id: user.id },
            SECRET_KEY,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        res.json({ 
            token,
            expiresIn: JWT_EXPIRES_IN,
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected Product Routes
app.get('/products', authenticateToken, (req, res) => {
    const { category } = req.query;
    
    if (category) {
        const filteredProducts = products.filter(p => 
            p.category.toLowerCase() === category.toLowerCase()
        );
        return res.json(filteredProducts);
    }
    
    res.json(products);
});

app.get('/products/:id', authenticateToken, (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

app.post('/products', authenticateToken, (req, res) => {
    const { id, name, category, price, inStock } = req.body;
    
    // Validate required fields
    if (!id || !name || !category || price === undefined || inStock === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check for duplicate product ID
    if (products.some(p => p.id === id)) {
        return res.status(409).json({ 
            error: 'Duplicate product ID',
            message: 'Product with this ID already exists'
        });
    }
    
    // Check for duplicate product name (case-insensitive)
    if (isDuplicate(products, 'name', name)) {
        return res.status(409).json({ 
            error: 'Duplicate product name',
            message: 'Product with this name already exists (case-insensitive check)'
        });
    }
    
    // Check for existing category (optional business logic)
    const categoryExists = products.some(p => 
        p.category.toLowerCase() === category.toLowerCase()
    );
    
    if (!categoryExists) {
        console.log(`New category detected: ${category}`);
    }
    
    const newProduct = { id, name, category, price, inStock };
    products.push(newProduct);
    
    res.status(201).json({
        message: 'Product created successfully',
        product: newProduct
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`JWT expiration set to: ${JWT_EXPIRES_IN}`);
});