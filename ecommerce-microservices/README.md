# Nexus Store Microservices Architecture

A full production-ready 3-tier e-commerce microservices application with a stunning React+Tailwind frontend UI ("NEXUS STORE") and 4 FastAPI microservices (Python 3.11 + Motor async MongoDB).

## Architecture

1. **Frontend**: React + Vite + Tailwind CSS (Port 3000 mapped to NGINX 80 in Docker)
2. **User Service**: FastAPI on Port 8001 (JWT Auth) + MongoDB (user-mongo:27017)
3. **Product Service**: FastAPI on Port 8002 + MongoDB (product-mongo:27018)
4. **Order Service**: FastAPI on Port 8003 + MongoDB (order-mongo:27019)
5. **Notification Service**: FastAPI on Port 8004 + MongoDB (notification-mongo:27020)

## Run Locally with Docker Compose

Ensure Docker Desktop / Docker Compose is installed. From the root directory, simply run:

```bash
docker-compose up --build -d
```

This will spin up 4 MongoDB instances, 4 FastAPI services, and 1 frontend React app.

The frontend is available at `http://localhost:3000`.
FastAPI Swagger docs are available at:
- `http://localhost:8001/docs` (User Service)
- `http://localhost:8002/docs` (Product Service)
- `http://localhost:8003/docs` (Order Service)
- `http://localhost:8004/docs` (Notification Service)

## Kubernetes Deployment (EC2 Notes)

If deploying to an EC2 instance, ensure your Security Group has the following TCP ports open:
- `3000` (Local Frontend DEV / General use)
- `8001-8004` (FastAPI Microservices API access via direct testing if needed)
- `30000` (Kubernetes NodePort for Frontend)

### Deploy locally (Minikube/Kind) or via EC2 `kubectl`:

1. Create the namespace first:
```bash
kubectl apply -f k8s/namespace.yaml
```

2. Apply configuration and secrets:
```bash
kubectl apply -f k8s/configmap-secrets.yaml
```

3. Spin up StatefulSets for databases:
```bash
kubectl apply -f k8s/mongo-statefulsets.yaml
```

4. Deploy microservices & frontend:
```bash
kubectl apply -f k8s/user-service.yaml
kubectl apply -f k8s/product-service.yaml
kubectl apply -f k8s/notification-service.yaml
kubectl apply -f k8s/order-service.yaml
kubectl apply -f k8s/frontend.yaml
```

Access via node IP address `http://<EC2-PUBLIC-IP>:30000`.

## Example cURL Traces

**Check Notification Health:**
```bash
curl -X GET http://localhost:8004/health
```

**Register User:**
```bash
curl -X POST http://localhost:8001/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name": "Admin User", "email": "admin@nexus.test", "password": "password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:8001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@nexus.test", "password": "password123"}'
```
