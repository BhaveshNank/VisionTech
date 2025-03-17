import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { sendMessageToChatbot } from '../utils/api';

const ChatContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const MessageList = styled.div`
  height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
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
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const ChatPopup = styled.div`
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: 15px;
  background: #007bff;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Generate a unique instance ID
const generateUniqueId = () => Math.random().toString(36).substring(2, 15);

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatInstanceId, setChatInstanceId] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize with a unique instance ID when component mounts
  useEffect(() => {
    const newInstanceId = generateUniqueId();
    setChatInstanceId(newInstanceId);
    console.log("Created new chat instance:", newInstanceId);
  }, []);

  // Handle opening the chat
  const handleOpenChat = async () => {
    setIsOpen(true);
    
    // Only initialize the chat once when it's first opened
    if (!hasInitialized) {
      // We don't add any greeting message by default
      // Just mark it as initialized so we don't do this again
      setHasInitialized(true);
    }
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

  return (
    <>
      <ChatButton onClick={() => isOpen ? setIsOpen(false) : handleOpenChat()}>
        {isOpen ? '✕' : '💬'}
      </ChatButton>
      
      <ChatPopup isOpen={isOpen}>
        <ChatHeader>
          <span>Product Assistant</span>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            ✕
          </button>
        </ChatHeader>
        <div style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <MessageList>
            {messages.map((msg, idx) => (
              <Message key={idx} isUser={msg.isUser}>
                {msg.text}
              </Message>
            ))}
            {isLoading && <Message>Thinking...</Message>}
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