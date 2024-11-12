import React, { useState } from 'react';
import '../RegisterForm.css';

function RegisterForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        phone: '',
        dateOfBirth: '',
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // FormData'yı kopyalayıp gender'ı büyük harfe çeviriyoruz
            const submissionData = {
                ...formData,
                gender: formData.gender.toUpperCase()
            };

            const response = await fetch('http://localhost:8080/auth/register/customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });

            if (response.ok) {
                setSuccess(true);
                setError('');
                setFormData({
                    firstName: '',
                    lastName: '',
                    gender: '',
                    phone: '',
                    dateOfBirth: '',
                    email: '',
                    password: ''
                });
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Kayıt işlemi başarısız oldu.');
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleSubmit}>
                <h2 className="register-title">Müşteri Kayıt Formu</h2>

                {success && (
                    <div className="success-message">
                        <i className="fas fa-check-circle"></i>
                        Kayıt başarıyla tamamlandı!
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Ad</label>
                    <div className="input-container">
                        <i className="fas fa-user"></i>
                        <input
                            type="text"
                            name="firstName"
                            className="form-input"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            placeholder="Adınızı giriniz"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Soyad</label>
                    <div className="input-container">
                        <i className="fas fa-user"></i>
                        <input
                            type="text"
                            name="lastName"
                            className="form-input"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            placeholder="Soyadınızı giriniz"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Cinsiyet</label>
                    <div className="input-container">
                        <i className="fas fa-venus-mars"></i>
                        <select
                            name="gender"
                            className="form-input"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seçiniz</option>
                            <option value="male">Erkek</option>
                            <option value="female">Kadın</option>
                            <option value="other">Diğer</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Telefon</label>
                    <div className="input-container">
                        <i className="fas fa-phone"></i>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="Telefon numaranızı giriniz"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Doğum Tarihi</label>
                    <div className="input-container">
                        <i className="fas fa-calendar"></i>
                        <input
                            type="date"
                            name="dateOfBirth"
                            className="form-input"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">E-posta</label>
                    <div className="input-container">
                        <i className="fas fa-envelope"></i>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="E-posta adresinizi giriniz"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Şifre</label>
                    <div className="input-container">
                        <i className="fas fa-lock"></i>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Şifrenizi giriniz"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className={`register-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading-spinner"></span>
                            Kaydediliyor...
                        </>
                    ) : (
                        'Kayıt Ol'
                    )}
                </button>

                <div className="form-footer">
                    Zaten hesabınız var mı? <a href="/login">Giriş Yap</a>
                </div>
            </form>
        </div>
    );
}

export default RegisterForm;