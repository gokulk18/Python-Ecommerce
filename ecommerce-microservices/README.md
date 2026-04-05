# E-Commerce Microservices

A fully working, production-ready 3-tier e-commerce microservices application using Python (FastAPI), MongoDB, Docker, and Kubernetes.

## Services

* **User Service (8001)**: User registration, login, profile management.
* **Product Service (8002)**: Product catalog management (requires JWT for creation).
* **Order Service (8003)**: Processing orders and checking inventory via Product Service, and dispatching events to Notification Service.
* **Notification Service (8004)**: Simulating sending emails to users upon system events.

Each service has its independent MongoDB database instance.

---

## How to run with Docker Compose

To build and run all 4 microservices + 4 MongoDB instances on a shared local docker network `ecommerce-net`:

```bash
docker-compose up --build
```
This maps the respective DB instances to your host (27017-27020) and application APIS to (8001-8004).

---

## How to deploy to Kubernetes

Ensure your local cluster (like minikube or docker desktop) is running.

```bash
# Apply the namespace, databases and all service deployments
kubectl apply -f k8s/
```
Verify the resources using:
```bash
kubectl get pods -n ecommerce
kubectl get svc -n ecommerce
kubectl get statefulsets -n ecommerce
```

---

## API Endpoints List

### User Service (`http://localhost:8001`)
- `POST /auth/register` (Register new user)
- `POST /auth/login` (Login and get JWT)
- `GET /users/me` (Get logged in user profile, needs JWT)
- `PUT /users/me` (Update logged in user profile, needs JWT)
- `GET /health` (Health check)

### Product Service (`http://localhost:8002`)
- `GET /products` (List products)
- `GET /products/{id}` (Get single product by ID)
- `POST /products` (Create product, needs JWT)
- `PUT /products/{id}` (Update product)
- `DELETE /products/{id}` (Soft delete product)
- `GET /health` (Health check)

### Order Service (`http://localhost:8003`)
- `POST /orders` (Create order, needs JWT)
- `GET /orders` (List user orders, needs JWT)
- `GET /orders/{id}` (Get user order by ID, needs JWT)
- `PUT /orders/{id}/cancel` (Cancel order and restore stock, needs JWT)
- `GET /health` (Health check)

### Notification Service (`http://localhost:8004`)
- `POST /notify` (Send notification)
- `GET /notifications/{user_id}` (List notifications for a user)
- `GET /health` (Health check)

---

## Sample curl commands

### 1. Register a User
```bash
curl -X POST "http://localhost:8001/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"name": "Admin", "email": "admin@example.com", "password": "password123"}'
```

### 2. Login to get token
```bash
curl -X POST "http://localhost:8001/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "password123"}'
```
*(Copy the `access_token` from the response to use as your `<JWT_TOKEN>` below)*

### 3. Create a Product
```bash
curl -X POST "http://localhost:8002/products" \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"name": "Laptop", "description": "Gaming Laptop", "price": 1200.00, "stock": 50, "category": "Electronics"}'
```
*(Copy the generated Product `id` to use as `<PRODUCT_ID>` below)*

### 4. Create an Order
```bash
curl -X POST "http://localhost:8003/orders" \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"items": [{"product_id": "<PRODUCT_ID>", "qty": 1, "price": 1200.00}]}'
```

### 5. Check Notifications
*Replace `<USER_ID>` with the `id` from the registration step*
```bash
curl -X GET "http://localhost:8004/notifications/<USER_ID>"
```
