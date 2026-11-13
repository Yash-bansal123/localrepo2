import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTickets } from '../../services/authorService';

const STATUS_STYLES = {
  'Open':        { dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700' },
  'In Progress': { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
  'Resolved':    { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700' },
  'Closed':      { dot: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-500' },
};

const PRIORITY_STYLES = {
  'Critical': 'bg-red-100 text-red-700',
  'High':     'bg-orange-100 text-orange-700',
  'Medium':   'bg-yellow-100 text-yellow-700',
  'Low':      'bg-green-100 text-green-700',
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

function StatusBadge({ status }) {
  const st = STATUS_STYLES[status] || STATUS_STYLES['Closed'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${st.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
      {status}
    </span>
  );
}

function PriorityChip({ priority }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_STYLES[priority] || 'bg-gray-100 text-gray-500'}`}>
      {priority}
    </span>
  );
}

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTickets = () => {
    getMyTickets()
      .then(r => setTickets(r.data.tickets || []))
      .catch(err => setError(err.response?.data?.message || 'Failed to load tickets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTickets();

    const handleUpdate = () => {
      loadTickets();
    };

    window.addEventListener('bookleaf:ticket_updated', handleUpdate);
    return () => {
      window.removeEventListener('bookleaf:ticket_updated', handleUpdate);
    };
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || t.subject.toLowerCase().includes(q) || (t.book?.title || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-medium">Error loading tickets</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">My Tickets</h2>
          <p className="text-sm text-gray-500 mt-1">Track all your support queries</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/submit-ticket')}
          className="px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition"
        >
          + New Ticket
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by subject or book title..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
        >
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">🎫</p>
          <p className="text-gray-700 font-medium">No tickets yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">Submit a query and our team will get back to you.</p>
          <button
            onClick={() => navigate('/dashboard/submit-ticket')}
            className="px-5 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition"
          >
            Submit Your First Query
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No tickets match your filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => (
            <div
              key={ticket._id}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-teal-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={ticket.status} />
                    <PriorityChip priority={ticket.priority} />
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {ticket.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 leading-snug mb-1">{ticket.subject}</h3>
                  <p className="text-sm text-gray-500">
                    📗 {ticket.book ? ticket.book.title : 'General / Account Level'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {fmtDate(ticket.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/tickets/${ticket._id}`)}
                  className="shrink-0 px-4 py-2 text-sm font-medium text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
