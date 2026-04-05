import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderApi } from '../api/orderApi';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) {
      addToast('Please login to place an order', 'warning');
      navigate('/login');
      return;
    }

    setOrdering(true);
    try {
      const items = cart.map(item => ({ product_id: item.product_id, qty: item.qty }));
      await orderApi.createOrder({ user_id: user.user_id, items });
      clearCart();
      addToast('Order placed successfully!', 'success');
      navigate('/orders');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to place order', 'error');
    } finally {
      setOrdering(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <ShoppingCart className="w-24 h-24 text-gray-600 mb-6" />
        <h2 className="text-3xl font-heading font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Explore our products and find something you love.</p>
        <Link to="/products">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.product_id} className="p-4 flex flex-col sm:flex-row items-center gap-4 border-borderMain">
              <div className="w-24 h-24 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.image_url || `https://picsum.photos/seed/${item.product_id}/400/400`} alt={item.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 flex flex-col">
                <Link to={`/products/${item.product_id}`} className="font-heading font-semibold text-lg hover:text-primary mb-1">
                  {item.name}
                </Link>
                <div className="text-secondary font-bold">${item.price.toFixed(2)}</div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="flex items-center border border-borderMain rounded-lg bg-surface">
                  <button onClick={() => updateQuantity(item.product_id, item.qty - 1)} className="p-2 hover:bg-white/5 text-gray-400">
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{item.qty}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.qty + 1)} className="p-2 hover:bg-white/5 text-gray-400">
                    <Plus size={16} />
                  </button>
                </div>
                
                <button onClick={() => removeFromCart(item.product_id)} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors tooltip">
                  <Trash2 size={20} />
                </button>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24 border-borderMain">
            <h3 className="font-heading font-bold text-xl mb-6 pb-4 border-b border-borderMain">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal ({cart.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            
            <div className="flex justify-between text-xl font-bold pt-4 border-t border-borderMain mt-4 mb-8">
              <span>Total</span>
              <span className="text-secondary">${subtotal.toFixed(2)}</span>
            </div>
            
            <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={ordering}>
              {ordering ? 'Processing...' : 'Place Order'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
