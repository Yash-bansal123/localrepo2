import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/adminService';

const PRIORITY_BADGE = {
  Critical: 'bg-red-200 text-red-800',
  High:     'bg-red-100 text-red-700',
  Medium:   'bg-yellow-100 text-yellow-700',
  Low:      'bg-green-100 text-green-700',
};

const STATUS_BADGE = {
  'Open':        'bg-red-100 text-red-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  'Resolved':    'bg-green-100 text-green-700',
  'Closed':      'bg-gray-100 text-gray-500',
};

function StatCard({ label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [urgent, setUrgent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const loadDashboard = () => {
    getDashboardStats()
      .then(r => { setStats(r.data.stats); setUrgent(r.data.urgent); })
      .catch(e => setError(e.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();

    const handleNew = () => {
      loadDashboard();
    };

    window.addEventListener('bookleaf:new_ticket', handleNew);
    return () => {
      window.removeEventListener('bookleaf:new_ticket', handleNew);
    };
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Support queue overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets"  value={stats.total}      color="text-gray-800" />
        <StatCard label="Open"           value={stats.open}       color="text-red-600"    sub="Needs attention" />
        <StatCard label="In Progress"    value={stats.inProgress} color="text-orange-600" sub="Being handled" />
        <StatCard label="Resolved"       value={stats.resolved}   color="text-green-600"  sub="Closed out" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <span className="text-lg">🚨</span>
          <h3 className="font-semibold text-gray-800">Urgent — Needs Attention</h3>
          <span className="ml-auto text-xs text-gray-400">Critical & High priority open tickets</span>
        </div>
        {urgent.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm">No urgent tickets right now!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {urgent.map(t => (
              <li
                key={t._id}
                onClick={() => navigate(`/admin/tickets/${t._id}`)}
                className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_BADGE[t.priority]}`}>
                      {t.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[t.status]}`}>
                      {t.status}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{t.category}</span>
                  </div>
                  <p className="font-medium text-gray-800 truncate">{t.subject}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t.author?.name} · {t.book?.title || 'General'} · {fmtDate(t.createdAt)}
                  </p>
                </div>
                <span className="text-gray-400 text-sm shrink-0">→</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
