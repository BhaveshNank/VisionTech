import React, { createContext, useContext, useReducer, useEffect } from "react";

// Create Context
const CartContext = createContext();

// Initial State - add support for loading from localStorage
const initialState = {
  cartItems: localStorage.getItem('cartItems') 
    ? JSON.parse(localStorage.getItem('cartItems')) 
    : [],
};

// Reducer function with added actions
const cartReducer = (state, action) => {
  let updatedItems;
  
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.cartItems.find(item => item.id === action.payload.id);
      if (existingItem) {
        updatedItems = state.cartItems.map(item => 
          item.id === action.payload.id 
            ? {...item, quantity: item.quantity + 1} 
            : item
        );
      } else {
        updatedItems = [...state.cartItems, action.payload];
      }
      break;
    
    case "REMOVE_FROM_CART":
      updatedItems = state.cartItems.filter(item => item.id !== action.payload);
      break;
      
    case "INCREASE_QUANTITY":
      updatedItems = state.cartItems.map(item => 
        item.id === action.payload 
          ? {...item, quantity: item.quantity + 1} 
          : item
      );
      break;
      
    case "DECREASE_QUANTITY":
      updatedItems = state.cartItems.map(item => 
        item.id === action.payload && item.quantity > 1
          ? {...item, quantity: item.quantity - 1} 
          : item
      );
      break;
    
    case "CLEAR_CART":
      updatedItems = [];
      break;
      
    default:
      return state;
  }
  
  // Save to localStorage whenever cart changes
  localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  return { ...state, cartItems: updatedItems };
};

// Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Calculate cart totals
  const itemCount = state.cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = state.cartItems.reduce((total, item) => {
    // Ensure price is a number and quantity is valid
    const price = typeof item.price === 'string' ? 
      parseFloat(item.price.replace(/[^0-9.-]+/g, '')) : 
      parseFloat(item.price) || 0;
    const quantity = item.quantity || 1;
    
    return total + (price * quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems: state.cartItems, 
      dispatch,
      itemCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Export a custom hook for using the cart
export const useCart = () => {
  return useContext(CartContext);
};

export default CartContext;