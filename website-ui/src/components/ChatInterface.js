import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { sendMessageToChatbot, generateConsistentProductId } from '../utils/api';
import { FaExpand, FaCompress, FaTimes, FaCommentAlt, FaShoppingCart } from 'react-icons/fa';
import eventSystem from '../utils/events';
import { useCart } from '../context/CartContext'; // Import the cart context hook

// Define backend URL at the top of your file for consistency
const BACKEND_URL = "http://localhost:5001";

const ChatContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ChatButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 1000;
`;

const ChatPopup = styled.div`
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: ${props => props.isExpanded ? '800px' : '350px'};  /* Increased from 650px to 800px */
  height: ${props => props.isExpanded ? '700px' : '500px'}; /* Increased from 600px to 700px */
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
  overflow: hidden;
  transition: all 0.3s ease; /* Add smooth transition */
`;

const ChatHeader = styled.div`
  padding: 15px;
  background: #007bff;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  
  &:hover {
    opacity: 0.8;
  }
`;

const MessageList = styled.div`
  height: ${props => props.isExpanded ? '550px' : '350px'}; 
  overflow-y: auto;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  transition: height 0.3s ease;
`;

const MessageInput = styled.input`
  width: 75%;
  padding: 0.5rem;
  margin-right: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const SendButton = styled.button`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 20%;

  &:hover {
    background: #0056b3;
  }
`;

const Message = styled.div`
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  border-radius: 1rem;
  max-width: 80%;
  ${props => props.isUser ? `
    background: #007bff;
    color: white;
    margin-left: auto;
  ` : `
    background: #e9ecef;
    margin-right: auto;
  `}
`;

// Add this new component for the category selection buttons
const CategoryButtons = ({ onCategorySelect }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      flexWrap: 'wrap', 
      gap: '10px', 
      marginTop: '15px',
      marginBottom: '5px'
    }}>
      <button
        onClick={() => onCategorySelect('phone')}
        style={{
          padding: '10px 18px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#0069d9'}
        onMouseOut={(e) => e.currentTarget.style.background = '#007bff'}
      >
        <span role="img" aria-label="Phone">📱</span> Phone
      </button>
      <button
        onClick={() => onCategorySelect('laptop')}
        style={{
          padding: '10px 18px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#0069d9'}
        onMouseOut={(e) => e.currentTarget.style.background = '#007bff'}
      >
        <span role="img" aria-label="Laptop">💻</span> Laptop
      </button>
      <button
        onClick={() => onCategorySelect('tv')}
        style={{
          padding: '10px 18px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#0069d9'}
        onMouseOut={(e) => e.currentTarget.style.background = '#007bff'}
      >
        <span role="img" aria-label="TV">📺</span> TV
      </button>
    </div>
  );
};

// Update the MessageContent component to include category buttons
const MessageContent = ({ text, isHtml, hasButtons, onCategorySelect }) => {
  if (isHtml) {
    return (
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
        {hasButtons && <CategoryButtons onCategorySelect={onCategorySelect} />}
      </div>
    );
  }
  
  return (
    <>
      {text}
      {hasButtons && <CategoryButtons onCategorySelect={onCategorySelect} />}
    </>
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
  top: -8px; /* Changed from 4px to -8px to move it above the notification */
  right: -8px; /* Changed from 4px to -8px to position it outside the container */
  background: white; /* Added white background for visibility */
  border-radius: 50%; /* Makes it circular */
  border: 1px solid #eee; /* Light border */
  color: #999;
  font-size: 12px;
  cursor: pointer;
  padding: 3px;
  width: 20px; /* Fixed width */
  height: 20px; /* Fixed height */
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease, color 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* Light shadow for depth */
  
  &:hover {
    color: #666;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  bottom: 100px;
  right: 20px;
  background: white;
  padding: 16px; /* Increased from 12px */
  border-radius: 12px; /* Increased from 8px for softer corners */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  cursor: pointer;
  z-index: 1000;
  animation: ${fadeIn} 0.5s ease-in-out;
  opacity: ${(props) => (props.visible ? "1" : "0")};
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  transition: opacity 0.3s, visibility 0.3s;
  max-width: 320px; /* Added max-width to make it larger */
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); /* Enhanced hover effect */
    
    ${CloseNotificationButton} {
      opacity: 1;
    }
  }
`;

const ChatIcon = styled.div`
  font-size: 24px; /* Larger icon */
  color: #007bff;
  margin-right: 12px;
  position: relative;
  background: #e6f0ff; /* Light blue background */
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotificationText = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 600; /* Make it bolder */
  margin-bottom: 2px; /* Space between lines */
`;

const NotificationSubtext = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: normal;
`;

const UnreadBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff3e3e;
  color: white;
  font-size: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  
  // Add category if provided
  if (category) {
    return `1-${nameSlug}-${category}`;
  }
  
  // Detect category from name
  const categories = ['phone', 'laptop', 'tv'];
  for (const cat of categories) {
    if (name.toLowerCase().includes(cat)) {
      return `1-${nameSlug}-${cat}`;
    }
  }
  
  // Default with no category
  return `1-${nameSlug}`;
};

const generateChatProductId = (productName, category) => {
  if (!productName) return '1-unknown-product';
  
  // Clean up the name for URL usage
  const nameSlug = productName.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-'); // Replace multiple consecutive hyphens with a single one
  
  // Detect category from name if not provided
  const detectedCategory = category || detectCategory(productName);
  
  // Create formatted product ID
  return `1-${nameSlug}${detectedCategory ? `-${detectedCategory}` : ''}`;
};

// Helper to detect category from name
const detectCategory = (name) => {
  name = name.toLowerCase();
  if (name.includes('phone') || name.includes('iphone') || name.includes('galaxy')) return 'phone';
  if (name.includes('laptop') || name.includes('macbook') || name.includes('notebook')) return 'laptop';
  if (name.includes('tv') || name.includes('television') || name.includes('smart tv')) return 'tv';
  return '';
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
      const price = priceMatch ? priceMatch[0] : "Price unavailable"; // Keep $ symbol
      
      // Generate a product ID for routing that's more compatible
      const productId = generateChatProductId(productName);
      
      // Find a product image
      const productImage = findProductImage(productName);
      
      // Extract features if available
      let features = [];
      const featuresMatch = productPart.match(/Key features: (.*?)(\n|$)/);
      if (featuresMatch && featuresMatch[1]) {
        features = featuresMatch[1].split(', ').filter(f => f.trim().length > 0);
      }
      
      // Format with image and link that opens in new tab
      // Use consistent styling that matches Image 1 (the first recommendation style)
      formattedText += `
<div style="margin: 15px 0; padding: 15px; border-radius: 8px; background: #ffffff; border: 1px solid #e9ecef;">
  <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
    <img 
      src="${productImage}" 
      alt="${productName}" 
      style="width: 60px; height: 60px; object-fit: contain; margin-right: 15px; border-radius: 4px;" 
      onerror="this.onerror=null; this.src='${BACKEND_URL}/images/default-product.jpg';" 
    />
    <div style="flex: 1;">
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 2px; color: #000;">${productName}</div>
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #000;">${price}</div>
      <div style="font-size: 14px; color: #666; line-height: 1.4;">${features.join(', ')}</div>
    </div>
  </div>
  <div style="display: flex; gap: 10px; margin-top: 10px;">
    <a 
      href="/product/${productId}" 
      target="_blank"
      rel="noopener noreferrer" 
      style="color: #007bff; text-decoration: none; display: inline-block; padding: 8px 12px; background: #e6f7ff; border-radius: 4px; font-size: 14px; flex: 1; text-align: center;"
      data-product-id="${productId}"
      data-product-name="${productName.replace(/"/g, '&quot;')}"
    >
      View Details
    </a>
    <button 
      class="add-to-cart-btn" 
      data-id="${productId}" 
      data-name="${productName.replace(/'/g, "\\'")}" 
      data-price="${price.replace(/[^\d.]/g, '')}" 
      data-image="${productImage}"
      style="color: white; background: #28a745; border: none; border-radius: 4px; padding: 8px 12px; font-size: 14px; cursor: pointer; flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
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

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // New state for expanded mode
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatInstanceId, setChatInstanceId] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [manuallyDismissed, setManuallyDismissed] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling
  
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
    setShowNotification(false); // Hide notification when opening chat
    
    // If this is the first time opening the chat in this session
    if (!hasInitialized) {
      setHasInitialized(true);
      
      // Add a slight delay for a more natural feel
      setTimeout(() => {
        setMessages([{ 
          text: `Welcome to SmartShop, I am Mark, Smartshop's virtual assistant! We offer wide range of <strong>Phones</strong>, <strong>Laptops</strong>, and <strong>TVs</strong>. What are you looking for today?`, 
          isUser: false,
          isHtml: true,
          hasButtons: true // New flag to indicate this message has buttons
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
  
  // Add this function to handle category selection
  const handleCategorySelect = (category) => {
    // Add the user's selection as a message
    const categoryMessages = {
      'phone': 'I need help finding a phone',
      'laptop': 'I need help finding a laptop',
      'tv': 'I need help finding a TV'
    };
    
    const userMessage = categoryMessages[category];
    
    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, { text: userMessage, isUser: true }]);
    
    // Process the selection like a user message
    processUserMessage(userMessage);
  };

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
            text: "Hi, I'm SmartShop's virtual assistant! How can I help you find the perfect product today?", 
            isUser: false 
          }]);
        }, 800);
      }
    });
    
    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [hasInitialized]);

  const handleDismissNotification = (e) => {
    e.stopPropagation(); // Prevent the notification click from triggering
    setShowNotification(false);
    setManuallyDismissed(true);
  };

  return (
    <>
      {/* Add notification component with updated text */}
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
            <FaCommentAlt />
            <UnreadBadge>1</UnreadBadge>
          </ChatIcon>
          <TextContainer>
            <NotificationText>Need help finding products?</NotificationText>
            <NotificationSubtext>Talk to our virtual assistant</NotificationSubtext>
          </TextContainer>
        </NotificationContainer>
      )}
      
      <ChatButton onClick={() => isOpen ? setIsOpen(false) : handleOpenChat()}>
        {isOpen ? '✕' : '💬'}
      </ChatButton>
      
      <ChatPopup isOpen={isOpen} isExpanded={isExpanded}>
        <ChatHeader>
          <span>Product Assistant</span>
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
              <Message key={idx} isUser={msg.isUser}>
                <MessageContent 
                  text={msg.text} 
                  isHtml={msg.isHtml || false} 
                  hasButtons={msg.hasButtons || false} 
                  onCategorySelect={handleCategorySelect} 
                />
              </Message>
            ))}
            {isLoading && <Message>Thinking...</Message>}
            <div ref={messagesEndRef} /> {/* Element to scroll to */}
          </MessageList>
          <form onSubmit={handleSubmit} style={{ 
            padding: '1rem', 
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <MessageInput
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about products..."
            />
            <SendButton type="submit">Send</SendButton>
          </form>
        </div>
      </ChatPopup>
      
      {/* Add success message notification */}
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