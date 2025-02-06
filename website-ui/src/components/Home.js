import React from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Hero = styled.div`
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled.div`
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Home = () => {
  return (
    <HomeContainer>
      <Hero>
        <Title>Welcome to Smart Shop Assistant</Title>
        <Subtitle>Your AI-powered shopping companion</Subtitle>
      </Hero>

      <FeaturesGrid>
        <FeatureCard>
          <h3>Smart Product Search</h3>
          <p>Find exactly what you need with our intelligent search assistant</p>
        </FeatureCard>
        <FeatureCard>
          <h3>Personalized Recommendations</h3>
          <p>Get tailored product suggestions based on your preferences</p>
        </FeatureCard>
        <FeatureCard>
          <h3>24/7 Assistant</h3>
          <p>Our AI chat assistant is always here to help you shop</p>
        </FeatureCard>
      </FeaturesGrid>
    </HomeContainer>
  );
};

export default Home;
