import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-emerald-700">🍃 BookLeaf Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.name}{' '}
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 capitalize">
                {user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            You are logged in as <strong className="text-emerald-600">{user?.role}</strong>.
            The dashboard features will be available in Phase 2.
          </p>
          <div className="mt-6 inline-block px-4 py-2 bg-emerald-50 rounded-lg text-sm text-emerald-700">
            Phase 1 Complete — Backend, Auth & Seed Data Ready ✓
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
