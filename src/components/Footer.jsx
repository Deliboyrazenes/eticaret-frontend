// Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import '../Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Upper Footer */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <h2 className="brand-title">ATLAS</h2>
            <p className="brand-description">
              Yeni nesil alışveriş deneyimi ile tarzınızı keşfedin.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h3 className="footer-title">Hızlı Linkler</h3>
            <ul className="links-list">
              {['Ürünler', 'Hakkımızda', 'İletişim', 'Blog'].map((item) => (
                <li key={item}>
                  <Link to="#" className="footer-link">
                    <span className="link-hover-line"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="footer-social">
            <h3 className="footer-title">Sosyal Medya</h3>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="footer-bottom">
          <p className="copyright">
            © 2024 ATLAS. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;