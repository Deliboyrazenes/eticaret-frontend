import React, { useState, useEffect } from "react";
import "../SellerDashboard.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from './Modal';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [orderTab, setOrderTab] = useState('pending');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    brand: "",
  });
  const [categoryId, setCategoryId] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);

  const showToast = (message, type = 'info') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Modal'ı açmak için helper fonksiyon
  const openModal = (title, message, onConfirm) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  // Modal'ı kapatmak için helper fonksiyon
  const closeModal = () => {
    setModalConfig({
      ...modalConfig,
      isOpen: false,
    });
  };

  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const createHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // API Çağrıları
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/category", {
        headers: createHeaders()
      });
      if (!response.ok) throw new Error('Kategoriler yüklenemedi');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const fetchSellerInfo = async () => {
    try {
      const response = await fetch("http://localhost:8080/seller/info", {
        headers: createHeaders()
      });
      if (!response.ok) throw new Error('Satıcı bilgileri alınamadı');
      const data = await response.json();
      setSellerInfo(data);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const fetchOrders = async () => {
    try {
      const sellerId = sellerInfo?.id;
      if (!sellerId) return;

      const response = await fetch(`http://localhost:8080/orders/seller/${sellerId}`, {
        headers: createHeaders()
      });

      if (!response.ok) throw new Error('Siparişler yüklenemedi');

      const data = await response.json();

      // Gelen verileri kontrol et ve düzenle
      const formattedOrders = data.map(order => ({
        id: order.id,
        status: order.status || 'PENDING',
        orderDate: order.orderDate,
        amount: order.amount || 0,
        orderItems: order.orderItems.reduce((acc, item) => {
          const existingItem = acc.find(i => i.productId === item.product.id);
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            acc.push({
              productId: item.product.id,
              productName: item.product.name,
              quantity: item.quantity
            });
          }
          return acc;
        }, [])
      }));

      setOrders(formattedOrders);

      // Debug için konsola yazdır
      console.log('Düzenlenmiş sipariş verileri:', formattedOrders);
    } catch (error) {
      console.error('Sipariş yükleme hatası:', error);
      showToast(error.message, 'error');
      setOrders([]); // Hata durumunda boş array set et
    }
  };


  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/seller/products", {
        headers: createHeaders()
      });
      if (!response.ok) throw new Error('Ürünler yüklenemedi');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast(error.message, 'error');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sipariş Durumu Güncelleme
  const handleShipOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8080/orders/seller/update-status/${orderId}?newStatus=SHIPPED`, {
        method: 'PUT',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error('Sipariş durumu güncellenemedi');
      }

      const updatedOrder = await response.json();
      showToast('Sipariş başarıyla kargoya verildi', 'success');

      // Siparişleri yeniden yüklemeden önce, güncellenen siparişin durumunu yerel olarak güncelle
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          order.status = 'SHIPPED';
        }
        return order;
      });
      setOrders(updatedOrders);

      // "Kargoya Verilen Siparişler" sekmesine geç
      setOrderTab('shipped');

      // Siparişleri yeniden yükle
      fetchOrders();
    } catch (error) {
      console.error('Sipariş güncelleme hatası:', error);
      showToast(error.message, 'error');
    }
  };

  // CRUD İşlemleri
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageFileName = formData.imagePath; // Mevcut resim yolunu koru

      // Yeni dosya seçildiyse yükle
      if (selectedFile) {
        const formDataFile = new FormData();
        formDataFile.append('file', selectedFile);

        const uploadResponse = await fetch('http://localhost:8080/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: formDataFile
        });

        if (!uploadResponse.ok) {
          throw new Error('Dosya yüklenemedi');
        }

        imageFileName = await uploadResponse.text();
      }

      // Ürün verilerini hazırla
      const productData = {
        ...formData,
        imagePath: imageFileName
      };

      // Ürün kaydetme/güncelleme isteği
      const productResponse = await fetch(
        editingProductId
          ? `http://localhost:8080/product/update/${editingProductId}`
          : `http://localhost:8080/product/add/${categoryId}`,
        {
          method: editingProductId ? "PUT" : "POST",
          headers: {
            ...createHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        }
      );

      if (!productResponse.ok) {
        throw new Error(editingProductId ? 'Ürün güncellenemedi' : 'Ürün eklenemedi');
      }

      showToast(
        editingProductId ? 'Ürün başarıyla güncellendi' : 'Ürün başarıyla eklendi',
        'success'
      );

      // Form temizleme
      setFormData({ name: "", price: "", stock: "", brand: "", imagePath: "" });
      setSelectedFile(null);
      setPreviewUrl(null);
      setEditingProductId(null);
      fetchProducts();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = (productId) => {
    openModal(
      'Ürün Silme',
      'Bu ürünü silmek istediğinize emin misiniz?',
      async () => {
        try {
          const response = await fetch(`http://localhost:8080/product/delete/${productId}`, {
            method: "DELETE",
            headers: createHeaders()
          });

          if (!response.ok) throw new Error('Ürün silinemedi');

          showToast('Ürün başarıyla silindi', 'success');
          fetchProducts();
        } catch (error) {
          showToast(error.message, 'error');
        }
        closeModal();
      }
    );
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      brand: product.brand,
      imagePath: product.imagePath // Mevcut resim yolunu da form verilerine ekle
    });
    setCategoryId(product.categoryId);
    setEditingProductId(product.id);
    // Eğer ürünün resmi varsa önizleme göster
    if (product.imagePath) {
      setPreviewUrl(`http://localhost:8080/uploads/${product.imagePath}`);
    }
  };

  const handleLogout = () => {
    openModal(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        showToast('Başarıyla çıkış yapıldı', 'success');
        window.location.href = '/login';
        closeModal();
      }
    );
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      showToast('Lütfen önce giriş yapın', 'error');
      return;
    }
    fetchProducts();
    fetchSellerInfo();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (sellerInfo?.id) {
      fetchOrders();
    }
  }, [sellerInfo]);

  return (
    <div className="seller-dashboard-body">
      <ToastContainer />
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
      />
      <div className="header">
        <div className="header-left">
          <h1>Satıcı Paneli</h1>
        </div>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Ürünlerim
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Siparişler
          </button>
        </div>
        <div className="header-right">
          {sellerInfo && (
            <>
              <div className="seller-info">
                <span>HOŞGELDİN {sellerInfo.name}</span>
              </div>
              <button onClick={handleLogout} className="logout-button">
                Çıkış Yap
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="seller-dashboard">
          <div className="seller-panel">
            <h2>{editingProductId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <div>
                <label>Ürün Adı</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Fiyat</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Stok</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Marka</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="form-group">
                  <label>Ürün Fotoğrafı</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file-input"
                  />
                  {previewUrl && (
                    <div className="image-preview">
                      <img src={previewUrl} alt="Önizleme" />
                    </div>
                  )}
                </div>

              </div>
              <button type="submit">
                {editingProductId ? 'Ürünü Güncelle' : 'Ürün Ekle'}
              </button>
            </form>
          </div>

          <div className="product-list">
            {isLoading ? (
              <div className="no-products-text">Yükleniyor...</div>
            ) : products.length === 0 ? (
              <div className="no-products-text">Henüz ürün eklenmemiş.</div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="product-item">
                  <div className="product-image-container">
                    <img
                      src={product.imagePath
                        ? `http://localhost:8080/uploads/${product.imagePath}`
                        : `http://localhost:8080/uploads/default-image.jpeg`}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        console.log('Resim yükleme hatası:', product.imagePath);
                        e.target.src = 'http://localhost:8080/uploads/default-image.jpeg';
                      }}
                    />
                  </div>
                  <h4>{product.name}</h4>
                  <p>Fiyat: {product.price} TL</p>
                  <p>Stok: {product.stock}</p>
                  <p>Marka: {product.brand}</p>
                  <div className="product-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(product)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(product.id)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (

        <div className="seller-dashboard" style={{ flexDirection: 'column', padding: '0 2rem' }}>
          <div className="order-tabs" style={{ marginBottom: '2rem' }}>
            <button
              className={`order-tab ${orderTab === 'pending' ? 'active' : ''}`}
              onClick={() => setOrderTab('pending')}
              style={{
                backgroundColor: orderTab === 'pending' ? '#6366f1' : '#242830',
                color: orderTab === 'pending' ? 'white' : '#94a3b8',
                padding: '1.5rem',
                flex: 1,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}
            >
              Bekleyen Siparişler ({orders.filter(order => order.status === 'PENDING' && order.orderItems.some(item => item.quantity === 1)).length})
            </button>
            <button
              className={`order-tab ${orderTab === 'shipped' ? 'active' : ''}`}
              onClick={() => setOrderTab('shipped')}
              style={{
                backgroundColor: orderTab === 'shipped' ? '#6366f1' : '#242830',
                color: orderTab === 'shipped' ? 'white' : '#94a3b8',
                padding: '1.5rem',
                flex: 1,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}
            >
              Kargoya Verilen Siparişler ({orders.filter(order => order.status === 'PENDING' && order.orderItems.some(item => item.quantity === 0)).length})
            </button>

            <button
              className={`order-tab ${orderTab === 'completed' ? 'active' : ''}`}
              onClick={() => setOrderTab('completed')}
              style={{
                backgroundColor: orderTab === 'completed' ? '#6366f1' : '#242830',
                color: orderTab === 'completed' ? 'white' : '#94a3b8',
                padding: '1.5rem',
                flex: 1,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}
            >
              Tamamlanan Siparişler ({orders.filter(order => order.status === 'SHIPPED').length})
            </button>
          </div>

          <div className="product-list" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
            width: '100%'
          }}>
            {orders
              .filter(order =>
                orderTab === 'pending'
                  ? order.status === 'PENDING' && order.orderItems.some(item => item.quantity === 1)
                  : orderTab === 'shipped'
                    ? order.status === 'PENDING' && order.orderItems.some(item => item.quantity === 0)
                    : order.status === 'SHIPPED' && order.orderItems.some(item => item.quantity === 1)
              )
              .map(order => (
                <div key={order.id} className="product-item order-card" style={{
                  backgroundColor: '#242830',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="order-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#ffffff' }}>Sipariş #{order.id}</h4>
                      {order.customer && (
                        <p style={{
                          margin: '0.5rem 0 0 0',
                          color: '#94a3b8',
                          fontSize: '0.9rem'
                        }}>
                          Müşteri: {order.customer.firstName} {order.customer.lastName}
                        </p>
                      )}
                    </div>
                    <span className={`status-badge ${order.status.toLowerCase()}`} style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: order.status === 'PENDING'
                        ? 'rgba(252, 211, 77, 0.1)'
                        : 'rgba(52, 211, 153, 0.1)',
                      color: order.status === 'PENDING' ? '#fcd34d' : '#34d399',
                      border: order.status === 'PENDING'
                        ? '1px solid rgba(252, 211, 77, 0.2)'
                        : '1px solid rgba(52, 211, 153, 0.2)',
                      fontWeight: '600'
                    }}>
                      {order.status === 'PENDING' ? 'BEKLEMEDE' : 'TAMAMLANDI'}
                    </span>
                  </div>

                  <p style={{ color: '#94a3b8', margin: '0.5rem 0' }}>
                    Tarih: {new Date(order.orderDate).toLocaleDateString('tr-TR')}
                  </p>
                  <p style={{ color: '#94a3b8', margin: '0.5rem 0' }}>
                    Toplam: {order.amount.toLocaleString('tr-TR')} TL
                  </p>

                  <div className="order-items" style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <h5 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Sipariş Detayları</h5>
                    {order.orderItems.map(item => (
                      <div key={item.productId} className="order-item-detail" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0',
                        color: '#94a3b8'
                      }}>
                        <span>{item.productName}</span>
                        {item.quantity > 0 && (
                          <span>{item.quantity} adet</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {orderTab !== 'shipped' && order.status === 'PENDING' && (
                    <button
                      className="edit-button"
                      onClick={() => handleShipOrder(order.id)}
                      style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '0.75rem',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Siparişi Onayla
                    </button>
                  )}
                </div>
              ))}
            {orders.filter(order =>
              orderTab === 'pending'
                ? order.status === 'PENDING'
                : order.status === 'SHIPPED'
            ).length === 0 && (
                <div className="no-products-text" style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#94a3b8',
                  backgroundColor: '#242830',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {orderTab === 'pending' ? 'Bekleyen sipariş bulunmuyor.' : 'Tamamlanan sipariş bulunmuyor.'}
                </div>
              )}
          </div>
        </div>
      )}

      <div className="feature-cards">
        <div className="feature-card">
          <h3>Toplam Ürün</h3>
          <p>{products.length}</p>
        </div>
        <div className="feature-card">
          <h3>Bekleyen Siparişler</h3>
          <p>{orders.filter(order => order.status === 'PENDING').length}</p>
        </div>
        <div className="feature-card">
          <h3>Tamamlanan Siparişler</h3>
          <p>{orders.filter(order => order.status === 'SHIPPED').length}</p>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;