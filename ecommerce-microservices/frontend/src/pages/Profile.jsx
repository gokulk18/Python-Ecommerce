import { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { orderApi } from '../api/orderApi';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { User, Package, Settings } from 'lucide-react';

export const Profile = () => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [orderStat, setOrderStat] = useState({ count: 0, total: 0 });
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const res = await orderApi.getOrders();
        const orders = res.data;
        const totalSpent = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
        setOrderStat({ count: orders.length, total: totalSpent });
      } catch (e) {
         console.warn("Failed fetching order stats", e);
      }
    };
    fetchUserOrders();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userApi.updateMe({ name, email });
      login(res.data);
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
          <User size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold">{user?.name}</h1>
          <p className="text-gray-400">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="p-6 border-borderMain">
            <div className="flex items-center gap-2 border-b border-borderMain pb-4 mb-6">
              <Settings className="text-gray-400" />
              <h2 className="text-xl font-heading font-semibold">Account Settings</h2>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input 
                label="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
              <Input 
                label="Email Address" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 border-borderMain bg-gradient-to-br from-surface to-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="text-primary" />
              <h3 className="font-heading font-semibold text-lg">Order Activity</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                <p className="text-3xl font-bold">{orderStat.count}</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-secondary">${orderStat.total.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
