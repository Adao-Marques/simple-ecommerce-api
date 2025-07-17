# A simple Ecommerce-api

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![REST](https://img.shields.io/badge/RESTful-API-brightgreen)

## ✨ Enhanced Features

- **Case-insensitive duplicate checks** for all critical fields
- **Detailed conflict detection** with clear error messages
- **Comprehensive API testing examples** for all scenarios
- **Improved response formats** with success/error details

---

## Quick Start

### Installation
```bash
git clone https://github.com/yourusername/ecommerce-api.git
cd ecommerce-api
npm install
cp .env.example .env
```

### Configuration

Edit .env file:
```bash
SECRET_KEY=your_secure_jwt_secret_here
PORT=3000
JWT_EXPIRES_IN=1h  # Token expiration time
```
### Running

```bash
npm start
```
Server runs at http://localhost:3000

### Authentication Flow

1- Register:
```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d '{"username":"newuser","password":"Str0ngP@ss"}'
```
2- Login (get token):
```bash
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{"username":"newuser","password":"Str0ngP@ss"}'
```
3- Use token in subsequent requests:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/products
```

## API Endpoints

| Method | Endpoint               | Description               | Auth Required |
|--------|-------------------------|-----------------------------|---------------|
| POST   | /auth/register           | Register new user            | No            |
| POST   | /auth/login              | Login and get JWT token       | No            |
| GET    | /products                | Get all products              | Yes           |
| GET    | /products?category=X     | Filter products by category   | Yes           |
| GET    | /products/:id            | Get single product            | Yes           |
| POST   | /products                | Create new product            | Yes           |

### Example Requests
```bash
curl -X POST http://localhost:3000/products \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "id": 101,
  "name": "Wireless Headphones",
  "category": "Electronics",
  "price": 129.99,
  "inStock": true
}'
```
### Get Products by Category:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
"http://localhost:3000/products?category=Electronics"
```
## Duplication Controls

The API prevents:

- Duplicate usernames (case-insensitive)
- Duplicate product IDs
- Duplicate product names (case-insensitive)

**Error Responses:**

```json
{
  "error": "Duplicate username",
  "message": "Username already exists (case-insensitive check)"
}
```

```json
{
  "error": "Duplicate product ID",
  "message": "Product with this ID already exists"
}
```
## Project Structure

```plaintext
ecommerce-api/
├── .env          # Environment config
├── app.js        # Main application
├── package.json  # Dependencies
├── README.md     # This file

```

## Testing Summary Table

| Test Case             | Method | Endpoint              | Status Code | Verification           |
|------------------------|--------|------------------------|-------------|-------------------------|
| New user registration  | POST   | /auth/register         | 201         | User created            |
| Duplicate username     | POST   | /auth/register         | 409         | Case-insensitive block   |
| Successful login       | POST   | /auth/login            | 200         | Returns JWT              |
| Create product         | POST   | /products              | 201         | Product created          |
| Duplicate product ID   | POST   | /products              | 409         | ID conflict              |
| Duplicate product name | POST   | /products              | 409         | Name conflict            |
| List all products      | GET    | /products              | 200         | Returns all items        |
| Filter by category     | GET    | /products?category=X   | 200         | Filtered results         |

---

## Error Handling Reference

| Code | Error Type   | Example Scenario         |
|------|--------------|---------------------------|
| 400  | Bad Request  | Missing required fields    |
| 401  | Unauthorized | Missing/invalid JWT        |
| 403  | Forbidden    | Expired JWT                |
| 404  | Not Found    | Product ID not found        |
| 409  | Conflict     | Duplicate detected          |
| 500  | Server Error | Unexpected failure          |

## 📄 License

This project is licensed under the **MIT License** - © 2025 Adão Marques.  
See the [LICENSE](LICENSE) file for details.
