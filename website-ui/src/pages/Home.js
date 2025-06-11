import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, createGlobalStyle, css } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FaShippingFast, FaExchangeAlt, FaLock, FaGift, FaSearch, FaShoppingCart, FaHeadset, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import eventSystem from '../utils/events';

// Phones Section - Add this after your iPad showcase section
const PhonesSection = styled.section`
  padding: 60px 20px;
  background: #ffffff;
  max-width: 1400px;
  margin: 0 auto;
`;

const PhonesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PhonesTitle = styled.h2`
  font-size: 48px;
  font-weight: 700;
  color: #000000;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const ViewAllButton = styled(Link)`
  padding: 12px 24px;
  background: transparent;
  color: #000000;
  border: 2px solid #000000;
  text-decoration: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: #000000;
    color: #ffffff;
  }
`;

const PhonesSliderContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const PhonesSlider = styled.div`
  display: flex;
  transition: transform 0.5s ease-in-out;
  transform: translateX(-${props => props.currentSlide * (100 / 3.5)}%);
  
  @media (max-width: 768px) {
    transform: translateX(-${props => props.currentSlide * 85}%);
  }
`;

const PhoneCard = styled.div`
  flex: 0 0 calc(28% - 16px); /* Reduced from 33.333% to 28% */
  margin-right: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px 16px; /* Reduced padding */
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  min-width: 240px; /* Set minimum width */
  max-width: 280px; /* Set maximum width */
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    flex: 0 0 85%; /* Show partial next card on mobile */
    margin-right: 16px;
    min-width: 280px;
    max-width: 320px;
  }
  
  @media (max-width: 480px) {
    flex: 0 0 90%;
    margin-right: 12px;
    min-width: 260px;
  }
`;

const PhoneImageContainer = styled.div`
  height: 200px; /* Reduced from 250px */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px; /* Reduced margin */
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
`;

const PhoneImage = styled.img`
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
`;

const PhoneTagline = styled.p`
  font-size: 14px;
  color: #666666;
  margin-bottom: 8px;
  font-weight: 500;
`;

const PhoneName = styled.h3`
  font-size: 20px; /* Reduced from 24px */
  font-weight: 700;
  margin-bottom: 10px; /* Reduced margin */
  color: #000000;
  line-height: 1.2;
`;

const PhonePrice = styled.div`
  margin-bottom: 16px;
`;

const PriceText = styled.span`
  font-size: 16px;
  color: #000000;
  font-weight: 600;
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  color: #999999;
  text-decoration: line-through;
  margin-left: 8px;
`;

const PhoneDescription = styled.p`
  font-size: 13px; /* Reduced from 14px */
  color: #666666;
  margin-bottom: 20px; /* Reduced margin */
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Limit to 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PhoneButtonContainer = styled.div`
  display: flex;
  gap: 10px; /* Reduced gap */
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const PhoneBuyButton = styled(Link)`
  padding: 10px 20px; /* Reduced padding */
  background: #000000;
  color: #ffffff;
  text-decoration: none;
  border-radius: 25px;
  font-size: 13px; /* Reduced font size */
  font-weight: 600;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 90px; /* Reduced min-width */
  
  &:hover {
    background: #333333;
    transform: translateY(-1px);
  }
`;

const PhoneEnquireButton = styled.button`
  padding: 10px 20px; /* Reduced padding */
  background: transparent;
  color: #000000;
  border: 1px solid #cccccc;
  border-radius: 25px;
  font-size: 13px; /* Reduced font size */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 90px; /* Reduced min-width */
  
  &:hover {
    background: #f8f9fa;
    border-color: #999999;
  }
`;

const SliderNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 1.2rem;
  color: #333333;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 10;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  &:focus {
    outline: none;
  }
  
  &.prev {
    left: -25px;
  }
  
  &.next {
    right: -25px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

// iPad M4 Pro Showcase Section - Full screen coverage with centered buttons
const IPadShowcaseSection = styled.section`
  position: relative;
  width: 100vw;
  height: auto; /* Changed from fixed vh to auto */
  min-height: 60vh; /* Set minimum height instead */
  margin-left: calc(-50vw + 50%);
  background: #000000;
  padding: 40px 0; /* Add padding for breathing room */
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    min-height: 50vh;
    padding: 20px 0;
  }
  
  @media (max-width: 480px) {
    min-height: 40vh;
    padding: 20px 0;
  }
`;

const IPadImageContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1400px; /* Limit maximum width */
  height: 500px; /* Fixed height for consistency */
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000000;
  
  @media (max-width: 768px) {
    height: 400px;
  }
  
  @media (max-width: 480px) {
    height: 300px;
  }
`;

const IPadImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain; /* Changed from cover to contain to show full image */
  object-position: center;
  background: #000000; /* Add background color for any letterboxing */
`;

const IPadButtonContainer = styled.div`
  position: absolute;
  bottom: 15%; /* Adjusted from 20% */
  left: 15%;
  display: flex;
  gap: 1rem;
  z-index: 10;
  
  @media (max-width: 768px) {
    bottom: 20px;
    left: 20px;
    gap: 0.8rem;
  }
  
  @media (max-width: 480px) {
    bottom: 20px;
    left: 15px;
    gap: 0.5rem;
    flex-direction: column;
  }
`;

const IPadBuyButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background: #1a73e8;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 25px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
  
  &:hover {
    background: #1557b0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
  }
  
  @media (max-width: 480px) {
    padding: 10px 20px;
    font-size: 0.8rem;
    text-align: center;
    width: 140px; /* Fixed width for mobile consistency */
  }
`;

const IPadLearnButton = styled.button`
  display: inline-block;
  padding: 12px 24px;
  background: transparent;
  color: #1a73e8;
  border: 2px solid #1a73e8;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #1a73e8;
    color: #ffffff;
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    padding: 10px 20px;
    font-size: 0.8rem;
    text-align: center;
    width: 140px; /* Fixed width for mobile consistency */
  }
`;

// Galaxy S25 Showcase Section - Clean version
const GalaxyTabShowcaseSection = styled.section`
  position: relative;
  width: 100vw;
  height: auto;
  min-height: 70vh;
  margin-left: calc(-50vw + 50%);
  background: #000000;
  padding: 40px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    min-height: 60vh;
    padding: 20px 0;
  }
  
  @media (max-width: 480px) {
    min-height: 50vh;
    padding: 20px 0;
  }
`;

const GalaxyTabImageContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1400px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000000;
  
  @media (max-width: 768px) {
    height: 500px;
  }
  
  @media (max-width: 480px) {
    height: 400px;
  }
`;

const GalaxyTabContentContainer = styled.div`
  position: absolute;
  bottom: 8%; /* Moved further down from 15% */
  left: 2%; /* Moved further left from 4% to 2% */
  z-index: 10;
  max-width: 450px; /* Reduced from 500px to 450px to avoid overlap */
  
  @media (max-width: 768px) {
    bottom: 6%;
    left: 3%;
    right: 3%;
    max-width: none;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    bottom: 5%;
    left: 2%;
    right: 2%;
  }
`;

const GalaxyTabTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.1;
  opacity: 0;
  transform: translateY(40px);
  animation: slideUpFadeInTitle 1s ease-out 0.5s forwards;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
  
  @keyframes slideUpFadeInTitle {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const GalaxyTabTagline = styled.p`
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(30px);
  animation: slideUpFadeIn 0.8s ease-out 0.2s forwards;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
  
  @keyframes slideUpFadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const GalaxyTabOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 40%,
    rgba(0, 0, 0, 0.4) 100%
  );
  z-index: 1;
`;


const GalaxyTabImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  background: #000000;
`;

const GalaxyTabButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  opacity: 0;
  transform: translateY(30px);
  animation: slideUpFadeIn 0.8s ease-out 1.1s forwards;
  
  @media (max-width: 768px) {
    justify-content: center;
    gap: 0.8rem;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.8rem;
    align-items: stretch;
  }
  
  @keyframes slideUpFadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const GalaxyTabBuyButton = styled(Link)`
  display: inline-block;
  padding: 14px 28px;
  background: #1a73e8;
  color: #ffffff;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 25px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(26, 115, 232, 0.4);
  text-align: center;
  
  &:hover {
    background: #1557b0;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 115, 232, 0.5);
  }
  
  @media (max-width: 480px) {
    padding: 12px 24px;
    font-size: 0.9rem;
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
`;


const GalaxyTabLearnButton = styled.button`
  display: inline-block;
  padding: 14px 28px;
  background: transparent;
  color: #ffffff;
  border: 2px solid #ffffff;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    background: #ffffff;
    color: #000000;
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    padding: 12px 24px;
    font-size: 0.9rem;
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
`;

const GalaxyTabSubtitle = styled.p`
  font-size: 1rem;
  color: #ffffff;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0;
  line-height: 1.5;
  transform: translateY(30px);
  animation: slideUpFadeIn 0.8s ease-out 0.8s forwards;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 1.2rem;
  }
  
  @keyframes slideUpFadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// OnePlus Style Product Showcase Section - Redesigned Layout
const OnePlusStyleShowcase = styled.section`
  position: relative;
  width: 100%;
  height: 90vh;  // Increased from 80vh to 90vh to accommodate full image
  min-height: 700px;  // Increased from 600px to 700px
  background: #000;
  overflow: hidden;
  margin: 0;
  
  @media (max-width: 768px) {
    height: 80vh;  // Increased from 70vh to 80vh
    min-height: 600px;  // Increased from 500px to 600px
  }
`;

const ShowcaseImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/images/rogstrix.jpg');
  background-size: cover;
  background-position: center top;  // Changed from center to center top to preserve top of image
  background-repeat: no-repeat;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg, 
      rgba(0, 0, 0, 0.1) 0%, 
      rgba(0, 0, 0, 0.2) 40%,  // Reduced opacity from 0.3 to 0.2
      rgba(0, 0, 0, 0.7) 85%,  // Reduced opacity from 0.8 to 0.7
      rgba(0, 0, 0, 0.85) 100%  // Reduced opacity from 0.9 to 0.85
    );
    z-index: 2;
    
    @media (max-width: 768px) {
      background: linear-gradient(
        135deg, 
        rgba(0, 0, 0, 0.2) 0%,  // Reduced opacity
        rgba(0, 0, 0, 0.4) 50%,  // Reduced opacity
        rgba(0, 0, 0, 0.6) 100%  // Reduced opacity
      );
    }
  }
`;

const ShowcaseContainer = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 2rem;
  z-index: 3;
  max-width: 450px;
  
  @media (max-width: 768px) {
    position: absolute;
    bottom: 4rem;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    text-align: center;
    max-width: 600px;
    padding: 0 2rem;
  }
`;

const ShowcaseContent = styled.div`
  color: white;
  max-width: 450px;
  text-align: left;
  
  @media (max-width: 768px) {
    max-width: 600px;
    text-align: center;
    padding: 0 1rem;
  }
`;

const ShowcaseTitle = styled.h2`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.1;
  
  @media (max-width: 768px) {
    font-size: 2.3rem;
    margin-bottom: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const ShowcaseSubtitle = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0.95;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 1.2rem;
  }
`;

// OnePlus style button - clean and minimal
const OnePlusBuyButton = styled(Link)`
  display: inline-block;
  padding: 16px 48px;
  background: #ffffff;
  color: #000000;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 14px 36px;
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 12px 32px;
    font-size: 0.9rem;
    text-align: center;
  }
`;

// OnePlus style enquire button with underline (like "view product")
const EnquireButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  background: transparent;
  color: #ffffff;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  border-bottom: 2px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    border-bottom-color: #ffffff;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    text-align: center;
  }
`;

const ArrowIcon = styled.span`
  font-size: 1.3rem;
  transition: transform 0.3s ease;
  margin-left: 4px;
  
  ${EnquireButton}:hover & {
    transform: translateX(4px);
  }
`;

// Latest Offers Section Styled Components
const OffersSection = styled.section`
  padding: 60px 20px;
  background: #ffffff;
  max-width: 1400px;
  margin: 0 auto;
`;

const OffersTitle = styled.h2`
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 48px;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 36px;
    margin-bottom: 32px;
  }
`;

const OffersGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const FeaturedCard = styled.div`
  background: #ffffff;
  border-radius: 24px;
  padding: 48px;
  color: #333;
  min-height: 400px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
  
  &:before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #1a73e8, #4285f4);
    border-radius: 50%;
    opacity: 0.1;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #34a853, #1ea362);
    border-radius: 50%;
    opacity: 0.08;
  }
  
  @media (max-width: 768px) {
    padding: 32px;
    min-height: 350px;
  }
`;

const FeaturedContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const OfferBadge = styled.span`
  background: #1a73e8;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 24px;
  width: fit-content;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
`;

const FeaturedProductLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: center;
  flex: 1;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
    text-align: center;
  }
`;

const FeaturedProductInfo = styled.div``;

const FeaturedProductName = styled.h3`
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const FeaturedProductSubtitle = styled.p`
  font-size: 18px;
  margin-bottom: 24px;
  color: #666;
`;

const PricingSection = styled.div`
  margin-bottom: 24px;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SalePrice = styled.span`
  font-size: 28px;
  font-weight: 800;
  color: #1a73e8;
`;

const OriginalPriceOffer = styled.span`
  font-size: 18px;
  color: #999;
  text-decoration: line-through;
`;

const Savings = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #34a853;
`;

const FeaturedButton = styled.button`
  background: #1a73e8;
  color: white;
  padding: 16px 32px;
  border-radius: 25px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(26, 115, 232, 0.3);
  
  &:hover {
    background: #1557b0;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 115, 232, 0.4);
  }
`;

const FeaturedImage = styled.div`
  display: flex;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 250px;
    object-fit: contain;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
  }
`;

const GridCards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const GridCard = styled.div`
  background: ${props => props.bgColor || '#f8f9fa'};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
`;

const GridCardImage = styled.div`
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  
  img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
  
  ${GridCard}:hover & img {
    transform: scale(1.1);
  }
`;

const GridCardName = styled.h4`
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
`;

const GridCardOffer = styled.p`
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 16px;
`;

const GridCardLink = styled.div`
  color: #1a73e8;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: gap 0.3s ease;
  
  ${GridCard}:hover & {
    gap: 8px;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ShowcaseButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
`;

// Gaming Accessories Section
const GamingAccessoriesSection = styled.section`
  background: #000000;
  padding: 60px 0;  // Changed from 60px 20px to 60px 0 to allow full width
  position: relative;
  width: 100vw;  // Added full viewport width
  margin-left: calc(-50vw + 50%);  // Center the full-width section
`;

const GamingAccessoriesContainer = styled.div`
  max-width: 100%;  // Changed from 1400px to 100% for full width
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;  // Reduced gap from 0 to 2px to bring images closer together
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const GamingAccessoryCard = styled.div`
  position: relative;
  height: 600px;  // Increased from 500px to 600px to better accommodate images
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 500px;  // Increased from 400px to 500px
  }
`;

const GamingAccessoryImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => `url(${props.image})`};
  background-size: contain;  // Changed to contain to show full image without cropping
  background-position: center center;
  background-repeat: no-repeat;
  background-color: #000000;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom, 
      rgba(0, 0, 0, 0.1) 0%,   // Very light at top to show product
      rgba(0, 0, 0, 0.2) 40%,  // Light in middle 
      rgba(0, 0, 0, 0.4) 70%,  // Gradually darker
      rgba(0, 0, 0, 0.7) 100%  // Darker at bottom for text readability
    );
    z-index: 1;
  }
`;

const GamingAccessoryContent = styled.div`
  position: relative;
  z-index: 2;
  color: white;
  text-align: left;  // Changed from center to left alignment
  padding: 2rem;
  max-width: 400px;
  
  // Position text in bottom-left corner to avoid obstructing products
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
  top: auto;
  
  @media (max-width: 768px) {
    bottom: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
    text-align: center;  // Center align on mobile for better readability
  }
`;

const GamingAccessoryTitle = styled.h3`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const GamingAccessorySubtitle = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0.9;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const GamingAccessoryButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-start;  // Changed from center to flex-start for left alignment
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;  // Changed from center to flex-start
    gap: 0.8rem;
  }
  
  @media (max-width: 768px) {
    justify-content: center;  // Center buttons on mobile for better UX
    
    button, a {
      text-align: center;
    }
  }
`;

const GamingAccessoryBuyButton = styled(Link)`
  display: inline-block;
  padding: 12px 28px;
  background: #ffffff;
  color: #000000;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    padding: 10px 24px;
    font-size: 0.8rem;
  }
`;

const GamingAccessoryEnquireButton = styled.button`
  display: inline-block;
  padding: 12px 28px;
  background: transparent;
  color: #ffffff;
  border: 2px solid #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: #ffffff;
    color: #000000;
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    padding: 10px 24px;
    font-size: 0.8rem;
  }
`;

// Audio Products Showcase Section
const AudioShowcaseSection = styled.section`
  padding: 80px 20px;
  background: #ffffff;
  max-width: 1400px;
  margin: 0 auto;
`;

const AudioSectionTitle = styled.h2`
  font-size: 48px;
  font-weight: 700;
  color: #000000;
  text-align: center;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    font-size: 36px;
    margin-bottom: 40px;
  }
`;

const AudioProductsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const AudioProductCard = styled.div`
  background: #f8f9fa;
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #e5e5e5;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    
    .product-image {
      transform: scale(1.05);
    }
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
  }
`;

const AudioProductImageContainer = styled.div`
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 240px;
    margin-bottom: 24px;
  }
`;

const AudioProductImage = styled.img`
  max-width: 85%;
  max-height: 85%;
  object-fit: contain;
  transition: transform 0.5s ease;
`;

const AudioProductName = styled.h3`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #000000;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 12px;
  }
`;

const AudioProductDescription = styled.p`
  font-size: 16px;
  color: #666666;
  margin-bottom: 30px;
  line-height: 1.6;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 24px;
  }
`;

const AudioProductButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

const AudioBuyButton = styled(Link)`
  padding: 14px 32px;
  background: #1a73e8;
  color: #ffffff;
  text-decoration: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(26, 115, 232, 0.3);
  
  &:hover {
    background: #1557b0;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 115, 232, 0.4);
  }
  
  @media (max-width: 480px) {
    width: 180px;
    text-align: center;
  }
`;

const AudioLearnButton = styled.button`
  padding: 14px 32px;
  background: transparent;
  color: #1a73e8;
  border: 2px solid #1a73e8;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #1a73e8;
    color: #ffffff;
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    width: 180px;
    text-align: center;
  }
`;

// Carousel Components
const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
`;

const CarouselSlider = styled.div`
  display: flex;
  width: 100%;
  transition: transform 0.5s ease-in-out;
  transform: translateX(-${props => props.currentSlide * 100}%);
`;

const CarouselSlide = styled.div`
  min-width: 100%;
  flex: 0 0 100%;
`;

const CarouselNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 1.2rem;
  color: #1a73e8;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 10;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  &:focus {
    outline: none;
  }
  
  &.prev {
    left: 20px;
  }
  
  &.next {
    right: 20px;
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
`;

// Story-style Indicators (Instagram/Samsung style)
const StoryIndicators = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 20;
  
  @media (max-width: 768px) {
    top: 15px;
    gap: 6px;
  }
`;

const StoryIndicator = styled.div`
  width: 60px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 2.5px;
  }
`;

const StoryIndicatorFill = styled.div`
  width: ${props => props.active ? '100%' : '0%'};
  height: 100%;
  background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
  border-radius: 2px;
  transition: width ${props => props.active ? '5s' : '0.3s'} ease;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
  transform-origin: left;
  
  ${props => props.active && !props.isPaused && `
    animation: storyProgressFill 5s linear;
  `}
  
  ${props => props.isPaused && `
    animation-play-state: paused;
  `}
`;

// Bottom Story Progress Bars (Samsung style)
const StoryProgressBars = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 20;
  
  @media (max-width: 768px) {
    bottom: 20px;
    gap: 3px;
  }
`;

const StoryProgressBar = styled.div`
  width: 80px;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
    transform: scaleY(1.5);
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 1.5px;
  }
`;

const StoryProgressFill = styled.div`
  width: ${props => {
    if (props.slideIndex < props.currentSlide) return '100%'; // Completed slides
    if (props.slideIndex === props.currentSlide) {
      // Current slide - starts at 0% and animates to 100%
      return props.isPaused ? 'var(--paused-width, 0%)' : '0%';
    }
    return '0%'; // Future slides
  }};
  height: 100%;
  background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
  border-radius: 1px;
  
  ${props => props.slideIndex === props.currentSlide && !props.isPaused && `
    animation: storyProgressFill 5s linear forwards;
  `}
  
  ${props => props.isPaused && props.slideIndex === props.currentSlide && `
    animation-play-state: paused;
  `}
  
  transition: width 0.3s ease;
`;

const storyProgressFill = keyframes`
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
`;

// Product Video Slide - Remove black space at the top
const VideoSlide = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Changed from center to flex-start */
  align-items: center;
  padding: 0;
  position: relative;
  background: #000;
  margin: 0;
`;

const VideoContainer = styled.div`
  width: 100%;
  position: relative;
  height: 70vh; /* Use viewport height instead of fixed aspect ratio */
  margin: 0;
  background-color: #000;
  display: block;
`;

const VideoOverlay = styled.div`
  position: absolute;
  bottom: 15%;
  left: 10%;
  color: white;
  text-align: left;
  z-index: 2;
`;

const VideoTitle = styled.h2`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const VideoDescription = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  max-width: 500px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;


// Global styles
const GlobalStyle = createGlobalStyle`
  body {
    background-color: #ffffff;
    margin: 0;
    padding: 0;
  }
`;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

// Main container
const HomeContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  margin-top: -80px; /* Negative margin to pull content up under sticky navbar and remove gap */
  position: relative;
  z-index: 1;
`;

// Hero Section with proper vertical centering
const HeroSection = styled.div`
  background: #ffffff;
  padding: 0 2rem; /* Only horizontal padding */
  margin: 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  height: 70vh; /* Use viewport height for consistent sizing */
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    height: 60vh;
    padding: 0 1rem;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  color: #1a202c;
  font-weight: 800;
  margin-bottom: 1rem;
  animation: ${fadeIn} 1s ease-out;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  color: #4a5568;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  animation: ${fadeIn} 1s ease-out;
  line-height: 1.8;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  animation: ${fadeIn} 1s ease-out;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    max-width: 240px;
    margin: 0 auto;
  }
`;

const PrimaryButton = styled(Link)`
  padding: 16px 36px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  background: #1a73e8;
  color: white;
  box-shadow: 0 4px 15px rgba(26, 115, 232, 0.3);
  
  &:hover {
    background: #1557b0;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26, 115, 232, 0.4);
  }
`;

const SecondaryButton = styled.button`
  padding: 16px 36px;
  font-size: 1.1rem;
  font-weight: 600;
  border: 2px solid #1a73e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  color: #1a73e8;
  
  &:hover {
    background: #1a73e8;
    color: white;
    transform: translateY(-2px);
  }
`;

// SAMSUNG STYLE LATEST OFFERS SECTION
const SamsungStyleOffersSection = styled.section`
  padding: 60px 20px;
  background: #ffffff;
  max-width: 1400px;
  margin: 0 auto;
`;

// Samsung style title - simple black text, no decorations
const SamsungOffersTitle = styled.h2`
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 40px;
  color: #000000;
  text-align: center;
  /* NO decorative elements like Vision's blue line */
`;

// Samsung style tabs - simple text, no button styling
const SamsungTabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 60px;
  gap: 40px;
  flex-wrap: wrap;
`;

const SamsungTab = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#000000' : '#666666'};
  cursor: pointer;
  padding: 8px 0;
  position: relative;
  transition: all 0.3s ease;
  
  /* Samsung style underline for active tab */
  ${props => props.active && `
    &:after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      right: 0;
      height: 2px;
      background: #000000;
    }
  `}
  
  &:hover {
    color: #000000;
  }
`;

// Samsung style layout - large featured product on left, smaller boxes on right
const SamsungOffersContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px; /* Reduced from 12px to 8px */
  max-width: 1200px;
  margin: 0 auto;
  align-items: stretch; /* Ensure both sides stretch to same height */
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SamsungFeaturedSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SamsungRightGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// Samsung style product card - clean white background
const SamsungOfferCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e5e5e5;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

// Large featured product card
const SamsungFeaturedCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e5e5e5;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

// Smaller right-side cards
const SamsungSmallCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e5e5e5;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

// Samsung style product image
const SamsungProductImage = styled.img`
  width: 100%;
  max-width: 200px;
  height: 200px;
  object-fit: contain;
  margin: 0 auto 24px;
  display: block;
`;

// Large featured product image
const SamsungFeaturedImage = styled.img`
  width: 100%;
  max-width: 300px;
  height: 300px;
  object-fit: contain;
  margin: 0 auto 32px;
  display: block;
`;

// Small card image
const SamsungSmallImage = styled.img`
  width: 100%;
  max-width: 120px;
  height: 120px;
  object-fit: contain;
  margin: 0 auto 16px;
  display: block;
`;

// Samsung style product name
const SamsungProductName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #000000;
  line-height: 1.4;
`;

// Samsung style product description/offer text
const SamsungOfferDescription = styled.p`
  font-size: 14px;
  color: #666666;
  margin-bottom: 24px;
  line-height: 1.5;
  min-height: 40px; /* Consistent height for alignment */
`;

// Samsung style "Buy now" button - but BLUE instead of black
const SamsungBuyButton = styled(Link)`
  display: inline-block;
  padding: 12px 32px;
  background: #1a73e8; /* BLUE instead of Samsung's black */
  color: white;
  text-decoration: none;
  border-radius: 24px; /* Samsung uses rounded buttons */
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: #1557b0; /* Darker blue on hover */
    transform: translateY(-1px);
  }
`;

// Rest of the sections remain the same...
const BenefitsSectionWrapper = styled.section`
  background: linear-gradient(to bottom, #ffffff, #f8fafb);
  padding: 5rem 0;
  position: relative;
  margin-top: -1px;
`;

const BenefitsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
`;


const BenefitCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
  
  &:hover .benefit-icon {
    transform: scale(1.1);
  }
`;

const BenefitIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  transition: transform 0.3s ease;
  
  /* Different colors for each icon */
  &.shipping {
    color: #1a73e8;
    background: linear-gradient(135deg, #e6f2ff 0%, #cce5ff 100%);
  }
  
  &.returns {
    color: #34a853;
    background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
  }
  
  &.payment {
    color: #ea4335;
    background: linear-gradient(135deg, #fdf2f2 0%, #fce4e4 100%);
  }
  
  &.rewards {
    color: #fbbc04;
    background: linear-gradient(135deg, #fffbf0 0%, #fff3cd 100%);
  }
`;

const BenefitTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const BenefitText = styled.p`
  font-size: 1rem;
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const LearnMoreLink = styled.a`
  color: #1a73e8;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s ease;
  cursor: pointer;
  
  &:hover {
    color: #1557b0;
    text-decoration: underline;
  }
  
  &:after {
    content: '→';
    font-size: 1rem;
    transition: transform 0.2s ease;
  }
  
  &:hover:after {
    transform: translateX(2px);
  }
`;

const FeaturedSection = styled.section`
  padding: 5rem 2rem;
  background: linear-gradient(to bottom, #f8fafb, #ffffff);
  position: relative;
  margin-top: -1px;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2d3748;
  position: relative;
  display: block;
  text-align: center;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: linear-gradient(to right, #1a73e8, #1557b0);
    border-radius: 2px;
  }
`;

const SectionDescription = styled.p`
  font-size: 1.2rem;
  color: #718096;
  max-width: 800px;
  margin: 2rem auto 3rem;
  padding-bottom: 1rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    border-color: #e0e0e0;
  }
`;

const ProductImage = styled.div`
  height: 220px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  img {
    max-width: 80%;
    max-height: 80%;
    object-fit: contain;
    transition: transform 0.5s ease;
  }
  
  ${ProductCard}:hover & img {
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
`;

const ProductName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const ProductPrice = styled.p`
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a73e8;
  margin-bottom: 1rem;
`;

const AddToCartButton = styled.button`
  width: 100%;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #1557b0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
  }
`;

const TestimonialsSection = styled.section`
  padding: 5rem 2rem;
  background: linear-gradient(to bottom, #f8fafb, #ffffff);
  margin-bottom: 0;
  position: relative;
  margin-top: -1px;
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
`;

const TestimonialCard = styled.div`
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 16px;
  position: relative;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
  }
  
  &:before {
    content: '"';
    position: absolute;
    top: 10px;
    left: 20px;
    font-size: 4rem;
    color: #1a73e820;
    font-family: Georgia, serif;
  }
`;

const Stars = styled.div`
  color: #ffd93d;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const TestimonialText = styled.p`
  color: #4a5568;
  font-style: italic;
  margin-bottom: 1rem;
  line-height: 1.6;
  position: relative;
  z-index: 1;
`;

const CustomerName = styled.p`
  font-weight: 600;
  color: #2d3748;
`;

const FeaturesSection = styled.div`
  padding: 5rem 2rem;
  background: #ffffff;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #1a73e8;
`;

const Button = styled(Link)`
  padding: 14px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  
  background: ${props => props.primary ? "#1a73e8" : "transparent"};
  color: ${props => props.primary ? "white" : "#1a73e8"};
  border: ${props => props.primary ? "none" : "2px solid #1a73e8"};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.primary 
      ? '0 4px 12px rgba(26, 115, 232, 0.25)' 
      : 'none'};
    background: ${props => props.primary ? "#1557b0" : "rgba(26, 115, 232, 0.05)"};
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('New In');
  const [phonesSlide, setPhonesSlide] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  
  const nextSlide = () => {
    setCurrentSlide(current => (current === 1 ? 0 : current + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(current => (current === 0 ? 1 : current - 1));
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  // Auto-progression for story-style carousel
  useEffect(() => {
    if (!isPaused) {
      const timer = setTimeout(() => {
        setCurrentSlide(current => (current === 1 ? 0 : current + 1));
      }, 5000); // 5 seconds per slide
      
      return () => clearTimeout(timer);
    }
  }, [currentSlide, isPaused]);

  // Pause auto-progression on hover
  const handleCarouselMouseEnter = () => setIsPaused(true);
  const handleCarouselMouseLeave = () => setIsPaused(false);
  
  // const featuredProducts = [
  //   {
  //     id: 1,
  //     name: 'MacBook M4 Pro',
  //     price: '$2,399',
  //     image: '/images/macbook_m4_pro1.jpg'
  //   },
  //   {
  //     id: 2,
  //     name: 'Samsung Galaxy S24 Ultra',
  //     price: '$1,199',
  //     image: '/images/samsung_s24_ultra.jpg'
  //   },
  //   {
  //     id: 3,
  //     name: 'Sony Bravia 8 OLED TV',
  //     price: '$2,299',
  //     image: '/images/sony_bravia_8.jpg'
  //   },
  //   {
  //     id: 4,
  //     name: 'iPad Pro M4',
  //     price: '$999',
  //     image: '/images/ipad_pro_m4.jpg'
  //   }
  // ];

  // Phones data for the slider
  const phonesData = [
    {
      id: 1,
      tagline: "Flagship Performance",
      name: "iPhone 16 Pro Max",
      priceFrom: "From £1,199.00",
      originalPrice: "£1,299.00",
      description: "Experience the ultimate in mobile technology with A17 Pro chip and titanium design.",
      image: "http://localhost:5001/images/iphone_16_pro_max.jpg",
      link: "/product/1-iphone-15-pro-max-phone"
    },
    {
      id: 2,
      tagline: "AI Revolution",
      name: "Samsung Galaxy S25 Ultra",
      priceFrom: "From £1,149.00",
      originalPrice: "£1,299.00",
      description: "Next-gen Galaxy AI is here. Transform your mobile experience with advanced AI features.",
      image: "http://localhost:5001/images/samsungs25ultra.jpg",
      link: "/product/1-samsung-galaxy-s25-ultra-phone"
    },
    {
      id: 3,
      tagline: "Pure Android Experience",
      name: "Google Pixel 9 Pro XL",
      priceFrom: "From £999.00",
      originalPrice: "£1,099.00",
      description: "The most helpful Pixel yet, with advanced AI and the best Pixel camera system.",
      image: "http://localhost:5001/images/googlepixel9proxl.jpg",
      link: "/product/1-google-pixel-9-pro-xl-phone"
    },
    {
      id: 4,
      tagline: "Pure Android Experience",
      name: "Google Pixel 8 Pro",
      priceFrom: "From £899.00",
      originalPrice: "£999.00",
      description: "The most helpful Pixel yet, with advanced AI and the best Pixel camera.",
      image: "http://localhost:5001/images/google_pixel_9_pro.jpg",
      link: "/product/1-google-pixel-9-pro-phone"
    },
    {
      id: 5,
      tagline: "Never Settle",
      name: "OnePlus 12",
      priceFrom: "From £749.00",
      originalPrice: "£849.00",
      description: "Flagship performance meets elegant design. Fast charging, smooth display.",
      image: "http://localhost:5001/images/oneplus_13r.jpg",
      link: "/product/1-oneplus-12-phone"
    }
  ];

  // Latest Offers data
  const featuredOffer = {
    id: 1,
    name: 'MacBook Pro M4',
    subtitle: 'Professional Performance Unleashed',
    originalPrice: '£2,399',
    salePrice: '£1,999',
    savings: 'Save £400',
    offer: 'Limited Time Offer',
    image: 'http://localhost:5001/images/macbook_m4_pro.jpg'
  };

  const gridOffers = [
    {
      id: 2,
      name: 'iPhone 16 Pro',
      offer: 'Trade-in deals up to £800 off',
      image: '/images/iphone_16_pro_max.jpg',
      bgColor: '#f8f9fa'
    },
    {
      id: 3,
      name: 'Galaxy S24 Ultra',
      offer: 'Free Galaxy Watch7 with purchase',
      image: '/images/samsung_s24_ultra.jpg',
      bgColor: '#f0f7ff'
    },
    {
      id: 4,
      name: 'Sony 65" BRAVIA',
      offer: 'Extra 15% off with soundbar bundle',
      image: '/images/sony_bravia_8.jpg',
      bgColor: '#fff5f0'
    },
    {
      id: 5,
      name: 'ASUS ROG Laptop',
      offer: 'Gaming bundle worth £300 included',
      image: '/images/rogstrix.jpg',
      bgColor: '#fef0f0'
    }
  ];

  const tabs = ['New In', 'Mobile', 'TV & AV', 'Laptops & Monitors'];

  // Phones slider navigation
  const nextPhonesSlide = () => {
  setPhonesSlide(current => (current === phonesData.length - 3 ? 0 : current + 1));
  };

  const prevPhonesSlide = () => {
  setPhonesSlide(current => (current === 0 ? phonesData.length - 3 : current - 1));
  };

  const handlePhoneEnquire = () => {
    eventSystem.emit('openChat');
  };

  const openChatbot = () => {
    eventSystem.emit('openChat');
  };
  
  const handleIPadLearnMore = () => {
    // Handle iPad learn more action
    console.log('Learn more about iPad M4 Pro');
  };

  const handleGalaxyTabLearnMore = () => {
  // Handle Galaxy Tab learn more action - open chatbot
  eventSystem.emit('openChat');
};
  
  return (
    <>
      <GlobalStyle />
      <HomeContainer>

        {/* Galaxy Tab S10 Showcase Section */}
        {/* <GalaxyTabShowcaseSection>
          <GalaxyTabImageContainer>
            <GalaxyTabImage 
              src="/images/ipadm4pro.jpg" 
              alt="Galaxy Tab S10"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/1400x600?text=Galaxy+Tab+S10';
              }}
            />
            <GalaxyTabOverlay />
            <GalaxyTabContentContainer>
              <GalaxyTabTagline>New Galaxy Tab S10</GalaxyTabTagline>
              <GalaxyTabTitle>Ultra Performance</GalaxyTabTitle>
              <GalaxyTabSubtitle>
                Experience the ultimate tablet with AI-powered productivity, 
                stunning display, and all-day battery life.
              </GalaxyTabSubtitle>
              <GalaxyTabButtonContainer>
                <GalaxyTabBuyButton to="/products?search=galaxy%20tab">
                  Buy Now
                </GalaxyTabBuyButton>
                <GalaxyTabLearnButton onClick={handleGalaxyTabLearnMore}>
                  Learn More
                </GalaxyTabLearnButton>
              </GalaxyTabButtonContainer>
            </GalaxyTabContentContainer>
          </GalaxyTabImageContainer>
        </GalaxyTabShowcaseSection> */}
        {/* Story-style Carousel with Auto-progression */}
        <CarouselContainer 
          onMouseEnter={handleCarouselMouseEnter}
          onMouseLeave={handleCarouselMouseLeave}
        >
          <CarouselSlider currentSlide={currentSlide}>
            
            {/* SLIDE 1: Galaxy Tab S10 */}
            <CarouselSlide>
              <GalaxyTabShowcaseSection>
                <GalaxyTabImageContainer>
                  <GalaxyTabImage 
                    src="/images/ipadm4pro.jpg"
                    alt="Galaxy Tab S10"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/1400x600?text=Galaxy+Tab+S10';
                    }}
                  />
                  <GalaxyTabOverlay />
                  <GalaxyTabContentContainer>
                    <GalaxyTabTagline>New Galaxy Tab S10</GalaxyTabTagline>
                    <GalaxyTabTitle>Ultra Performance</GalaxyTabTitle>
                    <GalaxyTabSubtitle>
                      Experience the ultimate tablet with AI-powered productivity, 
                      stunning display, and all-day battery life.
                    </GalaxyTabSubtitle>
                    <GalaxyTabButtonContainer>
                      <GalaxyTabBuyButton to="/products?search=galaxy%20tab">
                        Buy Now
                      </GalaxyTabBuyButton>
                      <GalaxyTabLearnButton onClick={handleGalaxyTabLearnMore}>
                        Learn More
                      </GalaxyTabLearnButton>
                    </GalaxyTabButtonContainer>
                  </GalaxyTabContentContainer>
                </GalaxyTabImageContainer>
              </GalaxyTabShowcaseSection>
            </CarouselSlide>
            
            {/* SLIDE 2: Video Content */}
            <CarouselSlide>
              <VideoSlide>
                <VideoContainer>
                  <video 
                    width="100%" 
                    height="100%" 
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      pointerEvents: 'none'
                    }}
                  >
                    <source src="/videos/ROG_Strix_G_Video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <VideoOverlay>
                    <VideoTitle>Vision Electronics Exclusive</VideoTitle>
                    <VideoDescription>
                      Discover our latest premium electronics collection with cutting-edge features and incredible performance.
                    </VideoDescription>
                    <PrimaryButton to="/products/featured">
                      Shop Collection
                    </PrimaryButton>
                  </VideoOverlay>
                </VideoContainer>
              </VideoSlide>
            </CarouselSlide>
          </CarouselSlider>
          
          {/* Navigation Arrows */}
          <CarouselNavButton className="prev" onClick={prevSlide}>
            <FaChevronLeft />
          </CarouselNavButton>
          <CarouselNavButton className="next" onClick={nextSlide}>
            <FaChevronRight />
          </CarouselNavButton>
          
          {/* Story-style Indicators */}
          <StoryIndicators>
            <StoryIndicator onClick={() => goToSlide(0)}>
              <StoryIndicatorFill active={currentSlide === 0} isPaused={isPaused} />
            </StoryIndicator>
            <StoryIndicator onClick={() => goToSlide(1)}>
              <StoryIndicatorFill active={currentSlide === 1} isPaused={isPaused} />
            </StoryIndicator>
          </StoryIndicators>
          
          {/* Bottom Story Progress Bars (Samsung style) */}
          <StoryProgressBars>
            <StoryProgressBar onClick={() => goToSlide(0)}>
              <StoryProgressFill 
                slideIndex={0} 
                currentSlide={currentSlide} 
                isPaused={isPaused} 
              />
            </StoryProgressBar>
            <StoryProgressBar onClick={() => goToSlide(1)}>
              <StoryProgressFill 
                slideIndex={1} 
                currentSlide={currentSlide} 
                isPaused={isPaused} 
              />
            </StoryProgressBar>
          </StoryProgressBars>
        </CarouselContainer>

        {/* Phones Section */}
        <PhonesSection>
          <PhonesHeader>
            <PhonesTitle>Phones</PhonesTitle>
            <ViewAllButton to="/products?category=phone">View all</ViewAllButton>
          </PhonesHeader>
          
          <PhonesSliderContainer>
            <PhonesSlider currentSlide={phonesSlide}>
              {phonesData.map(phone => (
                <PhoneCard key={phone.id}>
                  <PhoneImageContainer>
                    <PhoneImage 
                      src={phone.image} 
                      alt={phone.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x200?text=Phone';
                      }}
                    />
                  </PhoneImageContainer>
                  <PhoneTagline>{phone.tagline}</PhoneTagline>
                  <PhoneName>{phone.name}</PhoneName>
                  <PhonePrice>
                    <PriceText>{phone.priceFrom}</PriceText>
                    <OriginalPrice>{phone.originalPrice}</OriginalPrice>
                  </PhonePrice>
                  <PhoneDescription>{phone.description}</PhoneDescription>
                  <PhoneButtonContainer>
                    <PhoneBuyButton to={phone.link}>Buy now</PhoneBuyButton>
                    <PhoneEnquireButton onClick={handlePhoneEnquire}>Enquire</PhoneEnquireButton>
                  </PhoneButtonContainer>
                </PhoneCard>
              ))}
            </PhonesSlider>
            
            <SliderNavButton className="prev" onClick={prevPhonesSlide}>
              <FaChevronLeft />
            </SliderNavButton>
            <SliderNavButton className="next" onClick={nextPhonesSlide}>
              <FaChevronRight />
            </SliderNavButton>
          </PhonesSliderContainer>
        </PhonesSection>

        {/* Latest Offers & Deals Section */}
        <OffersSection>
          <OffersTitle>Latest Offers & Deals</OffersTitle>
          
          <OffersGrid>
            {/* Featured Large Card - Left Side */}
            <FeaturedCard>
              {/* Offer Badge */}
              <FeaturedContent>
                <OfferBadge>{featuredOffer.offer}</OfferBadge>
                
                <FeaturedProductLayout>
                  {/* Content Side */}
                  <FeaturedProductInfo>
                    <FeaturedProductName>{featuredOffer.name}</FeaturedProductName>
                    <FeaturedProductSubtitle>{featuredOffer.subtitle}</FeaturedProductSubtitle>
                    
                    {/* Pricing */}
                    <PricingSection>
                      <PriceContainer>
                        <SalePrice>{featuredOffer.salePrice}</SalePrice>
                        <OriginalPriceOffer>{featuredOffer.originalPrice}</OriginalPriceOffer>
                      </PriceContainer>
                      <Savings>{featuredOffer.savings}</Savings>
                    </PricingSection>
                    
                    {/* CTA Button */}
                    <FeaturedButton>Shop Now</FeaturedButton>
                  </FeaturedProductInfo>
                  
                  {/* Image Side */}
                  <FeaturedImage>
                    <img 
                      src={featuredOffer.image} 
                      alt={featuredOffer.name}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/300x200?text=${featuredOffer.name.replace(/\s+/g, '+')}`;
                      }}
                    />
                  </FeaturedImage>
                </FeaturedProductLayout>
              </FeaturedContent>
            </FeaturedCard>

            {/* Grid Cards - Right Side */}
            <GridCards>
              {gridOffers.map(item => (
                <GridCard key={item.id} bgColor={item.bgColor}>
                  {/* Image */}
                  <GridCardImage>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/80x80?text=${item.name.replace(/\s+/g, '+')}`;
                      }}
                    />
                  </GridCardImage>
                  
                  {/* Content */}
                  <GridCardName>{item.name}</GridCardName>
                  <GridCardOffer>{item.offer}</GridCardOffer>
                  
                  {/* Learn More Link */}
                  <GridCardLink>
                    Learn more 
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </GridCardLink>
                </GridCard>
              ))}
            </GridCards>
          </OffersGrid>
        </OffersSection>

         {/* Benefits Section */}
        <BenefitsSectionWrapper>
          <SectionTitle>The Vision Experience</SectionTitle>
          <SectionDescription>
            What makes us different
          </SectionDescription>
          <BenefitsSection>
            <BenefitCard>
              <BenefitIcon className="benefit-icon shipping">
                <FaShippingFast />
              </BenefitIcon>
              <BenefitTitle>Free Delivery</BenefitTitle>
              <BenefitText>Fast shipping on orders over £75</BenefitText>
              <LearnMoreLink>Learn more</LearnMoreLink>
            </BenefitCard>
            
            <BenefitCard>
              <BenefitIcon className="benefit-icon returns">
                <FaExchangeAlt />
              </BenefitIcon>
              <BenefitTitle>Easy Returns</BenefitTitle>
              <BenefitText>30-day hassle-free returns</BenefitText>
              <LearnMoreLink>Learn more</LearnMoreLink>
            </BenefitCard>
            
            <BenefitCard>
              <BenefitIcon className="benefit-icon payment">
                <FaLock />
              </BenefitIcon>
              <BenefitTitle>Secure Payment</BenefitTitle>
              <BenefitText>Your data is safe and encrypted</BenefitText>
              <LearnMoreLink>Learn more</LearnMoreLink>
            </BenefitCard>
            
            <BenefitCard>
              <BenefitIcon className="benefit-icon rewards">
                <FaGift />
              </BenefitIcon>
              <BenefitTitle>Rewards Program</BenefitTitle>
              <BenefitText>Earn points with every purchase</BenefitText>
              <LearnMoreLink>Learn more</LearnMoreLink>
            </BenefitCard>
          </BenefitsSection>
        </BenefitsSectionWrapper>

        {/* ROG Strix Gaming Showcase */}
        <OnePlusStyleShowcase>
          <ShowcaseImage />
          <ShowcaseContainer>
            <ShowcaseContent>
              <ShowcaseTitle>ROG Strix Gaming</ShowcaseTitle>
              <ShowcaseSubtitle>
                Ultimate gaming performance engineered for speed, power, and precision. 
                Experience the next level of gaming with ASUS ROG Strix.
              </ShowcaseSubtitle>
              <ShowcaseButtonContainer>
                <OnePlusBuyButton to="/product/1-asus-rog-strix-laptop">
                  Buy Now
                </OnePlusBuyButton>
                <EnquireButton onClick={openChatbot}>
                  Enquire
                  <ArrowIcon>›</ArrowIcon>
                </EnquireButton>
              </ShowcaseButtonContainer>
            </ShowcaseContent>
          </ShowcaseContainer>
        </OnePlusStyleShowcase>

        {/* Gaming Accessories Section */}
        <GamingAccessoriesSection>
          <GamingAccessoriesContainer>
            {/* Gaming Headphones */}
            <GamingAccessoryCard>
              <GamingAccessoryImage image="/images/headphone.jpg" />
              <GamingAccessoryContent>
                <GamingAccessoryTitle>Gaming Audio</GamingAccessoryTitle>
                <GamingAccessorySubtitle>
                  Immerse yourself in crystal-clear audio with premium gaming headphones 
                  designed for competitive advantage.
                </GamingAccessorySubtitle>
                <GamingAccessoryButtonContainer>
                  <GamingAccessoryBuyButton to="/products?search=gaming%20headphones">
                    Buy Now
                  </GamingAccessoryBuyButton>
                  <GamingAccessoryEnquireButton onClick={openChatbot}>
                    Enquire
                  </GamingAccessoryEnquireButton>
                </GamingAccessoryButtonContainer>
              </GamingAccessoryContent>
            </GamingAccessoryCard>

            {/* Gaming Mouse */}
            <GamingAccessoryCard>
              <GamingAccessoryImage image="/images/gamingmouse.jpg" />
              <GamingAccessoryContent>
                <GamingAccessoryTitle>Precision Control</GamingAccessoryTitle>
                <GamingAccessorySubtitle>
                  Achieve pixel-perfect accuracy with high-performance gaming mice 
                  built for speed and precision.
                </GamingAccessorySubtitle>
                <GamingAccessoryButtonContainer>
                  <GamingAccessoryBuyButton to="/products?search=gaming%20mouse">
                    Buy Now
                  </GamingAccessoryBuyButton>
                  <GamingAccessoryEnquireButton onClick={openChatbot}>
                    Enquire
                  </GamingAccessoryEnquireButton>
                </GamingAccessoryButtonContainer>
              </GamingAccessoryContent>
            </GamingAccessoryCard>
          </GamingAccessoriesContainer>
        </GamingAccessoriesSection>

       
        
        {/* Featured Products */}
        {/* <FeaturedSection>
          <SectionTitle>Featured Products</SectionTitle>
          <SectionDescription>
            Check out our most popular tech products loved by customers
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
                  <AddToCartButton>Add to Cart</AddToCartButton>
                </ProductInfo>
              </ProductCard>
            ))}
          </ProductsGrid>
        </FeaturedSection> */}
        
      

        {/* Customer Testimonials */}
        <TestimonialsSection>
          <SectionTitle>What Our Customers Say</SectionTitle>
          <SectionDescription>
            Real experiences from real customers
          </SectionDescription>
          <TestimonialGrid>
            <TestimonialCard>
              <Stars>⭐⭐⭐⭐⭐</Stars>
              <TestimonialText>
                The AI recommendations were spot on! Found the perfect laptop for my needs within minutes.
              </TestimonialText>
              <CustomerName>— Sarah Johnson</CustomerName>
            </TestimonialCard>
            <TestimonialCard>
              <Stars>⭐⭐⭐⭐⭐</Stars>
              <TestimonialText>
                Excellent customer service and fast delivery. My go-to store for all electronics.
              </TestimonialText>
              <CustomerName>— Michael Chen</CustomerName>
            </TestimonialCard>
            <TestimonialCard>
              <Stars>⭐⭐⭐⭐⭐</Stars>
              <TestimonialText>
                Great prices and the extended warranty gives me peace of mind. Highly recommend!
              </TestimonialText>
              <CustomerName>— Emily Davis</CustomerName>
            </TestimonialCard>
          </TestimonialGrid>
        </TestimonialsSection>
      </HomeContainer>
    </>
  );
};

export default Home;