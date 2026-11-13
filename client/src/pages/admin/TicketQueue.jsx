import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets } from '../../services/adminService';

const PRIORITY_BADGE = {
  Critical: 'bg-red-200 text-red-900 font-semibold',
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

const CATEGORIES = ['','Royalty & Payments','ISBN & Metadata Issues','Printing & Quality','Distribution & Availability','Book Status & Production Updates','General Inquiry'];
const STATUSES   = ['','Open','In Progress','Resolved','Closed'];
const PRIORITIES = ['','Critical','High','Medium','Low'];

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
const shortId = (id) => id?.slice(-6).toUpperCase();

export default function TicketQueue() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [page, setPage]       = useState(1);
  const LIMIT = 20;

  const [filters, setFilters] = useState({
    status: '', category: '', priority: '', search: '', sort: 'oldest'
  });
  const [pendingSearch, setPendingSearch] = useState('');

  const fetchTickets = useCallback(async (f, p) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: p, limit: LIMIT };
      if (f.status)   params.status   = f.status;
      if (f.category) params.category = f.category;
      if (f.priority) params.priority = f.priority;
      if (f.search)   params.search   = f.search;
      if (f.sort)     params.sort     = f.sort;
      const r = await getAllTickets(params);
      setTickets(r.data.tickets);
      setTotal(r.data.total);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets(filters, page);

    const handleNew = () => {
      fetchTickets(filters, page);
    };

    window.addEventListener('bookleaf:new_ticket', handleNew);
    return () => {
      window.removeEventListener('bookleaf:new_ticket', handleNew);
    };
  }, [filters, page, fetchTickets]);

  const applyFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilter('search', pendingSearch);
  };

  const clearFilters = () => {
    setFilters({ status:'', category:'', priority:'', search:'', sort:'oldest' });
    setPendingSearch('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Ticket Queue</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} ticket{total !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">

        <div className="flex flex-wrap gap-2">
          <select value={filters.status}   onChange={e => applyFilter('status',   e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
            <option value="">All Statuses</option>
            {STATUSES.slice(1).map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filters.category} onChange={e => applyFilter('category', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
            <option value="">All Categories</option>
            {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filters.priority} onChange={e => applyFilter('priority', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
            <option value="">All Priorities</option>
            {PRIORITIES.slice(1).map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={filters.sort}     onChange={e => applyFilter('sort',     e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
            <option value="oldest">Oldest First</option>
            <option value="newest">Newest First</option>
          </select>
          <button onClick={clearFilters} className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Clear Filters</button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={pendingSearch}
            onChange={e => setPendingSearch(e.target.value)}
            placeholder="Search subject, description, or author name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          />
          <button type="submit" className="px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-3xl mb-2">🎫</p>
          <p className="font-medium text-gray-600">No tickets match filters</p>
          <button onClick={clearFilters} className="mt-3 text-sm text-teal-700 hover:underline">Clear filters</button>
        </div>
      ) : (
        <>

          <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['ID','Author','Subject','Book','Category','Priority','Status','Created','Assigned To',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{shortId(t._id)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 whitespace-nowrap">{t.author?.name}</p>
                      <p className="text-xs text-gray-400">{t.author?.email}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="truncate font-medium text-gray-800" title={t.subject}>{t.subject}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[120px]">
                      <p className="truncate text-sm">{t.book?.title || <span className="text-gray-400 italic">General</span>}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded whitespace-nowrap">{t.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${PRIORITY_BADGE[t.priority]}`}>{t.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[t.status]}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{fmtDate(t.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {t.assignedTo?.name || <span className="text-gray-300">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/tickets/${t._id}`)}
                        className="px-3 py-1.5 text-xs font-medium text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition whitespace-nowrap"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {tickets.map(t => (
              <div key={t._id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-xs font-mono text-gray-400">#{shortId(t._id)}</p>
                    <p className="font-semibold text-gray-800 leading-snug mt-0.5">{t.subject}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[t.status]}`}>{t.status}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${PRIORITY_BADGE[t.priority]}`}>{t.priority}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t.category}</span>
                </div>
                <p className="text-sm text-gray-600">{t.author?.name} · {t.book?.title || 'General'}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400">{fmtDate(t.createdAt)}</p>
                  <button
                    onClick={() => navigate(`/admin/tickets/${t._id}`)}
                    className="px-3 py-1.5 text-xs font-medium text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition"
                  >
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-3 text-sm text-gray-600">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >← Prev</button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >Next →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
