import React from "react";
import { GiSellCard } from "react-icons/gi";

function Header() {
  return (
    <header className={`site-header`}>
      <div className="header-content">
        <h1><GiSellCard style={{ marginRight: 8 }} /> Collection Magic : Final Fantasy</h1>
      </div>
    </header>
  );
}

export default Header;
