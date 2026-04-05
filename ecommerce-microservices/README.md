# Nexus Store Microservices

A full production-ready 3-tier e-commerce microservices application with a stunning frontend UI.

## Architecture
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Backend**: 5 FastAPI Microservices (User, Product, Order, Notification, Admin)
- **Database**: 4 independent MongoDB instances
- **Infrastructure**: Docker Compose & Kubernetes

## Services & Ports
- Frontend: `3000` (NodePort `30000` in k8s)
- User Service: `8001`
- Product Service: `8002`
- Order Service: `8003`
- Notification Service: `8004`
- Admin Service: `8005`

## Running Locally via Docker Compose

1. Build and run all services:
```bash
cd ecommerce-microservices
docker compose up --build -d
```
2. The application will be available at `http://localhost:3000`

## Default Admin Credentials
Seeded automatically on startup:
**Email:** admin@nexus.com
**Password:** admin123

## Kubernetes Deployment (k8s)

```bash
cd ecommerce-microservices
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```
Ensure your EC2 security group has ports `3000, 8001, 8002, 8003, 8004, 8005, 30000` open.
Access the app via your EC2 public IP on port `30000`.

## API Endpoints

### User Service (:8001)
- `POST /auth/register` (name, email, password)
- `POST /auth/login` (email, password)
- `GET /users/me` (requires X-User-Id)
- `PUT /users/me` (requires X-User-Id)
- `GET /users`
- `PUT /users/{id}/admin`

### Product Service (:8002)
- `GET /products`
- `GET /products/all`
- `GET /products/{id}`
- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`

### Order Service (:8003)
- `POST /orders` (user_id, items)
- `GET /orders` (requires X-User-Id)
- `GET /orders/all`
- `GET /orders/{id}`
- `PUT /orders/{id}/status`
- `PUT /orders/{id}/cancel`

### Notification Service (:8004)
- `POST /notify`
- `GET /notifications`
- `GET /notifications/{user_id}`

### Admin Service (:8005)
- `GET /admin/stats`
- `GET /admin/dashboard`

## Sample Curl Commands

**Register a user:**
```bash
curl -X POST http://localhost:8001/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"test"}'
```

**Login:**
```bash
curl -X POST http://localhost:8001/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}'
```

**List Products:**
```bash
curl http://localhost:8002/products
```

**Get User Profile:**
```bash
curl http://localhost:8001/users/me -H "X-User-Id: <user_id_here>"
```
