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
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [cardInfo, setCardInfo] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
    });

    useEffect(() => {
        fetchCart();
        fetchAddresses();
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

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/address', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            if (response.data) {
                setAddresses(response.data);
            }
        } catch (error) {
            toast.error('Adres bilgileri alınırken bir hata oluştu');
        }
    };

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Lütfen önce giriş yapın');
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:8080/cart', {
                headers: {
                    Authorization: `Bearer ${token}`,
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

    const formatCardNumber = (value) => {
        const numbers = value.replace(/[^\d]/g, '');
        const trimmed = numbers.slice(0, 16);
        const parts = [];
        for (let i = 0; i < trimmed.length; i += 4) {
            parts.push(trimmed.slice(i, i + 4));
        }
        return parts.join(' ');
    };

    const formatExpiryDate = (value) => {
        const cleanValue = value.replace(/\D+/g, '');
        let formattedValue = cleanValue;

        if (cleanValue.length >= 2) {
            const month = parseInt(cleanValue.substring(0, 2));
            if (month > 12) {
                formattedValue = '12' + cleanValue.substring(2);
            }
            formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
        }

        return formattedValue.slice(0, 5);
    };

    const handleCardInfoChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case 'cardHolderName':
                if (/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/.test(value)) {
                    setCardInfo(prev => ({ ...prev, [name]: value.toUpperCase() }));
                }
                break;

            case 'cardNumber':
                setCardInfo(prev => ({ ...prev, cardNumber: formatCardNumber(value) }));
                break;

            case 'expiryDate':
                setCardInfo(prev => ({ ...prev, expiryDate: formatExpiryDate(value) }));
                break;

            case 'cvv':
                const cvv = value.replace(/\D/g, '').slice(0, 3);
                setCardInfo(prev => ({ ...prev, cvv }));
                break;

            default:
                break;
        }
    };

    const validateCardInfo = () => {
        if (!cardInfo.cardHolderName || cardInfo.cardHolderName.length < 5) {
            toast.error('Geçerli bir kart sahibi adı giriniz', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }

        const cardNumberOnly = cardInfo.cardNumber.replace(/\s/g, '');
        if (!cardNumberOnly || cardNumberOnly.length !== 16) {
            toast.error('Geçerli bir kart numarası giriniz', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }

        if (!cardInfo.expiryDate || cardInfo.expiryDate.length !== 5) {
            toast.error('Geçerli bir son kullanma tarihi giriniz', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }

        const [month, year] = cardInfo.expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        if (parseInt(year) < currentYear ||
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            toast.error('Kartınızın son kullanma tarihi geçmiş', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }

        if (!cardInfo.cvv || cardInfo.cvv.length !== 3) {
            toast.error('Geçerli bir CVV numarası giriniz', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }

        return true;
    };

    const completeCheckout = async () => {
        if (!selectedAddressId) {
            toast.error('Lütfen bir teslimat adresi seçiniz!', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        if (!paymentMethod) {
            toast.error('Lütfen bir ödeme yöntemi seçiniz!', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        if ((paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && !validateCardInfo()) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8080/orders/create',
                null,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        paymentMethod: paymentMethod
                    },
                    withCredentials: true,
                }
            );

            if (response.status === 201) {
                toast.success('Sipariş başarıyla tamamlandı');
                setCart({
                    id: null,
                    grandTotal: 0,
                    customer: {},
                    products: [],
                });
                navigate('/orders');
            }
        } catch (error) {
            console.error('Sipariş hatası:', error);
            toast.error('Sipariş tamamlanırken bir hata oluştu');
        }
    };



    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Yükleniyor...</div>
            </div>
        );
    }

    if (!cart.products || cart.products.length === 0) {
        return (
            <div className="empty-cart-container">
                <div className="cart-empty">
                    <h2>Sepetiniz Boş</h2>
                    <p>Alışverişe başlamak için ürünleri keşfedin!</p>
                    <button onClick={() => navigate('/products')}>Alışverişe Başla</button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <Menu />
            <div className="checkout-body">
                <div className="checkout-container">
                    <h1 className="checkout-title">Sipariş Tamamlama</h1>
                    <div className="checkout-grid">
                        {/* Sipariş Özeti */}
                        <div className="checkout-card order-summary-card">
                            <h3>Sipariş Özeti</h3>
                            <div className="order-summary">
                                {groupedProducts.map((product) => (
                                    <div key={product.id} className="order-item">
                                        <div className="product-info">
                                            <span className="product-name">{product.name}</span>
                                            <span className="product-quantity">  ({product.quantity})</span>
                                        </div>
                                        <span className="product-price">
                                            {(product.price * product.quantity).toFixed(2)} TL
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="order-total">
                                <span>Toplam:</span>
                                <span className="total-price">{cart.grandTotal.toFixed(2)} TL</span>
                            </div>
                        </div>

                        {/* Teslimat Adresi */}
                        <div className="checkout-card address-card">
                            <h3>Teslimat Adresi</h3>
                            {addresses.length > 0 ? (
                                <select
                                    value={selectedAddressId}
                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                    className="address-select"
                                >
                                    <option value="">Adres Seçiniz</option>
                                    {addresses.map((address) => (
                                        <option key={address.id} value={address.id}>
                                            {address.description} - {address.city}/{address.state} {address.postalCode}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="no-address">
                                    <p>Kayıtlı adresiniz bulunmamaktadır.</p>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="add-address-button"
                                    >
                                        Adres Ekle
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Ödeme Yöntemi */}
                        <div className="checkout-card payment-method-card">
                            <h3>Ödeme Yöntemi</h3>
                            <select
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                value={paymentMethod}
                                className="payment-select"
                            >
                                <option value="">Bir ödeme yöntemi seçin</option>
                                <option value="CREDIT_CARD">Kredi Kartı</option>
                                <option value="DEBIT_CARD">Banka Kartı</option>
                            </select>

                            {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                                <div className="card-info-form">
                                    <input
                                        type="text"
                                        name="cardHolderName"
                                        placeholder="Kart Üzerindeki İsim"
                                        value={cardInfo.cardHolderName}
                                        onChange={handleCardInfoChange}
                                        className="card-input"
                                    />
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        placeholder="Kart Numarası"
                                        value={cardInfo.cardNumber}
                                        onChange={handleCardInfoChange}
                                        maxLength="19"
                                        className="card-input"
                                    />
                                    <div className="card-info-row">
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            placeholder="AA/YY"
                                            value={cardInfo.expiryDate}
                                            onChange={handleCardInfoChange}
                                            className="card-input expiry"
                                        />
                                        <input
                                            type="text"
                                            name="cvv"
                                            placeholder="CVV"
                                            value={cardInfo.cvv}
                                            onChange={handleCardInfoChange}
                                            className="card-input cvv"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className="checkout-button"
                        onClick={completeCheckout}
                    >
                        Siparişi Tamamla
                    </button>

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Checkout;