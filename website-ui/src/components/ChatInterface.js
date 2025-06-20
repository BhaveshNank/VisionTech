import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { sendMessageToChatbot } from '../utils/api';
import { FaExpand, FaCompress, FaTimes, FaShoppingCart, FaPaperPlane } from 'react-icons/fa';
import eventSystem from '../utils/events';
import { useCart } from '../context/CartContext';

// Define backend URL at the top of your file for consistency
const BACKEND_URL = process.env.REACT_APP_API_URL || "";

// Removed unused ChatContainer

const ChatButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  z-index: 1000;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const ChatPopup = styled.div`
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: ${props => props.isExpanded ? '800px' : '380px'};
  height: ${props => props.isExpanded ? '700px' : '550px'};
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  
  @media (max-width: 768px) {
    right: 10px;
    width: calc(100vw - 20px);
    max-width: 400px;
  }
`;

const ChatHeader = styled.div`
  padding: 20px 24px;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  }
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AvatarContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  
  h3 {
    margin: 0 0 4px 0;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: white;
  }
  
  .status-container {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .online-dot {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    animation: pulse-green 2s infinite;
  }
  
  @keyframes pulse-green {
    0% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
  }
  
  span {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 400;
  }
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
`;

const MessageList = styled.div`
  height: ${props => props.isExpanded ? '550px' : '380px'}; 
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
  flex: 1;
  transition: height 0.3s ease;
  position: relative;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #e0e0e0;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #a0a0a0 0%, #808080 100%);
  }
`;

const MessageInputContainer = styled.div`
  padding: 20px 24px;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 20px 20px;
`;

const MessageInputForm = styled.form`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 25px;
  border: 2px solid #e0e0e0;
  padding: 4px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #000000;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  outline: none;
  background: transparent;
  color: #000000;
  
  &::placeholder {
    color: #888888;
  }
`;

const SendButton = styled.button`
  padding: 12px;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-right: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 16px 0;
  animation: slideIn 0.3s ease-out;
  gap: 10px;
  
  ${props => props.isUser ? `
    flex-direction: row-reverse;
    justify-content: flex-start;
  ` : `
    flex-direction: row;
  `}

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageBubble = styled.div`
  padding: 12px 18px;
  border-radius: 18px;
  max-width: 85%;
  word-wrap: break-word;
  position: relative;
  
  ${props => props.isUser ? `
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    color: white;
    border-bottom-right-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      right: -8px;
      width: 0;
      height: 0;
      border: 8px solid transparent;
      border-left-color: #000000;
      border-bottom: 0;
      border-top-left-radius: 8px;
    }
  ` : `
    background: #ffffff;
    color: #000000;
    border-bottom-left-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e0e0e0;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: -8px;
      width: 0;
      height: 0;
      border: 8px solid transparent;
      border-right-color: #ffffff;
      border-bottom: 0;
      border-top-right-radius: 8px;
    }
  `}
`;

const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  ${props => props.isUser ? `
    background: #000000;
    border-color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 14px;
  ` : ``}
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: #ffffff;
  border-radius: 18px;
  border-bottom-left-radius: 6px;
  max-width: 85%;
  color: #666666;
  font-style: italic;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  animation: pulse 1.5s ease-in-out infinite;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -8px;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-right-color: #ffffff;
    border-bottom: 0;
    border-top-right-radius: 8px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }
`;

// Category buttons removed - chatbot now handles all product categories through flexible text input

// Updated MessageContent component with category buttons removed
const MessageContent = ({ text, isHtml, isUser }) => {
  if (isHtml) {
    return (
      <Message isUser={isUser}>
        {!isUser && (
          <MessageAvatar>
            <img src="/images/mark_chatbot.jpg" alt="Mark - AI Assistant" />
          </MessageAvatar>
        )}
        {isUser && (
          <MessageAvatar isUser={true}>
            U
          </MessageAvatar>
        )}
        <MessageBubble isUser={isUser}>
          <div className="html-content-wrapper">
            <div 
              dangerouslySetInnerHTML={{ __html: text }} 
              onClick={(e) => {
                // Only handle links that don't have target="_blank"
                const link = e.target.closest('a[href^="/product/"]');
                if (link && link.getAttribute('target') !== '_blank') {
                  e.preventDefault();
                  window.open(link.getAttribute('href'), '_blank');
                }
              }}
              style={{ overflowX: 'auto' }} // Add horizontal scroll for wide tables
            />
          </div>
        </MessageBubble>
      </Message>
    );
  }
  
  return (
    <Message isUser={isUser}>
      {!isUser && (
        <MessageAvatar>
          <img src="/images/mark_chatbot.jpg" alt="Mark - AI Assistant" />
        </MessageAvatar>
      )}
      {isUser && (
        <MessageAvatar isUser={true}>
          U
        </MessageAvatar>
      )}
      <MessageBubble isUser={isUser}>
        {text}
      </MessageBubble>
    </Message>
  );
};

// Generate a unique instance ID
const generateUniqueId = () => Math.random().toString(36).substring(2, 15);

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CloseNotificationButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ffffff;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  color: #666666;
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    color: #000000;
    background: #f8f9fa;
    border-color: #000000;
    transform: scale(1.1);
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  bottom: 100px;
  right: 20px;
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  cursor: pointer;
  z-index: 1000;
  animation: ${fadeIn} 0.5s ease-in-out;
  opacity: ${(props) => (props.visible ? "1" : "0")};
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  transition: all 0.3s ease;
  max-width: 340px;
  border: 1px solid #e0e0e0;
  
  &:hover {
    box-shadow: 0 16px 50px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
    
    ${CloseNotificationButton} {
      opacity: 1;
    }
  }
`;

const ChatIcon = styled.div`
  font-size: 28px;
  background: #000000;
  color: white;
  margin-right: 16px;
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotificationText = styled.div`
  font-size: 16px;
  color: #000000;
  font-weight: 600;
  margin-bottom: 4px;
`;

const NotificationSubtext = styled.div`
  font-size: 14px;
  color: #666666;
  font-weight: normal;
`;

const UnreadBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  background: #f56565;
  color: white;
  font-size: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid white;
`;

const findProductImage = (productName) => {
  if (!productName) return `${BACKEND_URL}/images/default-product.jpg`;
  
  // Sanitize product name for URL
  const sanitizedName = encodeURIComponent(productName.trim());
  
  // Request image from backend with error handling
  return `${BACKEND_URL}/api/product-image/${sanitizedName}`;
};

// Create a consistent product ID for links
const generateProductId = (name, category = '') => {
  // Clean up the name for URL usage
  const nameSlug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return nameSlug;
};

const formatProductLinks = (text) => {
  // If the message already contains HTML product displays, return it as is
  if (text.includes('<div style="margin: 15px 0; padding: 15px;')) {
    return text;
  }
  
  // Split the text on product bullet points
  const parts = text.split("• ");
  
  if (parts.length <= 1) return text; // No product bullets found
  
  // Keep the intro text
  let formattedText = parts[0];
  
  // Process each product
  for (let i = 1; i < parts.length; i++) {
    const productPart = parts[i];
    
    // Extract product name - assuming it's before the first dash
    const dashIndex = productPart.indexOf(" - ");
    if (dashIndex > 0) {
      const productName = productPart.substring(0, dashIndex).trim();
      
      // Extract price if available
      const priceMatch = productPart.match(/\$(\d+(\.\d{1,2})?)/);
      const price = priceMatch ? priceMatch[0] : "Price unavailable";
      
      // Generate a product ID for routing that's more compatible
      const productId = generateProductId(productName);
      
      // Find a product image
      const productImage = findProductImage(productName);
      
      // Extract features if available
      let features = [];
      const featuresMatch = productPart.match(/Key features: (.*?)(\n|$)/);
      if (featuresMatch && featuresMatch[1]) {
        features = featuresMatch[1].split(', ').filter(f => f.trim().length > 0);
      }
      
      // Format with image and link that opens in new tab
      formattedText += `
<div style="margin: 15px 0; padding: 15px; border-radius: 12px; background: #ffffff; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
  <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
    <img 
      src="${productImage}" 
      alt="${productName}" 
      style="width: 60px; height: 60px; object-fit: contain; margin-right: 15px; border-radius: 8px; background: #f8f9fa;" 
      onerror="this.onerror=null; this.src='${BACKEND_URL}/images/default-product.jpg';" 
    />
    <div style="flex: 1;">
      <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px; color: #000000;">${productName}</div>
      <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px; color: #666666;">${price}</div>
      <div style="font-size: 14px; color: #888888; line-height: 1.4;">${features.join(', ')}</div>
    </div>
  </div>
  <div style="display: flex; gap: 10px; margin-top: 12px;">
    <a 
      href="/product/${productId}" 
      target="_blank"
      rel="noopener noreferrer" 
      style="color: #000000; text-decoration: none; display: inline-block; padding: 8px 16px; background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 20px; font-size: 14px; flex: 1; text-align: center; font-weight: 500; transition: all 0.2s ease;"
      data-product-id="${productId}"
      data-product-name="${productName.replace(/"/g, '&quot;')}"
      onmouseover="this.style.background='#e9ecef'; this.style.borderColor='#000000'"
      onmouseout="this.style.background='#f8f9fa'; this.style.borderColor='#e0e0e0'"
    >
      View Details
    </a>
    <button 
      class="add-to-cart-btn" 
      data-id="${productId}" 
      data-name="${productName.replace(/'/g, "\\'")}" 
      data-price="${price.replace(/[^\d.]/g, '')}" 
      data-image="${productImage}"
      style="color: white; background: #000000; border: none; border-radius: 20px; padding: 8px 16px; font-size: 14px; cursor: pointer; flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 500; transition: all 0.2s ease;"
      onmouseover="this.style.background='#333333'; this.style.transform='translateY(-1px)'"
      onmouseout="this.style.background='#000000'; this.style.transform='translateY(0)'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4a2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
      </svg>
      Add to Cart
    </button>
  </div>
</div>`;
    } else {
      // If format doesn't match, keep original
      formattedText += `• ${productPart}`;
    }
  }
  
  return formattedText;
};

const CartSuccessMessage = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: #404040;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #606060;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  z-index: 1100;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatInstanceId, setChatInstanceId] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [manuallyDismissed, setManuallyDismissed] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Get cart dispatch function from context
  const { dispatch } = useCart();

  // Initialize the global function to add products to cart
  useEffect(() => {
    // Create global function that HTML buttons can call
    window.addToCartFromChatbot = (id, name, price, image) => {
      console.log("Add to cart called with:", {id, name, price, image});
      
      // Parse price as a number if it's a string
      const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
      
      const product = {
        id,
        name,
        price: parsedPrice,
        image,
        quantity: 1
      };
      
      // Dispatch action to add to cart
      dispatch({
        type: "ADD_TO_CART",
        payload: product
      });
      
      // Show success message
      setCartMessage({
        product: name,
        visible: true
      });
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setCartMessage(null);
      }, 3000);
    };
    
    // Cleanup function
    return () => {
      window.addToCartFromChatbot = undefined;
    };
  }, [dispatch]);

  useEffect(() => {
    const handleAddToCartClick = (e) => {
      if (e.target.closest('.add-to-cart-btn')) {
        const button = e.target.closest('.add-to-cart-btn');
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);
        const image = button.dataset.image;
        
        console.log("Add to cart clicked:", {id, name, price, image});
        
        // Add to cart
        const product = {
          id,
          name,
          price,
          image,
          quantity: 1
        };
        
        // Dispatch action to add to cart
        dispatch({
          type: "ADD_TO_CART",
          payload: product
        });
        
        // Show success message
        setCartMessage({
          product: name,
          visible: true
        });
        
        // Hide message after 3 seconds
        setTimeout(() => {
          setCartMessage(null);
        }, 3000);
      }
    };
    
    document.addEventListener('click', handleAddToCartClick);
    return () => {
      document.removeEventListener('click', handleAddToCartClick);
    };
  }, [dispatch]);

  // Initialize with a unique instance ID when component mounts
  useEffect(() => {
    const newInstanceId = generateUniqueId();
    setChatInstanceId(newInstanceId);
    console.log("Created new chat instance:", newInstanceId);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle opening the chat
  const handleOpenChat = async () => {
    setIsOpen(true);
    setShowNotification(false);
    
    // If this is the first time opening the chat in this session
    if (!hasInitialized) {
      setHasInitialized(true);
      
      // Add a slight delay for a more natural feel
      setTimeout(() => {
        setMessages([{ 
          text: `Hi there! I'm Mark, your personal AI assistant at VisionTech! 👋 I'm here to help you find the perfect electronics. What are you looking for today?`,
          isUser: false,
          isHtml: true
        }]);
      }, 800);
    }
  };

  // Toggle expanded chat view
  const toggleExpandChat = () => {
    setIsExpanded(!isExpanded);
  };

  // Submit handler for user messages
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
  
    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, { text: inputText, isUser: true }]);
    
    // Store message for processing
    const messageToSend = inputText;
    
    // Clear input field
    setInputText('');
  
    // Process the message
    await processUserMessage(messageToSend);
  };

  // Add this function to process user messages
  const processUserMessage = async (messageText) => {
    console.log("🔵 Processing message:", messageText);
    setIsLoading(true);
    
    try {
      // Determine if this is the first message
      const isFirstMessage = messages.length <= 1;
      
      // Send the message with the instance ID to maintain session
      const parsedResponse = await sendMessageToChatbot(messageText, isFirstMessage, chatInstanceId);
      console.log("🟢 Chatbot Response:", parsedResponse);
  
      // Add bot response to chat
      let botText = parsedResponse.reply || "Sorry, something went wrong.";
      let isHtml = parsedResponse.isHtml || false;
      
      // Check if the response contains product recommendations (bullet points)
      if (!isHtml && botText.includes("• ") && (botText.includes("Here are") || botText.includes("best matching"))) {
        // Format product links
        isHtml = true;
        botText = formatProductLinks(botText);
      }
      
      setMessages(prevMessages => [...prevMessages, { 
        text: botText, 
        isUser: false,
        isHtml
      }]);
    } catch (error) {
      console.error('🔴 Chatbot API Error:', error);
      setMessages(prevMessages => [...prevMessages, { 
        text: 'Error connecting to chatbot. Please try again.', 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Category selection function removed - users now interact through flexible text input

  useEffect(() => {
    let notificationTimer;
    let reappearTimer;
    
    if (!isOpen) {
      // Show notification after 3 seconds if chat is closed
      notificationTimer = setTimeout(() => {
        if (!manuallyDismissed) {
          setShowNotification(true);
        }
      }, 3000);
      
      // If manually dismissed, set timer to show again after 10 minutes
      if (manuallyDismissed) {
        reappearTimer = setTimeout(() => {
          setManuallyDismissed(false);
          setShowNotification(true);
        }, 600000); // 10 minutes in milliseconds
      }
    } else {
      // Hide notification when chat is open
      setShowNotification(false);
    }
    
    // Clean up timers on unmount or when state changes
    return () => {
      clearTimeout(notificationTimer);
      clearTimeout(reappearTimer);
    };
  }, [isOpen, manuallyDismissed]);

  // Add effect to listen for open chat events
  useEffect(() => {
    // Listen for events to open the chat from other components
    const unsubscribe = eventSystem.on('openChat', () => {
      setIsOpen(true);
      setShowNotification(false);
      
      // Initialize chat if needed
      if (!hasInitialized) {
        setHasInitialized(true);
        
        setTimeout(() => {
          setMessages([{ 
            text: "Hi! I'm Mark, your AI assistant at VisionTech! How can I help you find the perfect product today? 😊", 
            isUser: false 
          }]);
        }, 800);
      }
    });
    
    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [hasInitialized]);

  const handleDismissNotification = (e) => {
    e.stopPropagation();
    setShowNotification(false);
    setManuallyDismissed(true);
  };

  return (
    <>
      {/* Notification component */}
      {showNotification && !isOpen && (
        <NotificationContainer 
          visible={showNotification}
          onClick={handleOpenChat}
        >
          <CloseNotificationButton 
            onClick={handleDismissNotification}
            aria-label="Dismiss notification"
          >
            <FaTimes />
          </CloseNotificationButton>
          <ChatIcon>
            <img src="/images/mark_chatbot.jpg" alt="Mark - AI Assistant" />
            <UnreadBadge>1</UnreadBadge>
          </ChatIcon>
          <TextContainer>
            <NotificationText>Hi! I'm Mark 👋</NotificationText>
            <NotificationSubtext>Need help finding products?</NotificationSubtext>
          </TextContainer>
        </NotificationContainer>
      )}
      
      <ChatButton onClick={() => isOpen ? setIsOpen(false) : handleOpenChat()}>
        {isOpen ? (
          <FaTimes style={{ fontSize: '20px' }} />
        ) : (
          <img src="/images/mark_chatbot.jpg" alt="Mark - AI Assistant" />
        )}
      </ChatButton>
      
      <ChatPopup isOpen={isOpen} isExpanded={isExpanded}>
        <ChatHeader>
          <HeaderContent>
            <AvatarContainer>
              <img src="/images/mark_chatbot.jpg" alt="Mark - AI Assistant" />
            </AvatarContainer>
            <HeaderText>
              <h3>Mark</h3>
              <div className="status-container">
                <div className="online-dot"></div>
                <span>Online • Ready to help</span>
              </div>
            </HeaderText>
          </HeaderContent>
          <HeaderActions>
            <IconButton onClick={toggleExpandChat} aria-label={isExpanded ? "Collapse chat" : "Expand chat"}>
              {isExpanded ? <FaCompress /> : <FaExpand />}
            </IconButton>
            <IconButton onClick={() => setIsOpen(false)} aria-label="Close chat">
              <FaTimes />
            </IconButton>
          </HeaderActions>
        </ChatHeader>
        <div style={{ height: 'calc(100% - 60px)', display: 'flex', flexDirection: 'column' }}>
          <MessageList isExpanded={isExpanded}>
            {messages.map((msg, idx) => (
              <MessageContent 
                key={idx}
                text={msg.text} 
                isHtml={msg.isHtml || false} 
                isUser={msg.isUser}
              />
            ))}
            {isLoading && (
              <Message isUser={false}>
                <MessageAvatar>
                  <img src="/images/mark_chatbot.jpg" alt="Mark - AI Assistant" />
                </MessageAvatar>
                <LoadingIndicator>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#000000', 
                    animation: 'pulse 1.5s ease-in-out infinite' 
                  }}></div>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#000000', 
                    animation: 'pulse 1.5s ease-in-out infinite 0.2s' 
                  }}></div>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#000000', 
                    animation: 'pulse 1.5s ease-in-out infinite 0.4s' 
                  }}></div>
                  <span style={{ marginLeft: '8px' }}>Mark is thinking...</span>
                </LoadingIndicator>
              </Message>
            )}
            <div ref={messagesEndRef} />
          </MessageList>
          <MessageInputContainer>
            <MessageInputForm onSubmit={handleSubmit}>
              <MessageInput
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about products..."
              />
              <SendButton type="submit">
                <FaPaperPlane />
              </SendButton>
            </MessageInputForm>
          </MessageInputContainer>
        </div>
      </ChatPopup>
      
      {/* Success message notification */}
      {cartMessage && cartMessage.visible && (
        <CartSuccessMessage>
          <FaShoppingCart style={{ marginRight: '10px' }} />
          Added {cartMessage.product} to cart!
        </CartSuccessMessage>
      )}
    </>
  );
};

export default ChatInterface;