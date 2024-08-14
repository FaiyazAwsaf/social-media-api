# social-media-api

## API Routes

### User Management
- **GET /users**: Retrieve a list of all users.
- **POST /users**: Create a new user.
- **GET /users/:id**: Retrieve a specific user by ID.
- **GET /users/name/:name**: Retrieve a specific user by name.
- **PUT /users/:id**: Update details of a specific user by ID.
- **DELETE /users/:id**: Delete a specific user by ID.

### Post Management
- **GET /posts**: Retrieve a list of all posts.
- **POST /posts**: Create a new post associated with a specific user.
- **GET /posts/:id**: Retrieve a specific post by ID.
- **PUT /posts/:id**: Update details of a specific post by ID.
- **DELETE /posts/:id**: Delete a specific post by ID.

## Features
- When a user is deleted, all their posts are also deleted (cascade delete).
