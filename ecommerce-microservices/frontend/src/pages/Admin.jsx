import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';
import { getProducts, createProduct } from '../api/productApi';
import { getOrders } from '../api/orderApi';
import { AuthContext } from '../context/AuthContext';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // New Product Form State
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', stock: '', category: '', image_url: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const data = await getProducts();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await createProduct({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      });
      setToast('Product created successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setToast(err.response?.data?.detail || 'Error creating product');
    }
  };

  if (user?.email !== 'admin@nexus.test') {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
       {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <Card className="p-4">
          <ul className="space-y-2">
            <li>
              <button 
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${activeTab === 'products' ? 'bg-nexus-primary text-white' : 'text-gray-400 hover:bg-white/5'}`}
                onClick={() => setActiveTab('products')}
              >
                Products
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${activeTab === 'orders' ? 'bg-nexus-primary text-white' : 'text-gray-400 hover:bg-white/5'}`}
                onClick={() => setActiveTab('orders')}
              >
                Orders (Admin setup demo)
              </button>
            </li>
          </ul>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-grow">
        <Card className="p-8 min-h-[60vh]">
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-sora font-semibold text-white">Product Catalog</h2>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center text-sm py-2">
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </div>

              {loading ? <Spinner /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-400">
                    <thead className="border-b border-nexus-border text-gray-300">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} className="border-b border-nexus-border/50 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-white font-medium">{p.name}</td>
                          <td className="py-3 px-4"><Badge color="purple">{p.category}</Badge></td>
                          <td className="py-3 px-4">${p.price.toFixed(2)}</td>
                          <td className="py-3 px-4">{p.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

           {activeTab === 'orders' && (
            <div>
               <h2 className="text-2xl font-sora font-semibold text-white mb-6">All Orders</h2>
               <p className="text-gray-400">Not implemented in this demo panel, refer to User Orders page.</p>
            </div>
           )}
        </Card>
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Product">
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input label="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <Input label="Description" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
             <Input label="Stock" type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
          </div>
          <Input label="Category" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          <Input label="Image URL" required value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
          <Button type="submit" className="w-full mt-6">Save Product</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Admin;
