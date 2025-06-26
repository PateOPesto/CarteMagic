import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";  // ou "./CardList" si c’est ton composant principal

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("L'élément #root est introuvable dans le HTML");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
