import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import About from './pages/About';
import ChatInterface from './components/ChatInterface';
import Footer from './components/UI/Footer';
import styled from 'styled-components';
import './styles/main.css';
import Contact from './pages/Contact';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';

// App container styles
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding-top: 80px;
  padding-bottom: 80px;
`;

// Exported styled components for reuse throughout the app
export const CategoryItem = styled.li`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  color: ${props => props.active ? '#007bff' : '#2c3e50'};
  font-weight: ${props => props.active ? '600' : 'normal'};
  border-radius: 6px;
  transition: all 0.2s ease;
  background: ${props => props.active ? '#e6f2ff' : 'transparent'};
  
  &:hover {
    background: ${props => props.active ? '#e6f2ff' : '#f8f9fa'};
    color: #007bff;
  }
  
  svg {
    margin-right: 10px;
    font-size: 1.1rem;
  }
`;

export const CategoryCount = styled.span`
  margin-left: auto;
  background-color: ${props => props.active ? '#007bff' : '#e9ecef'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 24px;
  text-align: center;
`;

export const FilterSection = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
`;

export const RangeContainer = styled.div`
  margin-top: 12px;
`;

export const PriceInputs = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

export const PriceInput = styled.input`
  width: 70px;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
`;

export const PriceSeparator = styled.span`
  margin: 0 8px;
  color: #6c757d;
`;

export const ApplyButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  
  &:hover {
    background-color: #0069d9;
  }
`;

export const MobileFilterToggle = styled.button`
  display: none;
  width: 100%;
  background: #007bff;
  color: white;
  border: none;
  padding: 10px;
  font-size: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  svg {
    margin-right: 8px;
  }
`;

export const Sidebar = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-self: start;
  position: sticky;
  top: 20px;
  
  @media (max-width: 768px) {
    position: static;
    display: ${props => props.isOpen ? 'block' : 'none'};
    margin-bottom: 1.5rem;
  }
`;

export const ClearFiltersButton = styled.button`
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 2rem;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: all 0.2s;
  
  &:hover {
    background-color: #dc3545;
    color: white;
  }
`;

function App() {
  useEffect(() => {
    window.addToCartFromChatbot = (id, name, price, image) => {
      // Your existing code for this function
    };
  }, []);

  return (
    <CartProvider>
      <BrowserRouter>
        <AppContainer>
          <Navbar />
          <ContentContainer>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:idOrName" element={<ProductDetailPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </ContentContainer>
          <ChatInterface />
          <Footer />
        </AppContainer>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;