import React, { useState, forwardRef } from 'react';
import styled, { css } from 'styled-components';
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
  height: 100%;
  
  ${props => props.viewMode === 'list' ? css`
    display: flex;
    flex-direction: row;
    align-items: stretch;
    
    &:hover {
      transform: translateX(5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    }
  ` : css`
    display: flex;
    flex-direction: column;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }
  `}
`;

const ProductImage = styled.div`
  ${props => props.viewMode === 'list' ? css`
    width: 200px;
    height: 150px;
    flex-shrink: 0;
  ` : css`
    height: 200px;
    width: 100%;
  `}
  
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: ${props => props.viewMode === 'list' ? '130px' : '180px'};
    object-fit: contain;
  }
`;

const ProductInfo = styled.div`
  ${props => props.viewMode === 'list' ? css`
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  ` : css`
    padding: 1.5rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  `}
`;

const ProductHeader = styled.div`
  ${props => props.viewMode === 'list' && css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  `}
`;

const ProductName = styled.h3`
  font-size: ${props => props.viewMode === 'list' ? '1.3rem' : '1.2rem'};
  margin-bottom: 0.5rem;
  color: #2c3e50;
  line-height: 1.3;
  
  ${props => props.viewMode === 'list' && css`
    margin-bottom: 0;
    flex: 1;
    margin-right: 1rem;
  `}
`;

const ProductPrice = styled.div`
  font-size: ${props => props.viewMode === 'list' ? '1.5rem' : '1.4rem'};
  font-weight: bold;
  color: #2980b9;
  
  ${props => props.viewMode === 'list' ? css`
    margin-bottom: 0;
    white-space: nowrap;
  ` : css`
    margin-bottom: 1rem;
  `}
`;

const ProductBrand = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: ${props => props.viewMode === 'list' ? '0.5rem' : '1rem'};
`;

const ProductFeatures = styled.div`
  ${props => props.viewMode === 'list' ? css`
    margin-bottom: 1rem;
    flex: 1;
  ` : css`
    margin-bottom: 1rem;
    flex-grow: 1;
  `}
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
  
  ${props => props.viewMode === 'list' && css`
    margin-top: 0;
    align-self: flex-end;
    width: fit-content;
  `}
`;

const ViewButton = styled(Link)`
  display: inline-block;
  padding: ${props => props.viewMode === 'list' ? '0.7rem 1.5rem' : '0.6rem 1.2rem'};
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
  text-align: center;
  white-space: nowrap;
  
  ${props => props.viewMode === 'list' ? css`
    flex-shrink: 0;
  ` : css`
    flex: 1;
  `}
  
  &:hover {
    background-color: #2980b9;
  }
`;

const CartButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${props => props.viewMode === 'list' ? '0.7rem 1.5rem' : '0.6rem 1rem'};
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  
  ${props => props.viewMode === 'list' ? css`
    flex-shrink: 0;
  ` : css`
    flex: 1;
  `}
  
  &:hover {
    background-color: #218838;
  }
`;

const ListContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const ListBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
`;

const ProductCard = forwardRef(({ product, className, viewMode = 'grid', ...props }, ref) => {
  const { dispatch } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Generate placeholder image based on product name if no image is provided
  const placeholderImage = `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`;
  
  // Extract the first 3 features for display
  const displayFeatures = product.features && Array.isArray(product.features) 
    ? product.features.slice(0, viewMode === 'list' ? 2 : 3) 
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
      id: product.id || productId,
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

  if (viewMode === 'list') {
    return (
      <div ref={ref} className={`product-card ${className || ''}`}>
        <Card viewMode={viewMode}>
          <ProductImage viewMode={viewMode}>
            <img 
              src={product.image || placeholderImage} 
              alt={product.name} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = placeholderImage;
              }}
            />
          </ProductImage>
          <ProductInfo viewMode={viewMode}>
            <ListContent>
              <div>
                <ProductHeader viewMode={viewMode}>
                  <ProductName viewMode={viewMode}>{product.name}</ProductName>
                  <ProductPrice viewMode={viewMode}>{product.price || '$N/A'}</ProductPrice>
                </ProductHeader>
                <ProductBrand viewMode={viewMode}>{product.brand || 'Generic Brand'}</ProductBrand>
                <ProductFeatures viewMode={viewMode}>
                  {displayFeatures.map((feature, index) => (
                    <Feature key={index}>{feature}</Feature>
                  ))}
                </ProductFeatures>
              </div>
              <ButtonContainer viewMode={viewMode}>
                <ViewButton to={`/product/${productId}`} viewMode={viewMode}>
                  View Details
                </ViewButton>
                <CartButton onClick={handleAddToCart} viewMode={viewMode}>
                  <FaShoppingCart size={14} />
                  Add to Cart
                </CartButton>
              </ButtonContainer>
            </ListContent>
          </ProductInfo>
        </Card>
        
        {showSuccess && (
          <SuccessToast message={`Added ${product.name} to cart!`} />
        )}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div ref={ref} className={`product-card ${className || ''}`}>
      <Card viewMode={viewMode}>
        <ProductImage viewMode={viewMode}>
          <img 
            src={product.image || placeholderImage} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholderImage;
            }}
          />
        </ProductImage>
        <ProductInfo viewMode={viewMode}>
          <ProductName viewMode={viewMode}>{product.name}</ProductName>
          <ProductBrand viewMode={viewMode}>{product.brand || 'Generic Brand'}</ProductBrand>
          <ProductPrice viewMode={viewMode}>{product.price || '$N/A'}</ProductPrice>
          
          <ProductFeatures viewMode={viewMode}>
            {displayFeatures.map((feature, index) => (
              <Feature key={index}>{feature}</Feature>
            ))}
          </ProductFeatures>
          
          <ButtonContainer viewMode={viewMode}>
            <ViewButton to={`/product/${productId}`} viewMode={viewMode}>
              View Details
            </ViewButton>
            <CartButton onClick={handleAddToCart} viewMode={viewMode}>
              <FaShoppingCart size={14} />
              Add to Cart
            </CartButton>
          </ButtonContainer>
        </ProductInfo>
      </Card>
      
      {showSuccess && (
        <SuccessToast message={`Added ${product.name} to cart!`} />
      )}
    </div>
  );
});

export default ProductCard;