import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
// You'll need to install react-icons: npm install react-icons
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background-color: #000000; /* Black background to match website theme */
  color: #e2e8f0;
  padding: 3rem 1.5rem 1.5rem; /* More top padding */
`;

const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem; /* Add gap between sections */
`;

const FooterSection = styled.div`
  margin-bottom: 2rem;
  min-width: 200px;
  flex: 1;
  
  /* Make first section slightly wider */
  &:first-child {
    flex: 1.2;
  }
`;

const FooterTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  color: white;
  position: relative;
  
  /* Add subtle underline */
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 40px;
    height: 2px;
    background-color: #3498db;
  }
`;

const FooterText = styled.p`
  line-height: 1.6;
  color: #a0aec0;
  margin-bottom: 1rem;
`;

const FooterLink = styled(Link)`
  display: block;
  color: #cbd5e0;
  text-decoration: none;
  margin-bottom: 0.7rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: #3498db;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const SocialIcon = styled.a`
  color: #cbd5e0;
  font-size: 1.2rem;
  transition: color 0.2s ease, transform 0.2s ease;
  
  &:hover {
    color: #3498db;
    transform: translateY(-2px);
  }
`;

const Divider = styled.div`
  border-top: 1px solid #333333;
  margin: 1.5rem 0;
  width: 100%;
`;

const BottomSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const Copyright = styled.div`
  color: #a0aec0;
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const LegalLink = styled(Link)`
  color: #a0aec0;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: #3498db;
  }
`;

const SubscriptionForm = styled.form`
  display: flex;
  margin-top: 1rem;
`;

const EmailInput = styled.input`
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 4px 0 0 4px;
  background-color: #1a1a1a;
  color: white;
  flex-grow: 1;
  
  &:focus {
    outline: none;
    background-color: #2a2a2a;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const SubscribeButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 0 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would add logic to handle the subscription
    console.log('Subscription requested for:', email);
    alert('Thanks for subscribing!');
    setEmail('');
  };

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>Vision Electronics</FooterTitle>
          <FooterText>
            Your trusted partner for quality electronics. We provide expert recommendations 
            powered by AI to help you find the perfect tech products.
          </FooterText>
          <SocialIcons>
            <SocialIcon href="https://facebook.com" target="_blank" aria-label="Facebook">
              <FaFacebook />
            </SocialIcon>
            <SocialIcon href="https://twitter.com" target="_blank" aria-label="Twitter">
              <FaTwitter />
            </SocialIcon>
            <SocialIcon href="https://instagram.com" target="_blank" aria-label="Instagram">
              <FaInstagram />
            </SocialIcon>
            <SocialIcon href="https://linkedin.com" target="_blank" aria-label="LinkedIn">
              <FaLinkedin />
            </SocialIcon>
          </SocialIcons>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Shop</FooterTitle>
          <FooterLink to="/categories">Categories</FooterLink>
          <FooterLink to="/products?category=phones">Phones</FooterLink>
          <FooterLink to="/products?category=laptops">Laptops</FooterLink>
          <FooterLink to="/products?category=tvs">TVs</FooterLink>
          <FooterLink to="/products?deals=true">Special Deals</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Support</FooterTitle>
          <FooterLink to="/contact">Contact Us</FooterLink>
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
          <FooterLink to="/shipping">Shipping Info</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Stay Updated</FooterTitle>
          <FooterText>
            Subscribe to get the latest products, deals and tech news.
          </FooterText>
          <SubscriptionForm onSubmit={handleSubmit}>
            <EmailInput 
              type="email" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <SubscribeButton type="submit">
              Subscribe
            </SubscribeButton>
          </SubscriptionForm>
        </FooterSection>
      </FooterContent>
      
      <Divider />
      
      <BottomSection>
        <Copyright>
          &copy; {new Date().getFullYear()} Vision Electronics. All rights reserved.
        </Copyright>
        <LegalLinks>
          <LegalLink to="/privacy">Privacy Policy</LegalLink>
          <LegalLink to="/terms">Terms of Service</LegalLink>
          <LegalLink to="/returns">Return Policy</LegalLink>
        </LegalLinks>
      </BottomSection>
    </FooterContainer>
  );
};

export default Footer;