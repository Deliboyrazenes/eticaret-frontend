import React, { useState, useEffect } from 'react';    
import axios from 'axios';    
import { toast } from 'react-toastify';    
import { useNavigate } from 'react-router-dom';   
import Footer from "./Footer"; 
import Menu from "./Menu"; 
import '../Checkout.css';    

const Checkout = () => {    
    const navigate = useNavigate();    
    const [cart, setCart] = useState({    
        id: null,    
        grandTotal: 0,    
        customer: {},    
        products: []    
    });    
    const [loading, setLoading] = useState(true);    

    // Form state'leri    
    const [address, setAddress] = useState({    
        fullName: '',    
        street: '',    
        city: '',    
        state: '',    
        zipCode: '',    
        country: ''    
    });    

    const [card, setCard] = useState({    
        cardNumber: '',    
        cardHolder: '',    
        expiryDate: '',    
        cvv: ''    
    });    

    useEffect(() => {    
        fetchCart();    
    }, []);    

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
            toast.error('Sepet bilgileri alınırken bir hata oluştu');    
        } finally {    
            setLoading(false);    
        }    
    };    

    const handleAddressChange = (e) => {    
        const { name, value } = e.target;    
        setAddress((prev) => ({    
            ...prev,    
            [name]: value    
        }));    
    };    

    const handleCardChange = (e) => {    
        const { name, value } = e.target;    
        setCard((prev) => ({    
            ...prev,    
            [name]: value    
        }));    
    };    

    const completeCheckout = async () => {    
        // Adres ve kart bilgilerini kontrol et    
        if (!address.fullName || !address.street || !address.city || !address.state || !address.zipCode || !address.country) {    
            toast.error('Lütfen adres bilgilerini eksiksiz doldurun');    
            return;    
        }    

        if (!/^\d{16}$/.test(card.cardNumber)) {    
            toast.error('Kart numarası 16 haneli olmalıdır');    
            return;    
        }    

        if (!/^\d{3}$/.test(card.cvv)) {    
            toast.error('CVV 3 haneli olmalıdır');    
            return;    
        }    

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiryDate)) {    
            toast.error('Son kullanma tarihi MM/YY formatında olmalıdır');    
            return;    
        }    

        try {    
            const token = localStorage.getItem('token');    
            const response = await axios.post('http://localhost:8080/orders/checkout', null, {    
                headers: {    
                    'Authorization': `Bearer ${token}`    
                }    
            });    

            toast.success('Sipariş başarıyla tamamlandı');    
            navigate('/orders'); // Siparişler sayfasına yönlendirme    
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
                <button onClick={() => navigate('/products')}>    
                    Alışverişe Başla    
                </button>    
            </div>    
        );    
    }    

    return (    
        <div>    
            {/* Menü Bileşeni */}  
            <Menu />    

            {/* Checkout İçeriği */}  
            <div className="checkout-body">    
                <div className="checkout-container">    
                    <h1 className="checkout-title">Sipariş Tamamlama</h1>    
                    <div className="checkout-grid">    
                        {/* Sipariş Özeti */}    
                        <div className="checkout-card order-summary-card">    
                            <h3>Sipariş Özeti</h3>    
                            <div className="order-summary">    
                                {cart.products.map((product) => (    
                                    <div key={product.id} className="order-item">    
                                        <span>{product.name}</span>    
                                        <span>{product.price} TL</span>    
                                    </div>    
                                ))}    
                            </div>    
                            <div className="order-total">    
                                <span>Toplam:</span>    
                                <span>{cart.grandTotal} TL</span>    
                            </div>    
                        </div>    

                        {/* Adres Bilgileri */}    
                        <div className="checkout-card address-card">    
                            <h3>Adres Bilgileri</h3>    
                            <input type="text" name="fullName" placeholder="Ad Soyad" value={address.fullName} onChange={handleAddressChange} />    
                            <input type="text" name="street" placeholder="Sokak Adresi" value={address.street} onChange={handleAddressChange} />    
                            <input type="text" name="city" placeholder="Şehir" value={address.city} onChange={handleAddressChange} />    
                            <input type="text" name="state" placeholder="Eyalet/İlçe" value={address.state} onChange={handleAddressChange} />    
                            <input type="text" name="zipCode" placeholder="Posta Kodu" value={address.zipCode} onChange={handleAddressChange} />    
                            <input type="text" name="country" placeholder="Ülke" value={address.country} onChange={handleAddressChange} />    
                        </div>    

                        {/* Kart Bilgileri */}    
                        <div className="checkout-card payment-card">    
                            <h3>Kart Bilgileri</h3>    
                            <input    
                                type="text"    
                                name="cardNumber"    
                                placeholder="Kart Numarası (16 hane)"    
                                maxLength="16"    
                                value={card.cardNumber}    
                                onChange={handleCardChange}    
                            />    
                            <input    
                                type="text"    
                                name="cardHolder"    
                                placeholder="Kart Sahibi"    
                                value={card.cardHolder}    
                                onChange={handleCardChange}    
                            />    
                            <input    
                                type="text"    
                                name="expiryDate"    
                                placeholder="Son Kullanma Tarihi (MM/YY)"    
                                value={card.expiryDate}    
                                onChange={handleCardChange}    
                            />    
                            <input    
                                type="text"    
                                name="cvv"    
                                placeholder="CVV (3 hane)"    
                                maxLength="3"    
                                value={card.cvv}    
                                onChange={handleCardChange}    
                            />    
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

            {/* Footer Bileşeni */}  
            <Footer />    
        </div>    
    );    
};    

export default Checkout;    