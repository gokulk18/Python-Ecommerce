import React, { useState, useContext } from 'react';
import { X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './AuthModal.css';

const AuthModal = ({ onClose }) => {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        
        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
