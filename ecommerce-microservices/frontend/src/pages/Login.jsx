import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { login } from '../api/userApi';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const data = await login({ email, password });
      loginUser(data.access_token, data.user);
      
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect');
      navigate(redirect ? `/${redirect}` : '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex">
      {/* Left panel - brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-nexus-primary to-purple-900 border-r border-nexus-border items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-sora font-extrabold text-white mb-6 tracking-widest">NEXUS</h1>
          <p className="text-xl text-gray-200">Access the finest tech catalog in the galaxy.</p>
        </div>
      </div>
      
      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-nexus-bg">
        <div className="w-full max-w-md">
          {error && <Toast message={error} onClose={() => setError(null)} type="error" />}
          <h2 className="text-3xl font-sora font-bold text-white mb-8 text-center lg:text-left">Welcome Back</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label="Email Address" 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <Input 
                label="Password" 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <Button className="w-full py-3" type="submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-400">
            Don't have an account? <Link to="/register" className="text-nexus-primary hover:text-purple-400 font-medium">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
