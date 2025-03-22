import React, { createContext, useContext, useReducer } from "react";

// ✅ Create Context
const CartContext = createContext();

// ✅ Initial State
const initialState = {
  cartItems: [],
};

// ✅ Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.cartItems.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item => 
            item.id === action.payload.id 
              ? {...item, quantity: item.quantity + 1} 
              : item
          )
        };
      }
      return { ...state, cartItems: [...state.cartItems, action.payload] };
    
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.id !== action.payload),
      };
    default:
      return state;
  }
};

// ✅ Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ cartItems: state.cartItems, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

// ✅ Export a custom hook for using the cart
export const useCart = () => {
  return useContext(CartContext);
};

export default CartContext;
