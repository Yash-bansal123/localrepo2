import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initClientSocket, disconnectClientSocket } from '../../services/socket';

const navItems = [
  { to: '/dashboard/books', label: 'My Books', icon: '📚' },
  { to: '/dashboard/submit-ticket', label: 'Submit Query', icon: '✉️' },
  { to: '/dashboard/tickets', label: 'My Tickets', icon: '🎫' },
];

export default function AuthorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const socket = initClientSocket();

    if (socket) {
      const handleTicketUpdated = (data) => {
        const text = data.lastMessage
          ? `New reply on your ticket: "${data.lastMessage.slice(0, 40)}..."`
          : `Ticket status updated to ${data.status}`;
        setToastMessage(text);
        setTimeout(() => setToastMessage(null), 5000);

        window.dispatchEvent(new CustomEvent('bookleaf:ticket_updated', { detail: data }));
      };

      socket.on('ticket_updated', handleTicketUpdated);

      return () => {
        socket.off('ticket_updated', handleTicketUpdated);
      };
    }
  }, []);

  const handleLogout = () => {
    disconnectClientSocket();
    logout();
    navigate('/login');
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-teal-700 text-white'
                : 'text-teal-100 hover:bg-teal-700/60 hover:text-white'
            }`
          }
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-teal-100 hover:bg-red-600/80 hover:text-white transition-colors mt-4"
      >
        <span className="text-lg">🚪</span>
        Logout
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg bg-teal-800 text-white text-sm font-medium border border-teal-600 animate-bounce">
          <span>🔔</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-teal-300 hover:text-white">✕</button>
        </div>
      )}

      <aside className="hidden lg:flex flex-col w-64 bg-teal-800 text-white fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 border-b border-teal-700">
          <h1 className="text-xl font-bold tracking-tight">🍃 BookLeaf</h1>
          <p className="text-teal-300 text-xs mt-1">Author Portal</p>
        </div>

        <div className="px-4 py-4 border-b border-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-teal-300 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <NavLinks />
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-teal-800 text-white transform transition-transform duration-200 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-5 border-b border-teal-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🍃 BookLeaf</h1>
            <p className="text-teal-300 text-xs mt-1">Author Portal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-teal-300 hover:text-white text-xl">✕</button>
        </div>
        <div className="px-4 py-4 border-b border-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-teal-300 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <NavLinks />
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <span className="text-xl">☰</span>
              </button>
              <div>
                <p className="text-sm text-gray-500 hidden sm:block">Welcome back,</p>
                <p className="font-semibold text-gray-800">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:block">{user?.email}</span>
              <span className="px-2 py-1 text-xs font-medium bg-teal-100 text-teal-700 rounded-full capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
