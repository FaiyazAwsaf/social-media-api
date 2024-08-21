const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(logger);
app.use(apiAuth);



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

let logs = [];

users.forEach(attachPostsToUser);

function attachPostsToUser(user){
    user.posts = posts.filter(p => p.userId === user.id);
};



//Home page
app.get('/', (req, res) => {
    res.send('Hello World!');
});

//Users list
app.get('/users', (req, res) => {
    const limit = parseInt(req.query.limit)
    
    if(!isNaN(liit) && limit > 0){
        res.send(users.slice(0, limit));    
    } 
    else {
        res.send(users); 
    }    
});

//Create new user
app.post('/users', (req, res) => {
    
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    const newUser = {
         id: users.length + 1, 
         name, 
         email 
    };
    
    // Alternative 1
    // const name = req.body.name;
    // const email = req.body.email;
     
    // const newUser = {
    //     id : users.length + 1,
    //     name,
    //     email    
    // }

    // Alternative 2
    // const newUser = {
    //     id : users.length + 1,
    //     name : req.body.name,
    //     email : req.body.email
    // }

    users.push(newUser);
    // res.send(newUser);
    res.status(201).send(newUser);
});

//Retrieve user by ID 
app.get('/users/:id', (req, res) => {
    const userID = parseInt(req.params.id);
    const user = users.find(u => u.id === userID);
    if (!user) return res.status(404).send('User not found');

    user.posts = posts.filter(p => p.userId === user.id);

    res.send(user);

});

//Retrieve user by name 
app.get('/users/name/:name', (req, res) => {
    const userName = req.params.name.toLocaleLowerCase();
    const user = users.find(un => un.name.toLocaleLowerCase() === userName);
    if (!user) return res.status(404).send('User not found');

    user.posts = posts.filter(p => p.userId === user.id);

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
    const user = users.find(u => u.id === parseInt(req.params.id));

    posts = posts.filter(p => p.userId !== user.id);

    const userIndex = users.indexOf(user);
    users.splice(userIndex, 1);
    res.status(204).send('User deleted');
});

//Show posts
app.get('/posts', (req, res) => {
    const limit = parseInt(req.query.limit)
    
    if(!isNaN(limit) && limit > 0){
        res.status(200).send(posts.slice(0, limit));    
    } 
    else {
        res.status(200).send(posts);
    }
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

    user.posts.push(newPost);
    posts.push(newPost);
    res.status(201).send(newPost);
});

//Retrieve post by ID
app.get('/posts/:id', (req, res) => {
    const postID =  parseInt(req.params.id);
    const post = posts.find(p => p.id === postID);
  
    if (!post) return res.status(404).send('Post not found');
    
    res.send(post);
});

//Update post info
app.put('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    
    if (!post) return res.status(404).send('Post not found');

    post.title = req.body.title;
    post.content = req.body.content;
    
    res.send(post);
});

//Delete post
app.delete('/posts/:id', (req, res) => {
    const postIndex = parseInt(req.params.id - 1);
    posts.splice(postIndex, 1);

    res.status(204).send('Post deleted');
});




function logger(req, res, next) {

    const newLog = {
        method: req.method,
        url: req.originalUrl 
    }

    logs.push(newLog);
    console.log("Logged: ", newLog);
    console.log("ALL logs", logs);
    next();
}

function apiAuth(req, res, next) {
    apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== 'aa-bb-cc-dd') {
        return res.status(403).send('Invalid api key');
    }
    next();
}



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

