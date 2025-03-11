import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 500;

  &:hover {
    color: #2980b9;
  }
`;

const Navigation = () => {
  return (
    <Navbar>
      <StyledLink to="/">Home</StyledLink>
      <NavLinks>
        <StyledLink to="/products">Products</StyledLink>
        <StyledLink to="/categories">Categories</StyledLink> {/* Added link to categories */}
        <StyledLink to="/about">About</StyledLink>
      </NavLinks>
    </Navbar>
  );
};

export default Navigation;
