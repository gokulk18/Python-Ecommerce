import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userApi } from '../api/userApi';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ShoppingBag } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const res = await userApi.login({ email, password });
      login(res.data);
      addToast('Welcome back!');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] bg-background">
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/30 rounded-full blur-[100px] z-0"></div>
        <div className="z-10 text-center">
          <ShoppingBag className="w-24 h-24 text-primary mx-auto mb-8" />
          <h1 className="text-5xl font-heading font-extrabold gradient-text mb-4">NEXUS STORE</h1>
          <p className="text-xl text-gray-300">The premier destination for future tech.</p>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 glass-effect p-10 rounded-2xl">
          <div>
            <h2 className="text-3xl font-heading font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to your account</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input 
              label="Email Address" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nexus.com"
            />
            <Input 
              label="Password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="text-center text-sm text-gray-400">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link>
          </div>

          <div className="text-center text-xs text-gray-500 pt-4 border-t border-borderMain">
            Admin Hint: admin@nexus.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
};
