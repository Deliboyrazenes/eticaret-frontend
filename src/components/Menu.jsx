// Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiShoppingBag, FiUser, FiSearch } from "react-icons/fi";
import "../Menu.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="logo-link">
        <h1>ATLAS</h1>
      </Link>
      
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input type="text" placeholder="Ürün ara..." />
      </div>
      
      <div className="nav-links">
        <Link to="/products" className="nav-link">
          <FiShoppingBag className="nav-icon" />
          <span>Ürünler</span>
        </Link>
        <Link to="/login" className="nav-link">
          <FiUser className="nav-icon" />
          <span>Giriş Yap</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;