import React, { useState } from 'react';
import styled from 'styled-components';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const ContactContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #000000;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ContactInfo = styled.div``;

const ContactForm = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const InfoIcon = styled.div`
  font-size: 1.5rem;
  color: #000000;
  margin-right: 1rem;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoContent = styled.div`
  color: #000000;
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.25rem;
  }
  
  p {
    margin: 0;
    line-height: 1.5;
    color: #666666;
  }
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #000000;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 150px;
  transition: border-color 0.3s ease;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;

const SubmitButton = styled.button`
  background: #000000;
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #333333;
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };
  
  return (
    <ContactContainer>
      <Header>
        <Title>Contact Us</Title>
        <Subtitle>
          Have questions or need assistance? We're here to help. 
          Reach out to our team through any of the methods below.
        </Subtitle>
      </Header>
      
      <ContactGrid>
        <ContactInfo>
          <InfoItem>
            <InfoIcon>
              <FaMapMarkerAlt />
            </InfoIcon>
            <InfoContent>
              <h3>Address</h3>
              <p>123 Tech Avenue</p>
              <p>San Francisco, CA 94107</p>
            </InfoContent>
          </InfoItem>
          
          <InfoItem>
            <InfoIcon>
              <FaPhone />
            </InfoIcon>
            <InfoContent>
              <h3>Phone</h3>
              <p>+1 (555) 123-4567</p>
            </InfoContent>
          </InfoItem>
          
          <InfoItem>
            <InfoIcon>
              <FaEnvelope />
            </InfoIcon>
            <InfoContent>
              <h3>Email</h3>
              <p>support@visionelectronics.com</p>
            </InfoContent>
          </InfoItem>
          
          <InfoItem>
            <InfoIcon>
              <FaClock />
            </InfoIcon>
            <InfoContent>
              <h3>Hours</h3>
              <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
              <p>Saturday - Sunday: 10:00 AM - 6:00 PM</p>
            </InfoContent>
          </InfoItem>
        </ContactInfo>
        
        <ContactForm>
          {isSubmitted && (
            <SuccessMessage>
              Thank you for your message! We'll get back to you as soon as possible.
            </SuccessMessage>
          )}
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Your Name</Label>
              <Input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                type="text" 
                id="subject" 
                name="subject" 
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                name="message" 
                value={formData.message}
                onChange={handleChange}
                required
              />
            </FormGroup>
            
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </SubmitButton>
          </Form>
        </ContactForm>
      </ContactGrid>
    </ContactContainer>
  );
};

export default Contact;