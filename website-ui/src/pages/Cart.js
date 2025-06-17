import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShoppingCart, FaShieldAlt, FaTruck, FaHeart, FaGift } from 'react-icons/fa';

const CartContainer = styled.div`
  background: #ffffff;
  min-height: 100vh;
  margin-top: 80px;
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  
  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const CartTitle = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: 48px;
  font-weight: 700;
  color: #000000;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const CartSubtitle = styled.p`
  color: #666666;
  font-size: 1.1rem;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 320px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CartContent = styled.div``;

const EmptyCart = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  color: #000000;
  border: 1px solid #e5e5e5;
  
  .empty-icon {
    font-size: 5rem;
    margin-bottom: 2rem;
    color: #cccccc;
  }
  
  h2 {
    margin-bottom: 1rem;
    font-weight: 600;
    font-size: 1.8rem;
    color: #000000;
  }
  
  p {
    margin-bottom: 2.5rem;
    font-size: 1.1rem;
    color: #666666;
    line-height: 1.6;
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
  padding: 2rem;
  border-radius: 12px;
  background: white;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: #e0e0e0;
    
    &::before {
      transform: scaleY(1);
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ProductImageContainer = styled.div`
  position: relative;
  margin-right: 2rem;
  
  @media (max-width: 768px) {
    margin-right: 0;
    align-self: center;
  }
`;

const ProductImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ProductName = styled.h3`
  margin: 0 0 0.75rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ProductBrand = styled.p`
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const ProductPrice = styled.div`
  margin: 0;
  
  .current-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
  }
  
  .unit-price {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.25rem;
  }
`;

const CartItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    gap: 1rem;
  }
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  cursor: pointer;
  color: ${props => props.disabled ? '#ccc' : '#333'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.disabled ? 'white' : '#667eea'};
    color: ${props => props.disabled ? '#ccc' : 'white'};
  }
  
  &:focus {
    outline: none;
  }
`;

const QuantityText = styled.div`
  padding: 0 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
  color: #333;
  background: white;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fff5f5;
  color: #e53e3e;
  border: 1px solid #fed7d7;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  font-weight: 500;
  
  &:hover {
    background: #e53e3e;
    color: white;
    border-color: #e53e3e;
  }
`;

const WishlistButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fff5f8;
  color: #d53f8c;
  border: 1px solid #fbb6ce;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  font-weight: 500;
  
  &:hover {
    background: #d53f8c;
    color: white;
    border-color: #d53f8c;
  }
`;

const CartSummary = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 100px;
  color: #000000;
  border: 1px solid #e5e5e5;
  
  @media (max-width: 768px) {
    position: static;
    margin-top: 1rem;
    padding: 1.5rem;
  }
`;

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e5e5;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: ${props => props.total ? '#000000' : '#666666'};
  font-weight: ${props => props.total ? '700' : '400'};
  
  ${props => props.total && `
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e5e5;
    font-size: 1.3rem;
  `}
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #1a1a1a;
    transform: translateY(-2px);
  }
`;

const ShopMoreLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #666666;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.5rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: #000000;
  }
`;

const SecurityFeatures = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e5e5;
`;

const SecurityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #666666;
  
  svg {
    color: #4ade80;
  }
`;

const OrderSuccess = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  
  h2 {
    color: #333;
    margin-bottom: 1.5rem;
    font-weight: 600;
    font-size: 1.5rem;
  }
  
  p {
    color: #666;
    margin-bottom: 1rem;
    font-size: 1rem;
    line-height: 1.5;
    
    &:last-of-type {
      margin-bottom: 2rem;
      font-weight: 500;
      color: #333;
    }
  }
`;

const ItemSubtotal = styled.div`
  font-weight: 700;
  color: #333;
  font-size: 1.3rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ShopButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 12px 24px;
  background: transparent;
  color: #000000;
  text-decoration: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid #000000;
  
  &:hover {
    background: #000000;
    color: #ffffff;
  }
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
      <ContentWrapper>
        {orderSuccess ? (
          <OrderSuccess>
            <h2>Thank you for your order!</h2>
            <p>Your order has been received and is being processed.</p>
            <p>Order confirmation details have been sent to your email.</p>
            <p>Order #: {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
            <ShopButton to="/products">
              Continue Shopping
            </ShopButton>
          </OrderSuccess>
        ) : (
          <>
            <PageHeader>
              <CartTitle>Shopping Cart</CartTitle>
              <CartSubtitle>Review your items and proceed to checkout</CartSubtitle>
            </PageHeader>
          
          {cartItems.length === 0 ? (
            <EmptyCart>
              <FaShoppingCart className="empty-icon" />
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any products to your cart yet.</p>
              <ShopButton to="/products">
                <FaArrowLeft size={14} /> Continue Shopping
              </ShopButton>
            </EmptyCart>
          ) : (
            <CartLayout>
              <CartContent>
                <CartItemList>
                  {cartItems.map(item => (
                    <CartItem key={item.id}>
                      <ProductImageContainer>
                        <ProductImage 
                          src={item.image} 
                          alt={item.name} 
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/120?text=Product';
                          }}
                        />
                      </ProductImageContainer>
                      <ProductInfo>
                        <ProductBrand>Premium Tech</ProductBrand>
                        <ProductName>{item.name}</ProductName>
                        <ProductPrice>
                          <div className="current-price">£{parseFloat(item.price.toString().replace(/[^0-9.-]+/g, '')).toFixed(2)}</div>
                          <div className="unit-price">Price per unit</div>
                        </ProductPrice>
                      </ProductInfo>
                      <CartItemActions>
                        <QuantityControls>
                          <QuantityButton 
                            onClick={() => dispatch({ type: 'DECREASE_QUANTITY', payload: item.id })}
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus size={14} />
                          </QuantityButton>
                          <QuantityText>{item.quantity}</QuantityText>
                          <QuantityButton onClick={() => dispatch({ type: 'INCREASE_QUANTITY', payload: item.id })}>
                            <FaPlus size={14} />
                          </QuantityButton>
                        </QuantityControls>
                        <ItemSubtotal>
                          £{(parseFloat(item.price.toString().replace(/[^0-9.-]+/g, '')) * item.quantity).toFixed(2)}
                        </ItemSubtotal>
                        <ActionButtons>
                          <WishlistButton onClick={() => console.log('Add to wishlist')}>
                            <FaHeart size={12} /> Save
                          </WishlistButton>
                          <RemoveButton onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}>
                            <FaTrash size={12} /> Remove
                          </RemoveButton>
                        </ActionButtons>
                      </CartItemActions>
                    </CartItem>
                  ))}
                </CartItemList>
              </CartContent>
              
              <CartSummary>
                <SummaryTitle>
                  <FaShoppingCart /> Order Summary
                </SummaryTitle>
                <SummaryRow>
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span>£{cartTotal.toFixed(2)}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Shipping & Handling</span>
                  <span>Free</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </SummaryRow>
                <SummaryRow total>
                  <span>Total</span>
                  <span>£{cartTotal.toFixed(2)}</span>
                </SummaryRow>
                
                <SecurityFeatures>
                  <SecurityItem>
                    <FaShieldAlt /> Secure checkout with SSL encryption
                  </SecurityItem>
                  <SecurityItem>
                    <FaTruck /> Free shipping on orders over £50
                  </SecurityItem>
                  <SecurityItem>
                    <FaGift /> Easy returns within 30 days
                  </SecurityItem>
                </SecurityFeatures>
                
                <CheckoutButton onClick={handleCheckout}>
                  Secure Checkout
                </CheckoutButton>
                <ShopMoreLink to="/products">
                  ← Continue Shopping
                </ShopMoreLink>
              </CartSummary>
            </CartLayout>
          )}
        </>
        )}
      </ContentWrapper>
    </CartContainer>
  );
};

export default Cart;