import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Menu from './Menu';
import { motion } from 'framer-motion';
import { FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'active' veya 'completed'
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusText = (status) => {
        const statusMap = {
            'PENDING': 'BEKLEMEDE',
            'SHIPPED': 'KARGOYA VERİLDİ',
            'DELIVERED': 'TESLİM EDİLDİ',
            'CANCELLED': 'İPTAL EDİLDİ'
        };
        return statusMap[status] || 'BEKLEMEDE';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <FaBox />;
            case 'SHIPPED':
                return <FaShippingFast />;
            case 'DELIVERED':
                return <FaCheckCircle />;
            case 'CANCELLED':
                return <FaTimesCircle />;
            default:
                return <FaBox />;
        }
    };

    const getStatusClass = (status) => {
        const statusClassMap = {
            'PENDING': 'order-tracking__status-pending',
            'SHIPPED': 'order-tracking__status-shipped',
            'DELIVERED': 'order-tracking__status-delivered',
            'CANCELLED': 'order-tracking__status-cancelled'
        };
        return statusClassMap[status] || 'order-tracking__status-pending';
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Lütfen önce giriş yapın');
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:8080/orders', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setOrders(response.data);
        } catch (error) {
            toast.error('Siparişler alınırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const groupOrderItems = (orderItems) => {
        const grouped = {};
        orderItems.forEach((item) => {
            if (grouped[item.product.id]) {
                grouped[item.product.id].quantity += item.quantity;
            } else {
                grouped[item.product.id] = { ...item, quantity: item.quantity };
            }
        });
        return Object.values(grouped);
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    const filterOrders = (orders) => {
        if (activeTab === 'active') {
            // Sadece PENDING (bekleyen) siparişleri göster
            return orders.filter(order => order.status === 'PENDING');
        } else {
            return orders.filter(order => 
                order.status === 'SHIPPED' || 
                order.status === 'DELIVERED' || 
                order.status === 'CANCELLED'
            );
        }
    };

    if (loading) {
        return (
            <div className="order-tracking__loading-container">
                <div className="order-tracking__loading-spinner"></div>
                <p>Siparişleriniz Yükleniyor...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="order-tracking__empty-container"
            >
                <div className="order-tracking__empty-content">
                    <img src="/empty-cart.svg" alt="Boş Siparişler" />
                    <h2>Henüz Siparişiniz Bulunmuyor</h2>
                    <p>Hemen alışverişe başlayarak siparişlerinizi buradan takip edebilirsiniz.</p>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/products')} 
                        className="order-tracking__shop-button"
                    >
                        Alışverişe Başla
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    const filteredOrders = filterOrders(orders);

    return (
        <div className="order-tracking__page">
            <Menu />
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="order-tracking__container"
            >
                <div className="order-tracking__header">
                    <h1>Siparişlerim</h1>
                    <div className="order-tracking__header-underline"></div>
                    <p>Tüm siparişlerinizi buradan takip edebilirsiniz</p>
                </div>

                <div className="order-tracking__tabs">
                    <button 
                        className={`order-tracking__tab-button ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Aktif Siparişler
                    </button>
                    <button 
                        className={`order-tracking__tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Tamamlanan Siparişler
                    </button>
                </div>

                <div className="order-tracking__grid">
                    {filteredOrders.map((order) => (
                        <motion.div
                            key={order.id}
                            whileHover={{ scale: 1.02 }}
                            className="order-tracking__card"
                        >
                            <div className="order-tracking__card-header">
                                <div className="order-tracking__info">
                                    <div className={`order-tracking__badge ${getStatusClass(order.status)}`}>
                                        <span className="order-tracking__status-icon">{getStatusIcon(order.status)}</span>
                                        <span className="order-tracking__status-text">{getStatusText(order.status)}</span>
                                    </div>
                                </div>
                                <div className="order-tracking__date">
                                    {formatDate(order.orderDate)}
                                </div>
                            </div>

                            <div className="order-tracking__content">
                                <div className="order-tracking__items-list">
                                    {groupOrderItems(order.orderItems).map((item) => (
                                        <motion.div 
                                            key={`${item.product.id}-${item.quantity}`} 
                                            className="order-tracking__item"
                                        >
                                            <div className="order-tracking__item-details">
                                                <h4>{item.product.name}</h4>
                                                <div className="order-tracking__item-meta">
                                                    <p className="order-tracking__item-quantity">
                                                        {item.quantity} adet
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="order-tracking__summary">
                                    <div className="order-tracking__total">
                                        <span>Toplam Tutar</span>
                                        <strong>{order.amount.toLocaleString('tr-TR')} TL</strong>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
            <Footer />
        </div>
    );
};

export default Orders;