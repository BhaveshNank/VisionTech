import React, { useState, forwardRef } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';
import SuccessToast from '../UI/SuccessToast';
import { generateConsistentProductId } from '../../utils/api';

const Card = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 180px;
    object-fit: contain;
  }
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
`;

const ProductPrice = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  color: #2980b9;
  margin-bottom: 1rem;
`;

const ProductBrand = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
`;

const ProductFeatures = styled.div`
  margin-bottom: 1rem;
  flex-grow: 1;
`;

const Feature = styled.div`
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.25rem;
  
  &:before {
    content: "• ";
    color: #1a73e8;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const ViewButton = styled(Link)`
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
  text-align: center;
  flex: 1;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const CartButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.6rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;
  
  &:hover {
    background-color: #218838;
  }
`;

const ProductCard = forwardRef(({ product, className, ...props }, ref) => {
  const { dispatch } = useCart();
  // Add state for success message
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Generate placeholder image based on product name if no image is provided
  const placeholderImage = `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`;
  
  // Extract the first 3 features for display
  const displayFeatures = product.features && Array.isArray(product.features) 
    ? product.features.slice(0, 3) 
    : [];
    
  // Use the consistent product ID generator
  const productId = generateConsistentProductId(product);
  
  // Function to handle adding product to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    const productImage = product.image || `https://via.placeholder.com/500x400?text=${encodeURIComponent(product.name)}`;
    
    // Parse price to ensure it's a clean number
    const parsedPrice = typeof product.price === 'string' 
      ? parseFloat(product.price.replace(/[^0-9.-]+/g, '')) 
      : parseFloat(product.price) || 0;
    
      const cartItem = {
        id: product.id || productId, // Use the productId you generated earlier
        name: product.name,
        price: parsedPrice,
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

  return (
    <div ref={ref} className={`product-card ${className || ''}`}>
      <Card>
        <ProductImage>
          <img 
            src={product.image || placeholderImage} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = placeholderImage;
            }}
          />
        </ProductImage>
        <ProductInfo>
          <ProductName>{product.name}</ProductName>
          <ProductBrand>{product.brand || 'Generic Brand'}</ProductBrand>
          <ProductPrice>{product.price || '$N/A'}</ProductPrice>
          
          <ProductFeatures>
            {displayFeatures.map((feature, index) => (
              <Feature key={index}>{feature}</Feature>
            ))}
          </ProductFeatures>
          
          <ButtonContainer>
            <ViewButton to={`/product/${productId}`}>View Details</ViewButton>
            <CartButton onClick={handleAddToCart}>
              <FaShoppingCart size={14} />
              Add to Cart
            </CartButton>
          </ButtonContainer>
        </ProductInfo>
      </Card>
      
      {/* Add the success toast */}
      {showSuccess && (
        <SuccessToast message={`Added ${product.name} to cart!`} />
      )}
    </div>
  );
});
  

export default ProductCard;