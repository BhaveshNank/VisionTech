import React from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import Categories from '../components/Categories';
import { Link } from 'react-router-dom';

// Add global style for grey background
const GlobalStyle = createGlobalStyle`
  body {
    background-color: #f5f7fa; /* Light grey background */
    margin: 0;
    padding: 0;
  }
`;

// Add animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Update the HomeContainer component with a subtle gradient
const HomeContainer = styled.div`
  text-align: center;
  padding: 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(to bottom, #f8f9fa, #eef1f6); /* Light background gradient */
  border-radius: 12px; /* Optional: adds rounded corners to the container */
`;

// Update the HeroSection component - reduce top margin
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
    background: url('/images/tech-pattern.png');
    background-size: cover;
    opacity: 0.08; /* Slightly increased for better visibility on dark blue */
    z-index: 0;
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  color: white;
  font-weight: 800;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 1s ease-out;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

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

// Enhanced buttons with better hover effects
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
  
  background: ${props => props.primary ? "white" : "transparent"};
  color: ${props => props.primary ? "#1a73e8" : "white"}; /* Changed to match blue gradient */
  border: ${props => props.primary ? "none" : "2px solid white"};
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => props.primary ? 
      "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)" :
      "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)"
    };
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3); /* Add slight glow effect */
    
    &:after {
      transform: translateX(100%);
    }
  }
`;

const CategoriesSection = styled.div`
  margin-top: 4rem;
`;

const Home = () => {
  return (
    <>
      <GlobalStyle />
      <HomeContainer>
        <HeroSection>
          <AIBadge>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="white"/>
              <path d="M15 12C15 13.66 13.66 15 12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12Z" fill="white"/>
            </svg>
            AI-Powered Shopping
          </AIBadge>
          
          <Title>Welcome to Smart Shop</Title>
          <Subtitle>
            Your intelligent shopping companion that helps you find the perfect tech products
          </Subtitle>
          
          <ButtonContainer>
            <Button to="/products" primary>Shop Now</Button>
            <Button to="/products?deals=true">Today's Deals</Button>
          </ButtonContainer>
        </HeroSection>

        <CategoriesSection>
          <Categories />
        </CategoriesSection>
      </HomeContainer>
    </>
  );
};

export default Home;
