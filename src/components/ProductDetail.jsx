// ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Menu from './Menu';
import Footer from './Footer';
import { toast } from 'react-toastify';
import '../ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:8080/product/${id}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                setProduct(response.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        const checkIfInCart = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await axios.get(`http://localhost:8080/cart`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    // Ürünün sepette olup olmadığını kontrol et
                    const isInCart = response.data.products.some(item => item.id === parseInt(id));
                    setIsAddedToCart(isInCart);
                }
            } catch (error) {
                console.error("Sepet kontrolü yapılırken hata oluştu:", error);
            }
        };

        checkIfInCart();
    }, [id]);

    const handleAddToCart = async () => {
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
                setIsAddedToCart(true);
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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Ürün yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-text">Hata: {error}</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="error-container">
                <p className="error-text">Ürün bulunamadı</p>
            </div>
        );
    }

    return (
        <div className="product-detail-container">
            <Menu />
            <motion.div
                className="product-detail-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="product-detail-grid">
                    <div className="product-image-section">
                        <img
                            src={`https://picsum.photos/800/800?random=${product.id}`}
                            alt={product.name}
                            className="main-image"
                        />
                    </div>

                    <div className="product-info-section">
                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-description">{product.description}</p>

                        <div className="price-stock-info">
                            <span className="product-price">{product.price} TL</span>
                            <span className="stock-status">Stokta</span>
                        </div>

                        <div className="quantity-selector">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="quantity-btn"
                            >
                                -
                            </button>
                            <span className="quantity">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="quantity-btn"
                            >
                                +
                            </button>
                        </div>

                        <motion.button
                            className={`add-to-cart-btn ${isAddedToCart ? 'disabled' : ''}`}
                            whileHover={{ scale: isAddedToCart ? 1 : 1.05 }}
                            whileTap={{ scale: isAddedToCart ? 1 : 0.95 }}
                            onClick={handleAddToCart}
                            disabled={isAddedToCart}
                        >
                            {isAddedToCart ? 'Sepete Eklendi' : 'Sepete Ekle'}
                        </motion.button>

                        <div className="product-details">
                            <h2>Ürün Detayları</h2>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Kategori:</span>
                                    <span className="detail-value">{product.categoryName || 'Belirtilmemiş'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Stok Durumu:</span>
                                    <span className="detail-value">{product.stock > 5 ? "Stokta" : "Tükenmek Üzere"}</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
            <Footer />
        </div>
    );
};

export default ProductDetail;