import React from 'react';
import styled from 'styled-components';
import ChatInterface from '../components/ChatInterface';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #ffffff, #f5f5f5);
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 80px 20px;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
`;

const Home = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <Title>Welcome to Smart Shop Assistant</Title>
        <Subtitle>
          Your AI-powered shopping companion. Get personalized product recommendations
          and instant assistance 24/7.
        </Subtitle>
      </HeroSection>

      <Features>
        <FeatureCard>
          <h2>Smart Recommendations</h2>
          <p>Get personalized product suggestions based on your preferences</p>
        </FeatureCard>
        <FeatureCard>
          <h2>Instant Support</h2>
          <p>Get immediate answers to all your shopping queries</p>
        </FeatureCard>
        <FeatureCard>
          <h2>Product Comparison</h2>
          <p>Compare different products to make informed decisions</p>
        </FeatureCard>
      </Features>

      <ChatInterface />
    </HomeContainer>
  );
};

export default Home;