import React from 'react';
import styled from 'styled-components';
import Categories from '../components/Categories';

const HomeContainer = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroSection = styled.div`
  padding: 4rem 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 10px;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto 2rem;
`;

const Button = styled.button`
  background: white;
  color: #2575fc;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 10px rgba(0, 0, 0, 0.2);
  }
`;

const FeaturedSection = styled.div`
  margin: 4rem 0;
`;

const FeaturedTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1a1a1a;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  justify-content: center;
  padding: 20px;
`;

const ProductCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background: white;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: contain;
  background-color: #f7f7f7;
`;

const ProductName = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  padding: 10px;
  text-align: center;
`;

const FeaturedProducts = [
  { name: 'Samsung Galaxy S24 Ultra', image: '/images/samsung_s24_ultra.jpg' },
  { name: 'iPhone 16 Pro Max', image: '/images/iphone_16_pro_max.jpg' },
  { name: 'Lenovo Gaming Laptop', image: '/images/lenovo_gaming_laptop.jpg' },
];

const Home = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <Title>Welcome to Smart Shop Assistant</Title>
        <Subtitle>
          Your AI-powered shopping companion that helps you find the perfect products tailored to your needs
        </Subtitle>
        <Button>Get Started</Button>
      </HeroSection>

      {/* Categories Section */}
      <Categories />

      {/* Featured Products Section */}
      <FeaturedSection>
        <FeaturedTitle>Featured Products</FeaturedTitle>
        <FeaturedGrid>
          {FeaturedProducts.map((product) => (
            <ProductCard key={product.name}>
              <ProductImage src={product.image} alt={product.name} />
              <ProductName>{product.name}</ProductName>
            </ProductCard>
          ))}
        </FeaturedGrid>
      </FeaturedSection>
    </HomeContainer>
  );
};

export default Home;
