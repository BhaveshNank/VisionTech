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

const FilterSkeletonContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterSectionSkeleton = styled.div`
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f2f5;
  
  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const FilterTitleSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: 60%;
  margin-bottom: 15px;
`;

const FilterItemSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const FilterCheckboxSkeleton = styled(SkeletonBase)`
  width: 18px;
  height: 18px;
  border-radius: 4px;
`;

const FilterLabelSkeleton = styled(SkeletonBase)`
  height: 14px;
  width: ${props => props.width || '70%'};
  flex: 1;
`;

const FilterCountSkeleton = styled(SkeletonBase)`
  width: 20px;
  height: 14px;
  border-radius: 8px;
`;

const FilterSkeleton = () => {
  return (
    <FilterSkeletonContainer>
      {/* Categories Section */}
      <FilterSectionSkeleton>
        <FilterTitleSkeleton />
        {[...Array(4)].map((_, index) => (
          <FilterItemSkeleton key={index}>
            <FilterCheckboxSkeleton />
            <FilterLabelSkeleton width={`${Math.random() * 30 + 50}%`} />
            <FilterCountSkeleton />
          </FilterItemSkeleton>
        ))}
      </FilterSectionSkeleton>

      {/* Brands Section */}
      <FilterSectionSkeleton>
        <FilterTitleSkeleton />
        {[...Array(6)].map((_, index) => (
          <FilterItemSkeleton key={index}>
            <FilterCheckboxSkeleton />
            <FilterLabelSkeleton width={`${Math.random() * 25 + 40}%`} />
            <FilterCountSkeleton />
          </FilterItemSkeleton>
        ))}
      </FilterSectionSkeleton>

      {/* Price Range Section */}
      <FilterSectionSkeleton>
        <FilterTitleSkeleton />
        {[...Array(5)].map((_, index) => (
          <FilterItemSkeleton key={index}>
            <FilterCheckboxSkeleton style={{ borderRadius: '50%' }} />
            <FilterLabelSkeleton width={`${Math.random() * 35 + 45}%`} />
          </FilterItemSkeleton>
        ))}
      </FilterSectionSkeleton>

      {/* Specifications Section */}
      <FilterSectionSkeleton>
        <FilterTitleSkeleton />
        {[...Array(4)].map((_, index) => (
          <FilterItemSkeleton key={index}>
            <FilterCheckboxSkeleton />
            <FilterLabelSkeleton width={`${Math.random() * 20 + 35}%`} />
            <FilterCountSkeleton />
          </FilterItemSkeleton>
        ))}
      </FilterSectionSkeleton>
    </FilterSkeletonContainer>
  );
};

export default FilterSkeleton;