import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchProducts } from '../utils/api';
import ProductCard from '../components/Products/ProductCard';
import { FaMobileAlt, FaLaptop, FaTv, FaList, FaFilter, FaTimes, FaCheck } from 'react-icons/fa';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
`;

const SidebarLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 80px;
  align-items: start;
  margin-left: 0;
  
  @media (max-width: 1200px) {
    grid-template-columns: 260px 1fr;
    gap: 60px;
    margin-left: 0;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-left: 0;
  }
`;

const MainContent = styled.div`
  width: 100%;
  min-width: 0; /* Prevents overflow */
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
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const ResultsCount = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #333;
  
  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
`;

const ViewButton = styled.button`
  padding: 8px 12px;
  border: none;
  background: ${props => props.active ? '#1a73e8' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: ${props => props.active ? '#1a73e8' : '#f5f5f5'};
  }
`;

// Enhanced Sidebar
const Sidebar = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  align-self: start;
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  width: 100%;
  margin-left: 0;
  
  @media (max-width: 768px) {
    position: static;
    display: ${props => props.isOpen ? 'block' : 'none'};
    margin-bottom: 1.5rem;
    margin-left: 0;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const FilterTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
`;

const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const CategoryItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-bottom: 0.5rem;
  cursor: pointer;
  color: ${props => props.active ? '#1a73e8' : '#666'};
  font-weight: ${props => props.active ? '600' : 'normal'};
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    color: #1a73e8;
    background: rgba(26, 115, 232, 0.05);
    padding-left: 0.5rem;
  }
  
  svg {
    margin-right: 10px;
    font-size: 1.1rem;
  }
  
  ${props => props.active && `
    background: rgba(26, 115, 232, 0.1);
    padding-left: 0.5rem;
  `}
`;

const CategoryCount = styled.span`
  background-color: ${props => props.active ? '#1a73e8' : '#e9ecef'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  font-weight: 500;
`;

// Brand Filter Components
const BrandFilterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  max-height: 200px;
  overflow-y: auto;
`;

const BrandFilterItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin: 0;
  
  &:hover {
    color: #333;
    background: rgba(26, 115, 232, 0.05);
  }
  
  input[type="checkbox"] {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    position: relative;
    transition: all 0.2s ease;
    cursor: pointer;
    
    &:checked {
      background: #1a73e8;
      border-color: #1a73e8;
      
      &:after {
        content: '';
        position: absolute;
        top: 2px;
        left: 5px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
    
    &:hover {
      border-color: #1a73e8;
    }
  }
  
  span {
    flex: 1;
  }
`;

const BrandCount = styled.span`
  margin-left: auto;
  background: #f0f0f0;
  color: #666;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 8px;
  min-width: 20px;
  text-align: center;
`;

// Improved Price Range Components
const PriceRangeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PriceRangeLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
`;

const PriceInputsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const PriceInput = styled.input`
  width: 100%;
  padding: 10px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  box-sizing: border-box;
  min-width: 0; /* Prevents input from growing beyond container */
  
  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
  }
  
  &::placeholder {
    color: #999;
    font-size: 0.85rem;
  }
`;

const PriceSeparator = styled.span`
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  padding: 0 4px;
`;

const ApplyButton = styled.button`
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 8px;
  
  &:hover {
    background-color: #1557b0;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Active Filters
const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 1.5rem;
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e6f2ff;
  color: #1a73e8;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const FilterTagClose = styled.button`
  background: none;
  border: none;
  color: #1a73e8;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #1557b0;
  }
`;

const ClearAllFilters = styled.button`
  background: #fff;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 10px 16px;
  border-radius: 6px;
  margin-top: 1.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: all 0.2s ease;
  gap: 6px;
  
  &:hover {
    background-color: #dc3545;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Mobile Filter Toggle
const MobileFilterToggle = styled.button`
  display: none;
  width: 100%;
  background: #1a73e8;
  color: white;
  border: none;
  padding: 12px;
  font-size: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

// Product Grid
const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => 
    props.viewMode === 'list' 
      ? '1fr' 
      : 'repeat(auto-fill, minmax(280px, 1fr))'};
  gap: ${props => props.viewMode === 'list' ? '16px' : '20px'};
  
  @media (max-width: 1200px) {
    grid-template-columns: ${props => 
      props.viewMode === 'list' 
        ? '1fr' 
        : 'repeat(auto-fill, minmax(260px, 1fr))'};
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const NoResultsMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  
  h2 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #333;
  }
  
  p {
    margin-bottom: 20px;
    color: #666;
  }
  
  button {
    background: #1a73e8;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 12px 24px;
    cursor: pointer;
    font-size: 16px;
    
    &:hover {
      background: #1557b0;
    }
  }
`;

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [availableBrands, setAvailableBrands] = useState([]);
  const productRefs = useRef({});
  
  // Extract parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search');
    const category = params.get('category') || 'all';
    const brands = params.get('brands')?.split(',').filter(Boolean) || [];
    const minPrice = params.get('min');
    const maxPrice = params.get('max');
    const sort = params.get('sort') || 'name';
    
    setSelectedCategory(category);
    setSelectedBrands(brands);
    setSearchQuery(query || '');
    setPriceMin(minPrice || '');
    setPriceMax(maxPrice || '');
    setSortBy(sort);
  }, [location.search]);
  
  // Fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
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
  
  // Update available brands based on current category
  useEffect(() => {
    let categoryProducts = allProducts;
    
    if (selectedCategory !== 'all') {
      categoryProducts = allProducts.filter(product => 
        product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Extract brands from current category products
    const brandCounts = {};
    categoryProducts.forEach(product => {
      const name = product.name.toLowerCase();
      let brand = 'Other';
      
      if (name.includes('iphone') || name.includes('apple')) brand = 'Apple';
      else if (name.includes('samsung') || name.includes('galaxy')) brand = 'Samsung';
      else if (name.includes('google') || name.includes('pixel')) brand = 'Google';
      else if (name.includes('oneplus')) brand = 'OnePlus';
      else if (name.includes('xiaomi')) brand = 'Xiaomi';
      else if (name.includes('huawei')) brand = 'Huawei';
      else if (name.includes('sony')) brand = 'Sony';
      else if (name.includes('lg')) brand = 'LG';
      else if (name.includes('dell')) brand = 'Dell';
      else if (name.includes('hp')) brand = 'HP';
      else if (name.includes('lenovo')) brand = 'Lenovo';
      else if (name.includes('asus')) brand = 'ASUS';
      else if (name.includes('acer')) brand = 'Acer';
      else if (name.includes('msi')) brand = 'MSI';
      else if (name.includes('macbook')) brand = 'Apple';
      
      brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });
    
    const brands = Object.entries(brandCounts)
      .filter(([brand, count]) => brand !== 'Other' && count > 0)
      .map(([brand, count]) => ({ name: brand, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    setAvailableBrands(brands);
  }, [allProducts, selectedCategory]);
  
  // Filter and sort products
  useEffect(() => {
    let filtered = [...allProducts];
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => {
        const name = product.name.toLowerCase();
        return selectedBrands.some(brand => {
          const brandLower = brand.toLowerCase();
          if (brandLower === 'apple') return name.includes('iphone') || name.includes('apple') || name.includes('macbook');
          if (brandLower === 'samsung') return name.includes('samsung') || name.includes('galaxy');
          if (brandLower === 'google') return name.includes('google') || name.includes('pixel');
          if (brandLower === 'oneplus') return name.includes('oneplus');
          if (brandLower === 'xiaomi') return name.includes('xiaomi');
          if (brandLower === 'huawei') return name.includes('huawei');
          if (brandLower === 'sony') return name.includes('sony');
          if (brandLower === 'lg') return name.includes('lg');
          if (brandLower === 'dell') return name.includes('dell');
          if (brandLower === 'hp') return name.includes('hp');
          if (brandLower === 'lenovo') return name.includes('lenovo');
          if (brandLower === 'asus') return name.includes('asus');
          if (brandLower === 'acer') return name.includes('acer');
          if (brandLower === 'msi') return name.includes('msi');
          return name.includes(brandLower);
        });
      });
    }
    
    // Price filter
    const minPrice = priceMin ? Number(priceMin) : null;
    const maxPrice = priceMax ? Number(priceMax) : null;
    
    if (minPrice || maxPrice) {
      filtered = filtered.filter(product => {
        const priceString = product.price && product.price.toString();
        const numericPrice = priceString ? 
          parseFloat(priceString.replace(/[^0-9.]/g, '')) : 0;
        
        if (minPrice && numericPrice < minPrice) return false;
        if (maxPrice && numericPrice > maxPrice) return false;
        
        return true;
      });
    }
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product => {
        return product.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return getNumericPrice(a.price) - getNumericPrice(b.price);
        case 'price-high':
          return getNumericPrice(b.price) - getNumericPrice(a.price);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    setFilteredProducts(filtered);
  }, [allProducts, selectedCategory, selectedBrands, searchQuery, priceMin, priceMax, sortBy]);
  
  const getNumericPrice = (price) => {
    if (!price) return 0;
    return parseFloat(price.toString().replace(/[^0-9.]/g, '')) || 0;
  };
  
  const updateURL = (updates) => {
    const params = new URLSearchParams(location.search);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all' && value.length > 0) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value);
        }
      } else {
        params.delete(key);
      }
    });
    
    navigate(`/products?${params.toString()}`, { replace: true });
  };
  
  const handleCategoryChange = (category) => {
    updateURL({ 
      category, 
      brands: [], // Clear brands when changing category
      min: '',
      max: ''
    });
  };
  
  const handleBrandChange = (brand, checked) => {
    const newBrands = checked 
      ? [...selectedBrands, brand]
      : selectedBrands.filter(b => b !== brand);
    
    updateURL({ brands: newBrands });
  };
  
  const handlePriceFilter = () => {
    updateURL({ min: priceMin, max: priceMax });
  };
  
  const clearAllFilters = () => {
    navigate('/products', { replace: true });
  };
  
  const removeFilter = (type, value = null) => {
    switch (type) {
      case 'category':
        updateURL({ category: 'all' });
        break;
      case 'brand':
        updateURL({ brands: selectedBrands.filter(b => b !== value) });
        break;
      case 'price':
        updateURL({ min: '', max: '' });
        break;
      case 'search':
        updateURL({ search: '' });
        break;
    }
  };
  
  const getPageTitle = () => {
    if (searchQuery) return `Search results for "${searchQuery}"`;
    if (selectedCategory === 'all') return 'All Products';
    return `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}s`;
  };
  
  const getActiveFilters = () => {
    const filters = [];
    
    if (selectedCategory !== 'all') {
      filters.push({ type: 'category', label: selectedCategory, value: selectedCategory });
    }
    
    selectedBrands.forEach(brand => {
      filters.push({ type: 'brand', label: brand, value: brand });
    });
    
    if (priceMin || priceMax) {
      const label = `£${priceMin || '0'} - £${priceMax || '∞'}`;
      filters.push({ type: 'price', label, value: null });
    }
    
    if (searchQuery) {
      filters.push({ type: 'search', label: `"${searchQuery}"`, value: null });
    }
    
    return filters;
  };

  return (
    <PageContainer>
      <MobileFilterToggle onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}>
        <FaFilter /> {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
      </MobileFilterToggle>
      
      <SidebarLayout>
        <Sidebar isOpen={isMobileFilterOpen}>
          {/* Categories */}
          <FilterSection>
            <FilterTitle>Categories</FilterTitle>
            <CategoryList>
              <CategoryItem 
                active={selectedCategory === 'all'} 
                onClick={() => handleCategoryChange('all')}
              >
                <span><FaList /> All Products</span>
                <CategoryCount active={selectedCategory === 'all'}>
                  {allProducts.length}
                </CategoryCount>
              </CategoryItem>
              <CategoryItem 
                active={selectedCategory === 'phone'} 
                onClick={() => handleCategoryChange('phone')}
              >
                <span><FaMobileAlt /> Phones</span>
                <CategoryCount active={selectedCategory === 'phone'}>
                  {allProducts.filter(p => p.category === 'phone').length}
                </CategoryCount>
              </CategoryItem>
              <CategoryItem 
                active={selectedCategory === 'laptop'} 
                onClick={() => handleCategoryChange('laptop')}
              >
                <span><FaLaptop /> Laptops</span>
                <CategoryCount active={selectedCategory === 'laptop'}>
                  {allProducts.filter(p => p.category === 'laptop').length}
                </CategoryCount>
              </CategoryItem>
              <CategoryItem 
                active={selectedCategory === 'tv'} 
                onClick={() => handleCategoryChange('tv')}
              >
                <span><FaTv /> TVs</span>
                <CategoryCount active={selectedCategory === 'tv'}>
                  {allProducts.filter(p => p.category === 'tv').length}
                </CategoryCount>
              </CategoryItem>
            </CategoryList>
          </FilterSection>
          
          {/* Brand Filters */}
          {availableBrands.length > 0 && (
            <FilterSection>
              <FilterTitle>Brands</FilterTitle>
              <BrandFilterList>
                {availableBrands.map(brand => (
                  <BrandFilterItem key={brand.name}>
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.name)}
                      onChange={(e) => handleBrandChange(brand.name, e.target.checked)}
                    />
                    <span>{brand.name}</span>
                    <BrandCount>{brand.count}</BrandCount>
                  </BrandFilterItem>
                ))}
              </BrandFilterList>
            </FilterSection>
          )}
          
          {/* Price Range */}
          <FilterSection>
            <FilterTitle>Price Range</FilterTitle>
            <PriceRangeContainer>
              <PriceRangeLabel>Set your budget (£)</PriceRangeLabel>
              <PriceInputsRow>
                <PriceInput 
                  type="number" 
                  placeholder="Min" 
                  min="0"
                  step="10"
                  value={priceMin} 
                  onChange={(e) => setPriceMin(e.target.value)} 
                />
                <PriceSeparator>to</PriceSeparator>
                <PriceInput 
                  type="number" 
                  placeholder="Max" 
                  min="0"
                  step="10"
                  value={priceMax} 
                  onChange={(e) => setPriceMax(e.target.value)} 
                />
              </PriceInputsRow>
              <ApplyButton onClick={handlePriceFilter}>Apply Filter</ApplyButton>
            </PriceRangeContainer>
          </FilterSection>
          
          {/* Clear All Filters */}
          {getActiveFilters().length > 0 && (
            <ClearAllFilters onClick={clearAllFilters}>
              <FaTimes size={12} />
              Clear All Filters
            </ClearAllFilters>
          )}
        </Sidebar>
        
        <MainContent>
          <ProductsHeader>
            <HeaderLeft>
              <PageTitle>{getPageTitle()}</PageTitle>
              <ResultsCount>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </ResultsCount>
            </HeaderLeft>
            
            <HeaderRight>
              <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </SortSelect>
              
              <ViewToggle>
                <ViewButton 
                  active={viewMode === 'grid'} 
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </ViewButton>
                <ViewButton 
                  active={viewMode === 'list'} 
                  onClick={() => setViewMode('list')}
                >
                  List
                </ViewButton>
              </ViewToggle>
            </HeaderRight>
          </ProductsHeader>
          
          {/* Active Filters */}
          {getActiveFilters().length > 0 && (
            <ActiveFilters>
              {getActiveFilters().map((filter, index) => (
                <FilterTag key={index}>
                  {filter.label}
                  <FilterTagClose onClick={() => removeFilter(filter.type, filter.value)}>
                    <FaTimes size={10} />
                  </FilterTagClose>
                </FilterTag>
              ))}
            </ActiveFilters>
          )}
          
          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <NoResultsMessage>
              <h2>No products found</h2>
              <p>Try adjusting your search criteria or filters.</p>
              <button onClick={clearAllFilters}>Clear All Filters</button>
            </NoResultsMessage>
          ) : (
            <ProductGrid viewMode={viewMode}>
              {filteredProducts.map(product => {
                const productId = product.id || `${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                
                return (
                  <ProductCard
                    key={productId}
                    ref={el => {
                      if (el) {
                        productRefs.current[productId] = el;
                      }
                    }}
                    product={product}
                    viewMode={viewMode}
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

export default ProductsPage;