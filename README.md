# L2B2-Frontend-Path-Assignment-7-Server

## Installation:
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Rename `.env.example` to `.env`.
4. Run the server using `npm run dev`.


## Configuration:
- Environment Variables:
  - `PORT`: Port number the server listens on. Default: 5000
  - `MONGODB_URI`: URI for MongoDB database.
  - `JWT_SECRET`: Secret key for JWT token generation.
  - `EXPIRES_IN`: Token expiration time.

## Usage:
- API Endpoints:

### User Routes

- **POST `/api/v1/register`**
  - Description: Register a new user.
  - Request Body: 
    ```json
    {
      "name": "John",
      "email": "john@example.com",
      "password": "password"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "data": { ... },
      "token": "jwt_token_here"
    }
    ```

- **POST `/api/v1/login`**
  - Description: Log in with existing credentials.
  - Request Body:
    ```json
    {
      "email": "john@example.com",
      "password": "password"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "token": "jwt_token_here"
    }
    ```

### Clothes Routes

- **POST `/api/v1/create-clothes`**
  - Description: Create a new clothes item.
  - Request Body:
    ```json
    {
      "email": "john@example.com",
      "data": {
        "image": "image_url_here",
        "category": "category_here",
        "title": "title_here",
        "description": "description_here",
        "size": "size_here"
      }
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "status": 201,
      "message": "Data created successfully",
      "data": { ... }
    }
    ```

- **GET `/api/v1/clothes`**
  - Description: Retrieve all clothes items.
  - Response:
    ```json
    {
      "success": true,
      "status": 200,
      "message": "All Data Retrieved successfully",
      "data": [ ... ]
    }
    ```

- **GET `/api/v1/clothes-by-user/:email`**
  - Description: Retrieve clothes items associated with a specific user.
  - Response:
    ```json
    {
      "success": true,
      "status": 200,
      "message": "All Data Retrieved successfully",
      "data": [ ... ]
    }
    ```

- **GET `/api/v1/clothes/:id`**
  - Description: Retrieve a single clothes item by ID.
  - Response:
    ```json
    {
      "success": true,
      "status": 200,
      "message": "Data Retrieved successfully",
      "data": { ... }
    }
    ```

- **PUT `/api/v1/update-clothes/:id`**
  - Description: Update a clothes item by ID.
  - Request Body:
    ```json
    {
      "image": "updated_image_url",
      "category": "updated_category",
      "title": "updated_title",
      "description": "updated_description",
      "size": "updated_size"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "status": 200,
      "message": "Clothes data updated successfully",
      "data": { ... }
    }
    ```

- **DELETE `/api/v1/delete-clothes/:id`**
  - Description: Delete a clothes item by ID.
  - Response:
    ```json
    {
      "success": true,
      "status": 200,
      "message": "Clothes data deleted successfully",
      "data": { ... }
    }
    ```

### About Us Route

- **GET `/api/v1/aboutUs`**
  - Description: Retrieve information about the clothing store.
  - Response:
    ```json
    {
      "success": true,
      "status": 200,
      "message": "All Data Retrieved successfully",
      "data": [ ... ]
    }
    ```

## Dependencies:
- `bcrypt`: Library for hashing passwords.
- `cors`: Express middleware for enabling CORS.
- `dotenv`: Loads environment variables from .env file.
- `express`: Web framework for Node.js.
- `jsonwebtoken`: Library for generating and verifying JWT tokens.
- `mongodb`: MongoDB driver for Node.js.
- `nodemon`: Utility for automatically restarting the server during development.
