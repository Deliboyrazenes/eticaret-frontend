import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Component imports
import HomePage from './components/HomePage';
import ProductList from './components/ProductList';
import UserProfile from './components/UserProfile';
import LoginPage from './components/LoginPage';
import CustomerLogin from "./components/CustomerLogin";
import SellerLogin from './components/SellerLogin';
import SellerDashboard from './components/SellerDashboard';
import RegisterForm from './components/RegisterForm';
import ProductDetail from './components/ProductDetail';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import Cart from './components/Cart';
import Chatbot from './components/Chatbot/Chatbot'; // Chatbot component'i import edildi
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ChatbotWrapper component'i - route kontrolü için
const ChatbotWrapper = () => {
  const location = useLocation();
  
  // Chatbot'un görünmemesi gereken sayfalar
  const excludedPaths = [
    '/seller-login',
    '/seller-dashboard',
    '/customer-login',
    '/login',
    '/register'
  ];

  // Eğer mevcut sayfa excludedPaths içindeyse chatbot'u gösterme
  if (excludedPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  return <Chatbot />;
};

const App = () => {
  return (
    <Router>
      {/* Toast bildirimleri için container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Authentication Routes */}
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/profile" element={<UserProfile />} />

        {/* Cart Route */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/products/category/:categoryId" element={<ProductList />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Orders Route */}
        <Route path="/orders" element={<Orders />} />

        {/* Dashboard Routes */}
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/customer-dashboard" element={<ProductList />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
      </Routes>

      {/* Chatbot Wrapper */}
      <ChatbotWrapper />
    </Router>
  );
};

export default App;