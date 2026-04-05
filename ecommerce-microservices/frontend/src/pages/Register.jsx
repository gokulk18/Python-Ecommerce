import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { register } from '../api/userApi';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const data = await register({ name, email, password });
      loginUser(data.access_token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex">
      {/* Left panel - brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-nexus-secondary to-blue-900 border-r border-nexus-border items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center">
           <h1 className="text-6xl font-sora font-extrabold text-white mb-6">JOIN NEXUS</h1>
          <p className="text-xl text-gray-200">The destination for modern technology.</p>
        </div>
      </div>
      
      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-nexus-bg">
        <div className="w-full max-w-md">
          {error && <Toast message={error} onClose={() => setError(null)} type="error" />}
          <h2 className="text-3xl font-sora font-bold text-white mb-8 text-center lg:text-left">Create Account</h2>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <Input 
              label="Full Name" 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
            
            <Button className="w-full py-3 hover:shadow-[0_0_15px_rgba(0,212,170,0.6)] bg-gradient-to-r from-teal-500 to-nexus-secondary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up'}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-nexus-secondary hover:text-teal-400 font-medium">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
