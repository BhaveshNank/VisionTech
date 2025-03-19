import React from 'react';
import styled from 'styled-components';
import './Categories.css'; // ✅ Ensure CSS is imported
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Laptops', image: '/images/laptop.jpg', filterName: 'laptop' },
  { name: 'Phones', image: '/images/phone.jpg', filterName: 'phone' },
  { name: 'TVs', image: '/images/tv.jpg', filterName: 'tv' },
  { name: 'Smartwatch', image: '/images/smartwatch.jpg', filterName: 'smartwatch' },
  { name: 'Earphone', image: '/images/earphone.jpg', filterName: 'earphone' }
];

const CategoriesContainer = styled.div`
  text-align: center;
  padding: ${props => props.showTitle ? '50px 20px' : '20px'};
`;

const CategoriesTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1a1a1a;
  position: relative;
  display: inline-block; /* Ensures the line is only as wide as the text */

  &:after {
    content: "";
    display: block;
    width: 50%;  /* Adjust the length of the line */
    height: 3px; /* Thickness of the line */
    background: #1a73e8; /* Color matching your blue gradient */
    margin: 5px auto 0;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  justify-content: center;
  padding: 20px;
`;

const CategoryCard = styled(Link)`
  position: relative;
  width: 100%;
  max-width: 250px;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none; /* Remove default link styling */
  display: block; /* Make sure the link takes full box size */
  
  &:hover {
    transform: scale(1.05);
  }
`;

const CategoryImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: contain; /* Change from 'cover' to 'contain' */
  filter: brightness(70%);
  transition: filter 0.3s ease-in-out;
  background-color: white; /* Adds background in case of empty space */

  ${CategoryCard}:hover & {
    filter: brightness(100%);
  }
`;


const CategoryName = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 10px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 5px;
`;

// Modified Categories component with showTitle prop
const Categories = ({ showTitle = false }) => {
  return (
    <CategoriesContainer showTitle={showTitle}>
      {showTitle && <CategoriesTitle>Categories</CategoriesTitle>}
      <CategoriesGrid>
        {categories.map((category) => (
          <CategoryCard 
            key={category.name}
            to={`/products?category=${category.filterName}`}
          >
            <CategoryImage src={category.image} alt={category.name} />
            <CategoryName>{category.name}</CategoryName>
          </CategoryCard>
        ))}
      </CategoriesGrid>
    </CategoriesContainer>
  );
};

export default Categories;
