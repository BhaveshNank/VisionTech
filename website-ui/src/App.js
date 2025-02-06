import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';
import ChatInterface from './components/ChatInterface';
import Home from './components/Home';
import styled from 'styled-components';
import './styles/main.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Add more routes here as needed */}
        </Routes>
        <ChatInterface />
      </AppContainer>
    </Router>
  );
}

export default App;