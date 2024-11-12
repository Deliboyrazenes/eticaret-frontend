import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../SellerLogin.css';

const SellerLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Giriş doğrulaması yapılacak
    navigate('/seller-dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Satıcı Girişi</h2>
        <input
          type="text"
          placeholder="Telefon Numarası"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Giriş Yap</button>
      </div>
    </div>
  );
};

export default SellerLogin;
