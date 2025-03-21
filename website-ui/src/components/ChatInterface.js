import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { sendMessageToChatbot } from '../utils/api';
import { FaExpand, FaCompress, FaTimes, FaCommentAlt } from 'react-icons/fa';
import eventSystem from '../utils/events';

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
  width: ${props => props.isExpanded ? '650px' : '350px'};
  height: ${props => props.isExpanded ? '600px' : '500px'};
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
  height: ${props => props.isExpanded ? '450px' : '350px'};
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
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

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
          text: "Hi, I'm SmartShop's virtual assistant! How can I help you find the perfect product today?", 
          isUser: false 
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

    console.log("🔵 Sending message:", inputText);
    setIsLoading(true);
    
    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, { text: inputText, isUser: true }]);
    
    // Store message for processing
    const messageToSend = inputText;
    
    // Clear input field
    setInputText('');

    try {
      // Determine if this is the first message (empty message list)
      const isFirstMessage = messages.length === 0;
      
      // Send the message with the instance ID to maintain session
      const parsedResponse = await sendMessageToChatbot(messageToSend, isFirstMessage, chatInstanceId);
      console.log("🟢 Chatbot Response:", parsedResponse);

      // Add bot response to chat
      const botText = parsedResponse.reply || "Sorry, something went wrong.";
      setMessages(prevMessages => [...prevMessages, { text: botText, isUser: false }]);
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
                {msg.text}
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
    </>
  );
};

export default ChatInterface;