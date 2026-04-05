import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Menu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <nav className="navbar glass">
        <div className="navbar-container flex-between">
          <Link to="/" className="brand">
            <ShoppingCart className="brand-icon" />
            <span className="text-gradient">NexMart</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/" className="nav-link">Products</Link>
            {user && <Link to="/orders" className="nav-link">My Orders</Link>}
            
            {user ? (
              <div className="user-menu">
                <button className="btn btn-secondary sm" onClick={logout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
                <User size={18} /> Login
              </button>
            )}
          </div>
        </div>
      </nav>
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </>
  );
};

export default Navbar;
