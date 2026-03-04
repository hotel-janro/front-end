import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css"; // <-- Notice the /styles/ right here!

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);