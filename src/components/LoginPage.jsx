import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(null);

  return (
    <div className="login-container">
      <div className="animated-background">
        <div className="light-beam"></div>
        <div className="particles">
          {[...Array(20)].map((_, index) => (
            <div key={index} className="particle"></div>
          ))}
        </div>
      </div>
      
      
      
      <div className="login-card">
        <div className="logo-container">
          <div className="logo">🚀</div>
        </div>
        
        <h1>Hoş Geldiniz</h1>
        <p className="subtitle">Hesabınıza giriş yapın veya yeni hesap oluşturun</p>
        
        <div className="buttons-container">
          <button
            className="login-button customer"
            onClick={() => navigate('/customer-login')}
            onMouseEnter={() => setIsHovering('customer')}
            onMouseLeave={() => setIsHovering(null)}
          >
            <span className="button-icon">👤</span>
            <span className="button-text">
              <span className="primary-text">Müşteri Girişi</span>
              <span className="secondary-text">Alışverişe başla</span>
            </span>
          </button>

          <button
            className="login-button seller"
            onClick={() => navigate('/seller-login')}
            onMouseEnter={() => setIsHovering('seller')}
            onMouseLeave={() => setIsHovering(null)}
          >
            <span className="button-icon">🏪</span>
            <span className="button-text">
              <span className="primary-text">Satıcı Girişi</span>
              <span className="secondary-text">Mağazanı yönet</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;