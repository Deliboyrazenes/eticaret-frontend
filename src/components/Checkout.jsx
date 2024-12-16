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

    // Kart numarası formatlaması fonksiyonu
    const formatCardNumber = (value) => {
        // Sadece rakamları al, boşlukları ve diğer karakterleri kaldır
        const numbers = value.replace(/[^\d]/g, '');

        // 16 rakamdan fazlasını alma
        const trimmed = numbers.slice(0, 16);

        // 4'lü gruplara böl
        const parts = [];
        for (let i = 0; i < trimmed.length; i += 4) {
            parts.push(trimmed.slice(i, i + 4));
        }

        // Grupları boşlukla birleştir
        return parts.join(' ');
    };


    // Tarih formatlaması
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

        return formattedValue;
    };

    const handleCardInfoChange = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case 'cardHolderName':
                // Sadece harf ve boşluk
                if (/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$/.test(value)) {
                    setCardInfo(prev => ({ ...prev, [name]: value }));
                }
                break;

            case 'cardNumber':
                const formattedNumber = formatCardNumber(value);
                setCardInfo(prev => ({ ...prev, cardNumber: formattedNumber }));
                break;

            case 'expiryDate':
                // AA/YY formatı
                const formattedDate = formatExpiryDate(value);
                if (formattedDate.length <= 5) {
                    setCardInfo(prev => ({ ...prev, [name]: formattedDate }));
                }
                break;

            case 'cvv':
                // Sadece rakam ve 3 karakter
                const cvv = value.replace(/\D/g, '');
                if (cvv.length <= 3) {
                    setCardInfo(prev => ({ ...prev, [name]: cvv }));
                }
                break;

            default:
                break;
        }
    };

    const validateCardInfo = () => {
        // Kart sahibi kontrolü
        if (!cardInfo.cardHolderName || cardInfo.cardHolderName.length < 5) {
            toast.error('Geçerli bir kart sahibi adı giriniz');
            return false;
        }

        // Kart numarası kontrolü
        const cardNumberOnly = cardInfo.cardNumber.replace(/\s/g, '');
        if (!cardNumberOnly || cardNumberOnly.length !== 16) {
            toast.error('Geçerli bir kart numarası giriniz');
            return false;
        }

        // Son kullanma tarihi kontrolü
        if (!cardInfo.expiryDate || cardInfo.expiryDate.length !== 5) {
            toast.error('Geçerli bir son kullanma tarihi giriniz');
            return false;
        }

        const [month, year] = cardInfo.expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        if (parseInt(year) < currentYear ||
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            toast.error('Kartınızın son kullanma tarihi geçmiş');
            return false;
        }

        // CVV kontrolü
        if (!cardInfo.cvv || cardInfo.cvv.length !== 3) {
            toast.error('Geçerli bir CVV numarası giriniz');
            return false;
        }

        return true;
    };

    const completeCheckout = async () => {
        if (!paymentMethod) {
            toast.error('Lütfen bir ödeme yöntemi seçin');
            return;
        }

        if (!selectedAddressId) {
            toast.error('Lütfen bir teslimat adresi seçin');
            return;
        }

        if ((paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && !validateCardInfo()) {
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
            navigate('/orders');
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
                                <span>{cart.grandTotal.toFixed(2)} TL</span>
                            </div>
                        </div>

                        <div className="checkout-card address-card">
                            <h3>Teslimat Adresi</h3>
                            {addresses.length > 0 ? (
                                <select
                                    value={selectedAddressId}
                                    onChange={(e) => setSelectedAddressId(e.target.value)}
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
                                    <button onClick={() => navigate('/profile/addresses')}>
                                        Adres Ekle
                                    </button>
                                </div>
                            )}
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
                                        maxLength="19" // 16 rakam + 3 boşluk
                                        inputMode="numeric"
                                    />
                                    <div className="card-info-row">
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            placeholder="AA/YY"
                                            value={cardInfo.expiryDate}
                                            onChange={handleCardInfoChange}
                                            className="card-input"
                                        />
                                        <input
                                            type="text"
                                            name="cvv"
                                            placeholder="CVV"
                                            value={cardInfo.cvv}
                                            onChange={handleCardInfoChange}
                                            className="card-input"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className="checkout-button"
                        onClick={completeCheckout}
                        disabled={!selectedAddressId || !paymentMethod}
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