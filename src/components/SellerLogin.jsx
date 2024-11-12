// LoginForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../CustomerLogin.css';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

function LoginForm() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/auth/sellerlogin', { phone, password });
            const { status, data } = response;

            if (status === 200 && data?.token && data?.userType) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userType', data.userType);
                navigate('/seller-dashboard');
            }
        } catch (error) {
            const message = error.response?.status === 401 ? "Hatalı şifre!" :
                          error.response?.status === 404 ? "Kullanıcı bulunamadı!" :
                          "Bir hata oluştu!";
            alert(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dark-login-container">
            <div className="dark-login-box">
                <div className="login-header">
                    <div className="rocket-container">
                        <div className="rocket">🚀</div>
                    </div>
                    <h1>Hoş Geldiniz</h1>
                    <p>Hesabınıza giriş yapın veya yeni hesap oluşturun</p>
                </div>

                <form className="dark-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <div className="input-icon">
                            <FiMail />
                        </div>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Telefon Numaranız"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <div className="input-icon">
                            <FiLock />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Şifreniz"
                            required
                        />
                    </div>

                    <div className="forgot-password">
                        <a href="/forgot-password">Şifremi Unuttum</a>
                    </div>

                    <button 
                        type="submit" 
                        className={`dark-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loader"></div>
                        ) : (
                            <>
                                Giriş Yap
                                <FiArrowRight className="button-icon" />
                            </>
                        )}
                    </button>
                </form>

                <div className="register-link">
                    Hesabınız yok mu? <a href="/register">Kayıt Olun</a>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;