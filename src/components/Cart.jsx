import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../Cart.css';
import Footer from "./Footer";
import Menu from "./Menu";

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({
        id: null,
        itemTotal: 0,
        grandTotal: 0,
        customer: {},
        products: []
    });
    const [quantities, setQuantities] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        const groupedProducts = {};
        cart.products.forEach(product => {
            if (groupedProducts[product.id]) {
                groupedProducts[product.id].quantity += 1;
            } else {
                groupedProducts[product.id] = { ...product, quantity: 1 };
            }
        });
        setQuantities(groupedProducts);
    }, [cart.products]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Lütfen önce giriş yapın');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:8080/cart', {
                headers: {
                    'Authorization': `Bearer ${token.trim()}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.data) {
                setCart(response.data);
            }
        } catch (error) {
            toast.error('Sepet verileri alınırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            toast.warning('Miktar 1\'den küçük olamaz');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/cart/update/${productId}`, {
                quantity: newQuantity
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            fetchCart();
            toast.success('Ürün miktarı güncellendi.');
        } catch (error) {
            toast.error('Ürün miktarı güncellenirken bir hata oluştu.');
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/cart/remove/${productId}`, null, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            toast.success('Ürün sepetten kaldırıldı');
            fetchCart();
        } catch (error) {
            toast.error('Ürün sepetten kaldırılırken bir hata oluştu.');
        }
    };

    if (loading) {
        return <div className="loading">Yükleniyor...</div>;
    }

    if (!cart.products || cart.products.length === 0) {
        return (
            <div className="cart-empty">
                <h2>Sepetiniz Boş</h2>
                <p>Alışverişe başlamak için ürünleri keşfedin!</p>
                <button onClick={() => navigate('/products')}>
                    Alışverişe Başla
                </button>
            </div>
        );
    }

    return (
        <div className='cart-body'>
            <Menu />
            <div className="cart-container">
                <div className="cart-header">
                    <h1>Alışveriş Sepeti</h1>
                </div>
                <div className="cart-content">
                    <div className="cart-items">
                        {Object.values(quantities).map((product) => (
                            <div key={product.id} className="cart-item">
                                <div className="item-image">
                                    {product.imagePath ? (
                                        <img
                                            src={`http://localhost:8080/uploads/${product.imagePath.split(',')[0]}`} // İlk resmi göster
                                            alt={product.name}
                                            loading="lazy"
                                            onError={(e) => {
                                                console.log('Resim yükleme hatası:', product.imagePath);
                                                e.target.src = 'http://localhost:8080/uploads/default-image.jpeg';
                                            }}
                                            className="cart-product-image"
                                            onClick={() => navigate(`/product/${product.id}`)} // Ürün detayına yönlendirme
                                        />
                                    ) : (
                                        <img
                                            src="http://localhost:8080/uploads/default-image.jpeg"
                                            alt="Varsayılan ürün resmi"
                                            className="cart-product-image"
                                        />
                                    )}
                                </div>


                                <div className="item-details">
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-price">{product.price} TL</p>
                                    <div className="quantity-controls">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                        >
                                            -
                                        </button>
                                        <span className="quantity">{product.quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="item-total">
                                        Toplam: {(product.price * product.quantity).toFixed(2)} TL
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeFromCart(product.id)}
                                    className="remove-button"
                                >
                                    Kaldır
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h3 className="summary-title">Sipariş Özeti</h3>
                        <div className="summary-item">
                            <span className="summary-label">Ara Toplam:</span>
                            <span className="summary-value">{cart.itemTotal.toFixed(2)} TL</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Toplam:</span>
                            <span className="summary-value">{cart.grandTotal.toFixed(2)} TL</span>
                        </div>
                        <button
                            className="card-button"
                            onClick={() => {
                                toast.info('Sipariş oluşturma işlemi başlatılıyor...');
                                navigate('/checkout')
                            }}
                        >
                            Sepeti Onayla
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Cart;  