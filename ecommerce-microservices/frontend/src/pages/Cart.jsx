import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Toast from '../components/Toast';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { createOrder } from '../api/orderApi';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));
      
      const payload = {
        items: orderItems,
        total_amount: getCartTotal()
      };

      await createOrder(payload);
      clearCart();
      setToast('Order placed successfully!');
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      setToast(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-nexus-card border border-nexus-border rounded-xl p-12">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-600 mb-6" />
          <h2 className="text-3xl font-sora font-semibold text-white mb-4">Your Cart is Empty</h2>
          <p className="text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products">
            <Button className="px-8 flex mx-auto">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-[fadeIn_0.3s_ease-out]">
      {toast && <Toast message={toast} onClose={() => setToast(null)} type={toast.includes('success') ? 'success' : 'error'} />}
      
      <h1 className="text-3xl font-sora font-bold text-white mb-8">Your Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow space-y-4">
          {cart.map(item => (
            <Card key={item.id} className="p-4 flex flex-col sm:flex-row items-center gap-6">
              <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-md bg-gray-800" />
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                <div className="text-nexus-secondary font-medium">${item.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-nexus-border rounded bg-nexus-bg">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-gray-400 hover:text-white">-</button>
                  <span className="px-3 py-1 text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-gray-400 hover:text-white">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div className="w-full lg:w-96 shrink-0">
          <Card className="p-6 sticky top-24">
            <h3 className="text-xl font-sora font-semibold text-white mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6 border-b border-nexus-border pb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({cart.length} items)</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-medium text-white">Total</span>
              <span className="text-2xl font-bold text-nexus-secondary">${getCartTotal().toFixed(2)}</span>
            </div>
            <Button className="w-full py-4 text-lg" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Processing...' : user ? 'Place Order' : 'Login to Checkout'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
