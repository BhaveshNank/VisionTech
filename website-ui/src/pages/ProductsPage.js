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
  display: flex;
  gap: 2rem;
`;

const Sidebar = styled.div`
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProductsGrid = styled.div`
  flex: 3;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
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

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    brand: '',
    priceRange: '',
    features: [],
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?category=${filters.category}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <PageContainer>
      <PageTitle>Products</PageTitle>
      <PageDescription>Find the best products tailored to your needs.</PageDescription>

      <ProductsLayout>
        <Sidebar>
          <FilterSection>
            <FilterTitle>Category</FilterTitle>
            {['phones', 'laptops', 'tvs'].map((cat) => (
              <FilterItem key={cat}>
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat}
                  onChange={() => handleFilterChange('category', cat)}
                />
                <label>{cat.charAt(0).toUpperCase() + cat.slice(1)}</label>
              </FilterItem>
            ))}
          </FilterSection>

          <FilterSection>
            <FilterTitle>Brand</FilterTitle>
            {['Samsung', 'Apple', 'Dell', 'Sony'].map((brand) => (
              <FilterItem key={brand}>
                <input
                  type="radio"
                  name="brand"
                  checked={filters.brand === brand}
                  onChange={() => handleFilterChange('brand', brand)}
                />
                <label>{brand}</label>
              </FilterItem>
            ))}
          </FilterSection>
        </Sidebar>

        <ProductsGrid>
          {loading ? <p>Loading products...</p> : products.map((product) => <ProductCard key={product.id} product={product} />)}
        </ProductsGrid>
      </ProductsLayout>
    </PageContainer>
  );
};

export default ProductsPage;
