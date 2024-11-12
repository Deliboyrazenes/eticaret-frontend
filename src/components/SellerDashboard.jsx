import React, { useState, useEffect } from "react";
import "../SellerDashboard.css";

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    brand: "",
  });
  const [categoryId, setCategoryId] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);

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
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setError('Lütfen önce giriş yapın');
      setIsLoading(false);
      return;
    }
    fetchProducts();
  }, []);

  // Ürün ekleme isteği
  const addProduct = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Oturum açmanız gerekiyor!');
      }

      const response = await fetch(`http://localhost:8080/product/add/${categoryId}`, {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      }

      if (!response.ok) {
        throw new Error('Ürün eklenirken bir hata oluştu');
      }

      alert("Ürün başarıyla eklendi");
      fetchProducts();
      setFormData({ name: "", price: "", stock: "", brand: "" });
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // Ürün güncelleme isteği
  const updateProduct = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Oturum açmanız gerekiyor!');
      }

      const response = await fetch(`http://localhost:8080/product/update/${editingProductId}`, {
        method: "PUT",
        headers: createHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      }

      if (!response.ok) {
        throw new Error('Ürün güncellenirken bir hata oluştu');
      }

      alert("Ürün başarıyla güncellendi");
      fetchProducts();
      setFormData({ name: "", price: "", stock: "", brand: "" });
      setEditingProductId(null);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // Ürün silme isteği
  const deleteProduct = async (productId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Oturum açmanız gerekiyor!');
      }

      const response = await fetch(`http://localhost:8080/product/delete/${productId}`, {
        method: "DELETE",
        headers: createHeaders()
      });

      if (response.status === 401) {
        throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      }

      if (!response.ok) {
        throw new Error('Ürün silinirken bir hata oluştu');
      }

      alert("Ürün başarıyla silindi");
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
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
    <div className="seller-dashboard">
      {/* Satıcı Paneli Sol Taraf */}
      <div className="seller-panel">
        <h2>Satıcı Paneli</h2>
        <form onSubmit={handleSubmit} className="product-form">
          {/* Form içeriği aynı kalacak */}
          {/* ... */}
        </form>
      </div>

      {/* Ürün Listesi Sağ Taraf */}
      <div className="product-list">
        {isLoading ? (
          <p>Yükleniyor...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : products.length === 0 ? (
          <p className="no-products-text">Henüz ürün eklenmemiş.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-item">
              {/* Ürün kartı içeriği aynı kalacak */}
              {/* ... */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;