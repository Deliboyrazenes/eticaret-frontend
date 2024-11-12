import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "./Footer";
import Menu from "./Menu";
import "../HomePage.css";

const HomePage = () => {
  return (
    <div className="homepage">

       {/* Menu Component */}
       <Menu />

      {/* Hero Section */}
      <section className="hero">
        <motion.div 
          className="hero-content"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2>Yeni Nesil Alışveriş Deneyimi</h2>
          <p>Özel koleksiyonlar ve benzersiz ürünlerle tarzınızı yansıtın</p>
          <div className="hero-buttons">
            <Link to="/products" className="primary-button">
              Ürünleri Keşfet
            </Link>
          </div>
        </motion.div>
        
        {/* Trending Categories */}
        <div className="categories">
          <motion.div 
            className="category-card glass"
            whileHover={{ scale: 1.05 }}
          >
            <img src="/electronics.jpg" alt="Elektronik" />
            <h3>Elektronik</h3>
          </motion.div>
          <motion.div 
            className="category-card glass"
            whileHover={{ scale: 1.05 }}
          >
            <img src="/fashion.jpg" alt="Moda" />
            <h3>Moda</h3>
          </motion.div>
          <motion.div 
            className="category-card glass"
            whileHover={{ scale: 1.05 }}
          >
            <img src="/home.jpg" alt="Ev & Yaşam" />
            <h3>Ev & Yaşam</h3>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;