import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaTimes } from 'react-icons/fa';

// Completely redesigned wrapper to eliminate any phantom areas
const SearchContainer = styled.div`
  position: relative;
  width: 350px;
  margin: 0 1rem;
  isolation: isolate; /* Creates a new stacking context */
`;

// Completely eliminate form behavior with simple div
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

// Enhanced button styling to ensure they're the only clickable elements
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
  padding: 0; /* Remove any default padding */
  
  &:hover {
    color: #2575fc;
  }
`;

const SearchButton = styled(IconButton)`
  right: 8px; /* Moved closer to edge */
  font-size: 18px;
  width: 32px; /* Slightly increased clickable area */
  height: 32px;
`;

const ClearButton = styled(IconButton)`
  right: 40px; /* Adjusted to prevent overlap */
  font-size: 16px;
  width: 28px;
  height: 28px;
`;

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = React.useRef(null);
  
  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };
  
  const handleClear = () => {
    setQuery('');
    // Focus back on input field after clearing
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  
  return (
    <SearchContainer>
      {/* Now using a plain div with no form-related behavior */}
      <SearchInputWrapper>
        <SearchInput 
          ref={inputRef}
          type="text" 
          placeholder="Search products..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search products"
          role="searchbox" /* Added proper accessibility role */
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