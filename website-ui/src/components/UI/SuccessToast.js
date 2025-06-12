import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';

const slideInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translate(-50%, 20px); 
  }
  to { 
    opacity: 1; 
    transform: translate(-50%, 0); 
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  color: #202124;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  z-index: 1100;
  animation: ${slideInUp} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid #e8eaed;
  min-width: 280px;
  max-width: 400px;
`;

const IconWrapper = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #34a853;
  border-radius: 50%;
  color: white;
  font-size: 12px;
`;

const MessageText = styled.span`
  font-weight: 500;
  font-size: 0.95rem;
`;

const SuccessToast = ({ message }) => {
  return (
    <ToastContainer>
      <IconWrapper>
        <FaCheck />
      </IconWrapper>
      <MessageText>{message}</MessageText>
    </ToastContainer>
  );
};

export default SuccessToast;