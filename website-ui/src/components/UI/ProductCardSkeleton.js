import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

const SkeletonCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
`;

const SkeletonImage = styled(SkeletonBase)`
  height: 240px;
  width: 100%;
  margin-bottom: 20px;
  border-radius: 12px;
`;

const SkeletonTitle = styled(SkeletonBase)`
  height: 20px;
  width: 80%;
  margin-bottom: 12px;
`;

const SkeletonSubtitle = styled(SkeletonBase)`
  height: 16px;
  width: 60%;
  margin-bottom: 16px;
`;

const SkeletonPrice = styled(SkeletonBase)`
  height: 24px;
  width: 40%;
  margin-bottom: 16px;
`;

const SkeletonFeature = styled(SkeletonBase)`
  height: 14px;
  width: ${props => props.width || '70%'};
  margin-bottom: 8px;
`;

const SkeletonButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const SkeletonButton = styled(SkeletonBase)`
  height: 40px;
  flex: 1;
  border-radius: 20px;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCardSkeleton = ({ count = 12 }) => {
  return (
    <SkeletonGrid>
      {[...Array(count)].map((_, index) => (
        <SkeletonCard key={index}>
          <SkeletonImage />
          <SkeletonSubtitle />
          <SkeletonTitle />
          <SkeletonPrice />
          <SkeletonFeature width="90%" />
          <SkeletonFeature width="75%" />
          <SkeletonFeature width="85%" />
          <SkeletonButtons>
            <SkeletonButton />
            <SkeletonButton />
          </SkeletonButtons>
        </SkeletonCard>
      ))}
    </SkeletonGrid>
  );
};

export default ProductCardSkeleton;