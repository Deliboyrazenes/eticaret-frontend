import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import Menu from "./Menu";
import Footer from "./Footer";
import { toast } from 'react-toastify';
import "../ProductList.css";

const ProductList = () => {
    const [productList, setProductList] = useState([]);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [errorStatus, setErrorStatus] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        sortBy: 'default'
    });
    const navigate = useNavigate();
    const { categoryId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            setLoadingStatus(true);

            try {
                const token = localStorage.getItem("token");
                const userType = localStorage.getItem("userType");

                if (categoryId) {
                    try {
                        const categoryResponse = await axios.get(`http://localhost:8080/category/${categoryId}`);
                        setCurrentCategory(categoryResponse.data);
                    } catch (error) {
                        console.error("Kategori bilgisi alınamadı:", error);
                    }
                }

                const url = categoryId
                    ? `http://localhost:8080/product/category/${categoryId}`
                    : "http://localhost:8080/product";

                const response = await axios.get(url, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (response.status === 200) {
                    if (Array.isArray(response.data)) {
                        setProductList(response.data);
                    } else if (response.data && Array.isArray(response.data.content)) {
                        setProductList(response.data.content);
                    } else {
                        setErrorStatus("Veri formatı beklendiği gibi değil");
                    }
                }
            } catch (error) {
                console.error("API Hatası:", error);
                setErrorStatus(
                    error.response?.data?.message ||
                    error.message ||
                    "Ürünler yüklenirken bir hata oluştu."
                );
            } finally {
                setLoadingStatus(false);
            }
        };

        fetchData();
    }, [categoryId]);

    const addToCart = async (product, e) => {
        e.stopPropagation();

        try {
            const token = localStorage.getItem("token");
            const userType = localStorage.getItem("userType");

            if (!token || userType !== "CUSTOMER") {
                toast.error("Sepete eklemek için müşteri olarak giriş yapmalısınız!");
                navigate('/login');
                return;
            }

            const response = await axios.post(`http://localhost:8080/cart/${product.id}`, null, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                toast.success(`${product.name} sepete eklendi!`);
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const errorMessage = error.response.data.message;

                switch (status) {
                    case 401:
                        toast.error('Lütfen giriş yapın');
                        navigate('/login');
                        break;
                    case 400:
                        if (errorMessage.includes('Yetersiz stok')) {
                            toast.warning(errorMessage);
                        } else {
                            toast.error(errorMessage);
                        }
                        break;
                    case 404:
                        toast.error('Ürün bulunamadı');
                        break;
                    default:
                        toast.error('Bir hata oluştu');
                }
            } else {
                toast.error('Sunucu ile bağlantı kurulamadı');
            }
        }
    };

    const FilterSection = () => {
        // Geçici filtre state'i
        const [tempFilters, setTempFilters] = useState({
            minPrice: '',
            maxPrice: '',
            sortBy: 'default'
        });
    
        // Filtreleri uygula
        const applyFilters = () => {
            setFilters({
                minPrice: tempFilters.minPrice,
                maxPrice: tempFilters.maxPrice,
                sortBy: tempFilters.sortBy
            });
        };
    
        return (
            <motion.div 
                className="filter-section"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="filter-controls">
                    <div className="price-inputs">
                        <input
                            type="text"
                            placeholder="Min Fiyat"
                            value={tempFilters.minPrice}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*$/.test(value)) {
                                    setTempFilters(prev => ({...prev, minPrice: value}));
                                }
                            }}
                            className="price-input"
                        />
                        <span>-</span>
                        <input
                            type="text"
                            placeholder="Max Fiyat"
                            value={tempFilters.maxPrice}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*$/.test(value)) {
                                    setTempFilters(prev => ({...prev, maxPrice: value}));
                                }
                            }}
                            className="price-input"
                        />
                    </div>
    
                    <select
                        value={tempFilters.sortBy}
                        onChange={(e) => setTempFilters(prev => ({...prev, sortBy: e.target.value}))}
                        className="sort-select-filter"
                    >
                        <option value="default">Sıralama</option>
                        <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                        <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                        <option value="name-asc">İsim: A-Z</option>
                        <option value="name-desc">İsim: Z-A</option>
                    </select>
    
                    <button
                        type="button"
                        className="apply-filters"
                        onClick={applyFilters}
                    >
                        Filtreleri Uygula
                    </button>
    
                    <button
                        type="button"
                        className="clear-filters"
                        onClick={() => {
                            setTempFilters({
                                minPrice: '',
                                maxPrice: '',
                                sortBy: 'default'
                            });
                            setFilters({
                                minPrice: '',
                                maxPrice: '',
                                sortBy: 'default'
                            });
                        }}
                    >
                        Filtreleri Temizle
                    </button>
                </div>
            </motion.div>
        );
    };

    const getFilteredProducts = () => {
        return productList
            .filter(product => {
                if (filters.minPrice && product.price < Number(filters.minPrice)) return false;
                if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false;
                return true;
            })
            .sort((a, b) => {
                switch (filters.sortBy) {
                    case 'price-asc':
                        return a.price - b.price;
                    case 'price-desc':
                        return b.price - a.price;
                    case 'name-asc':
                        return a.name.localeCompare(b.name);
                    case 'name-desc':
                        return b.name.localeCompare(a.name);
                    default:
                        return 0;
                }
            });
    };

    if (loadingStatus) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Ürünler yükleniyor...</p>
            </div>
        );
    }

    if (errorStatus) {
        return (
            <div className="error-container">
                <p className="error-text">Hata: {errorStatus}</p>
            </div>
        );
    }

    if (!productList || productList.length === 0) {
        return (
            <div className="empty-container">
                <p className="no-products-text">Bu kategoride henüz ürün bulunmamaktadır.</p>
            </div>
        );
    }

    return (
        <div className="homepage-container">
            <Menu />

            <motion.div
                className="hero-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="hero-content">
                    <div className="hero-grid">
                        <div className="hero-card">
                            <span className="hero-icon">🌟</span>
                            <h3>Özel Koleksiyon</h3>
                            <p>En yeni ürünlerle tarzınızı yansıtın</p>
                        </div>
                        <div className="hero-card">
                            <span className="hero-icon">🚚</span>
                            <h3>Hızlı Teslimat</h3>
                            <p>24 saat içinde kapınızda</p>
                        </div>
                        <div className="hero-card">
                            <span className="hero-icon">💎</span>
                            <h3>Premium Kalite</h3>
                            <p>En kaliteli ürünler</p>
                        </div>
                        <div className="hero-card">
                            <span className="hero-icon">🔒</span>
                            <h3>Güvenli Alışveriş</h3>
                            <p>%100 Müşteri memnuniyeti</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {currentCategory && (
                <motion.div
                    className="category-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2>{currentCategory.name}</h2>
                    {currentCategory.description && (
                        <p>{currentCategory.description}</p>
                    )}
                </motion.div>
            )}

            <FilterSection />

            <div className="products-section">
                <motion.div
                    className="product-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {getFilteredProducts().map((product) => (
                        <motion.div
                            key={product.id}
                            className="product-card"
                            whileHover={{ y: -5 }}
                            onClick={() => navigate(`/product/${product.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="product-image-wrapper">
                                <img
                                    src={product.imagePath
                                        ? `http://localhost:8080/uploads/${product.imagePath}`
                                        : `http://localhost:8080/uploads/default-image.jpeg`}
                                    alt={product.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        console.log('Resim yükleme hatası:', product.imagePath);
                                        e.target.src = 'http://localhost:8080/uploads/default-image.jpeg';
                                    }}
                                    className="product-image"
                                />
                                <motion.button
                                    className="quick-add-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => addToCart(product, e)}
                                >
                                    Sepete Ekle
                                </motion.button>
                            </div>
                            <div className="product-details">
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p>{product.description}</p>
                                </div>
                                <div className="price-row">
                                    <span className="price">{product.price} TL</span>
                                    <div className="stock-status in-stock">
                                        {product.stock < 5 ? 'Tükeniyor' : 'Stokta'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default ProductList;