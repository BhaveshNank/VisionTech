import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext"; // ✅ Import it correctly

ReactDOM.render(
  <React.StrictMode>
    <CartProvider> {/* ✅ Wrap the App inside CartProvider */}
      <App />
    </CartProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
