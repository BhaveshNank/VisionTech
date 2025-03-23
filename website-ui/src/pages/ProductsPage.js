import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchProducts } from '../utils/api';
import ProductCard from '../components/Products/ProductCard';
import { FaMobileAlt, FaLaptop, FaTv, FaList, FaFilter } from 'react-icons/fa';
// Import the styled components from App.js
import {
  CategoryItem,
  CategoryCount,
  FilterSection,
  RangeContainer,
  PriceInputs,
  PriceInput,
  PriceSeparator,
  ApplyButton,
  MobileFilterToggle,
  Sidebar,
  ClearFiltersButton
} from '../App';

// Add your other styled components for ProductsPage

export const CategoryTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
`;

export const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

const SidebarLayout = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  width: 100%;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    
    h1 {
      margin-bottom: 1rem;
    }
  }
`;

const SearchForm = styled.form`
  display: flex;
  width: 300px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-right: none;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const SearchButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0069d9;
  }
`;

const SearchResultsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f0f7ff;
  border-radius: 6px;
  font-size: 14px;
  color: #495057;
  min-width: 300px;
  border: 1px solid #cce5ff;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    color: #495057;
    text-decoration: underline;
  }
`;

const NoResultsMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  
  h2 {
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  p {
    margin-bottom: 20px;
  }
  
  button {
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 16px;
    
    &:hover {
      background: #0069d9;
    }
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const productRefs = useRef({});
  
  // Extract search query and category from URL params when location changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search');
    const category = params.get('category') || 'all';
    
    setSelectedCategory(category);
    
    if (query) {
      setSearchQuery(query.toLowerCase());
      console.log("Search query detected:", query);
    } else {
      setSearchQuery('');
    }
  }, [location.search]);
  
  // Fetch all products on component mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        // Your existing code to fetch products
        const response = await fetch(`http://localhost:5001/api/products`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    fetchAllProducts();
  }, []);
  
  // Filter products based on search query and category
  useEffect(() => {
    let filtered = [...allProducts];
    
    // Filter by category first
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Extract min and max price from URL parameters
    const params = new URLSearchParams(location.search);
    const minPrice = params.get('min') ? Number(params.get('min')) : null;
    const maxPrice = params.get('max') ? Number(params.get('max')) : null;
    
    // Update price input fields to reflect URL parameters
    if (minPrice) setPriceMin(minPrice.toString());
    if (maxPrice) setPriceMax(maxPrice.toString());
    
    // Filter by price if parameters exist
    if (minPrice || maxPrice) {
      filtered = filtered.filter(product => {
        // Extract numeric price (handle different price formats)
        const priceString = product.price && product.price.toString();
        const numericPrice = priceString ? 
          parseFloat(priceString.replace(/[^0-9.]/g, '')) : 0;
        
        // Apply min filter if exists
        if (minPrice && numericPrice < minPrice) return false;
        
        // Apply max filter if exists
        if (maxPrice && numericPrice > maxPrice) return false;
        
        return true;
      });
    }
    
    // Then filter by search query if present
    if (searchQuery) {
      // Your existing search filter code should be here
      filtered = filtered.filter(product => {
        // Keep your existing search logic
        return product.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    setFilteredProducts(filtered);
    
  }, [searchQuery, selectedCategory, allProducts, location.search]);
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(location.search);
    params.set('category', category);
    
    // Preserve search query if present
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    
    navigate(`/products?${params.toString()}`);
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    const formSearchQuery = e.target.elements.search.value;
    
    if (formSearchQuery.trim()) {
      const params = new URLSearchParams(location.search);
      params.set('search', formSearchQuery.trim());
      
      // Preserve category if present
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      } else {
        params.delete('category');
      }
      
      navigate(`/products?${params.toString()}`);
    }
  };
  
  // Clear search results
  const clearSearch = () => {
    // Update state immediately to avoid flashing UI
    setSearchQuery('');
    
    // Then update URL params
    const params = new URLSearchParams(location.search);
    params.delete('search');
    
    // Preserve category if present
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    
    // Use replace instead of navigate to avoid adding to history stack
    navigate(`/products?${params.toString()}`, { replace: true });
  };

  const applyPriceFilter = () => {
    const min = priceMin ? Number(priceMin) : 0;
    const max = priceMax ? Number(priceMax) : Infinity;
    
    // Apply filtering
    const params = new URLSearchParams(location.search);
    if (min > 0) params.set('min', min);
    else params.delete('min');
    
    if (max < Infinity) params.set('max', max);
    else params.delete('max');
    
    navigate(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setPriceMin('');
    setPriceMax('');
    setSearchQuery('');
    
    // Update URL
    navigate('/products', { replace: true });
  };

  return (
    <PageContainer>
      <MobileFilterToggle onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}>
        <FaFilter /> {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
      </MobileFilterToggle>
              
      <SidebarLayout>
        <Sidebar isOpen={isMobileFilterOpen}>
          <CategoryList>
            <CategoryItem 
              active={selectedCategory === 'all'} 
              onClick={() => handleCategoryChange('all')}
            >
              <FaList /> All Products
            </CategoryItem>
            <CategoryItem 
              active={selectedCategory === 'phone'} 
              onClick={() => handleCategoryChange('phone')}
            >
              <FaMobileAlt /> Phones 
              <CategoryCount active={selectedCategory === 'phone'}>
                {allProducts.filter(p => p.category === 'phone').length}
              </CategoryCount>
            </CategoryItem>
            <CategoryItem 
              active={selectedCategory === 'laptop'} 
              onClick={() => handleCategoryChange('laptop')}
            >
              <FaLaptop /> Laptops
              <CategoryCount active={selectedCategory === 'laptop'}>
                {allProducts.filter(p => p.category === 'laptop').length}
              </CategoryCount>
            </CategoryItem>
            <CategoryItem 
              active={selectedCategory === 'tv'} 
              onClick={() => handleCategoryChange('tv')}
            >
              <FaTv /> TVs
              <CategoryCount active={selectedCategory === 'tv'}>
                {allProducts.filter(p => p.category === 'tv').length}
              </CategoryCount>
            </CategoryItem>
          </CategoryList>
          <FilterSection>
            <CategoryTitle>Price Range</CategoryTitle>
            <RangeContainer>
              <PriceInputs>
                <PriceInput 
                  type="number" 
                  placeholder="Min" 
                  min="0"
                  value={priceMin} 
                  onChange={(e) => setPriceMin(e.target.value)} 
                />
                <PriceSeparator>to</PriceSeparator>
                <PriceInput 
                  type="number" 
                  placeholder="Max" 
                  min="0"
                  value={priceMax} 
                  onChange={(e) => setPriceMax(e.target.value)} 
                />
              </PriceInputs>
              <ApplyButton onClick={applyPriceFilter}>Apply</ApplyButton>
            </RangeContainer>
            <ClearFiltersButton onClick={clearAllFilters}>
              Clear All Filters
            </ClearFiltersButton>
          </FilterSection>
        </Sidebar>
        
        <MainContent>
          <ProductsHeader>
            <h1>{selectedCategory === 'all' ? 'All Products' : 
              `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}s`}
            </h1>
            
            <div style={{ position: 'relative' }}>
              {/* Search form always present, but visually hidden when showing results */}
              <SearchForm 
                onSubmit={handleSearch}
                style={{ 
                  visibility: searchQuery ? 'hidden' : 'visible',
                  position: searchQuery ? 'absolute' : 'static',
                  zIndex: searchQuery ? -1 : 1
                }}
              >
                <SearchInput 
                  type="text" 
                  name="search" 
                  placeholder="Search products..." 
                  defaultValue={searchQuery}
                />
                <SearchButton type="submit">Search</SearchButton>
              </SearchForm>
              
              {/* Results bar conditionally rendered on top */}
              {searchQuery && (
                <SearchResultsBar>
                  <span>
                    {filteredProducts.length === 0 
                      ? 'No products found for: ' 
                      : `Showing ${filteredProducts.length} result${filteredProducts.length !== 1 ? 's' : ''} for: `}
                    <strong>{searchQuery}</strong>
                  </span>
                  <ClearButton onClick={clearSearch}>Clear Search</ClearButton>
                </SearchResultsBar>
              )}
            </div>
          </ProductsHeader>
          
          {filteredProducts.length === 0 && searchQuery ? (
            <NoResultsMessage>
              <h2>No products found</h2>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button onClick={clearSearch}>Clear Search</button>
            </NoResultsMessage>
          ) : (
            <ProductGrid>
              {filteredProducts.map(product => {
                // Ensure product.id exists, create a fallback id if needed
                const productId = product.id || `${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                
                return (
                  <ProductCard
                    key={productId}
                    ref={el => {
                      if (el) {
                        productRefs.current[productId] = el;
                      }
                    }}
                    className={searchQuery && product.name.toLowerCase().includes(searchQuery) ? 'search-match' : ''}
                    product={product}
                  />
                );
              })}
            </ProductGrid>
          )}
        </MainContent>
      </SidebarLayout>
    </PageContainer>
  );
};

// Add this CSS to your stylesheet
const styles = `
  .search-match {
    border: 2px solid #007bff !important;
    box-shadow: 0 0 15px rgba(0, 123, 255, 0.3) !important;
  }
  
  @keyframes highlight {
    0% { background-color: rgba(0, 123, 255, 0.1); }
    50% { background-color: rgba(0, 123, 255, 0.3); }
    100% { background-color: transparent; }
  }
  
  .highlight-product {
    animation: highlight 2s ease;
  }
`;

export default ProductsPage;