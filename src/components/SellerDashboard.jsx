import React, { useState, useEffect } from "react";
import "../SellerDashboard.css";
import "../Modal.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from './Modal';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
   const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    brand: "",
  });
  const [categoryId, setCategoryId] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmAction, setModalConfirmAction] = useState(() => () => { });

  // Toast mesajları için yardımcı fonksiyon
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

  // Token'ı al
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Headers oluştur
  const createHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Kategorileri API'den çek  
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/category", {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error('Kategoriler yüklenirken bir hata oluştu.');
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
      showToast(error.message, 'error');
    }
  };

  // Satıcı bilgilerini al
  const fetchSellerInfo = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        showToast('Oturum açmanız gerekiyor!', 'error');
        return;
      }

      const response = await fetch("http://localhost:8080/seller/info", {
        method: 'GET',
        headers: createHeaders()
      });

      if (!response.ok) {
        showToast('Satıcı bilgileri alınamadı', 'error');
        return;
      }

      const data = await response.json();
      setSellerInfo(data);
    } catch (error) {
      console.error("Satıcı bilgileri yüklenirken hata:", error);
      showToast(error.message, 'error');
    }
  };

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    setModalTitle('Çıkış Yap');
    setModalMessage('Çıkış yapmak istediğinize emin misiniz?');
    setModalConfirmAction(() => () => {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      showToast('Başarıyla çıkış yapıldı', 'success');
      window.location.href = '/login';
    });
    setIsModalOpen(true);
  };

  // Ürünleri API'den al
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Oturum açmanız gerekiyor!');
      }

      const response = await fetch("http://localhost:8080/seller/products", {
        method: 'GET',
        headers: createHeaders()
      });

      if (response.status === 401) {
        throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      }

      if (response.status === 403) {
        throw new Error('Bu işlem için yetkiniz bulunmuyor.');
      }

      if (!response.ok) {
        throw new Error(`Sunucu hatası: ${response.status}`);
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ürünler yüklenirken hata:", error);
      setError(error.message);
      showToast(error.message, 'error');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('Lütfen önce giriş yapın');
      showToast('Lütfen önce giriş yapın', 'error');
      setIsLoading(false);
      return;
    }
    fetchProducts();
    fetchSellerInfo();
    fetchCategories();
  }, []);

  // Ürün ekleme isteği
  const addProduct = async () => {
    setModalTitle('Yeni Ürün Ekle');
    setModalMessage('Yeni ürünü eklemek istediğinize emin misiniz?');
    setModalConfirmAction(() => async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          showToast('Oturum açmanız gerekiyor!', 'error');
          return;
        }

        const response = await fetch(`http://localhost:8080/product/add/${categoryId}`, {
          method: "POST",
          headers: createHeaders(),
          body: JSON.stringify(formData),
        });

        if (response.status === 401) {
          showToast('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error');
          return;
        }

        if (!response.ok) {
          showToast('Ürün eklenirken bir hata oluştu', 'error');
          return;
        }

        showToast('Ürün başarıyla eklendi', 'success');
        fetchProducts();
        setFormData({ name: "", price: "", stock: "", brand: "" });
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
        showToast(error.message, 'error');
      }
    });
    setIsModalOpen(true);
  };

  // Ürün güncelleme isteği
  const updateProduct = async () => {
    setModalTitle('Ürün Düzenle');
    setModalMessage('Ürünü güncellemek istediğinize emin misiniz?');
    setModalConfirmAction(() => async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          showToast('Oturum açmanız gerekiyor!', 'error');
          return;
        }

        const response = await fetch(`http://localhost:8080/product/update/${editingProductId}`, {
          method: "PUT",
          headers: createHeaders(),
          body: JSON.stringify(formData),
        });

        if (response.status === 401) {
          showToast('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error');
          return;
        }

        if (!response.ok) {
          showToast('Ürün güncellenirken bir hata oluştu', 'error');
          return;
        }

        showToast('Ürün başarıyla güncellendi', 'success');
        fetchProducts();
        setFormData({ name: "", price: "", stock: "", brand: "" });
        setEditingProductId(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
        showToast(error.message, 'error');
      }
    });
    setIsModalOpen(true);
  };

  // Ürün silme isteği
  const deleteProduct = (productId) => {
    setModalTitle('Ürün Sil');
    setModalMessage('Ürünü silmek istediğinize emin misiniz?');
    setModalConfirmAction(() => async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          showToast('Oturum açmanız gerekiyor!', 'error');
          return;
        }

        const response = await fetch(`http://localhost:8080/product/delete/${productId}`, {
          method: "DELETE",
          headers: createHeaders()
        });

        if (response.status === 401) {
          showToast('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', 'error');
          return;
        }

        if (!response.ok) {
          showToast('Ürün silinirken bir hata oluştu', 'error');
          return;
        }

        showToast('Ürün başarıyla silindi', 'success');
        fetchProducts();
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
        showToast(error.message, 'error');
      }
    });
    setIsModalOpen(true);

  };

  // Form gönderimi
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProductId) {
      updateProduct();
    } else {
      addProduct();
    }
  };

  // Form verilerini değiştir
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Ürün düzenleme
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      brand: product.brand,
    });
    setCategoryId(product.category?.id || "");
    setEditingProductId(product.id);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="seller-dashboard-body">
      <ToastContainer />
      <div className="header">
        <div className="header-left">
          <h1>Satıcı Paneli</h1>
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

      <div className="seller-dashboard">
        {/* Sol Panel */}
        <div className="seller-panel">
          <h2>{editingProductId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div>
              <label>Ürün Adı</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label>Fiyat</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label>Stok</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label>Marka</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
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
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <button type="submit">
              {editingProductId ? 'Ürünü Güncelle' : 'Ürün Ekle'}
            </button>
          </form>
        </div>

        {/* Sağ Panel - Ürün Listesi */}
        <div className="product-list">
          {isLoading ? (
            <div className="no-products-text">Yükleniyor...</div>
          ) : error ? (
            <div className="no-products-text">{error}</div>
          ) : products.length === 0 ? (
            <div className="no-products-text">Henüz ürün eklenmemiş.</div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="product-item">
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
                    onClick={() => deleteProduct(product.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="feature-cards">
        <div className="feature-card">
          <h3>Toplam Ürün</h3>
          <p>{products.length}</p>
        </div>
        <div className="feature-card">
          <h3>Aktif Satışlar</h3>
          <p>0</p>
        </div>
        <div className="feature-card">
          <h3>Toplam Kazanç</h3>
          <p>0 TL</p>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        onConfirm={modalConfirmAction}
      />
    </div>
  );
};

export default SellerDashboard;