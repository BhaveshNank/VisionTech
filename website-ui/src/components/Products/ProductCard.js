import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

const Button = styled(Link)`
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.2s;
  text-align: center;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const ProductCard = ({ product }) => {
  // Generate placeholder image based on product name if no image is provided
  const placeholderImage = `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`;
  
  // Extract the first 3 features for display
  const displayFeatures = product.features && Array.isArray(product.features) 
    ? product.features.slice(0, 3) 
    : [];
    
  // Ensure product ID exists to prevent routing errors
  const productId = product.id || `1-${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <Card>
      <ProductImage>
        {/* The image URL is now directly stored in product.image */}
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
        
        <Button to={`/product/${productId}`}>View Details</Button>
      </ProductInfo>
    </Card>
  );
};

export default ProductCard;