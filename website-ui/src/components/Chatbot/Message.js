import React from 'react';
import styled from 'styled-components';

const MessageContainer = styled.div`
  padding: 10px;
  margin: 5px;
  border-radius: 10px;
  max-width: 70%;
  ${props => props.sender === 'user' ? `
    background-color: #007bff;
    color: white;
    margin-left: auto;
  ` : `
    background-color: #f1f1f1;
    margin-right: auto;
  `}
`;

const Message = ({ text, sender }) => {
  return (
    <MessageContainer sender={sender}>
      {text}
    </MessageContainer>
  );
};

export default Message;