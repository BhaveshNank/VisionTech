import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaStore, FaUsers, FaAward } from 'react-icons/fa';

const AboutContainer = styled.div`
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
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: #1a73e8;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  color: #1a73e8;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #2c3e50;
`;

const CardText = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const TeamMember = styled.div`
  text-align: center;
`;

const MemberImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin: 0 auto 1rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MemberName = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
`;

const MemberPosition = styled.p`
  color: #1a73e8;
  font-weight: 500;
`;

const About = () => {
  return (
    <AboutContainer>
      <Header>
        <Title>About Vision Electronics</Title>
        <Subtitle>
          We are dedicated to providing the best shopping experience with cutting-edge AI technology 
          to help you find the perfect tech products that suit your needs.
        </Subtitle>
      </Header>
      
      <Section>
        <SectionTitle>Our Story</SectionTitle>
        <p>
          Founded in 2023, Vision Electronics began with a simple mission: to make shopping for tech products easier 
          and more intuitive. We recognized that customers often struggle with the overwhelming number of choices 
          and technical specifications when shopping for electronics.
        </p>
        <p>
          Our team of tech enthusiasts and AI specialists joined forces to create a platform that uses 
          artificial intelligence to understand customer needs and preferences, providing personalized 
          recommendations that help customers make informed decisions.
        </p>
        <p>
          Today, Vision Electronics has grown to become one of the most trusted online retailers for tech products, 
          serving customers with an innovative shopping experience that combines cutting-edge technology 
          with excellent customer service.
        </p>
      </Section>
      
      <Section>
        <SectionTitle>Why Choose Us</SectionTitle>
        <Grid>
          <Card>
            <IconWrapper>
              <FaCheckCircle />
            </IconWrapper>
            <CardTitle>Quality Products</CardTitle>
            <CardText>
              We partner with leading brands and manufacturers to ensure that every product 
              in our catalog meets the highest quality standards.
            </CardText>
          </Card>
          
          <Card>
            <IconWrapper>
              <FaStore />
            </IconWrapper>
            <CardTitle>AI-Powered Shopping</CardTitle>
            <CardText>
              Our intelligent recommendation system learns from your preferences to suggest 
              products that perfectly match your needs and budget.
            </CardText>
          </Card>
          
          <Card>
            <IconWrapper>
              <FaUsers />
            </IconWrapper>
            <CardTitle>Customer Support</CardTitle>
            <CardText>
              Our dedicated support team is available 24/7 to assist you with any questions 
              or concerns about your purchase.
            </CardText>
          </Card>
          
          <Card>
            <IconWrapper>
              <FaAward />
            </IconWrapper>
            <CardTitle>Satisfaction Guaranteed</CardTitle>
            <CardText>
              We offer a 30-day satisfaction guarantee on all purchases, with hassle-free 
              returns and exchanges.
            </CardText>
          </Card>
        </Grid>
      </Section>
    </AboutContainer>
  );
};

export default About;