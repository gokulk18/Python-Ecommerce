import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';
import { getProduct } from '../api/productApi';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="h-screen"><Spinner /></div>;
  if (!product) return <div className="text-center py-20 text-white text-xl">Product not found</div>;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setToast('Added to cart successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-[fadeIn_0.3s_ease-out]">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-w-1 aspect-h-1 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(108,99,255,0.15)] border border-nexus-border bg-gradient-to-tr from-gray-900 to-gray-800">
           <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-90" />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <div className="mb-4">
            <Badge color="purple" className="mb-4 inline-block">{product.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-sora font-bold text-white mb-4 leading-tight">{product.name}</h1>
            <div className="text-3xl font-bold text-nexus-secondary mb-6">${product.price.toFixed(2)}</div>
          </div>
          
          <div className="bg-nexus-card border border-nexus-border rounded-xl p-6 mb-8">
            <p className="text-gray-300 leading-relaxed text-lg">{product.description}</p>
          </div>

          <div className="flex items-center space-x-6 mb-8">
            <div className="flex items-center border border-nexus-border rounded-md bg-nexus-card">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-colors"
                disabled={quantity <= 1}
              >-</button>
              <span className="px-6 py-3 font-semibold text-white">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-colors"
                disabled={quantity >= product.stock}
              >+</button>
            </div>
            
            <div className="text-sm">
              {product.stock > 0 ? (
                <span className="text-nexus-secondary">{product.stock} in stock</span>
              ) : (
                <span className="text-red-500">Out of stock</span>
              )}
            </div>
          </div>

          <Button 
            className="w-full md:w-auto py-4 text-lg hidden md:flex" 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-5 h-5 mr-3" /> Add to Cart
          </Button>

           <Button 
            className="w-full py-4 text-lg md:hidden" 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-5 h-5 mr-3" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
