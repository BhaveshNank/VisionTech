import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { fetchProductById, fetchProductByName } from '../utils/api';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const BreadcrumbNav = styled.div`
  margin-bottom: 2rem;
  
  a {
    color: #3498db;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  span {
    color: #7f8c8d;
    margin: 0 0.5rem;
  }
`;

const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductImage = styled.div`
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border-radius: 8px;
  
  img {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
  }
`;

const ProductInfo = styled.div``;

const ProductName = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const ProductBrand = styled.div`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 1.5rem;
`;

const ProductPrice = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #2980b9;
  margin-bottom: 2rem;
`;

const ProductDescription = styled.p`
  font-size: 1.1rem;
  color: #34495e;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const FeaturesTitle = styled.h2`
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.5rem;
`;

const FeaturesList = styled.ul`
  padding-left: 1.5rem;
  margin-bottom: 2rem;
`;

const FeatureItem = styled.li`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #34495e;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.8rem 1.5rem;
  background-color: #28a745;
  color: white;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 2rem;
  
  &:hover {
    background-color: #218838;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fff3f3;
  border-left: 4px solid #ff6b6b;
  padding: 1.5rem;
  border-radius: 4px;
  margin: 2rem 0;
  
  h2 {
    color: #e74c3c;
    margin-bottom: 0.5rem;
  }
`;

const ProductDetailPage = (props) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dispatch } = useCart();
  
  // Success message state
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      try {
        // Get ID from useParams hook, not props.match.params
        console.log("Looking up product with ID:", id);
        
        // Try to fetch by ID first
        let data = await fetchProductById(id);
        
        // If that fails, try by name (using the ID as a name)
        if (!data) {
          console.log("No product found by ID, trying by name:", id);
          // Extract name part (remove any numeric prefix)
          const nameParam = id.replace(/^\d+-/, '').replace(/-/g, ' ');
          data = await fetchProductByName(nameParam);
        }
        
        if (data) {
          console.log("Product successfully retrieved:", data);
          setProduct(data);
          setError(null);
        } else {
          console.error("Product not found by ID or name");
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [id]); // Remove props.fallbackName from dependencies since we're not using it

  // Function to handle adding product to cart
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
    
    // Show success message
    setShowSuccess(true);
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Generate breadcrumb category name
  const getCategoryName = () => {
    if (!product) return '';
    
    switch(product.category) {
      case 'phone': return 'Phones';
      case 'laptop': return 'Laptops';
      case 'tv': return 'TVs';
      default: return 'Products';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ 
            display: 'inline-block',
            width: '50px',
            height: '50px',
            border: '3px solid rgba(0,0,0,0.1)',
            borderRadius: '50%',
            borderTopColor: '#1a73e8',
            animation: 'spin 1s ease-in-out infinite',
          }}></div>
          <p>Loading product details...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !product) {
    return (
      <PageContainer>
        <BreadcrumbNav>
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/products">Products</Link>
        </BreadcrumbNav>
        
        <ErrorMessage>
          <h2>Product Not Found</h2>
          <p>Sorry, we couldn't find the product you're looking for.</p>
          <Link to="/products" style={{ color: '#3498db', textDecoration: 'none' }}>
            Browse all products
          </Link>
        </ErrorMessage>
      </PageContainer>
    );
  }

  // Generate placeholder image based on product name if no image is provided
  const productImage = product.image || 
    `https://via.placeholder.com/500x400?text=${encodeURIComponent(product.name)}`;

  return (
    <PageContainer>
      <BreadcrumbNav>
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/products">Products</Link>
        <span>›</span>
        <Link to={`/products?category=${product.category}`}>{getCategoryName()}</Link>
        <span>›</span>
        <span>{product.name}</span>
      </BreadcrumbNav>
      
      <ProductLayout>
        <ProductImage>
          <img 
            src={productImage} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = `https://via.placeholder.com/500x400?text=${encodeURIComponent(product.name)}`;
            }}
          />
        </ProductImage>
        
        <ProductInfo>
          <ProductName>{product.name}</ProductName>
          <ProductBrand>{product.brand || 'Generic Brand'}</ProductBrand>
          <ProductPrice>{product.price || '$N/A'}</ProductPrice>
          
          <ProductDescription>
            Experience cutting-edge technology with the {product.name}, designed for 
            optimal performance and user satisfaction.
          </ProductDescription>
          
          <FeaturesTitle>Key Features</FeaturesTitle>
          <FeaturesList>
            {product.features && product.features.map((feature, index) => (
              <FeatureItem key={index}>{feature}</FeatureItem>
            ))}
          </FeaturesList>
          
          <Button onClick={handleAddToCart}>
            <FaShoppingCart /> Add to Cart
          </Button>
          
          {showSuccess && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              Added to cart successfully!
            </div>
          )}
        </ProductInfo>
      </ProductLayout>
    </PageContainer>
  );
};

export default ProductDetailPage;