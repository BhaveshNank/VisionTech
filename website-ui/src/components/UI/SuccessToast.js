import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaShoppingCart } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  z-index: 1100;
  animation: ${fadeIn} 0.3s ease-out;
`;

const IconWrapper = styled.div`
  margin-right: 10px;
`;

const SuccessToast = ({ message }) => {
  return (
    <ToastContainer>
      <IconWrapper>
        <FaShoppingCart />
      </IconWrapper>
      {message}
    </ToastContainer>
  );
};

export default SuccessToast;