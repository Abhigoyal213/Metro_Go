import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PassengerBooking from './pages/PassengerBooking';
import BookingConfirmation from './pages/BookingConfirmation';
import AdminDashboard from './pages/AdminDashboard';
import NetworkStatus from './pages/NetworkStatus';
import Login from './pages/Login';
import ProtectedRoute from './components/layouts/ProtectedRoute';

function App() {
  useEffect(() => {
    // Initialize theme on app load
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PassengerBooking />} />
      <Route path="/status" element={<NetworkStatus />} />
      <Route path="/confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
