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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/products?category=${category}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // For now, use dummy data
    const dummyProducts = [
      { id: 1, name: 'iPhone 16 Pro', price: 999, image: '/images/iphone_16_pro.jpg', category: 'phones' },
      { id: 2, name: 'Samsung Galaxy S24', price: 899, image: '/images/samsung_s24.jpg', category: 'phones' },
      { id: 3, name: 'MacBook Pro', price: 1499, image: '/images/macbook_pro.jpg', category: 'laptops' },
      { id: 4, name: 'Dell XPS 15', price: 1299, image: '/images/dell_xps.jpg', category: 'laptops' },
      { id: 5, name: 'Sony 65" 4K TV', price: 1199, image: '/images/sony_tv.jpg', category: 'tvs' },
      { id: 6, name: 'LG OLED 55"', price: 999, image: '/images/lg_oled.jpg', category: 'tvs' }
    ];
    
    setTimeout(() => {
      if (category === 'all') {
        setProducts(dummyProducts);
      } else {
        setProducts(dummyProducts.filter(p => p.category === category));
      }
      setLoading(false);
    }, 500);
  }, [category]);

  const getCategoryTitle = () => {
    switch(category) {
      case 'phones': return 'Phones';
      case 'laptops': return 'Laptops';
      case 'tvs': return 'TVs';
      default: return 'All Products';
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
                type="checkbox" 
                id="phones" 
                checked={category === 'phones'} 
                onChange={() => {}} 
              />
              <label htmlFor="phones">Phones</label>
            </FilterItem>
            <FilterItem>
              <input 
                type="checkbox" 
                id="laptops" 
                checked={category === 'laptops'} 
                onChange={() => {}} 
              />
              <label htmlFor="laptops">Laptops</label>
            </FilterItem>
            <FilterItem>
              <input 
                type="checkbox" 
                id="tvs" 
                checked={category === 'tvs'} 
                onChange={() => {}} 
              />
              <label htmlFor="tvs">TVs</label>
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