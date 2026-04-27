import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Rooms from './pages/Rooms.jsx';
import BookingDetails from './pages/BookingDetails.jsx';
import Profile from './pages/Profile.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminRooms from './pages/AdminRooms.jsx';
import AdminBookings from './pages/AdminBookings.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminLogin />} />
        <Route
          path="bookings"
          element={
            <AdminProtectedRoute>
              <AdminBookings />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="rooms"
          element={
            <AdminProtectedRoute>
              <AdminRooms />
            </AdminProtectedRoute>
          }
        />
      </Route>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route
          path="/book/:roomId"
          element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
