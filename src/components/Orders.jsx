import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Menu from './Menu';
import '../Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

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

    if (loading) {
        return <div className="loading-spinner">Siparişler Yükleniyor...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="empty-orders">
                <h2>Henüz Siparişiniz Yok</h2>
                <p>Alışveriş yapmak için ürünlerimize göz atabilirsiniz.</p>
                <button onClick={() => navigate('/products')} className="btn-primary">
                    Alışverişe Başla
                </button>
            </div>
        );
    }

    return (
        <div className="orders-fullscreen">
            <Menu />
            <div className="orders-header">
                <h1>Siparişlerim</h1>
                <div className="atlas-accent"></div>
                <p>Sipariş geçmişinizi buradan görüntüleyebilirsiniz.</p>
            </div>

            <div className="orders-grid">
                {orders.map((order) => (
                    <div key={order.id} className="order-card">
                        <div className="order-card-header">
                            <h3>Sipariş #{order.id}</h3>
                            <p className={`order-status ${order.status ? order.status.toLowerCase() : 'unknown'}`}>
                                {order.status || 'HAZIRLANIYOR'}
                            </p>
                        </div>
                        <div className="order-details">
                            <p><strong>Tarih:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                            <p><strong>Toplam Tutar:</strong> {order.amount} TL</p>
                        </div>
                        <div className="order-items">
                            <h4>Ürünler:</h4>
                            <ul>
                                {groupOrderItems(order.orderItems).map((item) => (
                                    <li key={`${item.product.id}-${item.quantity}`}>
                                        {item.product.name} {item.quantity > 1 ? `(${item.quantity} adet)` : ''}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};

export default Orders;
