import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    FiMessageSquare, 
    FiX, 
    FiMinimize2, 
    FiMaximize2, 
    FiSearch,
    FiShoppingBag,
    FiArrowLeft,
    FiSend,
    FiLoader,
    FiPackage,
    FiShoppingCart,
    FiHelpCircle,
    FiPhone,
    FiMail,
    FiClock,
    FiTruck,
    FiCreditCard,
    FiRefreshCcw
} from 'react-icons/fi';
import './Chatbot.css';

const chatbotResponses = {
    start: {
        message: "Merhaba! 👋 Atlas'a hoş geldiniz. Size nasıl yardımcı olabilirim?",
        options: [
            { text: "Ürün Ara", icon: <FiSearch />, next: "search" },
            { text: "Siparişlerim", icon: <FiPackage />, next: "orders" },
            { text: "Sepetim", icon: <FiShoppingCart />, next: "cart" },
            { text: "Yardım", icon: <FiHelpCircle />, next: "help" }
        ]
    },
    search: {
        message: "Ne aramak istersiniz?",
        options: [
            { text: "Ürün Ara", icon: <FiSearch />, action: "startSearch" },
            { text: "Kategoriler", icon: <FiShoppingBag />, next: "categories" },
            { text: "Ana Menü", icon: <FiArrowLeft />, next: "start" }
        ]
    },
    orders: {
        message: "Siparişlerinizle ilgili ne yapmak istersiniz?",
        options: [
            { text: "Son Sipariş", icon: <FiPackage />, action: "/orders" },
            { text: "Tüm Siparişler", icon: <FiShoppingBag />, action: "/orders" },
            { text: "Ana Menü", icon: <FiArrowLeft />, next: "start" }
        ]
    },
    cart: {
        message: "Sepetinizle ilgili ne yapmak istersiniz?",
        options: [
            { text: "Sepeti Görüntüle", icon: <FiShoppingCart />, action: "/cart" },
            { text: "Ödeme Yap", icon: <FiCreditCard />, action: "/checkout" },
            { text: "Ana Menü", icon: <FiArrowLeft />, next: "start" }
        ]
    },
    help: {
        message: "Size nasıl yardımcı olabilirim?",
        options: [
            { text: "İletişim", icon: <FiPhone />, next: "contact" },
            { text: "SSS", icon: <FiHelpCircle />, next: "faq" },
            { text: "İade", icon: <FiRefreshCcw />, next: "returns" },
            { text: "Ana Menü", icon: <FiArrowLeft />, next: "start" }
        ]
    },
    contact: {
        message: "Bize ulaşabileceğiniz kanallar:",
        options: [
            { text: "Telefon", icon: <FiPhone />, action: "tel:08501234567" },
            { text: "E-posta", icon: <FiMail />, action: "mailto:info@atlas.com" },
            { text: "Ana Menü", icon: <FiArrowLeft />, next: "start" }
        ]
    },
    faq: {
        message: "Sıkça sorulan sorular:",
        options: [
            { text: "Kargo", icon: <FiTruck />, next: "shipping" },
            { text: "Ödeme", icon: <FiCreditCard />, next: "payment" },
            { text: "Ana Menü", icon: <FiArrowLeft />, next: "start" }
        ]
    }
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const [currentOptions, setCurrentOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [categories, setCategories] = useState([]);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8080/category');
                if (response.data) {
                    setCategories(response.data.sort((a, b) => a.name.localeCompare(b.name)));
                }
            } catch (error) {
                console.error("Kategoriler yüklenirken hata:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (isOpen) {
            addMessage(chatbotResponses.start.message, false);
            setCurrentOptions(chatbotResponses.start.options);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const addMessage = (message, isUser) => {
        setMessages(prev => [...prev, { 
            text: message, 
            isUser, 
            timestamp: new Date() 
        }]);
    };

    const handleSearch = async (value) => {
        if (value.length >= 2) {
            setIsSearching(true);
            try {
                const response = await axios.get(`http://localhost:8080/product/search?keyword=${value}`);
                setSearchResults(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Arama hatası:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleProductClick = (product) => {
        addMessage(`"${product.name}" ürününe gidiliyor...`, true);
        setTimeout(() => {
            navigate(`/product/${product.id}`);
            setIsSearchMode(false);
            setSearchResults([]);
            setSearchTerm('');
        }, 1000);
    };

    const handleCategorySelect = (category) => {
        addMessage(`${category.name} kategorisine gidiliyor...`, true);
        setTimeout(() => {
            navigate(`/products/category/${category.id}`);
        }, 1000);
    };

    const handleOption = (option) => {
        addMessage(option.text, true);

        if (option.action === "startSearch") {
            setIsSearchMode(true);
            addMessage("Hangi ürünü arıyorsunuz?", false);
            return;
        }

        if (option.action && typeof option.action === 'string') {
            if (option.action.startsWith('tel:') || option.action.startsWith('mailto:')) {
                window.location.href = option.action;
            } else {
                navigate(option.action);
            }
            return;
        }

        const nextState = chatbotResponses[option.next];
        if (nextState) {
            addMessage(nextState.message, false);
            if (option.next === "categories") {
                setCurrentOptions([
                    ...categories.map(cat => ({
                        text: cat.name,
                        icon: <FiShoppingBag />,
                        action: () => handleCategorySelect(cat)
                    })),
                    { text: "Ana Menü", icon: <FiArrowLeft />, next: "start" }
                ]);
            } else {
                setCurrentOptions(nextState.options || []);
            }
        }
    };

    const renderSearchMode = () => (
        <div className="chat-search-mode">
            <div className="chat-search-input">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleSearch(e.target.value);
                    }}
                    placeholder="Ürün ara..."
                />
                <button onClick={() => {
                    setIsSearchMode(false);
                    setSearchTerm('');
                    setSearchResults([]);
                }}>
                    <FiArrowLeft />
                </button>
            </div>
            
            <div className="chat-search-results">
                {isSearching ? (
                    <div className="chat-search-loading">
                        <FiLoader className="spinning" />
                        <span>Aranıyor...</span>
                    </div>
                ) : searchResults.length > 0 ? (
                    searchResults.map(product => (
                        <div
                            key={product.id}
                            className="chat-search-result-item"
                            onClick={() => handleProductClick(product)}
                        >
                            <img
                                src={`http://localhost:8080/uploads/${product.imagePath?.split(',')[0]}`}
                                alt={product.name}
                                onError={(e) => {
                                    e.target.src = 'http://localhost:8080/uploads/default-image.jpeg';
                                }}
                            />
                            <div className="chat-search-result-info">
                                <h4>{product.name}</h4>
                                <p>{product.price.toLocaleString('tr-TR', {
                                    style: 'currency',
                                    currency: 'TRY'
                                })}</p>
                            </div>
                        </div>
                    ))
                ) : searchTerm.length >= 2 ? (
                    <div className="chat-search-no-results">
                        Sonuç bulunamadı
                    </div>
                ) : null}
            </div>
        </div>
    );

    if (location.pathname.includes('/admin') || location.pathname.includes('/seller')) {
        return null;
    }

    return (
        <>
            {!isOpen && (
                <div className="chat-bubble" onClick={() => setIsOpen(true)}>
                    <div className="chat-bubble-icon">
                        <FiMessageSquare />
                    </div>
                    <div className="chat-bubble-pulse"></div>
                </div>
            )}

            <div className={`chat-container ${isOpen ? 'open' : ''} ${isMinimized ? 'minimized' : ''}`}>
                <div className="chat-header">
                    <div className="chat-header-title">
                        <div className="chat-avatar">A</div>
                        <div className="chat-header-info">
                            <span className="chat-header-name">Atlas Asistan</span>
                            <span className="chat-header-status">Online</span>
                        </div>
                    </div>
                    <div className="chat-header-buttons">
                        <button 
                            className="header-button"
                            onClick={() => setIsMinimized(!isMinimized)}
                        >
                            {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
                        </button>
                        <button 
                            className="header-button"
                            onClick={() => setIsOpen(false)}
                        >
                            <FiX />
                        </button>
                    </div>
                </div>
                
                <div className="chat-content">
                    {isSearchMode ? (
                        renderSearchMode()
                    ) : (
                        <>
                            <div className="chat-messages">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}
                                    >
                                        {!msg.isUser && (
                                            <div className="bot-avatar">A</div>
                                        )}
                                        <div className="message-bubble">
                                            <div className="message-content">{msg.text}</div>
                                            <div className="message-timestamp">
                                                {msg.timestamp.toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input">
                                <div className="options-grid">
                                    {currentOptions.map((option, index) => (
                                        <button
                                            key={index}
                                            className="option-card"
                                            onClick={() => handleOption(option)}
                                        >
                                            <span className="option-icon">
                                                {option.icon}
                                            </span>
                                            <span className="option-text">
                                                {option.text}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Chatbot;