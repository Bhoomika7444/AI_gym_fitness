import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#181c24",
            color: "#e8ecf0",
            border: "1px solid #1e2330",
            fontFamily: "'DM Sans', sans-serif",
          },
          success: { iconTheme: { primary: "#00e5a0", secondary: "#000" } },
          error:   { iconTheme: { primary: "#ff4757", secondary: "#fff" } },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);
