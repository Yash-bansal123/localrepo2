import { useEffect, useState, useMemo } from 'react';
import { getMyBooks } from '../../services/authorService';

const STATUS_STYLES = {
  'Published & Live':   'bg-green-100 text-green-700',
  'Typesetting':        'bg-yellow-100 text-yellow-700',
  'Printing':           'bg-blue-100 text-blue-700',
  'Cover Design':       'bg-purple-100 text-purple-700',
  'Editing':            'bg-orange-100 text-orange-700',
  'Proofreading':       'bg-pink-100 text-pink-700',
  'ISBN Assignment':    'bg-indigo-100 text-indigo-700',
  'Distribution Setup': 'bg-cyan-100 text-cyan-700',
  'Manuscript Received':'bg-gray-100 text-gray-600',
  'In Production':      'bg-gray-100 text-gray-600',
  'In Production - Cover Design': 'bg-purple-100 text-purple-700',
  'In Production - Typesetting':  'bg-yellow-100 text-yellow-700',
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtRs = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color || 'text-gray-800'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await getMyBooks();
        setBooks(res.data.books || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const totals = useMemo(() => ({
    totalBooks: books.length,
    copiesSold: books.reduce((s, b) => s + (b.copiesSold || 0), 0),
    royaltyEarned: books.reduce((s, b) => s + (b.royaltyEarned || 0), 0),
    royaltyPending: books.reduce((s, b) => s + (b.royaltyPending || 0), 0),
  }), [books]);

  const statuses = useMemo(() => ['All', ...new Set(books.map(b => b.status))], [books]);

  const filtered = useMemo(() => {
    return books.filter(b => {
      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || b.title.toLowerCase().includes(q) || b.isbn.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [books, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading your books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-medium">Error loading books</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-bold text-gray-800">My Books</h2>
        <p className="text-sm text-gray-500 mt-1">Track your publications, royalties and sales</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Books" value={totals.totalBooks} color="text-teal-700" />
        <SummaryCard label="Copies Sold" value={totals.copiesSold.toLocaleString('en-IN')} color="text-blue-700" />
        <SummaryCard label="Total Earned" value={fmtRs(totals.royaltyEarned)} color="text-green-700" />
        <SummaryCard label="Pending Royalty" value={fmtRs(totals.royaltyPending)} color="text-orange-600" sub="Awaiting payout" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by title or ISBN..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
        >
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {books.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-gray-700 font-medium">No books yet</p>
          <p className="text-gray-400 text-sm mt-1">Your published books will appear here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No books match your search/filter.</p>
        </div>
      ) : (
        <>

          <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Title', 'ISBN', 'Genre', 'Pub. Date', 'Status', 'MRP', 'Sold', 'Earned', 'Paid', 'Pending'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(book => (
                  <tr key={book._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px]">
                      <span className="line-clamp-2">{book.title}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{book.isbn}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{book.genre}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(book.publicationDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={book.status} /></td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtRs(book.mrp)}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{(book.copiesSold || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-green-700 font-medium whitespace-nowrap">{fmtRs(book.royaltyEarned)}</td>
                    <td className="px-4 py-3 text-blue-700 whitespace-nowrap">{fmtRs(book.royaltyPaid)}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      <span className={book.royaltyPending > 0 ? 'text-orange-600' : 'text-gray-400'}>
                        {fmtRs(book.royaltyPending)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {filtered.map(book => (
              <div key={book._id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-800 leading-snug">{book.title}</h3>
                  <StatusBadge status={book.status} />
                </div>
                <p className="text-xs text-gray-400 font-mono mb-3">{book.isbn}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Genre</p>
                    <p className="font-medium text-gray-700">{book.genre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">MRP</p>
                    <p className="font-medium text-gray-700">{fmtRs(book.mrp)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pub. Date</p>
                    <p className="font-medium text-gray-700">{fmtDate(book.publicationDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Copies Sold</p>
                    <p className="font-medium text-gray-700">{(book.copiesSold || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Earned</p>
                    <p className="font-semibold text-green-700">{fmtRs(book.royaltyEarned)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Paid</p>
                    <p className="font-semibold text-blue-700">{fmtRs(book.royaltyPaid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pending</p>
                    <p className={`font-semibold ${book.royaltyPending > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {fmtRs(book.royaltyPending)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
