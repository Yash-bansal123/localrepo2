import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById } from '../../services/authorService';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLES = {
  'Open':        'bg-red-100 text-red-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  'Resolved':    'bg-green-100 text-green-700',
  'Closed':      'bg-gray-100 text-gray-500',
};

const PRIORITY_STYLES = {
  'Critical': 'bg-red-100 text-red-700',
  'High':     'bg-orange-100 text-orange-700',
  'Medium':   'bg-yellow-100 text-yellow-700',
  'Low':      'bg-green-100 text-green-700',
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTicket = () => {
    getTicketById(id)
      .then(r => setTicket(r.data.ticket))
      .catch(err => setError(err.response?.data?.message || 'Failed to load ticket'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTicket();

    const handleUpdate = (e) => {
      if (!e.detail?.ticketId || e.detail.ticketId === id) {
        loadTicket();
      }
    };

    window.addEventListener('bookleaf:ticket_updated', handleUpdate);
    return () => {
      window.removeEventListener('bookleaf:ticket_updated', handleUpdate);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading ticket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <button onClick={() => navigate('/dashboard/tickets')} className="text-sm text-teal-700 hover:underline">← Back to Tickets</button>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      <button
        onClick={() => navigate('/dashboard/tickets')}
        className="text-sm text-teal-700 hover:underline flex items-center gap-1"
      >
        ← Back to My Tickets
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[ticket.status] || STATUS_STYLES['Closed']}`}>
            {ticket.status}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[ticket.priority] || 'bg-gray-100 text-gray-500'}`}>
            {ticket.priority} Priority
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {ticket.category}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">{ticket.subject}</h2>
        <p className="text-sm text-gray-500">
          📗 {ticket.book ? `${ticket.book.title} (${ticket.book.isbn})` : 'General / Account Level'}
        </p>
        <p className="text-xs text-gray-400 mt-2">Submitted on {fmtDate(ticket.createdAt)}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-400">{fmtDate(ticket.createdAt)}</p>
          </div>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        </div>
        {ticket.attachmentName && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">
            <span>📎 Attached File:</span>
            <span className="font-semibold text-teal-800">{ticket.attachmentName}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">📬 Response Timeline</h3>

        {(!ticket.responses || ticket.responses.length === 0) ? (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
            <p className="text-3xl mb-2">⏳</p>
            <p className="text-gray-500 text-sm font-medium">Waiting for response</p>
            <p className="text-gray-400 text-xs mt-1">Our team will respond within 24–48 hours.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ticket.responses.map((resp, idx) => {
              const isAdmin = resp.senderRole === 'admin';
              return (
                <div key={idx} className={`flex gap-3 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isAdmin ? 'bg-teal-700 text-white' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {resp.sender?.name?.charAt(0) || '?'}
                  </div>
                  <div className={`flex-1 max-w-[85%]`}>
                    <div className={`flex items-center gap-2 mb-1 ${isAdmin ? '' : 'justify-end'}`}>
                      <p className="text-xs font-semibold text-gray-700">{resp.sender?.name || 'Unknown'}</p>
                      {isAdmin && <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">Support</span>}
                      <p className="text-xs text-gray-400">{fmtDate(resp.createdAt)}</p>
                    </div>
                    <div className={`p-3.5 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap ${
                      isAdmin
                        ? 'bg-gray-50 border border-gray-200 rounded-tl-none'
                        : 'bg-teal-50 border border-teal-100 rounded-tr-none'
                    }`}>
                      {resp.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
