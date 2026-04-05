import React, { useEffect, useState, useContext } from 'react';
import { ShoppingBag } from 'lucide-react';
import { productApi, orderApi } from '../api';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    productApi.get('/products')
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (product) => {
    if (!user) {
      alert("Please login first to buy products");
      return;
    }
    setPurchasing(product.id);
    try {
      await orderApi.post('/orders', {
        product_id: product.id,
        quantity: 1
      });
      alert(`Successfully ordered ${product.name}! Check 'My Orders'.`);
    } catch (error) {
      alert(error.response?.data?.detail || "Error placing order");
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) return <div className="loading flex-center">Loading products...</div>;

  return (
    <div className="home fade-in">
      <div className="hero">
        <h1 className="hero-title text-gradient">Discover Next-Gen Products</h1>
        <p className="hero-subtitle">Premium quality items with cutting edge technology.</p>
      </div>

      <div className="grid-container">
        {products.map(product => (
          <div key={product.id} className="product-card glass">
            <div className="product-image-placeholder flex-center">
              <ShoppingBag size={48} opacity={0.5} />
            </div>
            <div className="product-details">
              <h3>{product.name}</h3>
              <p className="product-desc">{product.description}</p>
              <div className="flex-between">
                <span className="price">${product.price.toFixed(2)}</span>
                <button 
                  className="btn btn-primary btn-buy"
                  onClick={() => handleBuy(product)}
                  disabled={purchasing === product.id}
                >
                  {purchasing === product.id ? 'Ordering...' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div style={{gridColumn: "1 / -1", textAlign: "center", padding: "3rem"}}>
            No products found. Start adding some to the database!
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
