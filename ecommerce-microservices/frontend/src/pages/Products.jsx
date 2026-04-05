import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import { getProducts } from '../api/productApi';
import { Search } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ category: category || undefined });
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const categories = ["Laptops", "Gaming", "Wearables", "Audio", "Accessories", "Phones", "Displays", "Networking", "Furniture"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-[fadeIn_0.5s_ease-out]">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full bg-nexus-card border border-nexus-border text-nexus-text rounded-full pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-nexus-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <Card className="p-6 sticky top-24">
            <h3 className="text-lg font-sora font-semibold text-white mb-4 border-b border-nexus-border pb-2">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setCategory('')} 
                  className={`w-full text-left px-2 py-1 rounded transition-colors ${category === '' ? 'bg-nexus-primary/20 text-nexus-primary' : 'text-gray-400 hover:text-white'}`}
                >
                  All Products
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-2 py-1 rounded transition-colors ${category === cat ? 'bg-nexus-primary/20 text-nexus-primary' : 'text-gray-400 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Product Grid */}
        <div className="flex-grow">
          {loading ? (
            <div className="h-64"><Spinner /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-sora text-gray-500">No products found.</h2>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Link to={`/products/${product.id}`} key={product.id}>
                  <Card className="h-full flex flex-col group">
                    <div className="h-48 bg-gradient-to-tr from-gray-900 to-gray-800 relative overflow-hidden">
                      <img src={product.image_url} alt={product.name} className="object-cover w-full h-full opacity-70 group-hover:opacity-100 transition-opacity" />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-red-500 font-bold bg-nexus-card px-4 py-1 rounded">OUT OF STOCK</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-sora font-semibold text-white truncate w-48" title={product.name}>{product.name}</h3>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-grow">{product.description}</p>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-xl font-bold text-nexus-secondary">${product.price.toFixed(2)}</span>
                        {product.stock > 0 ? (
                           <Badge color="teal">{product.stock} in stock</Badge>
                        ) : (
                           <Badge color="red">0 in stock</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
