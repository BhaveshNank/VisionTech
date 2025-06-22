import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchProducts } from '../utils/api';
import ProductCard from '../components/Products/ProductCard';
import { FaMobileAlt, FaLaptop, FaTv, FaList, FaFilter, FaTimes, FaCheck, FaGamepad, FaHeadphones, FaSearch, FaSort, FaEye } from 'react-icons/fa';

const PageContainer = styled.div`
  background: #f8f9fa;
  min-height: 100vh;
  padding-top: 80px;
`;







const ContentWrapper = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0.5rem 16px 0;
  
  @media (max-width: 768px) {
    padding: 0.5rem 12px 0;
  }
`;

const FilterAndGridContainer = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  align-items: start;
  
  @media (max-width: 1200px) {
    grid-template-columns: 280px 1fr;
    gap: 1.25rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ProductsSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  
  @media (max-width: 768px) {
    border-radius: 6px;
    padding: 1rem;
  }
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ResultsInfo = styled.div`
  .count {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.25rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const SearchBar = styled.div`
  position: relative;
  
  input {
    width: 250px;
    padding: 8px 12px 8px 36px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    background: white;
    transition: border-color 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #000;
    }
    
    @media (max-width: 768px) {
      width: 180px;
    }
  }
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const SortDropdown = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  min-width: 140px;
  
  &:focus {
    outline: none;
    border-color: #000;
  }
`;


// Loading and Empty States
const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.1rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  .icon {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
    font-size: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #333333 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem 0;
  position: relative;
  display: inline-block;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  letter-spacing: -0.025em;
  line-height: 1.1;
  
  /* Add decorative underline */
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #000000 0%, #1a1a1a 50%, #333333 100%);
    border-radius: 2px;
    opacity: 0.8;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    font-size: 2.5rem;
    
    &:after {
      width: 60px;
      height: 3px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    
    &:after {
      width: 50px;
      height: 3px;
    }
  }
`;

const ResultsCount = styled.p`
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
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
  color: #1a1a1a;
  
  &:focus {
    outline: none;
    border-color: #000000;
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
  background: ${props => props.active ? '#000000' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: ${props => props.active ? '#000000' : '#f8f9fa'};
  }
`;

// Clean Sidebar
const Sidebar = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  @media (max-width: 768px) {
    position: static;
    border-radius: 6px;
    padding: 1rem;
    max-height: 70vh;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.active ? '#000' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  margin-bottom: 4px;
  
  &:hover {
    background: ${props => props.active ? '#000' : '#f5f5f5'};
  }
  
  .category-content {
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      font-size: 0.9rem;
    }
    
    span {
      font-weight: ${props => props.active ? '500' : '400'};
      font-size: 0.9rem;
    }
  }
`;

const CategoryCount = styled.span`
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#666'};
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
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.05);
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
      background: #000000;
      border-color: #000000;
      
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
      border-color: #000000;
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
  background: #000;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 400;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
  margin-top: 8px;
  
  &:hover {
    background-color: #333;
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
  border: 1px solid #ccc;
  color: #666;
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: all 0.2s ease;
  gap: 4px;
  
  &:hover {
    background-color: #f5f5f5;
    border-color: #000;
    color: #000;
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
  const [loading, setLoading] = useState(true);
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
        setLoading(true);
        const data = await fetchProducts();
        setAllProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
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
    // Always return "Products" instead of category-specific titles
    return 'Products';
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
      const label = `$${priceMin || '0'} - $${priceMax || '∞'}`;
      filters.push({ type: 'price', label, value: null });
    }
    
    if (searchQuery) {
      filters.push({ type: 'search', label: `"${searchQuery}"`, value: null });
    }
    
    return filters;
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <FilterAndGridContainer>
          <Sidebar>
            {/* Categories */}
            <FilterSection>
              <FilterTitle>Categories</FilterTitle>
              <CategoryList>
                <CategoryItem 
                  active={selectedCategory === 'all'} 
                  onClick={() => handleCategoryChange('all')}
                >
                  <div className="category-content">
                    <FaList />
                    <span>All Products</span>
                  </div>
                  <CategoryCount active={selectedCategory === 'all'}>
                    {allProducts.length}
                  </CategoryCount>
                </CategoryItem>
              <CategoryItem 
                active={selectedCategory === 'phone'} 
                onClick={() => handleCategoryChange('phone')}
              >
                <div className="category-content">
                  <FaMobileAlt />
                  <span>Phones</span>
                </div>
                <CategoryCount active={selectedCategory === 'phone'}>
                  {allProducts.filter(p => p.category === 'phone').length}
                </CategoryCount>
              </CategoryItem>
              <CategoryItem 
                active={selectedCategory === 'laptop'} 
                onClick={() => handleCategoryChange('laptop')}
              >
                <div className="category-content">
                  <FaLaptop />
                  <span>Laptops</span>
                </div>
                <CategoryCount active={selectedCategory === 'laptop'}>
                  {allProducts.filter(p => p.category === 'laptop').length}
                </CategoryCount>
              </CategoryItem>
              <CategoryItem 
                active={selectedCategory === 'tv'} 
                onClick={() => handleCategoryChange('tv')}
              >
                <div className="category-content">
                  <FaTv />
                  <span>TVs & Monitors</span>
                </div>
                <CategoryCount active={selectedCategory === 'tv'}>
                  {allProducts.filter(p => p.category === 'tv').length}
                </CategoryCount>
              </CategoryItem>
              <CategoryItem 
                active={selectedCategory === 'gaming'} 
                onClick={() => handleCategoryChange('gaming')}
              >
                <div className="category-content">
                  <FaGamepad />
                  <span>Gaming</span>
                </div>
                <CategoryCount active={selectedCategory === 'gaming'}>
                  {allProducts.filter(p => p.category === 'gaming').length}
                </CategoryCount>
              </CategoryItem>
              <CategoryItem 
                active={selectedCategory === 'audio'} 
                onClick={() => handleCategoryChange('audio')}
              >
                <div className="category-content">
                  <FaHeadphones />
                  <span>Audio</span>
                </div>
                <CategoryCount active={selectedCategory === 'audio'}>
                  {allProducts.filter(p => p.category === 'audio').length}
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
              <PriceRangeLabel>Set your budget ($)</PriceRangeLabel>
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
        
        <ProductsSection>
          <ProductsHeader>
            <ResultsInfo>
              <div className="count">{filteredProducts.length} Products</div>
              <div className="subtitle">
                {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
              </div>
            </ResultsInfo>
            
            <ControlsRow>
              <SearchBar>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </SearchBar>
              
              <SortDropdown
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </SortDropdown>
            </ControlsRow>
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
          
          {/* Products Grid or Loading/Empty State */}
          {loading ? (
            <LoadingState>Loading amazing products...</LoadingState>
          ) : filteredProducts.length === 0 ? (
            <EmptyState>
              <div className="icon">📱</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </EmptyState>
          ) : (
            <ProductGrid>
              {filteredProducts.map(product => {
                const productId = product.id || `${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                
                return (
                  <ProductCard
                    key={productId}
                    product={product}
                  />
                );
              })}
            </ProductGrid>
          )}
        </ProductsSection>
      </FilterAndGridContainer>
    </ContentWrapper>
  </PageContainer>
  );
};

export default ProductsPage;