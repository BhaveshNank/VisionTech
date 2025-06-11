import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Latest Offers Section Styles
const LatestOffersSection = styled.section`
  padding: 4rem 2rem;
  background: #f4f4f4;
  max-width: 1400px;
  margin: 0 auto;
`;

const OffersTitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: #000;
`;

const OffersTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const OfferTab = styled.button`
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 500;
  color: ${props => props.active ? '#000' : '#666'};
  cursor: pointer;
  padding: 0.5rem 1rem;
  position: relative;
  transition: color 0.3s ease;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #000;
    transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: #000;
  }
`;

const OffersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OfferCard = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  }
  
  ${props => props.large && `
    grid-column: span 2;
    
    @media (max-width: 1200px) {
      grid-column: span 1;
    }
  `}
`;

const OfferImage = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #fafafa;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const OfferContent = styled.div`
  padding: 1.5rem;
  text-align: center;
`;

const OfferHeadline = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #000;
`;

const OfferDescription = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const OfferButton = styled(Link)`
  display: inline-block;
  background: #000;
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.3s ease;
  
  &:hover {
    background: #333;
  }
`;

// Featured Products Section Styles
const FeaturedSection = styled.section`
  padding: 4rem 2rem;
  background: white;
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #000;
`;

const ProductsCarousel = styled.div`
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 1rem;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
  
  @media (min-width: 1200px) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    overflow-x: visible;
  }
`;

const ProductCard = styled.div`
  min-width: 280px;
  background: white;
  text-align: center;
  position: relative;
  
  @media (min-width: 1200px) {
    min-width: auto;
  }
`;

const NewBadge = styled.span`
  position: absolute;
  top: 0;
  left: 20px;
  background: #1428A0;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1;
`;

const ProductImageWrapper = styled.div`
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin-bottom: 1rem;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const ProductName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #000;
`;

const ProductSubtitle = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const ColorOptions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ColorLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
  margin-right: 0.5rem;
`;

const ColorDot = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? '#000' : '#ddd'};
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const PriceWrapper = styled.div`
  margin: 1.5rem 0;
`;

const OriginalPrice = styled.span`
  text-decoration: line-through;
  color: #999;
  font-size: 1rem;
  margin-right: 0.5rem;
`;

const CurrentPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
`;

const BuyButton = styled(Link)`
  display: inline-block;
  background: #000;
  color: white;
  padding: 0.8rem 3rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    background: #333;
    transform: translateY(-2px);
  }
`;

// Component
const UpdatedHomeSections = () => {
  const [activeOfferTab, setActiveOfferTab] = useState('newIn');
  const [selectedColors, setSelectedColors] = useState({});

  const offerTabs = [
    { id: 'newIn', label: 'New In' },
    { id: 'mobile', label: 'Mobile' },
    { id: 'tvAv', label: 'TV & AV' },
    { id: 'homeAppliances', label: 'Home Appliances' },
    { id: 'laptopsMonitors', label: 'Laptops & Monitors' }
  ];

  const latestOffers = {
    newIn: [
      {
        id: 1,
        image: '/images/galaxy-s25-ultra.jpg',
        headline: 'Galaxy S25 Ultra',
        description: 'Guaranteed $200 off when you trade in any android',
        link: '/products?search=galaxy+s25+ultra',
        large: true
      },
      {
        id: 2,
        image: '/images/galaxy-watch-a56-bundle.jpg',
        headline: 'Claim Galaxy Watch7 worth $214',
        description: 'on us with Galaxy A56 5G',
        link: '/products?search=galaxy+a56'
      },
      {
        id: 3,
        image: '/images/galaxy-tab-s10.jpg',
        headline: 'Save up to $200',
        description: 'on the Galaxy Tab S10 Series',
        link: '/products?search=galaxy+tab+s10'
      }
    ],
    mobile: [
      {
        id: 4,
        image: '/images/iphone-16-pro.jpg',
        headline: 'iPhone 16 Pro',
        description: 'Get up to $800 off with eligible trade-in',
        link: '/products?search=iphone+16+pro'
      },
      {
        id: 5,
        image: '/images/pixel-9-pro.jpg',
        headline: 'Google Pixel 9 Pro',
        description: 'Free Pixel Buds Pro with purchase',
        link: '/products?search=pixel+9+pro'
      }
    ],
    tvAv: [
      {
        id: 6,
        image: '/images/neo-qled-8k.jpg',
        headline: '2025 Neo QLED 8K',
        description: 'Get up to 20% off with select TVs',
        link: '/products?search=neo+qled+8k',
        large: true
      }
    ]
  };

  const featuredProducts = [
    {
      id: 1,
      name: 'Galaxy S25 Ultra',
      subtitle: 'Flagship Performance',
      image: '/images/galaxy-s25-ultra.jpg',
      price: 1249.00,
      originalPrice: null,
      isNew: true,
      colors: [
        { name: 'Titanium Gray', hex: '#4a4a4a' },
        { name: 'Titanium Black', hex: '#000000' },
        { name: 'Titanium White', hex: '#e8e8e8' }
      ]
    },
    {
      id: 2,
      name: 'MacBook M4 Pro',
      subtitle: 'Pro Performance',
      image: '/images/macbook-m4-pro.jpg',
      price: 2399.00,
      originalPrice: 2599.00,
      isNew: false,
      colors: [
        { name: 'Space Gray', hex: '#4a4a4a' },
        { name: 'Silver', hex: '#e8e8e8' }
      ]
    },
    {
      id: 3,
      name: 'Galaxy Buds3 Pro',
      subtitle: 'Premium Sound',
      image: '/images/galaxy-buds3-pro.jpg',
      price: 219.00,
      originalPrice: null,
      isNew: false,
      colors: [
        { name: 'Silver', hex: '#e8e8e8' },
        { name: 'Graphite', hex: '#4a4a4a' }
      ]
    },
    {
      id: 4,
      name: '55" OLED S90D 4K Smart AI TV',
      subtitle: '2024 Model',
      image: '/images/oled-s90d-tv.jpg',
      price: 999.00,
      originalPrice: 1299.00,
      isNew: false,
      colors: []
    }
  ];

  const handleColorSelect = (productId, colorName) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: colorName
    }));
  };

  const currentOffers = latestOffers[activeOfferTab] || [];

  return (
    <>
      {/* Latest Offers Section */}
      <LatestOffersSection>
        <OffersTitle>Latest Offers</OffersTitle>
        
        <OffersTabs>
          {offerTabs.map(tab => (
            <OfferTab
              key={tab.id}
              active={activeOfferTab === tab.id}
              onClick={() => setActiveOfferTab(tab.id)}
            >
              {tab.label}
            </OfferTab>
          ))}
        </OffersTabs>
        
        <OffersGrid>
          {currentOffers.map(offer => (
            <OfferCard key={offer.id} large={offer.large}>
              <OfferImage>
                <img src={offer.image} alt={offer.headline} />
              </OfferImage>
              <OfferContent>
                <OfferHeadline>{offer.headline}</OfferHeadline>
                <OfferDescription>{offer.description}</OfferDescription>
                <OfferButton to={offer.link}>Buy now</OfferButton>
              </OfferContent>
            </OfferCard>
          ))}
        </OffersGrid>
      </LatestOffersSection>

      {/* Featured Products Section */}
      <FeaturedSection>
        <SectionTitle>Recommended Products</SectionTitle>
        
        <ProductsCarousel>
          {featuredProducts.map(product => (
            <ProductCard key={product.id}>
              {product.isNew && <NewBadge>New</NewBadge>}
              
              <ProductImageWrapper>
                <img src={product.image} alt={product.name} />
              </ProductImageWrapper>
              
              <ProductName>{product.name}</ProductName>
              <ProductSubtitle>{product.subtitle}</ProductSubtitle>
              
              {product.colors.length > 0 && (
                <ColorOptions>
                  <ColorLabel>Colour :</ColorLabel>
                  {product.colors.map(color => (
                    <ColorDot
                      key={color.name}
                      color={color.hex}
                      selected={selectedColors[product.id] === color.name || (!selectedColors[product.id] && product.colors[0].name === color.name)}
                      onClick={() => handleColorSelect(product.id, color.name)}
                      title={color.name}
                    />
                  ))}
                </ColorOptions>
              )}
              
              <PriceWrapper>
                {product.originalPrice && (
                  <OriginalPrice>${product.originalPrice.toFixed(2)}</OriginalPrice>
                )}
                <CurrentPrice>${product.price.toFixed(2)}</CurrentPrice>
              </PriceWrapper>
              
              <BuyButton to={`/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`}>
                Buy now
              </BuyButton>
            </ProductCard>
          ))}
        </ProductsCarousel>
      </FeaturedSection>
    </>
  );
};

export default UpdatedHomeSections;
