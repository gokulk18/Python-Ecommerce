import { useState, useEffect } from 'react';
import { orderApi } from '../api/orderApi';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Spinner } from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { PackageX, Package, ChevronDown, ChevronUp } from 'lucide-react';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const { addToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getOrders();
        setOrders(res.data);
      } catch (err) {
        addToast('Failed to load orders', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [addToast]);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'confirmed': return <Badge variant="success">Confirmed</Badge>;
      case 'shipped': return <Badge variant="primary">Shipped</Badge>;
      case 'delivered': return <Badge variant="success">Delivered</Badge>;
      case 'cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <PackageX className="w-24 h-24 text-gray-600 mx-auto mb-6" />
        <h2 className="text-3xl font-heading font-bold mb-4">No Orders Found</h2>
        <p className="text-gray-400">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="border-borderMain overflow-hidden">
            <div 
              className="p-6 cursor-pointer hover:bg-white/5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              onClick={() => toggleExpand(order.id)}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg">Order #{order.id.substring(0, 8).toUpperCase()}</h3>
                  <p className="text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 justify-between md:justify-end flex-1">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="font-bold text-secondary">${order.total.toFixed(2)}</p>
                </div>
                <div>{getStatusBadge(order.status)}</div>
                <div className="text-gray-400">
                  {expanded[order.id] ? <ChevronUp /> : <ChevronDown />}
                </div>
              </div>
            </div>
            
            {expanded[order.id] && (
              <div className="p-6 border-t border-borderMain bg-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Items Ordered</h4>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-mono text-sm">{item.qty}x</span>
                        <span className="font-medium text-gray-200">{item.name}</span>
                      </div>
                      <span className="text-gray-400">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
