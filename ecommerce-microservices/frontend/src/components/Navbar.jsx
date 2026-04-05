import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, ShieldAlert } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-borderMain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-heading font-bold gradient-text">
              NEXUS STORE
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-textMain hover:text-primary transition-colors">Home</Link>
            <Link to="/products" className="text-textMain hover:text-primary transition-colors">Products</Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/cart" className="relative text-textMain hover:text-primary transition-colors">
              <ShoppingCart size={24} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.is_admin && (
                  <Link to="/admin" className="flex items-center text-secondary hover:text-teal-400 transition-colors tooltip" title="Admin Dashboard">
                    <ShieldAlert size={20} className="mr-1" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <Link to="/orders" className="text-textMain hover:text-primary transition-colors">Orders</Link>
                <Link to="/profile" className="text-textMain hover:text-primary transition-colors">
                  <User size={24} />
                </Link>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-400 transition-colors">
                  <LogOut size={24} />
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-textMain hover:text-primary transition-colors font-medium">Login</Link>
                <Link to="/register" className="bg-primary hover:bg-purple-600 text-white px-4 py-1.5 rounded-lg font-medium transition-colors">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
