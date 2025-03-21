import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaTimes } from 'react-icons/fa';

// Using div instead of form to eliminate default form behavior
const SearchContainer = styled.div`
  position: relative;
  width: 350px;
  margin: 0 1rem;
`;

// Using div instead of form
const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 16px;
  font-size: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &:focus {
    border-color: #2575fc;
    box-shadow: 0 3px 12px rgba(37, 117, 252, 0.15);
  }
`;

const IconButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  z-index: 10;
  
  &:hover {
    color: #2575fc;
  }
`;

const SearchButton = styled(IconButton)`
  right: 10px;
  font-size: 18px;
  width: 32px;
  height: 32px;
`;

const ClearButton = styled(IconButton)`
  right: 40px;
  font-size: 16px;
  width: 28px;
  height: 28px;
`;

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);
  
  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };
  
  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle keyboard events (including Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent any default form submission
      handleSearch();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };
  
  return (
    <SearchContainer>
      {/* Changed from form to div to eliminate default form submission */}
      <SearchInputWrapper>
        <SearchInput 
          ref={inputRef}
          type="text" 
          placeholder="Search products..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search products"
          role="searchbox"
        />
        
        {query && (
          <ClearButton 
            type="button" 
            onClick={handleClear}
            aria-label="Clear search"
            tabIndex={-1}
          >
            <FaTimes />
          </ClearButton>
        )}
        
        <SearchButton 
          type="button" 
          onClick={handleSearch}
          aria-label="Search"
        >
          <FaSearch />
        </SearchButton>
      </SearchInputWrapper>
    </SearchContainer>
  );
};

export default SearchBar;