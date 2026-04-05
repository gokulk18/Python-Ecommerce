from fastapi import APIRouter
import httpx
from app.config import settings
import asyncio

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
async def get_stats():
    async with httpx.AsyncClient(timeout=10.0) as client:
        users_f = client.get(f"{settings.USER_SERVICE_URL}/users")
        products_f = client.get(f"{settings.PRODUCT_SERVICE_URL}/products/all")
        orders_f = client.get(f"{settings.ORDER_SERVICE_URL}/orders/all")
        
        users_resp, products_resp, orders_resp = await asyncio.gather(users_f, products_f, orders_f, return_exceptions=True)
        
        total_users = len(users_resp.json()) if isinstance(users_resp, httpx.Response) and users_resp.status_code == 200 else 0
        total_products = len(products_resp.json()) if isinstance(products_resp, httpx.Response) and products_resp.status_code == 200 else 0
        
        orders_data = orders_resp.json() if isinstance(orders_resp, httpx.Response) and orders_resp.status_code == 200 else []
        total_orders = len(orders_data)
        total_revenue = sum(o.get("total", 0) for o in orders_data if o.get("status") not in ["cancelled"])
        
        return {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": total_revenue
        }

@router.get("/dashboard")
async def get_dashboard_data():
    async with httpx.AsyncClient(timeout=10.0) as client:
        users_f = client.get(f"{settings.USER_SERVICE_URL}/users")
        products_f = client.get(f"{settings.PRODUCT_SERVICE_URL}/products/all")
        orders_f = client.get(f"{settings.ORDER_SERVICE_URL}/orders/all")
        
        users_resp, products_resp, orders_resp = await asyncio.gather(users_f, products_f, orders_f, return_exceptions=True)
        
        users_data = users_resp.json() if isinstance(users_resp, httpx.Response) and users_resp.status_code == 200 else []
        products_data = products_resp.json() if isinstance(products_resp, httpx.Response) and products_resp.status_code == 200 else []
        orders_data = orders_resp.json() if isinstance(orders_resp, httpx.Response) and orders_resp.status_code == 200 else []
        
        # Sort and limit
        recent_orders = sorted(orders_data, key=lambda x: x.get("created_at", ""), reverse=True)[:5]
        recent_users = users_data[-5:] # assuming appending, though no timestamp on users right now
        low_stock_products = sorted([p for p in products_data if not p.get("is_deleted")], key=lambda x: x.get("stock", 0))[:5]
        
        return {
            "recent_orders": recent_orders,
            "low_stock_products": low_stock_products,
            "recent_users": recent_users
        }
