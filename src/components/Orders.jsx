import React, { useEffect, useState } from 'react';  
import axios from 'axios';  
import { toast } from 'react-toastify';  

const Orders = () => {  
  const [orders, setOrders] = useState([]);  
  const [loading, setLoading] = useState(true); // Yükleniyor durumu  

  useEffect(() => {  
    fetchOrders();  
  }, []);  

  const fetchOrders = async () => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      toast.error('Müşteri ID bulunamadı. Lütfen giriş yapın.');
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:8080/orders?customerId=${customerId}`);
      setOrders(response.data);
    } catch (error) {
      toast.error('Siparişler alınırken bir hata oluştu.');
    }
  };
  

  if (loading) {  
    return <div>Yükleniyor...</div>; // Yükleniyor durumu  
  }  

  return (
    <div>
      <h1>Siparişlerim</h1>
      {orders.length === 0 ? (
        <p>Henüz bir siparişiniz bulunmamaktadır.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id}>
            <p>Order ID: {order.id}</p>
            <p>Amount: {order.amount} TL</p>
            <p>Order Date: {order.orderDate}</p>
          </div>
        ))
      )}
    </div>
  );
  
};  

export default Orders;  