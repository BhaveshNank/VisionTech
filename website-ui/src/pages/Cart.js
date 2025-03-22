import React from 'react';
import { useCart } from '../context/CartContext';
import styled from 'styled-components';
import { FaTrash } from 'react-icons/fa';

// Add styling
const CartContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const CartTitle = styled.h1`
  margin-bottom: 30px;
  font-size: 28px;
  color: #333;
`;

const EmptyCart = styled.p`
  font-size: 18px;
  color: #666;
  text-align: center;
  padding: 40px 0;
`;

const CartItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: white;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-right: 20px;
  border-radius: 4px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.h3`
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
`;

const ProductPrice = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #2575fc;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: #f8f9fa;
  color: #dc3545;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dc3545;
    color: white;
  }
`;

const Cart = () => {
  const { cartItems, dispatch } = useCart();

  return (
    <CartContainer>
      <CartTitle>Your Shopping Cart</CartTitle>
      {cartItems.length === 0 ? (
        <EmptyCart>Your cart is empty</EmptyCart>
      ) : (
        <CartItemList>
          {cartItems.map(item => (
            <CartItem key={item.id}>
              <ProductImage src={item.image} alt={item.name} />
              <ProductInfo>
                <ProductName>{item.name}</ProductName>
                <ProductPrice>${item.price} × {item.quantity || 1}</ProductPrice>
              </ProductInfo>
              <RemoveButton onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}>
                <FaTrash /> Remove
              </RemoveButton>
            </CartItem>
          ))}
        </CartItemList>
      )}
    </CartContainer>
  );
};

export default Cart;