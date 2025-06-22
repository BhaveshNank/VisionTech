import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { getProductImageUrl } from '../../utils/imageUtils';

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

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f5f9ff;
  }
`;

const SuggestionImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin-right: 12px;
  border-radius: 4px;
`;

const SuggestionText = styled.div`
  display: flex;
  flex-direction: column;
`;

const SuggestionName = styled.div`
  font-size: 14px;
  color: #333;
`;

const SuggestionCategory = styled.div`
  font-size: 12px;
  color: #999;
  text-transform: capitalize;
`;

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/search-suggestions?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch suggestions: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Suggestions received:", data); // Debug log
        setSuggestions(data);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      }
    };
    
    // Debounce API calls
    const timerId = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(timerId);
  }, [query]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target) && 
        inputRef.current && 
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false); // Hide suggestions after search
    }
  };
  
  const handleClear = () => {
    setQuery('');
    setSuggestions([]); // Clear suggestions
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(suggestion.name.trim())}`);
  };

  // Handle keyboard events (including Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent any default form submission
      handleSearch();
    } else if (e.key === 'Escape') {
      handleClear();
      setShowSuggestions(false); // Also hide suggestions
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
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true); // Show suggestions when typing
          }}
          onFocus={() => setShowSuggestions(true)} // Show suggestions on focus
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
      
      {/* Render the suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <SuggestionsContainer ref={suggestionsRef}>
          {suggestions.map((suggestion, index) => (
            <SuggestionItem 
              key={index} 
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.image && (
                <SuggestionImage 
                  src={suggestion.image} 
                  alt={suggestion.name} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getProductImageUrl('default-product.jpg');
                  }}
                />
              )}
              <SuggestionText>
                <SuggestionName>{suggestion.name}</SuggestionName>
                <SuggestionCategory>{suggestion.category}</SuggestionCategory>
              </SuggestionText>
            </SuggestionItem>
          ))}
        </SuggestionsContainer>
      )}
    </SearchContainer>
  );
};

export default SearchBar;