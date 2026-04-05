import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Input, Select } from '../components/Input';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Search } from 'lucide-react';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProducts({ category, search, limit: 50 });
        // Client side search for simplicity since backend doesn't implement regex search by default
        let data = res.data;
        if (search) {
          data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
        }
        setProducts(data);
      } catch (err) {
        addToast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, search, addToast]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const q = formData.get('search');
    if (q) searchParams.set('search', q);
    else searchParams.delete('search');
    setSearchParams(searchParams);
  };

  const handleCategoryFilter = (cat) => {
    if (cat) searchParams.set('category', cat);
    else searchParams.delete('category');
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-heading font-bold">All Products</h1>
        <form onSubmit={handleSearch} className="flex w-full md:w-auto relative">
          <Input 
            name="search"
            placeholder="Search products..." 
            defaultValue={search}
            className="w-full md:w-80 pr-10"
          />
          <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-white">
            <Search size={20} />
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card className="p-4 border-borderMain">
            <h3 className="font-heading font-semibold mb-4 text-lg border-b border-borderMain pb-2">Filters</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
              <Select 
                value={category} 
                onChange={(e) => handleCategoryFilter(e.target.value)}
                options={[
                  { label: 'All Categories', value: '' },
                  { label: 'Electronics', value: 'Electronics' },
                  { label: 'Wearables', value: 'Wearables' },
                  { label: 'Furniture', value: 'Furniture' },
                  { label: 'Smart Home', value: 'Smart Home' },
                ]}
              />
            </div>
          </Card>
        </div>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl font-heading mb-2">No products found</p>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="flex flex-col h-full bg-surface border-borderMain">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square bg-white/5 relative overflow-hidden">
                      <img 
                        src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-2 right-2">
                        {product.stock > 0 ? (
                          <Badge variant="success">In Stock ({product.stock})</Badge>
                        ) : (
                          <Badge variant="danger">Out of Stock</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/products/${product.id}`} className="hover:text-primary transition-colors">
                        <h3 className="font-heading font-semibold text-lg line-clamp-1">{product.name}</h3>
                      </Link>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-bold text-secondary">${product.price.toFixed(2)}</span>
                      <Button 
                        onClick={() => {
                          addToCart(product);
                          addToast(`Added ${product.name} to cart`);
                        }}
                        disabled={product.stock <= 0}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
