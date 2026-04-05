import { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { productApi } from '../api/productApi';
import { orderApi } from '../api/orderApi';
import { userApi } from '../api/userApi';
import { notificationApi } from '../api/notificationApi';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Spinner } from '../components/Spinner';
import { Table, TRow, TCell } from '../components/Table';
import { SlideOver } from '../components/SlideOver';
import { Input, TextArea, Select } from '../components/Input';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { LayoutDashboard, Package, ShoppingCart, Users, Bell, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        setStats(res.data);
      } catch (e) {
        addToast('Failed to load admin stats', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab, addToast]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'Products', icon: <Package size={20} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-surface border-r border-borderMain flex flex-col pt-8 px-4 flex-shrink-0">
        <h2 className="text-xl font-heading font-bold mb-8 px-4 text-gray-300 uppercase tracking-widest">Admin Portal</h2>
        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left ${
                activeTab === tab.id ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {loading && activeTab === 'dashboard' ? (
          <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
            {activeTab === 'products' && <ProductsTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
          </>
        )}
      </div>
    </div>
  );
};

/* --- Tabs Implementations --- */

const DashboardTab = ({ stats }) => {
  if (!stats) return null;
  return (
    <div>
      <h2 className="text-3xl font-heading font-bold mb-8">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Users</p>
          <p className="text-4xl font-bold">{stats.total_users}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Active Products</p>
          <p className="text-4xl font-bold">{stats.total_products}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Orders</p>
          <p className="text-4xl font-bold">{stats.total_orders}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Revenue</p>
          <p className="text-4xl font-bold text-secondary">${stats.total_revenue.toFixed(2)}</p>
        </Card>
      </div>
      {/* Could load dashboard graph or recent orders here from /dashboard API if needed */}
    </div>
  );
};

const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAllProducts();
      setProducts(res.data);
    } catch (e) {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      description: fd.get('description'),
      price: parseFloat(fd.get('price')),
      stock: parseInt(fd.get('stock')),
      category: fd.get('category'),
      image_url: fd.get('image_url')
    };

    try {
      if (editingItem) {
        await productApi.updateProduct(editingItem.id, data);
        addToast('Product updated');
      } else {
        await productApi.createProduct(data);
        addToast('Product created');
      }
      setSlideOpen(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Error saving product', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await productApi.deleteProduct(deleteId);
      addToast('Product soft deleted');
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      addToast('Error deleting product', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold">Manage Products</h2>
        <Button onClick={() => { setEditingItem(null); setSlideOpen(true); }}>Add New Product</Button>
      </div>
      
      <Table headers={['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions']}>
        {products.map(p => (
          <TRow key={p.id}>
            <TCell>
              <img src={p.image_url || `https://picsum.photos/seed/${p.id}/40/40`} className="w-10 h-10 rounded object-cover" />
            </TCell>
            <TCell className="font-medium text-gray-100">{p.name}</TCell>
            <TCell>{p.category}</TCell>
            <TCell>${p.price.toFixed(2)}</TCell>
            <TCell>{p.stock}</TCell>
            <TCell>
              {p.is_deleted ? <Badge variant="danger">Deleted</Badge> : <Badge variant="success">Active</Badge>}
            </TCell>
            <TCell>
              <div className="flex gap-2">
                <button onClick={() => { setEditingItem(p); setSlideOpen(true); }} className="text-blue-400 p-1 hover:bg-blue-400/20 rounded">
                  <Edit size={16} />
                </button>
                {!p.is_deleted && (
                  <button onClick={() => setDeleteId(p.id)} className="text-red-400 p-1 hover:bg-red-400/20 rounded">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </TCell>
          </TRow>
        ))}
      </Table>

      <SlideOver isOpen={slideOpen} onClose={() => setSlideOpen(false)} title={editingItem ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="name" label="Product Name" defaultValue={editingItem?.name || ''} required />
          <TextArea name="description" label="Description" rows={4} defaultValue={editingItem?.description || ''} required />
          <div className="grid grid-cols-2 gap-4">
            <Input name="price" type="number" step="0.01" label="Price" defaultValue={editingItem?.price || ''} required />
            <Input name="stock" type="number" label="Stock Quantity" defaultValue={editingItem?.stock || 0} required />
          </div>
          <Select 
            name="category" 
            label="Category" 
            defaultValue={editingItem?.category || ''} 
            required 
            options={[
              {label: 'Electronics', value: 'Electronics'},
              {label: 'Clothing', value: 'Clothing'},
              {label: 'Books', value: 'Books'},
              {label: 'Home & Garden', value: 'Home & Garden'},
              {label: 'Wearables', value: 'Wearables'},
              {label: 'Sports', value: 'Sports'},
              {label: 'Beauty', value: 'Beauty'},
              {label: 'Toys', value: 'Toys'},
              {label: 'Automotive', value: 'Automotive'},
              {label: 'Food', value: 'Food'},
              {label: 'Other', value: 'Other'},
            ]}
          />
          <Input name="image_url" label="Image URL" defaultValue={editingItem?.image_url || ''} />
          
          <div className="pt-6">
            <Button type="submit" className="w-full">{editingItem ? 'Save Changes' : 'Create Product'}</Button>
          </div>
        </form>
      </SlideOver>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <p className="mb-6">Are you sure you want to soft delete this product? It will be hidden from customers.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  
  const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getAllOrders();
      setOrders(res.data);
    } catch (e) {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      if (status === 'cancelled') {
        await orderApi.cancelOrder(id);
      } else {
        await orderApi.updateStatus(id, status);
      }
      addToast(`Order ${id.substring(0,6)} updated to ${status}`);
      fetchOrders();
    } catch (e) {
      addToast(e.response?.data?.detail || 'Failed to update order', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Manage Orders</h2>
      <Table headers={['Order ID', 'User ID', 'Date', 'Items', 'Total', 'Current Status', 'Change Status']}>
        {orders.map(o => (
          <TRow key={o.id}>
            <TCell className="font-mono text-xs">{o.id.substring(0, 8)}</TCell>
            <TCell className="font-mono text-xs text-gray-500">{o.user_id.substring(0, 8)}</TCell>
            <TCell>{new Date(o.created_at).toLocaleDateString()}</TCell>
            <TCell>{o.items.length}</TCell>
            <TCell>${o.total.toFixed(2)}</TCell>
            <TCell>
               <Badge variant={
                 o.status === 'pending' ? 'warning' : 
                 o.status === 'cancelled' ? 'danger' : 
                 ['confirmed','shipped'].includes(o.status) ? 'primary' : 'success'
               }>
                 {o.status}
               </Badge>
            </TCell>
            <TCell>
              <select 
                className="bg-surface border border-borderMain rounded px-2 py-1 text-xs"
                value={o.status}
                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                disabled={o.status === 'cancelled' || o.status === 'delivered'}
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </TCell>
          </TRow>
        ))}
      </Table>
    </div>
  );
};

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllUsers();
      setUsers(res.data);
    } catch (e) {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleAdmin = async (id) => {
    try {
      await userApi.toggleAdmin(id);
      addToast('Admin status updated', 'success');
      fetchUsers();
    } catch (e) {
      addToast('Failed to update admin status', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">Manage Users</h2>
      <Table headers={['Name', 'Email', 'User ID', 'Admin Status', 'Actions']}>
        {users.map(u => (
          <TRow key={u.user_id}>
            <TCell className="font-medium">{u.name}</TCell>
            <TCell>{u.email}</TCell>
            <TCell className="font-mono text-xs">{u.user_id}</TCell>
            <TCell>
               {u.is_admin ? <Badge variant="primary"><ShieldAlert size={12} className="inline mr-1"/>Admin</Badge> : <Badge variant="secondary">User</Badge>}
            </TCell>
            <TCell>
              <Button size="sm" variant={u.is_admin ? 'danger' : 'secondary'} className="py-1 px-3 text-xs" onClick={() => toggleAdmin(u.user_id)}>
                {u.is_admin ? 'Demote' : 'Promote'}
              </Button>
            </TCell>
          </TRow>
        ))}
      </Table>
    </div>
  );
};

const NotificationsTab = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationApi.getAllNotifications();
        setNotifs(res.data);
      } catch (e) {
        addToast('Failed to load notifications', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [addToast]);

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-6">System Notifications Logs</h2>
      <Table headers={['Timestamp', 'User ID', 'Message']}>
        {notifs.map(n => (
          <TRow key={n.id}>
            <TCell className="whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</TCell>
            <TCell className="font-mono text-xs text-gray-500">{n.user_id}</TCell>
            <TCell className="w-full">{n.message}</TCell>
          </TRow>
        ))}
      </Table>
    </div>
  );
};
