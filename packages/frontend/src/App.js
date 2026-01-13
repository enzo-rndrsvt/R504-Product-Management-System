import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserList from './pages/UserList';
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import Navigation from './components/Navigation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));

  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const refreshAuth = React.useCallback(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50">
        {isAuthenticated && <Navigation onLogout={refreshAuth} />}
        <main className={isAuthenticated ? 'container-base' : ''}>
          <Routes>
            <Route path="/login" element={<Login onLogin={refreshAuth} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route
              path="/"
              element={isAuthenticated ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
