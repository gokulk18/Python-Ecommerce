import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { getProducts } from '../api/productApi';
import { Cpu, Gamepad2, Headphones, Watch } from 'lucide-react';

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    getProducts({ limit: 3 }).then(setFeatured).catch(console.error);
  }, []);

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      {/* Hero Section */}
      <div className="hero-bg min-h-[80vh] flex items-center border-b border-nexus-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-nexus-bg"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <h1 className="text-5xl md:text-7xl font-sora font-extrabold mb-6 tracking-tight">
            SHOP THE <span className="text-gradient">FUTURE</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Experience next-generation technology, curated for the elite. The future is available today at Nexus Store.
          </p>
          <div className="flex justify-center flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/products">
              <Button className="w-full sm:w-auto px-8 py-4 text-lg">Shop Now</Button>
            </Link>
            <Link to="/products">
              <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 text-lg">View Categories</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-nexus-border bg-nexus-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-wrap justify-around items-center text-center">
          <div>
            <div className="text-4xl font-sora font-bold text-white mb-2">10K+</div>
            <div className="text-sm text-nexus-secondary tracking-widest uppercase">Products</div>
          </div>
          <div>
            <div className="text-4xl font-sora font-bold text-white mb-2">50K+</div>
            <div className="text-sm text-nexus-secondary tracking-widest uppercase">Customers</div>
          </div>
          <div>
            <div className="text-4xl font-sora font-bold text-white mb-2">99.9%</div>
            <div className="text-sm text-nexus-secondary tracking-widest uppercase">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-nexus-border">
        <h2 className="text-3xl font-sora font-bold text-white mb-10 text-center">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="text-center p-8 hover:border-nexus-secondary cursor-pointer">
            <Cpu className="w-12 h-12 mx-auto text-nexus-primary mb-4" />
            <h3 className="font-semibold text-lg text-white">Computing</h3>
          </Card>
          <Card className="text-center p-8 hover:border-nexus-secondary cursor-pointer">
            <Gamepad2 className="w-12 h-12 mx-auto text-nexus-primary mb-4" />
            <h3 className="font-semibold text-lg text-white">Gaming</h3>
          </Card>
          <Card className="text-center p-8 hover:border-nexus-secondary cursor-pointer">
            <Headphones className="w-12 h-12 mx-auto text-nexus-primary mb-4" />
            <h3 className="font-semibold text-lg text-white">Audio</h3>
          </Card>
          <Card className="text-center p-8 hover:border-nexus-secondary cursor-pointer">
            <Watch className="w-12 h-12 mx-auto text-nexus-primary mb-4" />
            <h3 className="font-semibold text-lg text-white">Wearables</h3>
          </Card>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-sora font-bold text-white">Featured Drops</h2>
          <Link to="/products" className="text-nexus-primary hover:text-purple-400 font-medium">View All &rarr;</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map(product => (
            <Link to={`/products/${product.id}`} key={product.id}>
              <Card className="h-full group">
                <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gradient-to-tr from-gray-800 to-gray-700 h-48 relative">
                  <img src={product.image_url} alt={product.name} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity mix-blend-overlay mix-blend-normal" />
                  <div className="absolute inset-0 bg-gradient-to-t from-nexus-card to-transparent opacity-60"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-sora font-semibold text-white mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-nexus-secondary">${product.price.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
