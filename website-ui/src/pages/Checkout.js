import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingCart, FaShieldAlt, FaCreditCard, FaTruck, FaCheck, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const CheckoutContainer = styled.div`
  background: #f8f9fa;
  min-height: 100vh;
  margin-top: 80px;
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  
  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const CheckoutTitle = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #000000;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CheckoutSubtitle = styled.p`
  color: #666666;
  font-size: 1.1rem;
  margin: 0;
`;

const StepsIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  background: ${props => props.active ? '#000000' : props.completed ? '#4ade80' : '#e5e5e5'};
  color: ${props => props.active || props.completed ? '#ffffff' : '#666666'};
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
`;

const StepConnector = styled.div`
  width: 40px;
  height: 2px;
  background: ${props => props.completed ? '#4ade80' : '#e5e5e5'};
  
  @media (max-width: 768px) {
    width: 20px;
  }
`;

const CheckoutLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 350px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CheckoutForm = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e5e5;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
  
  &:invalid {
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const PaymentMethodCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#000000' : '#e5e5e5'};
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#f8f9fa' : 'white'};
  
  &:hover {
    border-color: #000000;
  }
`;

const PaymentIcon = styled.div`
  font-size: 1.5rem;
  color: ${props => props.selected ? '#000000' : '#666666'};
`;

const PaymentText = styled.div`
  flex: 1;
  
  .method-name {
    font-weight: 600;
    color: #000000;
    margin-bottom: 0.25rem;
  }
  
  .method-desc {
    font-size: 0.85rem;
    color: #666666;
  }
`;

const OrderSummary = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  height: fit-content;
  position: sticky;
  top: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e5e5;
  
  @media (max-width: 768px) {
    position: static;
    order: -1;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OrderItem = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: #000000;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
`;

const ItemQuantity = styled.div`
  font-size: 0.8rem;
  color: #666666;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #000000;
  font-size: 0.9rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: ${props => props.total ? '#000000' : '#666666'};
  font-weight: ${props => props.total ? '700' : '400'};
  
  ${props => props.total && `
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 2px solid #e5e5e5;
    font-size: 1.2rem;
  `}
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &.primary {
    background: #000000;
    color: white;
    
    &:hover {
      background: #1a1a1a;
      transform: translateY(-2px);
    }
    
    &:disabled {
      background: #cccccc;
      cursor: not-allowed;
      transform: none;
    }
  }
  
  &.secondary {
    background: transparent;
    color: #000000;
    border: 2px solid #000000;
    
    &:hover {
      background: #000000;
      color: white;
    }
  }
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae6fd;
  font-size: 0.85rem;
  color: #0369a1;
`;

const Checkout = () => {
  const { cartItems, dispatch, cartTotal } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Form state
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const steps = [
    { number: 1, title: 'Shipping', icon: FaTruck },
    { number: 2, title: 'Payment', icon: FaCreditCard },
    { number: 3, title: 'Review', icon: FaCheck }
  ];

  const handleInputChange = (form, setForm) => (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = () => {
    setOrderComplete(true);
    dispatch({ type: "CLEAR_CART" });
    
    // Redirect to success page after 3 seconds
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  const isStepValid = () => {
    switch(currentStep) {
      case 1:
        return shippingForm.firstName && shippingForm.lastName && shippingForm.email && 
               shippingForm.address && shippingForm.city && shippingForm.zipCode;
      case 2:
        return paymentMethod === 'paypal' || 
               (paymentForm.cardNumber && paymentForm.expiryDate && paymentForm.cvv && paymentForm.cardName);
      case 3:
        return true;
      default:
        return false;
    }
  };

  if (cartItems.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  if (orderComplete) {
    return (
      <CheckoutContainer>
        <ContentWrapper>
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', maxWidth: '600px', margin: '0 auto' }}>
            <FaCheck style={{ fontSize: '4rem', color: '#4ade80', marginBottom: '2rem' }} />
            <h1 style={{ color: '#000000', marginBottom: '1rem' }}>Order Complete!</h1>
            <p style={{ color: '#666666', marginBottom: '1rem' }}>Thank you for your purchase. Your order has been confirmed.</p>
            <p style={{ color: '#000000', fontWeight: '600' }}>Order #: {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
            <p style={{ color: '#666666', fontSize: '0.9rem', marginTop: '2rem' }}>Redirecting to homepage...</p>
          </div>
        </ContentWrapper>
      </CheckoutContainer>
    );
  }

  const renderShippingForm = () => (
    <FormSection>
      <SectionTitle>
        <FaTruck /> Shipping Information
      </SectionTitle>
      <FormGrid>
        <FormGroup>
          <Label>First Name *</Label>
          <Input
            type="text"
            name="firstName"
            value={shippingForm.firstName}
            onChange={handleInputChange(shippingForm, setShippingForm)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Last Name *</Label>
          <Input
            type="text"
            name="lastName"
            value={shippingForm.lastName}
            onChange={handleInputChange(shippingForm, setShippingForm)}
            required
          />
        </FormGroup>
        <FormGroup className="full-width">
          <Label>Email Address *</Label>
          <Input
            type="email"
            name="email"
            value={shippingForm.email}
            onChange={handleInputChange(shippingForm, setShippingForm)}
            required
          />
        </FormGroup>
        <FormGroup className="full-width">
          <Label>Phone Number</Label>
          <Input
            type="tel"
            name="phone"
            value={shippingForm.phone}
            onChange={handleInputChange(shippingForm, setShippingForm)}
          />
        </FormGroup>
        <FormGroup className="full-width">
          <Label>Street Address *</Label>
          <Input
            type="text"
            name="address"
            value={shippingForm.address}
            onChange={handleInputChange(shippingForm, setShippingForm)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>City *</Label>
          <Input
            type="text"
            name="city"
            value={shippingForm.city}
            onChange={handleInputChange(shippingForm, setShippingForm)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>State/Province</Label>
          <Input
            type="text"
            name="state"
            value={shippingForm.state}
            onChange={handleInputChange(shippingForm, setShippingForm)}
          />
        </FormGroup>
        <FormGroup>
          <Label>ZIP/Postal Code *</Label>
          <Input
            type="text"
            name="zipCode"
            value={shippingForm.zipCode}
            onChange={handleInputChange(shippingForm, setShippingForm)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Country</Label>
          <Select
            name="country"
            value={shippingForm.country}
            onChange={handleInputChange(shippingForm, setShippingForm)}
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Australia">Australia</option>
          </Select>
        </FormGroup>
      </FormGrid>
    </FormSection>
  );

  const renderPaymentForm = () => (
    <FormSection>
      <SectionTitle>
        <FaCreditCard /> Payment Method
      </SectionTitle>
      
      <PaymentMethodCard 
        selected={paymentMethod === 'card'} 
        onClick={() => setPaymentMethod('card')}
      >
        <PaymentIcon selected={paymentMethod === 'card'}>
          <FaCreditCard />
        </PaymentIcon>
        <PaymentText>
          <div className="method-name">Credit/Debit Card</div>
          <div className="method-desc">Visa, Mastercard, American Express</div>
        </PaymentText>
      </PaymentMethodCard>
      
      <PaymentMethodCard 
        selected={paymentMethod === 'paypal'} 
        onClick={() => setPaymentMethod('paypal')}
      >
        <PaymentIcon selected={paymentMethod === 'paypal'}>
          💳
        </PaymentIcon>
        <PaymentText>
          <div className="method-name">PayPal</div>
          <div className="method-desc">Pay with your PayPal account</div>
        </PaymentText>
      </PaymentMethodCard>
      
      {paymentMethod === 'card' && (
        <FormGrid style={{ marginTop: '1.5rem' }}>
          <FormGroup className="full-width">
            <Label>Card Number *</Label>
            <Input
              type="text"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={paymentForm.cardNumber}
              onChange={handleInputChange(paymentForm, setPaymentForm)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Expiry Date *</Label>
            <Input
              type="text"
              name="expiryDate"
              placeholder="MM/YY"
              value={paymentForm.expiryDate}
              onChange={handleInputChange(paymentForm, setPaymentForm)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>CVV *</Label>
            <Input
              type="text"
              name="cvv"
              placeholder="123"
              value={paymentForm.cvv}
              onChange={handleInputChange(paymentForm, setPaymentForm)}
              required
            />
          </FormGroup>
          <FormGroup className="full-width">
            <Label>Cardholder Name *</Label>
            <Input
              type="text"
              name="cardName"
              value={paymentForm.cardName}
              onChange={handleInputChange(paymentForm, setPaymentForm)}
              required
            />
          </FormGroup>
        </FormGrid>
      )}
    </FormSection>
  );

  const renderReviewOrder = () => (
    <FormSection>
      <SectionTitle>
        <FaCheck /> Review Your Order
      </SectionTitle>
      
      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#000000' }}>Shipping Address</h4>
        <p style={{ margin: '0', color: '#666666', lineHeight: '1.5' }}>
          {shippingForm.firstName} {shippingForm.lastName}<br />
          {shippingForm.address}<br />
          {shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}<br />
          {shippingForm.country}
        </p>
      </div>
      
      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#000000' }}>Payment Method</h4>
        <p style={{ margin: '0', color: '#666666' }}>
          {paymentMethod === 'card' ? `Card ending in ****${paymentForm.cardNumber.slice(-4)}` : 'PayPal'}
        </p>
      </div>
    </FormSection>
  );

  return (
    <CheckoutContainer>
      <ContentWrapper>
        <PageHeader>
          <CheckoutTitle>Checkout</CheckoutTitle>
          <CheckoutSubtitle>Complete your purchase securely</CheckoutSubtitle>
        </PageHeader>

        <StepsIndicator>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <Step 
                active={currentStep === step.number}
                completed={currentStep > step.number}
              >
                <step.icon size={14} />
                {step.title}
              </Step>
              {index < steps.length - 1 && (
                <StepConnector completed={currentStep > step.number} />
              )}
            </React.Fragment>
          ))}
        </StepsIndicator>

        <CheckoutLayout>
          <CheckoutForm>
            {currentStep === 1 && renderShippingForm()}
            {currentStep === 2 && renderPaymentForm()}
            {currentStep === 3 && renderReviewOrder()}
            
            <SecurityNote>
              <FaShieldAlt />
              Your information is protected with 256-bit SSL encryption
            </SecurityNote>
            
            <ButtonContainer>
              {currentStep > 1 && (
                <Button className="secondary" onClick={handleBack}>
                  <FaArrowLeft size={14} />
                  Back
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button 
                  className="primary" 
                  onClick={handleNext}
                  disabled={!isStepValid()}
                >
                  Continue
                  <FaArrowRight size={14} />
                </Button>
              ) : (
                <Button 
                  className="primary" 
                  onClick={handlePlaceOrder}
                  disabled={!isStepValid()}
                >
                  Place Order
                  <FaCheck size={14} />
                </Button>
              )}
            </ButtonContainer>
          </CheckoutForm>

          <OrderSummary>
            <SummaryTitle>
              <FaShoppingCart />
              Order Summary
            </SummaryTitle>
            
            {cartItems.map(item => (
              <OrderItem key={item.id}>
                <ItemImage 
                  src={item.image} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/60?text=Product';
                  }}
                />
                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                  <ItemQuantity>Qty: {item.quantity}</ItemQuantity>
                </ItemDetails>
                <ItemPrice>
                  ${(parseFloat(item.price.toString().replace(/[^0-9.-]+/g, '')) * item.quantity).toFixed(2)}
                </ItemPrice>
              </OrderItem>
            ))}
            
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e5e5' }}>
              <SummaryRow>
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Shipping</span>
                <span>Free</span>
              </SummaryRow>
              <SummaryRow>
                <span>Tax</span>
                <span>${(cartTotal * 0.08).toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow total>
                <span>Total</span>
                <span>${(cartTotal * 1.08).toFixed(2)}</span>
              </SummaryRow>
            </div>
          </OrderSummary>
        </CheckoutLayout>
      </ContentWrapper>
    </CheckoutContainer>
  );
};

export default Checkout;