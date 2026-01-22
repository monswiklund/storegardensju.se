import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ThemeProvider from "./providers/ThemeProvider.jsx";
import ScrollProvider from "./providers/ScrollProvider.jsx";
import { CartProvider } from "../components/layout/CartContext/CartContext.jsx";
import { ProductProvider } from "../components/layout/ProductContext/ProductContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <ScrollProvider>
        <ProductProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ProductProvider>
      </ScrollProvider>
    </ThemeProvider>
  </StrictMode>
);