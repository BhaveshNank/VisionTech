import React from 'react';
import styled from 'styled-components';
import { Categories } from '../components';

const PageContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
`;

const CategoriesPage = () => {
  return (
    <PageContainer>
      <Title>Categories</Title>
      <Categories />
    </PageContainer>
  );
};

export default CategoriesPage;
