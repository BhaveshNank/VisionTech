import React from 'react';
import './ProductCard.css'; // Assuming you have a CSS file for styling

const ProductCard = ({ product }) => {
    return (
        <div className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">${product.price}</p>
            <p className="product-description">{product.description}</p>
            <button className="add-to-cart">Add to Cart</button>
        </div>
    );
};

export default ProductCard;