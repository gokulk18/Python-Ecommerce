import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react';

export const Home = () => {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center isolate">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 -left-20 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 tracking-tight">
            SHOP THE <span className="gradient-text">FUTURE</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
            Discover a curated collection of next-generation gadgets, tools, and digital apparel. Welcome to the Nexus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products">
              <Button size="lg" className="px-8 py-4 text-lg">Shop Now <ArrowRight className="inline ml-2" size={20}/></Button>
            </Link>
            <Link to="/products?category=Electronics">
              <Button variant="secondary" size="lg" className="px-8 py-4 text-lg">View Electronics</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="border-y border-borderMain bg-white/5 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-borderMain">
          <div className="flex flex-col items-center p-4">
            <Zap className="text-primary w-12 h-12 mb-4" />
            <h3 className="text-xl font-heading font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Quantum delivery system ensures your items arrive instantly.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Shield className="text-primary w-12 h-12 mb-4" />
            <h3 className="text-xl font-heading font-semibold mb-2">Secure Beyond measure</h3>
            <p className="text-gray-400">Military-grade encryption protects your digital assets.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Globe className="text-primary w-12 h-12 mb-4" />
            <h3 className="text-xl font-heading font-semibold mb-2">Global Network</h3>
            <p className="text-gray-400">Access the Nexus from anywhere in the solar system.</p>
          </div>
        </div>
      </section>
      
      {/* Animated Stats Bar */}
      <section className="py-20 bg-background text-center">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">10K+</div>
              <div className="text-sm text-gray-400 uppercase tracking-widest">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">50K+</div>
              <div className="text-sm text-gray-400 uppercase tracking-widest">Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">99%</div>
              <div className="text-sm text-gray-400 uppercase tracking-widest">Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
              <div className="text-sm text-gray-400 uppercase tracking-widest">Support</div>
            </div>
        </div>
      </section>

    </div>
  );
};
