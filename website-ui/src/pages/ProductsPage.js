import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/Products/ProductCard';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const PageDescription = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
`;

const ProductsLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 3fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-self: start;
  position: sticky;
  top: 20px;
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
`;

const FilterTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.5rem;
`;

const FilterItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  label {
    margin-left: 8px;
    cursor: pointer;
  }
  
  input {
    cursor: pointer;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`;

const ErrorMessage = styled.div`
  background-color: #fff3f3;
  border-left: 4px solid #ff6b6b;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
`;

const NoProductsMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  grid-column: 1 / -1;
  
  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
  }
  
  p {
    color: #7f8c8d;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #1a73e8;
  animation: spin 1s ease-in-out infinite;
  margin: 3rem auto;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  grid-column: 1 / -1;
`;

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    brand: searchParams.get('brand') || '',
  });

  // Effect to fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.category !== 'all') {
          queryParams.set('category', filters.category);
        }
        if (filters.brand) {
          queryParams.set('brand', filters.brand);
        }
        
        // Add search parameter if it exists in URL
        const searchQuery = searchParams.get('search');
        if (searchQuery) {
          queryParams.set('search', searchQuery);
        }
        
        // Fetch products with all parameters
        const response = await fetch(`http://localhost:5001/api/products?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, [filters, searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category !== 'all') {
      params.set('category', filters.category);
    }
    if (filters.brand) {
      params.set('brand', filters.brand);
    }
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Get appropriate title based on category
  const getCategoryTitle = () => {
    switch(filters.category) {
      case 'phone': return 'Phones';
      case 'laptop': return 'Laptops';
      case 'tv': return 'TVs';
      default: return 'All Products';
    }
  };

  return (
    <PageContainer>
      <PageTitle>{getCategoryTitle()}</PageTitle>
      <PageDescription>
        Browse our wide selection of {filters.category !== 'all' ? filters.category + 's' : 'products'}. 
        Use the filters to find exactly what you're looking for.
      </PageDescription>
      
      {error && (
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      )}
      
      <ProductsLayout>
        <Sidebar>
          <FilterSection>
            <FilterTitle>Category</FilterTitle>
            <FilterItem>
              <input 
                type="radio" 
                id="all" 
                name="category"
                checked={filters.category === 'all'} 
                onChange={() => handleFilterChange('category', 'all')} 
              />
              <label htmlFor="all">All Products</label>
            </FilterItem>
            <FilterItem>
              <input 
                type="radio" 
                id="phone" 
                name="category"
                checked={filters.category === 'phone'} 
                onChange={() => handleFilterChange('category', 'phone')} 
              />
              <label htmlFor="phone">Phones</label>
            </FilterItem>
            <FilterItem>
              <input 
                type="radio" 
                id="laptop" 
                name="category"
                checked={filters.category === 'laptop'} 
                onChange={() => handleFilterChange('category', 'laptop')} 
              />
              <label htmlFor="laptop">Laptops</label>
            </FilterItem>
            <FilterItem>
              <input 
                type="radio" 
                id="tv" 
                name="category"
                checked={filters.category === 'tv'} 
                onChange={() => handleFilterChange('category', 'tv')} 
              />
              <label htmlFor="tv">TVs</label>
            </FilterItem>
          </FilterSection>
          
          <FilterSection>
            <FilterTitle>Brand</FilterTitle>
            <FilterItem>
              <input 
                type="radio" 
                id="all-brands" 
                name="brand"
                checked={filters.brand === ''} 
                onChange={() => handleFilterChange('brand', '')} 
              />
              <label htmlFor="all-brands">All Brands</label>
            </FilterItem>
            {['Apple', 'Samsung', 'Dell', 'Sony', 'LG', 'Microsoft'].map(brand => (
              <FilterItem key={brand}>
                <input 
                  type="radio" 
                  id={brand.toLowerCase()} 
                  name="brand"
                  checked={filters.brand === brand.toLowerCase()} 
                  onChange={() => handleFilterChange('brand', brand.toLowerCase())} 
                />
                <label htmlFor={brand.toLowerCase()}>{brand}</label>
              </FilterItem>
            ))}
          </FilterSection>
        </Sidebar>
        
        <div>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <p>Loading products...</p>
            </LoadingContainer>
          ) : products.length > 0 ? (
            <ProductsGrid>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductsGrid>
          ) : (
            <NoProductsMessage>
              <h3>No products found</h3>
              <p>Try adjusting your filters or check back later for new products.</p>
            </NoProductsMessage>
          )}
        </div>
      </ProductsLayout>
    </PageContainer>
  );
};

export default ProductsPage;