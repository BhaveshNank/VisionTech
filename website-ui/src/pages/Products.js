import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/Products/ProductCard';
import { fetchProducts } from '../utils/api';

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
`;

const Sidebar = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`;

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        if (category === 'all') {
          // Fetch all products from all categories
          const [phones, laptops, tvs, gaming, audio] = await Promise.all([
            fetchProducts('phone'),
            fetchProducts('laptop'),
            fetchProducts('tv'),
            fetchProducts('gaming'),
            fetchProducts('audio')
          ]);
          
          setProducts([...phones, ...laptops, ...tvs, ...gaming, ...audio]);
        } else {
          // Fetch products for specific category
          const data = await fetchProducts(category);
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllProducts();
  }, [category]);

  const getCategoryTitle = () => {
    switch(category) {
      case 'phone': return 'Phones';
      case 'laptop': return 'Laptops';
      case 'tv': return 'TVs & Monitors';
      case 'gaming': return 'Gaming';
      case 'audio': return 'Audio';
      default: return 'All Products';
    }
  };

  const handleCategoryChange = (newCategory) => {
    if (newCategory === 'all') {
      navigate('/products');
    } else {
      navigate(`/products?category=${newCategory}`);
    }
  };

  return (
    <PageContainer>
      <PageTitle>{getCategoryTitle()}</PageTitle>
      <PageDescription>
        Browse our wide selection of {category !== 'all' ? category : 'products'}. Use the filters to find exactly what you're looking for.
      </PageDescription>
      
      <ProductsLayout>
        <Sidebar>
          <FilterSection>
            <FilterTitle>Categories</FilterTitle>
            <FilterItem>
              <input 
                type="radio" 
                id="all" 
                name="category"
                checked={category === 'all'} 
                onChange={() => handleCategoryChange('all')} 
              />
              <label htmlFor="all">All Products</label>
            </FilterItem>
            <FilterItem>
              <input 
                type="radio" 
                id="phone" 
                name="category"
                checked={category === 'phone'} 
                onChange={() => handleCategoryChange('phone')} 
              />
              <label htmlFor="phone">Phones</label>
            </FilterItem>
            <FilterItem>
              <input 
                type="radio" 
                id="laptop" 
                name="category"
                checked={category === 'laptop'} 
                onChange={() => handleCategoryChange('laptop')} 
              />
              <label htmlFor="laptop">Laptops</label>
            </FilterItem>
            <FilterItem>
              <input 
                type="radio" 
                id="tv" 
                name="category"
                checked={category === 'tv'} 
                onChange={() => handleCategoryChange('tv')} 
              />
              <label htmlFor="tv">TVs & Monitors</label>
            </FilterItem>
            <FilterItem>
              <input 
                type="radio" 
                id="gaming" 
                name="category"
                checked={category === 'gaming'} 
                onChange={() => handleCategoryChange('gaming')} 
              />
              <label htmlFor="gaming">Gaming</label>
            </FilterItem>
            <FilterItem>
              <input 
                type="radio" 
                id="audio" 
                name="category"
                checked={category === 'audio'} 
                onChange={() => handleCategoryChange('audio')} 
              />
              <label htmlFor="audio">Audio</label>
            </FilterItem>
          </FilterSection>
          
          <FilterSection>
            <FilterTitle>Price Range</FilterTitle>
            {/* Price slider would go here */}
            <div>$0 - $2000</div>
          </FilterSection>
        </Sidebar>
        
        <div>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <ProductsGrid>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductsGrid>
          )}
        </div>
      </ProductsLayout>
    </PageContainer>
  );
};

export default ProductsPage;