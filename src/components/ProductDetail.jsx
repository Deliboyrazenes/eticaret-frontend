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
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

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

    const handleQuantityChange = (newQuantity) => {
        const maxQuantity = product?.stock || 1;
        const validQuantity = Math.min(Math.max(1, newQuantity), maxQuantity);
        setQuantity(validQuantity);
    };

    const handleAddToCart = async () => {
        if (addingToCart) return;
      
        try {
            setAddingToCart(true);
            const token = localStorage.getItem("token");
            const userType = localStorage.getItem("userType");

            if (!token || userType !== "CUSTOMER") {
                toast.error("Sepete eklemek için müşteri olarak giriş yapmalısınız!");
                navigate('/login');
                return;
            }

            for (let i = 0; i < quantity; i++) {
                const response = await axios.post(`http://localhost:8080/cart/${product.id}`, null, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.data) {
                    throw new Error('Sepete ekleme başarısız');
                }
            }

            toast.success(`${quantity} adet ${product.name} sepete eklendi!`);
            setQuantity(1);

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
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="pd-loading-container">
                <div className="pd-loading-spinner"></div>
                <p className="pd-loading-text">Ürün yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pd-error-container">
                <p className="pd-error-text">Hata: {error}</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pd-error-container">
                <p className="pd-error-text">Ürün bulunamadı</p>
            </div>
        );
    }

    return (
        <div className="pd-product-detail-container">
            <Menu />
            <motion.div
                className="pd-product-detail-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="pd-product-detail-grid">
                    <div className="pd-product-image-section">
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
                            className="pd-product-image"
                        />
                    </div>

                    <div className="pd-product-info-section">
                        <h1 className="pd-product-title">{product.name}</h1>
                        <p className="pd-product-description">{product.description}</p>

                        <div className="pd-price-stock-info">
                            <span className="pd-product-price">{product.price} TL</span>
                            <span className={`pd-stock-status ${product.stock <= 5 ? 'pd-low-stock' : ''}`}>
                                {product.stock > 0 
                                    ? `Stokta (${product.stock} adet)` 
                                    : 'Stokta Yok'}
                            </span>
                        </div>

                        <div className="pd-quantity-selector">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                className="pd-quantity-btn"
                                disabled={quantity <= 1 || product.stock === 0}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                min="1"
                                max={product.stock}
                                className="pd-quantity-input"
                            />
                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                className="pd-quantity-btn"
                                disabled={quantity >= product.stock}
                            >
                                +
                            </button>
                        </div>

                        <div className="pd-total-price">
                            Toplam: {(product.price * quantity).toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY'
                            })}
                        </div>

                        <motion.button
                            className={`pd-add-to-cart-btn ${product.stock === 0 ? 'pd-disabled' : ''}`}
                            whileHover={{ scale: product.stock > 0 ? 1.05 : 1 }}
                            whileTap={{ scale: product.stock > 0 ? 0.95 : 1 }}
                            onClick={handleAddToCart}
                            disabled={product.stock === 0 || addingToCart}
                        >
                            {addingToCart ? 'Ekleniyor...' : 
                             product.stock === 0 ? 'Stokta Yok' : 
                             'Sepete Ekle'}
                        </motion.button>

                        <div className="pd-product-details">
                            <h2>Ürün Detayları</h2>
                            <div className="pd-details-grid">
                                <div className="pd-detail-item">
                                    <span className="pd-detail-label">Kategori:</span>
                                    <span className="pd-detail-value">
                                        {product.categoryName || 'Belirtilmemiş'}
                                    </span>
                                </div>
                                <div className="pd-detail-item">
                                    <span className="pd-detail-label">Marka:</span>
                                    <span className="pd-detail-value">
                                        {product.brand || 'Belirtilmemiş'}
                                    </span>
                                </div>
                                <div className="pd-detail-item">
                                    <span className="pd-detail-label">Stok Durumu:</span>
                                    <span className="pd-detail-value">
                                        {product.stock > 5 ? "Stokta" : 
                                         product.stock > 0 ? "Tükenmek Üzere" : 
                                         "Stokta Yok"}
                                    </span>
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