const express = require('express');
const app = express();
const { check, validationResult } = require('express-validator');
const db = require('./db');
const port = 3000;

app.use(express.json());
app.use(logger);
app.use(apiAuth);

// Keep your existing validation middleware
const validateUser = [
    check('name').notEmpty().withMessage('Name is required').escape(),
    check('email').isEmail().withMessage('Invalid email format')
        .notEmpty().withMessage('Email is required').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validatePost = [
    check('title').notEmpty().withMessage("Enter a title!").escape(),
    check('content').notEmpty().withMessage("The post has no content!").escape(),
    check('userId').isInt().withMessage("User ID must be an integer"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Updated routes with database operations
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Get users (you already have this one)
app.get('/users', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        let query = 'SELECT * FROM users';
        if (!isNaN(limit) && limit > 0) {
            query += ' LIMIT ?';
            const [users] = await db.execute(query, [limit]);
            res.send(users);
        } else {
            const [users] = await db.query(query);
            res.send(users);
        }
    } catch (error) {
        res.status(500).send('Database error: ' + error.message);
    }
});

// Create new user
app.post('/users', validateUser, async (req, res) => {
    try {
        const { name, email } = req.body;
        const [result] = await db.execute(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            [name, email]
        );
        
        const [newUser] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).send(newUser[0]);
    } catch (error) {
        res.status(500).send('Database error: ' + error.message);
    }
});

// Get user by ID with their posts
app.get('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const [users] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).send('User not found');
        }

        const [posts] = await db.execute(
            'SELECT * FROM posts WHERE userId = ?',
            [userId]
        );

        const user = users[0];
        user.posts = posts;
        res.send(user);
    } catch (error) {
        res.status(500).send('Database error: ' + error.message);
    }
});

// Get user by name
app.get('/users/name/:name', async (req, res) => {
    try {
        const userName = req.params.name.toLowerCase();
        const [users] = await db.execute(
            'SELECT * FROM users WHERE LOWER(name) = ?',
            [userName]
        );

        if (users.length === 0) {
            return res.status(404).send('User not found');
        }

        const [posts] = await db.execute(
            'SELECT * FROM posts WHERE userId = ?',
            [users[0].id]
        );

        const user = users[0];
        user.posts = posts;
        res.send(user);
    } catch (error) {
        res.status(500).send('Database error: ' + error.message);
    }
});

// Update user
app.put('/users/:id', validateUser, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { name, email } = req.body;
        
        const [result] = await db.execute(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }
        
        const [updatedUser] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        
        res.send(updatedUser[0]);
    } catch (error) {
        res.status(500).send('Database error: ' + error.message);
    }
});

// Delete user
app.delete('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const [result] = await db.execute(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).send('User not found');
        }
        
        res.status(204).send();
    } catch (error) {
        res.status(500).send('Database error: ' + error.message);
    }
});

// Get posts
app.get('/posts', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        let query = 'SELECT * FROM posts';
        if (!isNaN(limit) && limit > 0) {
            query += ' LIMIT ?';
            const [posts] = await db.execute(query, [limit]);
            res.send(posts);
        } else {
            const [posts] = await db.query(query);
            res.send(posts);
        }
    } catch (error) {
        res.status(500).send('Database error: ' + error.message);
    }
});

// Create post
app.post('/posts', validatePost, async (req, res) => {
    try {
        const { userId, title, content } = req.body;
        
        // Check if user exists
        const [users] = await db.execute(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).send('User not found');
        }
        
        const [result] = await db.execute(
            'INSERT INTO posts (userId, title, content) VALUES (?, ?, ?)',
            [userId, title, content]
        );
        
        const [newPost] = await db.execute(
            'SELECT * FROM posts WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).send(newPost[0]);
    } catch (error) {
        res.status(500).send('Database error: ' + error.message);
    }
});

// Get post by ID
app.get('/posts/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const [posts] = await db.execute(
            'SELECT * FROM posts WHERE id = ?',
            [postId]
        );
        
        if (posts.length === 0) {
            return res.status(404).send('Post not found');
        }
        
        res.send(posts[0]);
    } catch (error) {
        res.status(500).send('Database error: ' + error.message);
    }
});

// Update post
app.put('/posts/:id', validatePost, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const { title, content } = req.body;
        
        const [result] = await db.execute(
            'UPDATE posts SET title = ?, content = ? WHERE id = ?',
            [title, content, postId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).send('Post not found');
        }
        
        const [updatedPost] = await db.execute(
            'SELECT * FROM posts WHERE id = ?',
            [postId]
        );
        
        res.send(updatedPost[0]);
    } catch (error) {
        res.status(500).send('Database error: ' + error.message);
    }
});

// Delete post
app.delete('/posts/:id', async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const [result] = await db.execute(
            'DELETE FROM posts WHERE id = ?',
            [postId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).send('Post not found');
        }
        
        res.status(204).send();
    } catch (error) {
        res.status(500).send('Database error: ' + error.message);
    }
});

// Update logger to use database
async function logger(req, res, next) {
    try {
        await db.execute(
            'INSERT INTO logs (method, url) VALUES (?, ?)',
            [req.method, req.originalUrl]
        );
        console.log("Logged:", { method: req.method, url: req.originalUrl });
        next();
    } catch (error) {
        console.error('Logging error:', error);
        next(); // Continue even if logging fails
    }
}

function apiAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== 'aa-bb-cc-dd') {
        return res.status(403).send('Invalid api key');
    }
    next();
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});