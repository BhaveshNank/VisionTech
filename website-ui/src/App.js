import React, { useEffect, useState } from 'react';
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

function App() {
  useEffect(() => {
    window.addToCartFromChatbot('test-123', 'Test Product', 99.99, 'http://localhost:5001/images/default-product.jpg');
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
              <Route path="/product/:id" element={<ProductDetailPage />} />
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
