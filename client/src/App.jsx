import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login       from './pages/Login';
import AuthorLayout  from './pages/author/AuthorLayout';
import MyBooks       from './pages/author/MyBooks';
import SubmitTicket  from './pages/author/SubmitTicket';
import MyTickets     from './pages/author/MyTickets';
import TicketDetail  from './pages/author/TicketDetail';

import AdminLayout      from './pages/admin/AdminLayout';
import AdminDashboard   from './pages/admin/AdminDashboard';
import TicketQueue      from './pages/admin/TicketQueue';
import AdminTicketDetail from './pages/admin/AdminTicketDetail';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={<ProtectedRoute role="author"><AuthorLayout /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="books" replace />} />
            <Route path="books"         element={<MyBooks />} />
            <Route path="submit-ticket" element={<SubmitTicket />} />
            <Route path="tickets"       element={<MyTickets />} />
            <Route path="tickets/:id"   element={<TicketDetail />} />
          </Route>

          <Route
            path="/admin"
            element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"    element={<AdminDashboard />} />
            <Route path="tickets"      element={<TicketQueue />} />
            <Route path="tickets/:id"  element={<AdminTicketDetail />} />
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
