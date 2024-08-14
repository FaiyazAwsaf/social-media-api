const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let users =
[
    {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com"
    },
    {
        id: 2,
        name: "Faiyaz Awsaf",
        email: "faiyaz.@example.com"
    },
    {
        id: 3,
        name: "Zareen Tabassum",
        email: "zareen.doe@example.com"
    }
];

let posts =
[
    {
        id: 1,
        userId: 1,
        title: "My First Post",
        content: "This is the content of my first post."
    },
    {
        id: 2,
        userId: 1,
        title: "My Second Post",
        content: "This is the content of my first post."
    },
    {
        id: 3,
        userId: 1,
        title: "My First Post",
        content: "This is the content of my first post."
    }
];

//Home page
app.get('/', (req, res) => {
    res.send('Hello World!');
});

//Users list
app.get('/users', (req, res) => {
    res.send(users);
});

//Create new user
app.post('/users', (req, res) => {
    const newUser = {
        id : users.length + 1,
        name : req.body.name,
        email : req.body.email
    }

    users.push(newUser);
    // res.send(newUser);
    res.status(201).send(newUser);
});

//Retrieve user by ID 
app.get('/users/:id', (req, res) => {
    const userID = parseInt(req.params.id);
    const user = users.find(u => u.id === userID);

    if (!user) return res.status(404).send('User not found');
    res.send(user);

});

//Update user info
app.put('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');

    user.name = req.body.name;
    user.email = req.body.email;
    res.send(user);
});

//Delete user 
app.delete('/users/:id', (req, res) => {
    const userIndex = parseInt(req.params.id - 1);
    users.splice(userIndex, 1);

    res.send('User deleted');
});

//Show posts
app.get('/posts', (req, res) => {
    res.send(posts);
});

//Create post (associated with a user)
app.post('/posts', (req, res) => {
    const userId = req.body.userId;
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).send('User not found');

    const newPost = {
        id: posts.length + 1,
        userId: userId,
        title: req.body.title,
        content: req.body.content
    };
    posts.push(newPost);
    res.status(201).send(newPost);
});

app.get('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).send('Post not found');
    res.send(post);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

