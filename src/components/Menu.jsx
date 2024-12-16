// Menu.jsx  
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiShoppingBag,
    FiUser,
    FiSearch,
    FiLogOut,
    FiPackage,
    FiShoppingCart,
    FiMonitor,
    FiSmartphone,
    FiHeadphones,
    FiWatch,
    FiCamera,
    FiPrinter,
    FiHardDrive,
    FiTv,
    FiSpeaker
} from "react-icons/fi";
import axios from 'axios';
import "../Menu.css";
import Modal from './Modal';

const categoryIcons = {
    "Bilgisayar": FiMonitor,
    "Telefon": FiSmartphone,
    "Kulaklık": FiHeadphones,
    "Akıllı Saat": FiWatch,
    "Kamera": FiCamera,
    "Yazıcı": FiPrinter,
    "Harici Disk": FiHardDrive,
    "Televizyon": FiTv,
    "Hoparlör": FiSpeaker,
    "default": FiShoppingBag
};

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalConfirmAction, setModalConfirmAction] = useState(() => () => { });
    const [categories, setCategories] = useState([]);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8080/category');
                if (response.data) {
                    const sortedCategories = response.data.sort((a, b) => {
                        return a.name.localeCompare(b.name);
                    });
                    setCategories(sortedCategories);
                }
            } catch (error) {
                console.error("Kategoriler yüklenirken hata:", error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                fetchCartItemCount();
            }
        } catch (error) {
            console.error("Kullanıcı bilgileri yüklenirken hata:", error);
            localStorage.removeItem('user');
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.nav-dropdown')) {
                setActiveDropdown(null);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDropdownToggle = (dropdownName) => {
        setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length >= 2) {
            setIsSearching(true);
            try {
                const response = await axios.get(`http://localhost:8080/product/search?keyword=${value}`);
                const data = response.data;
                setSearchResults(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Arama hatası:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleSearchResultClick = (productId) => {
        setSearchResults([]);
        setSearchTerm('');
        navigate(`/product/${productId}`);
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/products/category/${categoryId}`);
        setActiveDropdown(null);
    };

    const handleLogout = () => {
        setModalTitle('Çıkış Yap');
        setModalMessage('Çıkış yapmak istediğinize emin misiniz?');
        setModalConfirmAction(() => () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            setUser(null);
            setActiveDropdown(null);
            navigate('/');
            setIsModalOpen(false);
        });
        setIsModalOpen(true);
    };

    const fetchCartItemCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://localhost:8080/cart', {
                headers: {
                    'Authorization': `Bearer ${token.trim()}`
                }
            });

            if (response.data && response.data.products) {
                setCartItemCount(response.data.products.length);
            }
        } catch (error) {
            console.error("Sepet bilgileri yüklenirken hata:", error);
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo-link">
                <h1>ATLAS</h1>
            </Link>

            <div className="search-container" ref={searchRef}>
                <div className="search-bar">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Ürün ara..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((product) => (
                            <div
                                key={product.id}
                                className="search-result-item"
                                onClick={() => handleSearchResultClick(product.id)}
                            >
                                <img
                                    src={product.imagePath
                                        ? `http://localhost:8080/uploads/${product.imagePath}`
                                        : `http://localhost:8080/uploads/default-image.jpeg`}
                                    alt={product.name}
                                    className="search-result-thumbnail"
                                    onError={(e) => {
                                        console.log('Resim yükleme hatası:', product.imagePath);
                                        e.target.src = 'http://localhost:8080/uploads/default-image.jpeg';
                                    }}
                                />
                                <div className="product-info">
                                    <h4>{product.categoryName}<span> &gt; </span>
                                        <span className="product-name-font">{product.name}</span>
                                    </h4>
                                    <p>
                                        {product.price.toLocaleString('tr-TR', {
                                            style: 'currency',
                                            currency: 'TRY'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isSearching && (
                    <div className="search-loading">
                        <div className="loading-spinner"></div>
                        <span>Aranıyor...</span>
                    </div>
                )}

                {!isSearching && searchTerm.length >= 2 && searchResults.length === 0 && (
                    <div className="no-results">
                        Sonuç bulunamadı
                    </div>
                )}
            </div>

            <div className="nav-links">
                <div className="nav-dropdown">
                    <button
                        className="nav-button"
                        onClick={() => handleDropdownToggle('categories')}
                    >
                        <FiShoppingBag className="nav-icon" />
                        <span>Kategoriler</span>
                    </button>
                    {activeDropdown === 'categories' && (
                        <div className="dropdown-menu">
                            {categories.map((category) => {
                                const IconComponent = categoryIcons[category.name] || categoryIcons.default;
                                return (
                                    <button
                                        key={category.id}
                                        className="dropdown-item"
                                        onClick={() => handleCategoryClick(category.id)}
                                    >
                                        <IconComponent />
                                        <span>{category.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {user ? (
                    <div className="nav-dropdown">
                        <button
                            className="nav-button"
                            onClick={() => handleDropdownToggle('user')}
                        >
                            <FiUser className="nav-icon" />
                            <span>{user.firstName} {user.lastName}</span>
                        </button>
                        {activeDropdown === 'user' && (
                            <div className="dropdown-menu">
                                <Link to="/orders" className="dropdown-item">
                                    <FiPackage />
                                    <span>Siparişlerim</span>
                                </Link>
                                <Link to="/cart" className="dropdown-item">
                                    <div className="cart-item-wrapper">
                                        <FiShoppingCart />
                                        <span>Sepetim</span>
                                        {cartItemCount > 0 && (
                                            <span className="cart-badge">{cartItemCount}</span>
                                        )}
                                    </div>
                                </Link>
                                <Link to="/profile" className="dropdown-item">
                                    <FiUser />
                                    <span>Kullanıcı Bilgilerim</span>
                                </Link>
                                <button onClick={handleLogout} className="dropdown-item logout">
                                    <FiLogOut />
                                    <span>Çıkış Yap</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="nav-button">
                        <FiUser className="nav-icon" />
                        <span>Giriş Yap</span>
                    </Link>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTitle}
                message={modalMessage}
                onConfirm={modalConfirmAction}
            />
        </nav>
    );
};

export default Navbar;  