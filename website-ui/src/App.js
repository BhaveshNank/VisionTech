import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';
import ChatInterface from './components/ChatInterface';
import Home from './components/Home';
import CategoriesPage from './pages/CategoriesPage';  // ✅ Ensure it's imported

import styled from 'styled-components';
import './styles/main.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const ContentContainer = styled.div`
  padding-top: 80px; // Add space for fixed navbar
  padding-bottom: 80px; // Add space for chat interface
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Navbar />
        <ContentContainer>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<CategoriesPage />} />  {/* ✅ Properly routed */}
          </Routes>
        </ContentContainer>
        <ChatInterface />
      </AppContainer>
    </Router>
  );
}

export default App;
