import React from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import Categories from '../components/Categories';
import { Link } from 'react-router-dom';
// Import icons for benefits section
import { FaShippingFast, FaExchangeAlt, FaLock, FaGift } from 'react-icons/fa';

// Add global style for grey background
const GlobalStyle = createGlobalStyle`
  body {
    background-color: #f5f7fa; /* Light grey background */
    margin: 0;
    padding: 0;
  }
`;

// Original fade in animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const HomeContainer = styled.div`
  text-align: center;
  padding: 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(to bottom, #f8f9fa, #eef1f6); /* Light background gradient */
  border-radius: 12px; /* Optional: adds rounded corners to the container */
`;

// Modified Hero Section with geometric pattern
const HeroSection = styled.div`
  background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
  padding: 4.5rem 2rem; /* Slightly reduced from 5rem */
  border-radius: 16px;
  text-align: center;
  max-width: 1100px;
  margin: 0.5rem auto; /* Reduced from 2rem to 0.5rem */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L60 60M60 0L0 60' stroke='rgba(255,255,255,0.15)' stroke-width='1'/%3E%3C/svg%3E");
    opacity: 0.4;
    z-index: 0;
  }
`;

// Revert Title to use original fadeIn animation
const Title = styled.h1`
  font-size: 3.5rem;
  color: white;
  font-weight: 800;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 1s ease-out;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

// Keep Tagline but with fadeIn animation
const Tagline = styled.h2`
  font-size: 1.8rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 1.2s ease-out 0.2s both;
  font-style: italic;
`;

// Revert Subtitle to use original fadeIn animation
const Subtitle = styled.p`
  font-size: 1.6rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 1s ease-out 0.3s both;
`;

const AIBadge = styled.div`
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 1s ease-out both;
  
  svg {
    margin-right: 6px;
    vertical-align: middle;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 1s ease-out 0.6s both;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    max-width: 240px;
    margin: 0 auto;
  }
`;

// Updated Button with red Shop Now button
const Button = styled(Link)`
  padding: 16px 32px;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  display: inline-block;
  
  background: ${props => props.primary ? 
    "white" : /* Changed to white background */
    "transparent"};
  color: ${props => props.primary ? "#1a73e8" : /* Changed to blue text */
    "white"};
  border: ${props => props.primary ? "none" : "2px solid rgba(255, 255, 255, 0.5)"};
  box-shadow: ${props => props.primary ? 
    "0 4px 15px rgba(0, 0, 0, 0.15)" : /* Updated shadow for white button */
    "none"};
  
  /* Shine effect */
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0) 0%,
      ${props => props.primary ? 'rgba(26, 115, 232, 0.1)' : 'rgba(255, 255, 255, 0.3)'} 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: ${props => props.primary 
      ? '0 8px 25px rgba(0, 0, 0, 0.2)' : /* Updated shadow for white button */
      '0 8px 20px rgba(255, 255, 255, 0.25)'};
    
    &:after {
      transform: translateX(100%);
    }
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: ${props => props.primary 
      ? '0 2px 8px rgba(0, 0, 0, 0.15)' : /* Updated shadow for white button */
      '0 2px 8px rgba(255, 255, 255, 0.25)'};
  }
`;

// Updated Benefits Section - keeping the same structure but enhancing the styling
const BenefitsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
  margin: 3rem auto;
  max-width: 1100px;
`;

const BenefitCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const BenefitIcon = styled.div`
  font-size: 2.5rem;
  color: #1a73e8;
  margin-bottom: 15px;
  background-color: #ebf4ff;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BenefitTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
`;

const BenefitText = styled.p`
  font-size: 0.95rem;
  color: #7f8c8d;
  line-height: 1.6;
`;

// 3. FEATURED PRODUCTS SECTION
const SectionTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  color: #2d3748;
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(to right, #3498db, #2575fc);
    border-radius: 3px;
  }
`;

const SectionDescription = styled.p`
  font-size: 1.2rem;
  color: #718096;
  max-width: 800px;
  margin: 1.5rem auto 2.5rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  margin: 0 auto;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    
    img {
      transform: scale(1.05);
    }
  }
`;

const ProductImage = styled.div`
  height: 200px;
  overflow: hidden;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain; /* Changed from 'cover' to 'contain' */
    transition: transform 0.5s ease;
  }
`;

const ProductInfo = styled.div`
  padding: 20px;
`;

const ProductName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
`;

const ProductPrice = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a73e8;
  margin-bottom: 12px;
`;

const ProductRating = styled.div`
  color: #f39c12;
  margin-bottom: 15px;
  font-size: 1rem;
`;

const ProductButton = styled.button`
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  width: 100%;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #0d47a1;
  }
`;

// 4. ENHANCED CATEGORIES SECTION
const CategoriesSectionWrapper = styled.div`
  margin: 4rem 0;
  text-align: center;
  padding: 2rem 0;
  background: linear-gradient(to bottom, #f9f9f9, #ffffff);
  border-radius: 12px;
`;

const CategoriesSection = styled.div`
  margin-top: 4rem;
`;

const Home = () => {
  // Mock featured products data
  const featuredProducts = [
    {
      id: 1,
      name: 'MacBook M4 Pro',
      price: '$2399',
      image: '/images/macbook_m4_pro.jpg',
      rating: 4.9
    },
    {
      id: 2,
      name: 'Samsung Galaxy S24 Ultra',
      price: '$1199',
      image: '/images/samsung_s24_ultra.jpg',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Sony Bravia 8 OLED',
      price: '$2299',
      image: '/images/sony_bravia_8.jpg',
      rating: 4.7
    },
    {
      id: 4,
      name: 'OnePlus 13R',
      price: '$499',
      image: '/images/oneplus_13r.jpg',
      rating: 4.6
    }
  ];

  // Function to render star ratings
  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '★' : '') + '☆'.repeat(5 - Math.ceil(rating));
  };

  return (
    <>
      <GlobalStyle />
      <HomeContainer>
        {/* 1. HERO SECTION WITH UPDATED PATTERN BACKGROUND */}
        <HeroSection>
          <AIBadge>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12C22 14.6522 20.9464 17.1957 19.0711 19.0711C17.1957 20.9464 14.6522 22 12 22C9.34784 22 6.8043 20.9464 4.92893 19.0711C3.05357 17.1957 2 14.6522 2 12C2 9.34784 3.05357 6.8043 4.92893 4.92893C6.8043 3.05357 9.34784 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12Z" stroke="white" fill="none" strokeWidth="2"/>
              <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            AI-Powered Shopping
          </AIBadge>
          
          <Title>Welcome to SmartShop</Title>
          <Subtitle>
            Your intelligent shopping companion that helps you find the perfect tech products
          </Subtitle>
          
          <ButtonContainer>
            <Button to="/products" primary>Shop Now</Button>
            <Button to="/products?deals=true">Today's Deals</Button>
          </ButtonContainer>
        </HeroSection>

        {/* 2. UPDATED BENEFITS SECTION WITH CIRCULAR ICONS */}
        <BenefitsSection>
          <BenefitCard>
            <BenefitIcon>
              <FaShippingFast />
            </BenefitIcon>
            <BenefitTitle>Free Shipping</BenefitTitle>
            <BenefitText>Free shipping on all orders over $50</BenefitText>
          </BenefitCard>
          
          <BenefitCard>
            <BenefitIcon>
              <FaExchangeAlt />
            </BenefitIcon>
            <BenefitTitle>Easy Returns</BenefitTitle>
            <BenefitText>30-day easy return policy on all products</BenefitText>
          </BenefitCard>
          
          <BenefitCard>
            <BenefitIcon>
              <FaLock />
            </BenefitIcon>
            <BenefitTitle>Secure Payment</BenefitTitle>
            <BenefitText>Your payment information is always safe</BenefitText>
          </BenefitCard>
          
          <BenefitCard>
            <BenefitIcon>
              <FaGift />
            </BenefitIcon>
            <BenefitTitle>Loyalty Rewards</BenefitTitle>
            <BenefitText>Earn points with every purchase you make</BenefitText>
          </BenefitCard>
        </BenefitsSection>
        
        {/* 3. FEATURED PRODUCTS SECTION */}
        <div>
          <SectionTitle>Featured Products</SectionTitle>
          <SectionDescription>
            Check out our most popular tech products loved by our customers
          </SectionDescription>
          
          <ProductsGrid>
            {featuredProducts.map(product => (
              <ProductCard key={product.id}>
                <ProductImage>
                  <img src={product.image} alt={product.name} />
                </ProductImage>
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>{product.price}</ProductPrice>
                  <ProductRating>{renderStars(product.rating)}</ProductRating>
                  <ProductButton>Add to Cart</ProductButton>
                </ProductInfo>
              </ProductCard>
            ))}
          </ProductsGrid>
        </div>
        
        {/* 4. ENHANCED CATEGORIES SECTION */}
        <CategoriesSectionWrapper>
          <SectionTitle>Shop By Category</SectionTitle>
          <SectionDescription>
            Browse our wide selection of products by category
          </SectionDescription>
          <Categories />
        </CategoriesSectionWrapper>
      </HomeContainer>
    </>
  );
};

export default Home;