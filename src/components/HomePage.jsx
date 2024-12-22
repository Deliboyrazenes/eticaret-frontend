import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
    FiArrowRight,
    FiShoppingBag,
    FiHeart,
    FiTruck,
    FiPackage,
    FiShield,
    FiGrid,
    FiChevronRight
} from "react-icons/fi";
import Navbar from "./Menu";
import Footer from "./Footer";
import menBanner from '../assets/men-banner.jpg';
import womenBanner from '../assets/women-banner.jpg';
import "../HomePage.css";

const HomePage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({
        id: null,
        grandTotal: 0,
        customer: {},
        products: [],
    });
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [groupedProducts, setGroupedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
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

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            };

            const [categoriesRes, productsRes] = await Promise.all([
                axios.get("http://localhost:8080/category", { headers }),
                axios.get("http://localhost:8080/product", { headers })
            ]);

            setCategories(categoriesRes.data);
            setProducts(Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.content);
            setLoading(false);
        } catch (error) {
            console.error("Veri çekme hatası:", error);
            setLoading(false);
        }
    };

    const categoryFeatures = [
        {
            icon: <FiShoppingBag />,
            title: "Premium Ürünler",
            desc: "Özel seçilmiş koleksiyonlar"
        },
        {
            icon: <FiTruck />,
            title: "Hızlı Teslimat",
            desc: "Aynı gün kargo imkanı"
        },
        {
            icon: <FiShield />,
            title: "Güvenli Alışveriş",
            desc: "256-bit SSL güvenliği"
        }
    ];

    // Kategoriler için animasyon varyantları
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="hp-homepage">
            <Navbar />

            <div className="hp-gradient-bg">
                <div className="hp-gradient-circle-1"></div>
                <div className="hp-gradient-circle-2"></div>
            </div>

            <section className="hp-fullscreen-categories">
                <div className="hp-category-slide" onClick={() => navigate('/products/category/5')}>
                    <div
                        className="hp-category-background"
                        style={{ backgroundImage: `url(${menBanner})` }}
                    />
                    <div className="hp-category-overlay" />
                    <div className="hp-slide-content">
                        <h2>ERKEK</h2>
                        <p>Yeni Sezon Koleksiyonu</p>
                        <div className="hp-button-container">
                            <button className="hp-slide-button">
                                Keşfet
                                <FiArrowRight />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="hp-category-slide" onClick={() => navigate('/products/category/4')}>
                    <div
                        className="hp-category-background"
                        style={{ backgroundImage: `url(${womenBanner})` }}
                    />
                    <div className="hp-category-overlay" />
                    <div className="hp-slide-content">
                        <h2>KADIN</h2>
                        <p>Yeni Sezon Koleksiyonu</p>
                        <div className="hp-button-container">
                            <button className="hp-slide-button">
                                Keşfet
                                <FiArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="hp-hero">
                <div className="hp-hero-content">
                    <motion.span
                        className="hp-hero-badge"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        2024 KOLEKSİYONU
                    </motion.span>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hp-gradient-text"
                    >
                        Yeni Nesil Alışveriş Deneyimi
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Özel tasarımlar ve benzersiz ürünlerle tarzınızı yansıtın
                    </motion.p>

                    <motion.div
                        className="hp-hero-buttons"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <Link to="/products" className="hp-primary-button">
                            Ürünleri Keşfet
                            <FiArrowRight className="hp-button-icon" />
                        </Link>
                    </motion.div>
                </div>

                {/* Kategoriler Bölümü */}
                <motion.div
                    className="hp-categories-section"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <h2 className="hp-section-title">Kategoriler</h2>
                    <div className="hp-categories-grid">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                className="hp-category-item"
                                variants={itemVariants}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/products/category/${category.id}`)}
                            >
                                <div className="hp-category-icon">
                                    <FiGrid />
                                </div>
                                <div className="hp-category-content">
                                    <h3>{category.name}</h3>
                                    <FiChevronRight className="hp-category-arrow" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    className="hp-categories"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    {categoryFeatures.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="hp-category-card"
                            whileHover={{ y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="hp-card-content">
                                <div className="hp-card-icon">
                                    {feature.icon}
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Trending Products */}
                <motion.div
                    className="hp-trending-products"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    <h2 className="hp-section-title">Öne Çıkan Ürünler</h2>
                    <div className="hp-products-grid">
                        {products.slice(0, 4).map((product, index) => (
                            <motion.div
                                key={product.id}
                                className="hp-product-card"
                                whileHover={{ y: -10 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                <div className="hp-product-image">
                                    <img
                                        src={`http://localhost:8080/uploads/${product.imagePath}`}
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = 'http://localhost:8080/uploads/default-image.jpeg';
                                        }}
                                    />
                                    <div className="hp-product-overlay">
                                        <button className="hp-add-to-cart">
                                            <FiShoppingBag />
                                            Ürünü İncele
                                        </button>
                                    </div>
                                </div>
                                <div className="hp-product-info">
                                    <h3>{product.name}</h3>
                                    <p className="hp-price">{product.price} TL</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            <Footer />
        </div>
    );
};

export default HomePage;