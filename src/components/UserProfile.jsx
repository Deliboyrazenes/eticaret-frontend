import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit, FiCalendar, FiPlus, FiTrash2, FiSave, FiLock } from 'react-icons/fi'; import axios from 'axios';
import '../UserProfile.css';
import { Link } from 'react-router-dom';

function UserProfile() {
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: '',
        dateOfBirth: '',
        addresses: []
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({});
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('profile');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressFormData, setAddressFormData] = useState({
        city: '',
        state: '',
        description: '',
        postalCode: ''
    });

    const [editingAddressId, setEditingAddressId] = useState(null);

    // Adres formu değişiklik işleyicisi  
    const handleAddressFormChange = (e) => {
        const { name, value } = e.target;
        setAddressFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Adres düzenleme işleyicisini güncelle  
    const handleEditAddress = (address) => {
        console.log("Düzenlenecek adres:", address); // Debug için  
        setEditingAddressId(address.id);
        setAddressFormData({
            city: address.city || '',
            state: address.state || '',
            description: address.description || '',
            postalCode: address.postalCode || ''
        });
        setShowAddressForm(true);
    };
    // Adres gönderme işleyicisi  
    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const addressData = {
                city: addressFormData.city,
                state: addressFormData.state,
                description: addressFormData.description,
                postalCode: addressFormData.postalCode
            };

            console.log("Gönderilecek adres verisi:", addressData); // Debug için  

            let response;
            if (editingAddressId) {
                console.log("Güncelleme yapılıyor, ID:", editingAddressId); // Debug için  
                response = await axios.put(
                    `http://localhost:8080/address/${editingAddressId}`,
                    addressData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                response = await axios.post(
                    'http://localhost:8080/address',
                    addressData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            if (response.data) {
                console.log("Sunucu yanıtı:", response.data); // Debug için  
                await fetchUserData();
                setShowAddressForm(false);
                setAddressFormData({
                    city: '',
                    state: '',
                    description: '',
                    postalCode: ''
                });
                setEditingAddressId(null);
                alert(editingAddressId ? 'Adres başarıyla güncellendi' : 'Adres başarıyla eklendi');
            }
        } catch (error) {
            console.error('Adres işlemi sırasında hata:', error);
            console.error('Hata detayı:', error.response?.data); // Debug için  
            alert('İşlem sırasında bir hata oluştu');
        }
    };

    // Adres silme işleyicisi  
    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(
                    `http://localhost:8080/address/${addressId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                alert('Adres başarıyla silindi');
                fetchUserData();
            } catch (error) {
                console.error('Adres silinirken hata:', error);
                alert('Adres silinirken bir hata oluştu');
            }
        }
    };

    useEffect(() => {
        console.log('Component mounted');
        fetchUserData();
    }, []);

    useEffect(() => {
        console.log('User data updated:', user);
    }, [user]);
    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching with token:', token);

            // Kullanıcı bilgilerini al  
            const userResponse = await axios.get('http://localhost:8080/customer/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('User Response:', userResponse.data);

            // Adresleri al  
            const addressResponse = await axios.get('http://localhost:8080/address', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Address Response:', addressResponse.data);

            if (userResponse.data) {
                const userData = {
                    ...userResponse.data,
                    dateOfBirth: userResponse.data.dateOfBirth
                        ? new Date(userResponse.data.dateOfBirth).toISOString().split('T')[0]
                        : '',
                    addresses: addressResponse.data || []
                };
                console.log('Setting user data:', userData);
                setUser(userData);
                setEditedUser(userData);
            }
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
            if (error.response) {
                console.log('Error response:', error.response);
            }
            setErrors({ api: 'Bilgiler yüklenemedi' });
        }
    };

    const handlePasswordUpdate = async () => {
        // Şifre alanlarının kontrolü
        if (!editedUser.currentPassword || !editedUser.newPassword || !editedUser.confirmPassword) {
            setErrors({ password: 'Tüm şifre alanları doldurulmalıdır' });
            return;
        }

        if (editedUser.newPassword !== editedUser.confirmPassword) {
            setErrors({ confirmPassword: 'Yeni şifreler eşleşmiyor' });
            return;
        }

        if (editedUser.newPassword.length < 6) {
            setErrors({ newPassword: 'Şifre en az 6 karakter olmalıdır' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                'http://localhost:8080/customer/profile/password',
                {
                    currentPassword: editedUser.currentPassword,
                    newPassword: editedUser.newPassword
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Şifre alanlarını temizle
            setEditedUser(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            alert('Şifre başarıyla güncellendi');
        } catch (error) {
            console.error('Şifre güncellenirken hata:', error);
            if (error.response?.status === 400) {
                setErrors({ currentPassword: 'Mevcut şifre yanlış' });
            } else {
                setErrors({ password: 'Şifre güncellenirken bir hata oluştu' });
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!editedUser.firstName || editedUser.firstName.length < 2 || editedUser.firstName.length > 50) {
            newErrors.firstName = 'İsim 2-50 karakter arasında olmalıdır';
        }

        if (!editedUser.lastName || editedUser.lastName.length < 2 || editedUser.lastName.length > 50) {
            newErrors.lastName = 'Soyisim 2-50 karakter arasında olmalıdır';
        }

        if (!editedUser.email) {
            newErrors.email = 'E-posta adresi gereklidir';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editedUser.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }

        if (editedUser.phone && !/^[0-9]*$/.test(editedUser.phone)) {
            newErrors.phone = 'Telefon numarası sadece rakam içermelidir';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedUser({
            ...user,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const dataToSend = {
                firstName: editedUser.firstName,
                lastName: editedUser.lastName,
                phone: editedUser.phone,
                gender: editedUser.gender,
                dateOfBirth: editedUser.dateOfBirth
            };

            const response = await axios.put(
                'http://localhost:8080/customer/profile',
                dataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                const updatedUser = {
                    ...response.data,
                    dateOfBirth: response.data.dateOfBirth
                        ? new Date(response.data.dateOfBirth).toISOString().split('T')[0]
                        : ''
                };
                setUser(updatedUser);
                setIsEditing(false);
                setErrors({});
                alert('Profil bilgileri başarıyla güncellendi');
            }
        } catch (error) {
            console.error('Profil güncellenirken hata:', error);
            setErrors({
                api: 'Profil güncellenirken bir hata oluştu'
            });
        }
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Belirtilmemiş';
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    return (
        <div className='user-profile'>
            <div className='user-profile-body'>
                <div className="modern-profile-container">
                    <div className="profile-header">
                        <div className="profile-cover">
                            <div className="cover-overlay"></div>
                            <div className="atlas-brand">
                                <div className="atlas-logo-container">
                                    <Link to="/" className="atlas-text" style={{ textDecoration: 'none' }}>
                                        <h1>ATLAS</h1>
                                    </Link>
                                    <div className="atlas-accent"></div>
                                    <span className="atlas-tagline">Yeni Nesil Alışveriş</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-header-content">
                            <div className="profile-header-info">
                                <h1>{user.firstName} {user.lastName}</h1>
                                {!isEditing && (
                                    <button className="edit-profile-btn" onClick={handleEdit}>
                                        <FiEdit /> Profili Düzenle
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="profile-body">
                        <div className="profile-navigation">
                            <button
                                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <FiUser /> Kişisel Bilgiler
                            </button>
                            <button
                                className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                                onClick={() => setActiveTab('addresses')}
                            >
                                <FiMapPin /> Adreslerim
                            </button>
                        </div>

                        <div className="profile-content">
                            {errors.api && (
                                <div className="api-error">
                                    <p>{errors.api}</p>
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="info-grid">
                                    <div className="info-card">
                                        <div className="info-card-header">
                                            <FiUser className="info-icon" />
                                            <h3>Kişisel Bilgiler</h3>
                                        </div>
                                        <div className="info-card-content">
                                            {isEditing ? (
                                                <>
                                                    <div className="edit-form-row">
                                                        <label>Ad</label>
                                                        <input
                                                            type="text"
                                                            name="firstName"
                                                            value={editedUser.firstName}
                                                            onChange={handleInputChange}
                                                            className={errors.firstName ? 'error' : ''}
                                                        />
                                                        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                                                    </div>
                                                    <div className="edit-form-row">
                                                        <label>Soyad</label>
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            value={editedUser.lastName}
                                                            onChange={handleInputChange}
                                                            className={errors.lastName ? 'error' : ''}
                                                        />
                                                        {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                                                    </div>
                                                    <div className="edit-form-row">
                                                        <label>E-posta</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={editedUser.email}
                                                            onChange={handleInputChange}
                                                            className={errors.email ? 'error' : ''}
                                                            disabled
                                                        />
                                                        {errors.email && <span className="error-message">{errors.email}</span>}
                                                    </div>
                                                    <div className="edit-form-row">
                                                        <label>Telefon</label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={editedUser.phone}
                                                            onChange={handleInputChange}
                                                            className={errors.phone ? 'error' : ''}
                                                        />
                                                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="info-row">
                                                        <span className="info-label">Ad Soyad</span>
                                                        <span className="info-value">{user.firstName} {user.lastName}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="info-label">E-posta</span>
                                                        <span className="info-value">{user.email}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="info-label">Telefon</span>
                                                        <span className="info-value">{user.phone || 'Belirtilmemiş'}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="info-card">
                                            <div className="info-card-header">
                                                <FiLock className="info-icon" />
                                                <h3>Şifre Güncelleme</h3>
                                            </div>
                                            <div className="info-card-content">
                                                <div className="edit-form-row">
                                                    <label>Mevcut Şifre</label>
                                                    <input
                                                        type="password"
                                                        name="currentPassword"
                                                        value={editedUser.currentPassword || ''}
                                                        onChange={handleInputChange}
                                                        className={errors.currentPassword ? 'error' : ''}
                                                        placeholder="Mevcut şifrenizi girin"
                                                    />
                                                    {errors.currentPassword && (
                                                        <span className="error-message">{errors.currentPassword}</span>
                                                    )}
                                                </div>
                                                <div className="edit-form-row">
                                                    <label>Yeni Şifre</label>
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={editedUser.newPassword || ''}
                                                        onChange={handleInputChange}
                                                        className={errors.newPassword ? 'error' : ''}
                                                        placeholder="Yeni şifrenizi girin"
                                                    />
                                                    {errors.newPassword && (
                                                        <span className="error-message">{errors.newPassword}</span>
                                                    )}
                                                </div>
                                                <div className="edit-form-row">
                                                    <label>Yeni Şifre (Tekrar)</label>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={editedUser.confirmPassword || ''}
                                                        onChange={handleInputChange}
                                                        className={errors.confirmPassword ? 'error' : ''}
                                                        placeholder="Yeni şifrenizi tekrar girin"
                                                    />
                                                    {errors.confirmPassword && (
                                                        <span className="error-message">{errors.confirmPassword}</span>
                                                    )}
                                                </div>
                                                <div className="edit-actions">
                                                    <button
                                                        className="modern-update-btn"
                                                        onClick={handlePasswordUpdate}
                                                    >
                                                        <FiSave className="btn-icon" />
                                                        <span>Şifreyi Güncelle</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="info-card">
                                        <div className="info-card-header">
                                            <FiCalendar className="info-icon" />
                                            <h3>Diğer Bilgiler</h3>
                                        </div>
                                        <div className="info-card-content">
                                            {isEditing ? (
                                                <>
                                                    <div className="edit-form-row">
                                                        <label>Doğum Tarihi</label>
                                                        <input
                                                            type="date"
                                                            name="dateOfBirth"
                                                            value={editedUser.dateOfBirth || ''}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div className="edit-form-row">
                                                        <label>Cinsiyet</label>
                                                        <select
                                                            name="gender"
                                                            value={editedUser.gender || ''}
                                                            onChange={handleInputChange}
                                                        >
                                                            <option value="">Seçiniz</option>
                                                            <option value="MALE">Erkek</option>
                                                            <option value="FEMALE">Kadın</option>

                                                        </select>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="info-row">
                                                        <span className="info-label">Doğum Tarihi</span>
                                                        <span className="info-value">
                                                            {user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Belirtilmemiş'}
                                                        </span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="info-label">Cinsiyet</span>
                                                        <span className="info-value">
                                                            {user.gender === 'MALE' ? 'Erkek' :
                                                                user.gender === 'FEMALE' ? 'Kadın' :
                                                                    user.gender === 'OTHER' ? 'Diğer' : 'Belirtilmemiş'}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                </div>

                            )}


                            {activeTab === 'addresses' && (
                                <div className="addresses-section">
                                    <div className="addresses-header">
                                        <h2>Kayıtlı Adreslerim</h2>
                                        <button
                                            className="add-address-btn"
                                            onClick={() => setShowAddressForm(true)}
                                        >
                                            <FiPlus /> Yeni Adres Ekle
                                        </button>
                                    </div>

                                    {showAddressForm && (
                                        <div className="address-form-container">
                                            <form onSubmit={handleAddressSubmit} className="address-form">
                                                <div className="form-group">
                                                    <label>Şehir</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={addressFormData.city}
                                                        onChange={handleAddressFormChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>İlçe</label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={addressFormData.state}
                                                        onChange={handleAddressFormChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Adres Detayı</label>
                                                    <textarea
                                                        name="description"
                                                        value={addressFormData.description}
                                                        onChange={handleAddressFormChange}
                                                        required
                                                        style={{
                                                            width: '100%',
                                                            padding: '15px',
                                                            border: '2px solid #e1e1e1',
                                                            borderRadius: '12px',
                                                            fontSize: '1rem',
                                                            backgroundColor: '#f8f9fa'
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Posta Kodu</label>
                                                    <input
                                                        type="text"
                                                        name="postalCode"
                                                        value={addressFormData.postalCode}
                                                        onChange={handleAddressFormChange}
                                                        required
                                                        maxLength="5"
                                                        pattern="\d{5}"
                                                        title="Posta kodu 5 haneli olmalıdır"
                                                    />
                                                </div>
                                                <div className="form-actions">
                                                    <button type="submit" className="save-btn">
                                                        <FiSave /> {editingAddressId ? 'Güncelle' : 'Kaydet'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="cancel-btn"
                                                        onClick={() => {
                                                            setShowAddressForm(false);
                                                            setAddressFormData({
                                                                city: '',
                                                                state: '',
                                                                description: '',
                                                                postalCode: ''
                                                            });
                                                            setEditingAddressId(null);
                                                        }}
                                                    >
                                                        İptal
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}


                                    <div className="addresses-grid">
                                        {user.addresses && user.addresses.length > 0 ? (
                                            user.addresses.map((address) => (
                                                <div key={address.id} className="address-card">
                                                    <div className="address-card-header">
                                                        <h3>{address.city}</h3>
                                                        <div className="address-actions">
                                                            <button
                                                                className="edit-btn"
                                                                onClick={() => handleEditAddress(address)}
                                                            >
                                                                <FiEdit />
                                                            </button>
                                                            <button
                                                                className="delete-btn"
                                                                onClick={() => handleDeleteAddress(address.id)}
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="address-card-content">
                                                        <p><strong>İlçe:</strong> {address.state}</p>
                                                        <p><strong>Adres:</strong> {address.description}</p>
                                                        <p><strong>Posta Kodu:</strong> {address.postalCode}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-address-message">
                                                <p>Henüz kayıtlı adresiniz bulunmamaktadır.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                {isEditing && (
                                    <div className="button-group">
                                        <button className="save-btn" onClick={handleSave}>
                                            <FiSave className="btn-icon" />
                                            <span>Kaydet</span>
                                        </button>
                                        <button className="cancel-btn" onClick={handleCancel}>
                                            <span>İptal</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;