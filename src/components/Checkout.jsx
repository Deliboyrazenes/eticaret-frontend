import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Menu from './Menu';
import '../Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({
        id: null,
        grandTotal: 0,
        customer: {},
        products: [],
    });
    const [groupedProducts, setGroupedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('');

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        const grouped = {};
        cart.products.forEach((product) => {
            if (grouped[product.id]) {
                grouped[product.id].quantity += 1;
            } else {
                grouped[product.id] = { ...product, quantity: 1 };
            }
        });
        setGroupedProducts(Object.values(grouped));
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
                    Authorization: `Bearer ${token.trim()}`,
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            if (response.data) {
                setCart(response.data);
            }
        } catch (error) {
            toast.error('Sepet bilgileri alınırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const completeCheckout = async () => {
        if (!paymentMethod) {
            toast.error('Lütfen bir ödeme yöntemi seçin');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:8080/orders/create',
                null,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        paymentMethod: paymentMethod,
                    },
                }
            );

            toast.success('Sipariş başarıyla tamamlandı');
            navigate('/orders'); // Siparişlerim sayfasına yönlendir
        } catch (error) {
            toast.error('Sipariş tamamlanırken bir hata oluştu');
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
                <button onClick={() => navigate('/products')}>Alışverişe Başla</button>
            </div>
        );
    }

    return (
        <div>
            <Menu />
            <div className="checkout-body">
                <div className="checkout-container">
                    <h1 className="checkout-title">Sipariş Tamamlama</h1>
                    <div className="checkout-grid">
                        <div className="checkout-card order-summary-card">
                            <h3>Sipariş Özeti</h3>
                            <div className="order-summary">
                                {groupedProducts.map((product) => (
                                    <div key={product.id} className="order-item">
                                        <span>
                                            {product.name} (x{product.quantity})
                                        </span>
                                        <span>
                                            {(product.price * product.quantity).toFixed(2)} TL
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="order-total">
                                <span>Toplam:</span>
                                <span>{cart.grandTotal} TL</span>
                            </div>
                        </div>

                        <div className="checkout-card payment-method-card">
                            <h3>Ödeme Yöntemi</h3>
                            <select
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                value={paymentMethod}
                            >
                                <option value="">Bir ödeme yöntemi seçin</option>
                                <option value="CREDIT_CARD">Kredi Kartı</option>
                                <option value="DEBIT_CARD">Banka Kartı</option>
                            </select>
                        </div>
                    </div>

                    <button className="checkout-button" onClick={completeCheckout}>
                        Siparişi Tamamla
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Checkout;
