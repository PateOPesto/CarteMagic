import React, { useState } from "react";
import CardList from "./components/CardList";
import Header from "./components/Header"; //

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`App ${darkMode ? "dark" : ""}`}>
      <Header darkMode={darkMode} toggleTheme={() => setDarkMode(prev => !prev)} />
      <CardList darkMode={darkMode} />
    </div>
  );
}

export default App;