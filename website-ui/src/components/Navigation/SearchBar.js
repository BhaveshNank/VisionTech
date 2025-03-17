import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SearchContainer = styled.div`
  position: relative;
  width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  outline: none;
  
  &:focus {
    border-color: #3498db;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
`;

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${query}`);
      setQuery('');
    }
  };
  
  return (
    <SearchContainer>
      <form onSubmit={handleSearch}>
        <SearchInput 
          type="text" 
          placeholder="Search products..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchButton type="submit">🔍</SearchButton>
      </form>
    </SearchContainer>
  );
};

export default SearchBar;