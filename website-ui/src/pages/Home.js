import React from 'react';
import styled from 'styled-components';
import Categories from '../components/Categories';

const HomeContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroSection = styled.div`
  background: linear-gradient(to bottom, #d1d8e6, #c0c8d8);
  padding: 4rem; /* Increase padding */
  height: 280px; /* Increase height */
  border-radius: 12px;
  text-align: center;
  max-width: 1100px; /* Increase width slightly */
  margin: 3rem auto;
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
`;



const Title = styled.h1`
  font-size: 3rem;
  color: #2c3e50;
  font-weight: bold;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const Button = styled.button`
  padding: 12px 24px;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
  
  background: ${props => (props.primary ? "#007bff" : "transparent")};
  color: ${props => (props.primary ? "white" : "#007bff")};
  border: 2px solid #007bff;

  &:hover {
    background: ${props => (props.primary ? "#0056b3" : "#007bff")};
    color: white;
  }
`;

const CategoriesSection = styled.div`
  margin-top: 4rem;
`;

const Home = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <Title>Welcome to Smart Shop</Title>
        <Subtitle>Your AI-powered shopping companion for the best tech products</Subtitle>
        <ButtonContainer>
          <Button primary>Shop Now</Button>
          <Button>Today's Deals</Button>
        </ButtonContainer>
      </HeroSection>

      <CategoriesSection>
        <Categories />
      </CategoriesSection>
    </HomeContainer>
  );
};

export default Home;
