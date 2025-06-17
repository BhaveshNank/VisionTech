import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById, fetchProductByName } from '../utils/api';
import { useCart } from '../context/CartContext';
import eventSystem from '../utils/events';
import { 
  FaShoppingCart, 
  FaArrowLeft, 
  FaLock, 
  FaTruck, 
  FaUndo, 
  FaCheck, 
  FaStar
} from 'react-icons/fa';

// Import shadcn/ui components
import { Button } from '../components/UI/button.jsx';
import { Badge } from '../components/UI/badge.jsx';
import { Alert, AlertDescription } from '../components/UI/alert.jsx';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/UI/breadcrumb.jsx';


















const ProductDetailPage = () => {
  const { idOrName } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dispatch } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const id = decodeURIComponent(idOrName);
  
  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.group(`🔍 Debug - ProductDetailPage Getting Product: ${id}`);
        
        let data = await fetchProductById(id);
        console.log("ID lookup result:", data ? "Found" : "Not found");
        
        if (!data && id.includes('-')) {
          const nameParam = id.replace(/^\d+-/, '').replace(/-/g, ' ');
          console.log("Trying name lookup:", nameParam);
          
          try {
            data = await fetchProductByName(nameParam);
            console.log("Name lookup result:", data ? "Found" : "Not found");
          } catch (nameErr) {
            console.error("Name lookup failed:", nameErr);
          }
        }
        
        if (data) {
          console.log("✅ Product successfully retrieved:", data.name);
          setProduct(data);
          setError(null);
        } else {
          const rawName = id.replace(/^\d+-/, '')
                           .replace(/-/g, ' ')
                           .replace(/(-phone|-laptop|-tv)$/, '');
          
          console.log("Attempting last-resort lookup with:", rawName);
          try {
            data = await fetchProductByName(rawName);
            if (data) {
              console.log("✅ Last-resort lookup succeeded:", data.name);
              setProduct(data);
              setError(null);
            } else {
              console.error("❌ All lookup methods failed");
              setError(`Product not found: ${id}`);
            }
          } catch (err) {
            console.error("Last-resort lookup failed:", err);
            setError(`Product not found: ${id}`);
          }
        }
        
        console.groupEnd();
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(`Failed to load product details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    if (id) {
      getProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const productImage = product.image || `https://via.placeholder.com/500x400?text=${encodeURIComponent(product.name)}`;
    
    const cartItem = {
      id: product.id || id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      image: productImage,
      quantity: 1
    };
    
    dispatch({
      type: "ADD_TO_CART",
      payload: cartItem
    });
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleEnquire = () => {
    // Emit event to open chatbot
    eventSystem.emit('openChat');
  };

  const getCategoryName = () => {
    if (!product) return '';
    
    switch(product.category) {
      case 'phone': return 'Smartphones';
      case 'laptop': return 'Laptops';
      case 'tv': return 'TVs & Displays';
      case 'gaming': return 'Gaming';
      case 'audio': return 'Audio';
      default: return 'Technology';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mb-4 opacity-50"></div>
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="py-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">Products</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto flex items-center justify-center">
                <FaArrowLeft className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Product Not Found</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We couldn't find the product you're looking for. It may have been moved or is no longer available.
                </p>
              </div>
              <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white rounded-xl">
                <Link to="/products">
                  Browse All Products
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const productImage = product.image || 
    `https://via.placeholder.com/500x400?text=${encodeURIComponent(product.name)}`;

  const formatPrice = (price) => {
    if (typeof price === 'string' && price.startsWith('$')) {
      return price;
    }
    if (typeof price === 'number') {
      return `$${price.toLocaleString()}`;
    }
    return price || '$N/A';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">Products</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/products?category=${product.category}`} className="text-muted-foreground hover:text-foreground transition-colors">{getCategoryName()}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {/* Product Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div className="lg:sticky lg:top-24">
            <div className="relative group">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/500x400?text=${encodeURIComponent(product.name)}`;
                  }}
                />
              </div>
              {/* Image overlay gradient for elegance */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-xl pointer-events-none"></div>
            </div>
          </div>
          
          {/* Product Information */}
          <div className="space-y-6">
            {/* Header Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                  {getCategoryName()}
                </Badge>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="h-3 w-3 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    4.8 (1,247 reviews)
                  </span>
                </div>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2 leading-tight">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground font-medium uppercase tracking-wider">
                  {product.brand || 'Premium Technology'}
                </p>
              </div>
            </div>
            
            {/* Price Section */}
            <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <span className="text-base text-muted-foreground line-through">
                  {/* Could add original price here if available */}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FaTruck className="h-2 w-2" />
                  Free shipping
                </span>
                <span>•</span>
                <span>AppleCare+ available</span>
                <span>•</span>
                <span>Trade-in credit up to $800</span>
              </div>
            </div>
            
            {/* Product Description */}
            <div className="prose prose-gray max-w-none">
              <p className="text-base leading-relaxed text-gray-700">
                {product.description || 
                  `Experience the future with the ${product.name}. Engineered with precision and designed for those who demand excellence. Every detail has been carefully crafted to deliver an unparalleled user experience.`
                }
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-4 pt-3">
              <div className="flex gap-3">
                <Button 
                  size="lg" 
                  className="flex-1 h-12 text-base font-semibold bg-black hover:bg-gray-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5" 
                  onClick={handleAddToCart}
                >
                  <FaShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                
                <Button 
                  size="lg"
                  onClick={handleEnquire}
                  className="flex-1 h-12 text-base font-semibold bg-black hover:bg-gray-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Enquire
                </Button>
              </div>
              
              {/* Accepted Cards */}
              <div className="flex justify-start py-6">
                <img 
                  src="/images/cards.jpg" 
                  alt="Accepted payment cards" 
                  className="h-28 w-auto object-contain"
                />
              </div>
              
              {showSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <FaCheck className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">
                    Successfully added to your cart!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
        
        {/* Additional Product Information */}
        <div className="space-y-8">
          {/* Technical Specifications */}
          {(product.specifications || product.features) && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Technical Specifications</h2>
                <p className="text-muted-foreground mt-1 text-sm">Detailed product features and specifications</p>
              </div>
              <div className="p-6">
                <div className="grid gap-3">
                  {(product.specifications || product.features || []).map((spec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 leading-relaxed text-sm">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Trust & Service Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Why Choose Us</h2>
              <p className="text-muted-foreground mt-1 text-sm">Premium service and peace of mind with every purchase</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-200">
                    <FaLock className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">Secure Checkout</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">Bank-level security with 256-bit SSL encryption for safe transactions</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-200">
                    <FaTruck className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">Free Express Shipping</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">Complimentary express delivery on all orders with tracking included</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-200">
                    <FaUndo className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">30-Day Returns</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">Hassle-free returns and exchanges with full refund guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;