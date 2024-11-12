import React, { useState, useEffect } from "react";
import "../SellerDashboard.css";

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    brand: "",
  });
  const [categoryId, setCategoryId] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);

  // Ürünleri API'den al
  const fetchProducts = async () => {
    const response = await fetch("http://localhost:8080/product");
    const data = await response.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Form verilerini değiştir
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Ürün ekleme isteği
  const addProduct = async () => {
    try {
      const response = await fetch(`http://localhost:8080/product/add/${categoryId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Ürün başarıyla eklendi");
        fetchProducts();
        setFormData({ name: "", price: "", stock: "", brand: "" });
      } else {
        alert("Ürün eklenirken hata oluştu");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Ürün güncelleme isteği
  const updateProduct = async () => {
    try {
      const response = await fetch(`http://localhost:8080/product/update/${editingProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Ürün başarıyla güncellendi");
        fetchProducts();
        setFormData({ name: "", price: "", stock: "", brand: "" });
        setEditingProductId(null);
      } else {
        alert("Ürün güncellenirken hata oluştu");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Ürün silme isteği
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8080/product/delete/${productId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Ürün başarıyla silindi");
        fetchProducts();
      } else {
        alert("Ürün silinirken hata oluştu");
      }
    } catch (error) {
      console.error(error);
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

  return (
    <div className="seller-dashboard">
      {/* Satıcı Paneli Sol Taraf */}
      <div className="seller-panel">
        <h2>Satıcı Paneli</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div>
            <label>Ürün Adı:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Fiyat:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Stok:</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Marka:</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Kategori:</label>
            <select
              name="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Kategori Seçin</option>
              {/* Kategoriler burada listelenecek */}
            </select>
          </div>
          <button type="submit" className="submit-button">
            {editingProductId ? "Güncelle" : "Ekle"}
          </button>
        </form>
      </div>

      {/* Ürün Listesi Sağ Taraf */}
      <div className="product-list">
        {products.length === 0 ? (
          <p className="no-products-text">Henüz ürün eklenmemiş.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-item">
              <div>
                <h4>{product.name}</h4>
                <p>Fiyat: {product.price} TL</p>
                <p>Stok: {product.stock}</p>
                <p>Marka: {product.brand}</p>
              </div>
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
  );
};

export default SellerDashboard;
