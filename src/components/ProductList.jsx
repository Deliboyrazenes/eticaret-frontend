import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Menu from "./Menu";
import Footer from "./Footer";
import "../ProductList.css";

const ProductList = () => {
    const [productList, setProductList] = useState([]);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [errorStatus, setErrorStatus] = useState(null);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingStatus(true);
            
            try {
                const token = localStorage.getItem("token");
                const userType = localStorage.getItem("userType");

                console.log("Token:", token);
                console.log("User Type:", userType);

                const response = await axios.get("http://localhost:8080/product", {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                console.log("API Yanıtı:", response);

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
    }, []);

    const addToCart = (product) => {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");

        if (!token || userType !== "CUSTOMER") {
            alert("Sepete eklemek için müşteri olarak giriş yapmalısınız!");
            return;
        }

        setCartItems((prevCart) => [...prevCart, product]);
        alert(`${product.name} sepete eklendi!`);
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
                <p className="no-products-text">Henüz ürün eklenmemiş.</p>
            </div>
        );
    }

    return (
        <div className="homepage-container">
            <Menu />

            {/* Hero Section */}
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

            {/* Ürün Listesi */}
            <div className="products-section">
                <motion.div 
                    className="product-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {productList.map((product) => (
                        <motion.div 
                            key={product.id} 
                            className="product-card"
                            whileHover={{ y: -5 }}
                        >
                            <div className="product-image-wrapper">
                                <img
                                    src={`https://picsum.photos/400/400?random=${product.id}`}
                                    alt={product.name}
                                    loading="lazy"
                                />
                                <motion.button 
                                    className="quick-add-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => addToCart(product)}
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
                                    <div className="stock-status in-stock">Stokta</div>
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