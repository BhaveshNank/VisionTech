import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const ProductDetailPage = () => {
  const { id } = useParams(); // ✅ Get product ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const dummyProducts = {
      "1": { 
        id: 1, 
        name: 'iPhone 16 Pro', 
        price: 999, 
        image: 'https://via.placeholder.com/400x400?text=iPhone', 
        category: 'phones',
        description: 'The latest iPhone with an improved camera system, faster chip, and longer battery life.',
        specs: {
          'Display': '6.1-inch Super Retina XDR',
          'Processor': 'A17 Pro chip',
          'Camera': '48MP main camera',
          'Battery': 'Up to 23 hours video playback',
          'Storage': '128GB, 256GB, 512GB, 1TB'
        }
      },
      "2": { 
        id: 2, 
        name: 'Samsung Galaxy S24', 
        price: 899, 
        image: 'https://via.placeholder.com/400x400?text=Samsung', 
        category: 'phones',
        description: 'Experience the next generation of Galaxy with advanced AI features.',
        specs: {
          'Display': '6.2-inch Dynamic AMOLED 2X',
          'Processor': 'Snapdragon 8 Gen 3',
          'Camera': '50MP main camera',
          'Battery': '4,000mAh',
          'Storage': '128GB, 256GB'
        }
      }
    };

    setTimeout(() => {
      setProduct(dummyProducts[id] || null);
      setLoading(false);
    }, 500);
  }, [id]); // ✅ Fix: useEffect is inside component and depends on `id`

  if (loading) {
    return <PageContainer>Loading product details...</PageContainer>;
  }

  if (!product) {
    return <PageContainer>Product not found</PageContainer>;
  }

  return (
    <PageContainer>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <h2>Price: ${product.price}</h2>
    </PageContainer>
  );
};

export default ProductDetailPage;
