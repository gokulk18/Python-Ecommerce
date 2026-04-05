import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Spinner } from '../components/Spinner';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Minus, Plus, ShoppingBag } from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productApi.getProduct(id);
        setProduct(res.data);
      } catch (err) {
        addToast('Failed to load product details', 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, addToast, navigate]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, qty);
    addToast(`Added ${qty}x ${product.name} to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="rounded-2xl overflow-hidden glass-effect aspect-square">
          <img 
            src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex flex-col py-6">
          <div className="mb-2">
            <Badge variant="primary">{product.category}</Badge>
          </div>
          <h1 className="text-4xl font-heading font-extrabold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-secondary mb-6">${product.price.toFixed(2)}</p>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-400 leading-relaxed">{product.description}</p>
          </div>

          <div className="mb-8">
            {product.stock > 0 ? (
              <p className="text-sm text-gray-300">
                <span className="text-secondary font-bold mr-1">{product.stock}</span> 
                items available in stock
              </p>
            ) : (
              <p className="text-sm text-red-500 font-bold">Out of stock</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <div className="flex items-center border border-borderMain rounded-lg bg-surface w-max">
              <button 
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="p-3 hover:bg-white/5 transition-colors disabled:opacity-50"
                disabled={product.stock === 0}
              >
                <Minus size={20} />
              </button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button 
                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                className="p-3 hover:bg-white/5 transition-colors disabled:opacity-50"
                disabled={product.stock === 0}
              >
                <Plus size={20} />
              </button>
            </div>
            
            <Button 
              size="lg" 
              className="flex-1 flex items-center justify-center gap-2 text-lg"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingBag size={24} />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
