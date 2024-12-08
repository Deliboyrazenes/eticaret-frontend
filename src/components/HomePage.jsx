// HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "./Footer";
import Menu from "./Menu";
import "../HomePage.css";

const HomePage = () => {
  return (
    <div className="homepage">
      <div className="gradient-bg">
        <div className="gradient-circle-1"></div>
        <div className="gradient-circle-2"></div>
      </div>

      <Menu />

      <section className="hero">
        <motion.div 
          className="hero-content"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="hero-badge">YENİ SEZON</span>
          <h2>Yeni Nesil Alışveriş Deneyimi</h2>
          <p>Özel koleksiyonlar ve benzersiz ürünlerle tarzınızı yansıtın</p>
          <div className="hero-buttons">
            <Link to="/products" className="primary-button">
              Ürünleri Keşfet
              <span className="button-icon">→</span>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="categories"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.div 
            className="category-card"
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="card-content">
              <div className="card-icon">🎮</div>
              <h3>Elektronik</h3>
              <p>En son teknoloji ürünleri keşfedin</p>
            </div>
          </motion.div>

          <motion.div 
            className="category-card"
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="card-content">
              <div className="card-icon">👕</div>
              <h3>Moda</h3>
              <p>Trend koleksiyonlar ve özel tasarımlar</p>
            </div>
          </motion.div>

          <motion.div 
            className="category-card"
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="card-content">
              <div className="card-icon">🏠</div>
              <h3>Ev & Yaşam</h3>
              <p>Eviniz için modern çözümler</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;