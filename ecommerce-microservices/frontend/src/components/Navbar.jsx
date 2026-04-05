import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Package, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Badge from './Badge';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-nexus-bg/80 backdrop-blur-md border-b border-nexus-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-sora font-extrabold text-white tracking-widest text-gradient">
              NEXUS
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium transition-colors">Home</Link>
              <Link to="/products" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium transition-colors">Products</Link>
              {user && <Link to="/orders" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium transition-colors">Orders</Link>}
              {user && user.email === 'admin@nexus.test' && <Link to="/admin" className="text-nexus-primary hover:text-white px-3 py-2 rounded-md font-medium transition-colors">Admin</Link>}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/cart" className="text-gray-300 hover:text-nexus-secondary transition-colors relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-nexus-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-gray-300 hover:text-nexus-secondary transition-colors">
                  <User className="w-6 h-6" />
                </Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
