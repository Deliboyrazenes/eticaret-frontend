import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../CustomerLogin.css';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/auth/login', { email, password });
            const { status, data } = response;

            console.log('Login response:', data); 

            if (status === 200 && data?.token) {
                // Token ve userType'ı kaydet
                localStorage.setItem('token', data.token);
                localStorage.setItem('userType', data.userType);

                // Kullanıcı bilgilerini backend'den gelen şekliyle kaydet
                const userInfo = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email
                };

                console.log('Saving user info:', userInfo); 
                localStorage.setItem('user', JSON.stringify(userInfo));
                toast.success('Başarıyla giriş yapıldı!', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });

               
                setTimeout(() => {
                    navigate('/products');
                }, 2000);
            }
        } catch (error) {
            console.error('Login error:', error); 
            const message = error.response?.status === 401 ? "Hatalı şifre!" :
                error.response?.status === 404 ? "Kullanıcı bulunamadı!" :
                    "Bir hata oluştu!";

            toast.error(message, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dark-login-container">
            <ToastContainer 
              theme="dark"
              style={{ fontSize: '14px' }}
          />
            <div className="dark-login-box">
                <div className="login-header">
                    <div className="rocket-container">
                        <div className="rocket">🚀</div>
                    </div>
                    <h1>Hoş Geldiniz</h1>
                    <p>Hesabınıza giriş yapın veya yeni hesap oluşturun</p>
                </div>

                <form className="dark-form" onSubmit={handleSubmit} autoComplete="on">
                    <div className="input-group">
                        <div className="input-icon">
                            <FiMail />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-posta adresiniz"
                            autoComplete="username"
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