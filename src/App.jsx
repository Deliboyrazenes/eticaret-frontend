import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Component imports
import HomePage from './components/HomePage';
import ProductList from './components/ProductList';
import LoginPage from './components/LoginPage';
import CustomerLogin from "./components/CustomerLogin";
import SellerLogin from './components/SellerLogin';
import SellerDashboard from './components/SellerDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Authentication Routes */}
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        
        {/* Dashboard Routes */}
        <Route path="/customer-dashboard" element={<ProductList />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
