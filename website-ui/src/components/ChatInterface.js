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

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Load Messages from Session Storage (to retain chat history)
  const [messages, setMessages] = useState(() => {
    return JSON.parse(sessionStorage.getItem("chatMessages")) || [];
  });

  // ✅ Load Session Data (e.g., chatbot context like last_question)
  const [sessionData, setSessionData] = useState(() => {
    return JSON.parse(sessionStorage.getItem("sessionData")) || {};
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Persist Messages to Session Storage whenever they change
  useEffect(() => {
    sessionStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // ✅ Persist Session Data (e.g., last chatbot question) whenever it changes
  useEffect(() => {
    sessionStorage.setItem("sessionData", JSON.stringify(sessionData));
  }, [sessionData]);

  // ✅ Submit Handler
  // ✅ Submit Handler
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!inputText.trim()) {
      console.warn("⚠️ User tried to send an empty message.");
      return;
  }

  console.log("🔵 Sending message:", inputText);

  setIsLoading(true);
  setMessages(prevMessages => [...prevMessages, { text: inputText, isUser: true }]);

  try {
      const botReply = await sendMessageToChatbot(inputText);

      console.log("🟢 Full Chatbot Response:", botReply);

      // ✅ Prevent Redundant Responses
      const lastBotMessage = sessionStorage.getItem("lastBotMessage");
      if (botReply === lastBotMessage) {
          console.warn("⚠️ Chatbot is repeating itself. Ignoring duplicate response.");
          setIsLoading(false);
          return;
      }
      sessionStorage.setItem("lastBotMessage", botReply); // Store chatbot response

      let parsedResponse;
      try {
          parsedResponse = JSON.parse(botReply);
          if (typeof parsedResponse !== "object") throw new Error("Invalid JSON structure");
      } catch (error) {
          console.error("❌ Failed to parse bot response:", error);
          parsedResponse = { reply: botReply, response_type: "text" }; // Fallback to plain text
      }

      // ✅ Handle Multi-Product Recommendations
      if (Array.isArray(parsedResponse.products) && parsedResponse.products.length > 0) {
          console.log("🔹 Chatbot provided multiple product options.");

          // ✅ Format the product recommendations
          const productList = parsedResponse.products.map(product => 
              `- ${product.name} (${product.specifications?.slice(0, 3).join(", ") || "No details available"})`
          ).join("\n");

          setMessages(prevMessages => [...prevMessages, { 
              text: `Here are some great options:\n${productList}\n\nWhich one are you interested in?`, 
              isUser: false 
          }]);

          // ✅ Store last recommendations for future reference
          sessionStorage.setItem("lastRecommendations", JSON.stringify(parsedResponse.products));

          setIsLoading(false);
          return; // Stop further execution to prevent duplicate responses
      }

      // ✅ Ensure Follow-Up Works When User Picks a Product
      const lastRecommendations = JSON.parse(sessionStorage.getItem("lastRecommendations") || "[]");

      const selectedProduct = lastRecommendations.find(product => 
          inputText.toLowerCase().includes(product.name.toLowerCase())
      );

      if (selectedProduct) {
          console.log("🔍 User selected a specific product:", selectedProduct.name);
          setMessages(prevMessages => [...prevMessages, { 
              text: `✅ Here are details for ${selectedProduct.name}:\n` + 
                    selectedProduct.specifications.slice(0, 5).map(f => `- ${f}`).join("\n") + 
                    `\nPrice: ${selectedProduct.price || 'Price not available'}`,
              isUser: false
          }]);

          setIsLoading(false);
          return; // Stop further execution to prevent unnecessary API call
      }

      // ✅ If chatbot is asking a follow-up question, store it
      if (parsedResponse.response_type === "question") {
          console.log("💬 Chatbot is asking for more info:", parsedResponse.message);

          setSessionData(prevSession => ({
              ...prevSession,
              lastQuestion: parsedResponse.message
          }));
          sessionStorage.setItem("lastQuestion", parsedResponse.message);
      }

      setMessages(prevMessages => [...prevMessages, { text: parsedResponse.reply, isUser: false }]);

  } catch (error) {
      console.error('🔴 Chatbot API Error:', error);
      setMessages(prevMessages => [...prevMessages, { 
          text: 'Error connecting to chatbot. Please try again.', 
          isUser: false 
      }]);
  } finally {
      setIsLoading(false);
  }

  setInputText('');
};


  return (
    <>
      <ChatButton onClick={() => setIsOpen(!isOpen)}>
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
