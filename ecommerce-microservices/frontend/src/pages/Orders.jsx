import React, { useState, useEffect } from 'react';
import { getOrders, cancelOrder } from '../api/orderApi';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = async (id) => {
    try {
      await cancelOrder(id);
      setToast('Order cancelled successfully');
      fetchOrders();
    } catch (err) {
      setToast(err.response?.data?.detail || 'Failed to cancel order');
    }
  };

  if (loading) return <div className="h-screen"><Spinner /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <h1 className="text-3xl font-sora font-bold text-white mb-8">Order History</h1>
      
      {orders.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-gray-400">You have no orders yet.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <Card key={order.id} className="p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-4 border-b border-nexus-border pb-4">
                  <div className="text-sm text-gray-400">Order ID: <span className="text-gray-200 font-mono">{order.id}</span></div>
                  <div>
                    {order.status === 'confirmed' && <Badge color="teal">Confirmed</Badge>}
                    {order.status === 'pending' && <Badge color="yellow">Pending</Badge>}
                    {order.status === 'cancelled' && <Badge color="red">Cancelled</Badge>}
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm items-center">
                      <span className="text-gray-300"><span className="text-gray-500">{item.quantity}x</span> {item.name}</span>
                      <span className="text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-500">Placed on: {new Date(order.created_at).toLocaleString()}</div>
              </div>
              
              <div className="w-full md:w-48 shrink-0 bg-nexus-bg rounded-lg p-4 border border-nexus-border flex flex-col items-center justify-center">
                <div className="text-sm text-gray-400 mb-1">Total Amount</div>
                <div className="text-2xl font-bold text-nexus-secondary mb-4">${order.total_amount.toFixed(2)}</div>
                {order.status !== 'cancelled' && (
                  <Button variant="danger" className="w-full py-2 text-sm" onClick={() => handleCancelClick(order.id)}>Cancel Order</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
