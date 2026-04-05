import React, { useEffect, useState, useContext } from 'react';
import { Package, Bell, XCircle } from 'lucide-react';
import { orderApi, notificationApi } from '../api';
import { AuthContext } from '../context/AuthContext';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchOrdersAndNotifications = async () => {
    if (!user) return;
    try {
      const [orderRes, notifRes] = await Promise.all([
        orderApi.get('/orders'),
        notificationApi.get(`/notifications/${user.id}`)
      ]);
      setOrders(orderRes.data);
      setNotifications(notifRes.data.sort((a,b) => new Date(b.sent_at) - new Date(a.sent_at)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndNotifications();
    
    // Poll for new notifications/orders
    const interval = setInterval(() => {
      fetchOrdersAndNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const cancelOrder = async (orderId) => {
    try {
      await orderApi.put(`/orders/${orderId}/cancel`);
      fetchOrdersAndNotifications();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel order');
    }
  };

  if (!user) {
    return <div className="loading flex-center">Please login to view orders.</div>;
  }

  if (loading) return <div className="loading flex-center">Loading orders...</div>;

  return (
    <div className="orders-page fade-in">
      <div className="grid-container" style={{ gridTemplateColumns: 'minmax(300px, 2fr) minmax(250px, 1fr)' }}>
        
        <div className="orders-section">
          <h2 className="section-title"><Package /> My Orders</h2>
          {orders.length === 0 ? (
            <div className="glass empty-state flex-center">No orders yet.</div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card glass">
                  <div className="flex-between">
                    <div>
                      <span className="order-id">Order #{order.id.slice(-6)}</span>
                      <span className={`status-badge ${order.status}`}>{order.status}</span>
                    </div>
                    <h4>${order.total.toFixed(2)}</h4>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item text-secondary">
                        {item.qty}x Product ID: {item.product_id.slice(-6)}
                      </div>
                    ))}
                  </div>
                  {order.status !== 'cancelled' && (
                    <button 
                      className="btn btn-secondary sm" 
                      onClick={() => cancelOrder(order.id)}
                      style={{ marginTop: '1rem', color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                    >
                      <XCircle size={14} /> Cancel Order
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="notifications-section">
          <h2 className="section-title"><Bell /> Notifications</h2>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="glass empty-state flex-center">No notifications.</div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="notification-card glass">
                  <div className="notif-header flex-between">
                    <span className="notif-type">{notif.type}</span>
                    <span className="notif-time">
                      {new Date(notif.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="notif-message">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Orders;
