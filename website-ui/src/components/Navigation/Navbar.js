import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import SearchBar from './SearchBar';
import { useCart } from "../../context/CartContext"; // ✅ Ensure correct path
import eventSystem from '../../utils/events';
import { FaShoppingCart } from 'react-icons/fa';

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  
  a {
    color: #2575fc;
    text-decoration: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  
  a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -5px;
      left: 0;
      background-color: #2575fc;
      transition: width 0.3s ease;
    }
    
    &:hover:after, &.active:after {
      width: 100%;
    }
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const CartIcon = styled.div`
  position: relative;
  cursor: pointer;
  color: #333; // Add explicit color
  font-size: 24px; // Increase size
  margin-left: 15px; // Add spacing
  
  a {
    display: flex;
    align-items: center;
    color: inherit; // Inherit color from parent
    text-decoration: none;
  }
  
  span {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #2575fc;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const HelpButton = styled.button`
  padding: 8px 12px;
  background: #2575fc;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #1a65e0;
    transform: translateY(-2px);
  }
`;

const Navbar = () => {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  const openChatbot = () => {
    eventSystem.emit('openChat');
  };

  return (
    <NavContainer>
      <Logo>
        <Link to="/">SmartShop</Link>
      </Logo>
      
      <NavLinks>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </NavLinks>
      
      <NavRight>
        <SearchBar />
        <CartIcon>
          <Link to="/cart" aria-label="View shopping cart">
            <FaShoppingCart size={24} />
            {itemCount > 0 && <span>{itemCount}</span>}
          </Link>
        </CartIcon>
      </NavRight>
    </NavContainer>
  );
};

export default Navbar;
