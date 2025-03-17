import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background-color: #2c3e50;
  color: white;
  padding: 2rem 1rem;
`;

const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterSection = styled.div`
  margin-bottom: 1.5rem;
  min-width: 200px;
  flex: 1;
`;

const FooterTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const FooterLink = styled(Link)`
  display: block;
  color: #ecf0f1;
  text-decoration: none;
  margin-bottom: 0.5rem;
  
  &:hover {
    color: #3498db;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #34495e;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>Smart Shop</FooterTitle>
          <p>Your AI-powered shopping companion for the best tech products</p>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Shop</FooterTitle>
          <FooterLink to="/categories">Categories</FooterLink>
          <FooterLink to="/products?category=phones">Phones</FooterLink>
          <FooterLink to="/products?category=laptops">Laptops</FooterLink>
          <FooterLink to="/products?category=tvs">TVs</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Support</FooterTitle>
          <FooterLink to="/contact">Contact Us</FooterLink>
          <FooterLink to="/about">About Us</FooterLink>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        &copy; {new Date().getFullYear()} Smart Shop. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;