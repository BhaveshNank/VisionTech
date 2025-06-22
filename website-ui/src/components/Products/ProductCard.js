import React, { useState, forwardRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FaShoppingCart, FaHeart, FaEye, FaStar } from 'react-icons/fa';
import SuccessToast from '../UI/SuccessToast';
import { generateConsistentProductId } from '../../utils/api';
import { getProductImageUrl } from '../../utils/imageUtils';

// Refined animations for Samsung/OnePlus feel
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.98);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

// Simple clean card styling
const Card = styled.div`
  background: #ffffff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  height: 100%;
  position: relative;
  border: 1px solid #e0e0e0;
  
  ${props => props.viewMode === 'list' ? css`
    display: flex;
    flex-direction: row;
    align-items: stretch;
    min-height: 200px;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  ` : css`
    display: flex;
    flex-direction: column;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      
      .action-buttons {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `}
`;

// Clean product image styling
const ProductImage = styled.div`
  ${props => props.viewMode === 'list' ? css`
    width: 280px;
    height: 200px;
    flex-shrink: 0;
  ` : css`
    height: 260px;
    width: 100%;
  `}
  
  overflow: hidden;
  background: #fafbfc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  img {
    max-width: 80%;
    max-height: ${props => props.viewMode === 'list' ? '80%' : '75%'};
    object-fit: contain;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.06));
  }
  
  /* Clean quick actions */
  .quick-actions {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  /* Refined sale badge */
  .product-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: #ea4335;
    color: white;
    padding: 6px 14px;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(234, 67, 53, 0.25);
  }
`;

const QuickActionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #5f6368;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
  
  &:hover {
    background: #1a73e8;
    color: white;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
  }
`;

// Clean product info layout
const ProductInfo = styled.div`
  ${props => props.viewMode === 'list' ? css`
    padding: 28px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  ` : css`
    padding: 24px 20px 20px;
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
    margin-bottom: 16px;
  `}
`;

// Samsung-style brand display
const ProductBrand = styled.div`
  font-size: 0.875rem;
  color: #5f6368;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
`;

// Clean product name
const ProductName = styled.h3`
  font-size: ${props => props.viewMode === 'list' ? '1.25rem' : '1.1rem'};
  margin-bottom: 12px;
  color: #202124;
  line-height: 1.4;
  font-weight: 500;
  
  ${props => props.viewMode === 'list' && css`
    margin-bottom: 0;
    flex: 1;
    margin-right: 20px;
  `}
  
  /* Limit to 2 lines with ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// Samsung-style pricing
const ProductPrice = styled.div`
  font-size: ${props => props.viewMode === 'list' ? '1.5rem' : '1.3rem'};
  font-weight: 600;
  color: #202124;
  margin-bottom: 12px;
  
  ${props => props.viewMode === 'list' ? css`
    margin-bottom: 0;
    white-space: nowrap;
  ` : css`
    margin-bottom: 16px;
  `}
  
  .original-price {
    font-size: 0.875rem;
    color: #9aa0a6;
    text-decoration: line-through;
    font-weight: 400;
    margin-left: 8px;
  }
  
  .discount {
    background: #34a853;
    color: white;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 12px;
    margin-left: 8px;
    font-weight: 500;
  }
`;

// Clean features list
const ProductFeatures = styled.div`
  ${props => props.viewMode === 'list' ? css`
    margin-bottom: 20px;
    flex: 1;
  ` : css`
    margin-bottom: 20px;
    flex-grow: 1;
  `}
`;

const Feature = styled.div`
  font-size: 0.875rem;
  color: #5f6368;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  line-height: 1.4;
  
  &:before {
    content: "";
    width: 3px;
    height: 3px;
    background: #9aa0a6;
    border-radius: 50%;
    margin-right: 10px;
    flex-shrink: 0;
  }
`;

// Minimalist rating display
const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  
  .stars {
    display: flex;
    gap: 1px;
    
    svg {
      color: #fbbc04;
      font-size: 13px;
    }
  }
  
  .rating-text {
    font-size: 0.8rem;
    color: #5f6368;
    font-weight: 400;
  }
`;

// Clean button container
const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
  
  ${props => props.viewMode === 'list' && css`
    margin-top: 0;
    align-self: flex-end;
    width: fit-content;
  `}
  
  .action-buttons {
    display: flex;
    gap: 12px;
    width: 100%;
    opacity: ${props => props.viewMode === 'list' ? '1' : '0'};
    transform: ${props => props.viewMode === 'list' ? 'translateY(0)' : 'translateY(8px)'};
    transition: all 0.3s ease;
  }
`;

// Simple style buttons
const ViewButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${props => props.viewMode === 'list' ? '8px 16px' : '8px 12px'};
  background: transparent;
  color: #666;
  text-decoration: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: 400;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  text-align: center;
  white-space: nowrap;
  
  ${props => props.viewMode === 'list' ? css`
    flex-shrink: 0;
  ` : css`
    flex: 1;
  `}
  
  &:hover {
    background: #f5f5f5;
    border-color: #000;
    color: #000;
  }
`;

const CartButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${props => props.viewMode === 'list' ? '8px 16px' : '8px 12px'};
  background: #000;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 400;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  
  ${props => props.viewMode === 'list' ? css`
    flex-shrink: 0;
  ` : css`
    flex: 1;
  `}
  
  &:hover {
    background: #333;
  }
  
  &:disabled {
    background: #ccc;
    color: #666;
    cursor: not-allowed;
    
    &:hover {
      background: #ccc;
    }
  }
`;

// List view specific components
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
  gap: 20px;
`;

// Clean stock status
const StockStatus = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 12px;
  width: fit-content;
  
  ${props => props.inStock ? css`
    background: rgba(52, 168, 83, 0.1);
    color: #34a853;
  ` : css`
    background: rgba(234, 67, 53, 0.1);
    color: #ea4335;
  `}
`;

// Enhanced availability badge
const AvailabilityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${props => props.inStock ? '#34a853' : '#ea4335'};
  margin-bottom: 12px;
  
  &:before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => props.inStock ? '#34a853' : '#ea4335'};
  }
`;

const ProductCard = forwardRef(({ product, className, viewMode = 'grid', ...props }, ref) => {
  const { dispatch } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // Generate fallback image URL if no image is provided
  const fallbackImage = getProductImageUrl('default-product.jpg');
  
  // Extract the first 3-4 features for display
  const displayFeatures = product.features && Array.isArray(product.features) 
    ? product.features.slice(0, viewMode === 'list' ? 3 : 3) 
    : [];
    
  // ALWAYS use the ID provided by the backend API - never generate frontend IDs
  const productId = product.id || `fallback-${product.name?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  
  // Generate mock rating (in real app, this would come from data)
  const rating = 4.5;
  const reviewCount = Math.floor(Math.random() * 500) + 50;
  
  // Check if product is on sale (mock logic - more conservative)
  const isOnSale = Math.random() > 0.8;
  const originalPrice = isOnSale ? (parseFloat(product.price?.replace(/[^0-9.-]+/g, '')) * 1.15).toFixed(0) : null;
  const discount = isOnSale ? Math.floor(Math.random() * 20) + 10 : null;
  
  // Mock stock status - most products in stock
  const inStock = Math.random() > 0.05;
  
  // Function to handle adding product to cart
  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!product || !inStock) return;
    
    const productImage = product.image || fallbackImage;
    
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

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  if (viewMode === 'list') {
    return (
      <div ref={ref} className={`product-card ${className || ''}`}>
        <Card viewMode={viewMode}>
          <ProductImage viewMode={viewMode} className="product-image">
            <img 
              src={product.image || fallbackImage} 
              alt={product.name} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }}
            />
            {isOnSale && (
              <div className="product-badge">
                Sale
              </div>
            )}
          </ProductImage>
          <ProductInfo viewMode={viewMode}>
            <ListContent>
              <div>
                <ProductHeader viewMode={viewMode}>
                  <div>
                    <ProductBrand>{product.brand || 'Generic Brand'}</ProductBrand>
                    <ProductName viewMode={viewMode}>{product.name}</ProductName>
                  </div>
                  <ProductPrice viewMode={viewMode}>
                    {product.price || '$N/A'}
                    {isOnSale && (
                      <>
                        <span className="original-price">${originalPrice}</span>
                        <span className="discount">-{discount}%</span>
                      </>
                    )}
                  </ProductPrice>
                </ProductHeader>
                
                <ProductRating>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} style={{ opacity: i < Math.floor(rating) ? 1 : 0.3 }} />
                    ))}
                  </div>
                  <span className="rating-text">({reviewCount})</span>
                </ProductRating>
                
                <AvailabilityBadge inStock={inStock}>
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </AvailabilityBadge>
                
                <ProductFeatures viewMode={viewMode}>
                  {displayFeatures.map((feature, index) => (
                    <Feature key={index}>{feature}</Feature>
                  ))}
                </ProductFeatures>
              </div>
              <ButtonContainer viewMode={viewMode}>
                <div className="action-buttons">
                  <ViewButton to={`/product/${productId}`} viewMode={viewMode}>
                    <FaEye size={12} />
                    View Details
                  </ViewButton>
                  <CartButton 
                    onClick={handleAddToCart} 
                    viewMode={viewMode}
                    disabled={!inStock}
                  >
                    <FaShoppingCart size={12} />
                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                  </CartButton>
                </div>
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
        <ProductImage viewMode={viewMode} className="product-image">
          <img 
            src={product.image || fallbackImage} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }}
          />
          
          {/* Quick Actions for Grid View */}
          <div className="quick-actions">
            <QuickActionButton onClick={handleLike}>
              <FaHeart style={{ color: isLiked ? '#ea4335' : undefined }} />
            </QuickActionButton>
          </div>
          
          {/* Sale Badge */}
          {isOnSale && (
            <div className="product-badge">
              Sale
            </div>
          )}
        </ProductImage>
        
        <ProductInfo viewMode={viewMode}>
          <ProductBrand>{product.brand || 'Generic Brand'}</ProductBrand>
          <ProductName viewMode={viewMode}>{product.name}</ProductName>
          
          <ProductRating>
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} style={{ opacity: i < Math.floor(rating) ? 1 : 0.3 }} />
              ))}
            </div>
            <span className="rating-text">({reviewCount})</span>
          </ProductRating>
          
          <ProductPrice viewMode={viewMode}>
            {product.price || '$N/A'}
            {isOnSale && (
              <>
                <span className="original-price">${originalPrice}</span>
                <span className="discount">-{discount}%</span>
              </>
            )}
          </ProductPrice>
          
          <AvailabilityBadge inStock={inStock}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </AvailabilityBadge>
          
          <ProductFeatures viewMode={viewMode}>
            {displayFeatures.map((feature, index) => (
              <Feature key={index}>{feature}</Feature>
            ))}
          </ProductFeatures>
          
          <ButtonContainer viewMode={viewMode}>
            <div className="action-buttons">
              <ViewButton to={`/product/${productId}`} viewMode={viewMode}>
                <FaEye size={12} />
                View
              </ViewButton>
              <CartButton 
                onClick={handleAddToCart} 
                viewMode={viewMode}
                disabled={!inStock}
              >
                <FaShoppingCart size={12} />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </CartButton>
            </div>
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