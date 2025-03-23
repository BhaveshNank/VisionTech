import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

// Enhanced styling
const CartContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const CartTitle = styled.h1`
  margin-bottom: 30px;
  font-size: 28px;
  color: #333;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 12px;
    color: #007bff;
  }
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CartContent = styled.div``;

const EmptyCart = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  h2 {
    color: #333;
    margin-bottom: 20px;
  }
  
  p {
    color: #666;
    margin-bottom: 20px;
  }
  
  svg {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 20px;
  }
`;

const CartItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f8f9fa;
  border: none;
  cursor: pointer;
  color: ${props => props.disabled ? '#adb5bd' : '#495057'};
  
  &:hover {
    background: ${props => props.disabled ? '#f8f9fa' : '#e9ecef'};
  }
  
  &:focus {
    outline: none;
  }
`;

const QuantityText = styled.div`
  padding: 0 12px;
  font-size: 14px;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
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

const CartSummary = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 24px;
`;

const SummaryTitle = styled.h2`
  font-size: 20px;
  margin: 0 0 20px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 16px;
  color: ${props => props.total ? '#333' : '#666'};
  font-weight: ${props => props.total ? '600' : 'normal'};
  
  &:last-child {
    margin-top: 20px;
    padding-top: 12px;
    border-top: 1px solid #e9ecef;
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 24px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #218838;
  }
`;

const ShopMoreLink = styled(Link)`
  display: inline-block; // Changed from block to inline-block
  text-align: center;
  margin-top: 16px;
  color: #007bff;
  text-decoration: none;
  font-size: 13px; // Reduced from 14px
  padding: 5px 10px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const OrderSuccess = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: #d4edda;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  color: #155724;
  margin-top: 20px;
  
  h2 {
    margin-bottom: 20px;
  }
  
  p {
    margin-bottom: 20px;
    font-size: 16px;
  }
  
  button {
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-top: 10px;
    
    &:hover {
      background: #218838;
    }
  }
`;

// Add this styled component for displaying item subtotal
const ItemSubtotal = styled.div`
  margin-left: auto;
  margin-right: 20px;
  font-weight: 500;
  color: #333;
`;

const Cart = () => {
  const { cartItems, dispatch, cartTotal } = useCart();
  const navigate = useNavigate();
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const handleCheckout = () => {
    setOrderSuccess(true);
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContainer>
      {orderSuccess ? (
        <OrderSuccess>
          <h2>Thank you for your order!</h2>
          <p>Your order has been received and is being processed.</p>
          <p>Order confirmation details have been sent to your email.</p>
          <p>Order #: {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
          <Link to="/products" style={{ 
            background: '#28a745',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            textDecoration: 'none'
          }}>
            Continue Shopping
          </Link>
        </OrderSuccess>
      ) : (
        <>
          <CartTitle>
            <FaShoppingCart /> Your Shopping Cart
          </CartTitle>
          
          {cartItems.length === 0 ? (
            <EmptyCart>
              <FaShoppingCart />
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any products to your cart yet.</p>
              <Link to="/products" style={{ 
                padding: '6px 12px', // Reduced from 10px 20px
                background: '#007bff', 
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '14px', // Added smaller font size
                gap: '6px' // Reduced from 8px
              }}>
                <FaArrowLeft size={12} /> Continue Shopping
              </Link>
            </EmptyCart>
          ) : (
            <CartLayout>
              <CartContent>
                <CartItemList>
                  {cartItems.map(item => (
                    <CartItem key={item.id}>
                      <ProductImage 
                        src={item.image} 
                        alt={item.name} 
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=Product';
                        }}
                      />
                      <ProductInfo>
                        <ProductName>{item.name}</ProductName>
                        <ProductPrice>
                          ${parseFloat(item.price.toString().replace(/[^0-9.-]+/g, '')).toFixed(2)}
                        </ProductPrice>
                      </ProductInfo>
                      <QuantityControls>
                        <QuantityButton 
                          onClick={() => dispatch({ type: 'DECREASE_QUANTITY', payload: item.id })}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus size={12} />
                        </QuantityButton>
                        <QuantityText>{item.quantity}</QuantityText>
                        <QuantityButton onClick={() => dispatch({ type: 'INCREASE_QUANTITY', payload: item.id })}>
                          <FaPlus size={12} />
                        </QuantityButton>
                      </QuantityControls>
                      <ItemSubtotal>
                        ${(parseFloat(item.price.toString().replace(/[^0-9.-]+/g, '')) * item.quantity).toFixed(2)}
                      </ItemSubtotal>
                      <RemoveButton onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}>
                        <FaTrash /> Remove
                      </RemoveButton>
                    </CartItem>
                  ))}
                </CartItemList>
              </CartContent>
              
              <CartSummary>
                <SummaryTitle>Order Summary</SummaryTitle>
                <SummaryRow>
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Shipping</span>
                  <span>Free</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </SummaryRow>
                <SummaryRow total>
                  <span>Estimated Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </SummaryRow>
                <CheckoutButton onClick={handleCheckout}>
                  Proceed to Checkout
                </CheckoutButton>
                <ShopMoreLink to="/products">
                  ← Continue Shopping
                </ShopMoreLink>
              </CartSummary>
            </CartLayout>
          )}
        </>
      )}
    </CartContainer>
  );
};

export default Cart;