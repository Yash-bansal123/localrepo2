import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAdminTicket,
  updateStatus,
  assignTicket,
  addInternalNote,
  respondToTicket,
  updateCategory,
  updatePriority,
  regenerateDraft
} from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
const fmtRs = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const STATUS_BADGE = {
  Open: 'bg-red-100 text-red-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  Resolved: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-100 text-gray-500'
};
const PRIORITY_BADGE = {
  Critical: 'bg-red-200 text-red-900 font-semibold',
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700'
};
const CATEGORIES = [
  'Royalty & Payments',
  'ISBN & Metadata Issues',
  'Printing & Quality',
  'Distribution & Availability',
  'Book Status & Production Updates',
  'General Inquiry'
];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
        type === 'success' ? 'bg-teal-700' : 'bg-red-600'
      }`}
    >
      {type === 'success' ? '✅' : '❌'} {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <span>{icon}</span>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [authorBooks, setAuthorBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const [selStatus, setSelStatus] = useState('');
  const [selCategory, setSelCategory] = useState('');
  const [selPriority, setSelPriority] = useState('');
  const [noteText, setNoteText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState({});
  const [regenerating, setRegenerating] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = useCallback(async () => {
    try {
      const r = await getAdminTicket(id);
      const t = r.data.ticket;
      setTicket(t);
      setAuthorBooks(r.data.authorTotalBooks);
      setSelStatus(t.status);
      setSelCategory(t.category);
      setSelPriority(t.priority);

      if (t.aiDraft) {
        setReplyText((prev) => (prev ? prev : t.aiDraft));
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const withSave = async (key, fn) => {
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      await fn();
      await load();
      showToast('Saved successfully');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  };

  const handleRegenerateDraft = async () => {
    setRegenerating(true);
    try {
      const res = await regenerateDraft(id);
      const newDraft = res.data.aiDraft;
      setReplyText(newDraft || '');
      await load();
      if (newDraft) {
        showToast('AI draft regenerated successfully');
      } else {
        showToast('AI unavailable - please write response manually', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to regenerate draft', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center h-64 items-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (error)
    return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">{error}</div>;
  if (!ticket) return null;

  const isAssigned = !!ticket.assignedTo;
  const isAssignedToMe = ticket.assignedTo?._id === user?.id;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/tickets')} className="text-sm text-teal-700 hover:underline">
          ← Ticket Queue
        </button>
        <div className="flex gap-2 ml-auto flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[ticket.priority]}`}>
            {ticket.priority}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[ticket.status]}`}>
            {ticket.status}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-teal-50 border border-teal-200 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {ticket.aiCategory ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-700 text-white">
                🤖 AI Classified: {ticket.aiCategory} (Confidence {ticket.aiConfidence || 85}%)
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                AI Priority: {ticket.aiPriority || ticket.priority}
              </span>
              {ticket.aiOverridden && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  ✏️ Overridden by Admin
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-medium text-gray-500">
              Ticket not yet classified by AI
            </span>
          )}
        </div>
        <button
          onClick={handleRegenerateDraft}
          disabled={regenerating}
          className="px-3 py-1.5 text-xs font-semibold bg-white text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-100 transition disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {regenerating ? 'Regenerating...' : '🔄 Regenerate Draft'}
        </button>
      </div>

      <h2 className="text-xl font-bold text-gray-800">{ticket.subject}</h2>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        <div className="xl:col-span-1 space-y-4">

          <Section title="Author" icon="👤">
            <p className="font-semibold text-gray-800">{ticket.author?.name}</p>
            <p className="text-sm text-gray-500 mt-0.5">{ticket.author?.email}</p>
            <p className="text-xs text-gray-400 mt-2">
              {authorBooks} book{authorBooks !== 1 ? 's' : ''} published
            </p>
            <p className="text-xs text-gray-400">
              Member since{' '}
              {new Date(ticket.author?.createdAt).toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </Section>

          {ticket.book ? (
            <Section title="Book" icon="📗">
              <p className="font-semibold text-gray-800">{ticket.book.title}</p>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{ticket.book.isbn}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-gray-700">{ticket.book.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">MRP</span>
                  <span className="font-medium text-gray-700">{fmtRs(ticket.book.mrp)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending Royalty</span>
                  <span
                    className={`font-semibold ${
                      ticket.book.royaltyPending > 0 ? 'text-orange-600' : 'text-gray-400'
                    }`}
                  >
                    {fmtRs(ticket.book.royaltyPending)}
                  </span>
                </div>
              </div>
            </Section>
          ) : (
            <Section title="Book" icon="📗">
              <p className="text-sm text-gray-400 italic">General / Account Level Query</p>
            </Section>
          )}

          <Section title="Ticket Details" icon="📋">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700 text-xs text-right">{fmtDate(ticket.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Updated</span>
                <span className="text-gray-700 text-xs text-right">{fmtDate(ticket.updatedAt)}</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1 font-medium">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
            {ticket.attachmentName && (
              <div className="mt-2 p-2.5 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-2 text-xs text-teal-900 font-medium">
                <span>📎 Attached:</span>
                <span className="font-bold">{ticket.attachmentName}</span>
              </div>
            )}
          </Section>

          <Section title="Assignment" icon="👷">
            {isAssigned ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Assigned to <span className="font-semibold">{ticket.assignedTo?.name}</span>
                  {isAssignedToMe && <span className="ml-1 text-xs text-teal-600">(You)</span>}
                </p>
                {!isAssignedToMe && (
                  <button
                    onClick={() => withSave('assign', () => assignTicket(id, { assignToMe: true }))}
                    disabled={saving.assign}
                    className="w-full px-4 py-2 text-sm font-medium text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition disabled:opacity-50"
                  >
                    {saving.assign ? 'Reassigning…' : 'Reassign to Me'}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => withSave('assign', () => assignTicket(id, { assignToMe: true }))}
                disabled={saving.assign}
                className="w-full px-4 py-2 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition disabled:opacity-50"
              >
                {saving.assign ? 'Assigning…' : 'Assign to Me'}
              </button>
            )}
          </Section>
        </div>

        <div className="xl:col-span-2 space-y-4">

          <Section title="Controls" icon="⚙️">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Category</label>
                <div className="flex gap-2">
                  <select
                    value={selCategory}
                    onChange={(e) => setSelCategory(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => withSave('cat', () => updateCategory(id, selCategory))}
                    disabled={saving.cat || selCategory === ticket.category}
                    className="px-3 py-2 text-sm font-medium bg-teal-700 text-white rounded-lg hover:bg-teal-800 disabled:opacity-40 transition"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Priority</label>
                <div className="flex gap-2">
                  <select
                    value={selPriority}
                    onChange={(e) => setSelPriority(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => withSave('pri', () => updatePriority(id, selPriority))}
                    disabled={saving.pri || selPriority === ticket.priority}
                    className="px-3 py-2 text-sm font-medium bg-teal-700 text-white rounded-lg hover:bg-teal-800 disabled:opacity-40 transition"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Status</label>
                <div className="flex gap-2">
                  <select
                    value={selStatus}
                    onChange={(e) => setSelStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => withSave('status', () => updateStatus(id, selStatus))}
                    disabled={saving.status || selStatus === ticket.status}
                    className="px-3 py-2 text-sm font-medium bg-teal-700 text-white rounded-lg hover:bg-teal-800 disabled:opacity-40 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Internal Notes" icon="🔒">
            <div className="mb-3 inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
              INTERNAL — Not visible to author
            </div>

            <div className="flex gap-2 mb-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={2}
                placeholder="Add an internal note visible only to admins..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              />
              <button
                onClick={async () => {
                  if (!noteText.trim()) return;
                  await withSave('note', () => addInternalNote(id, noteText.trim()));
                  setNoteText('');
                }}
                disabled={saving.note || !noteText.trim()}
                className="px-4 py-2 text-sm font-semibold bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-40 transition self-start"
              >
                {saving.note ? '…' : 'Add Note'}
              </button>
            </div>

            {ticket.internalNotes?.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No internal notes yet.</p>
            ) : (
              <div className="space-y-3">
                {ticket.internalNotes?.map((n, i) => (
                  <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-yellow-800">
                        {n.addedBy?.name || 'Admin'}
                      </span>
                      <span className="text-xs text-yellow-600">{fmtDate(n.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.note}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Response to Author" icon="💬">

            {!ticket.aiDraft && (
              <div className="mb-4 p-3.5 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between text-yellow-800 text-xs">
                <span className="font-medium">
                  ⚠️ AI unavailable - please write response manually
                </span>
                <button
                  onClick={handleRegenerateDraft}
                  disabled={regenerating}
                  className="underline hover:text-yellow-950 font-semibold cursor-pointer"
                >
                  {regenerating ? 'Generating...' : 'Try AI Draft'}
                </button>
              </div>
            )}

            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {ticket.aiDraft ? '🤖 AI Suggested Draft (editable):' : 'Write response to author:'}
                </label>
                {ticket.aiDraft && (
                  <span className="text-xs text-teal-600 font-medium">
                    Pre-filled with AI draft
                  </span>
                )}
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                placeholder="Write your response to the author here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none bg-white font-normal"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">
                  {replyText.length} characters (min 5)
                </span>
                <button
                  onClick={async () => {
                    if (replyText.trim().length < 5) {
                      showToast('Response must be at least 5 characters', 'error');
                      return;
                    }
                    await withSave('reply', () => respondToTicket(id, replyText.trim()));
                    setReplyText('');
                  }}
                  disabled={saving.reply || replyText.trim().length < 5}
                  className="px-5 py-2.5 text-sm font-semibold bg-teal-700 text-white rounded-lg hover:bg-teal-800 disabled:opacity-40 transition shadow-sm"
                >
                  {saving.reply ? 'Sending…' : 'Send Response'}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Response History
              </p>
              {ticket.responses?.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-400 text-sm">No responses yet. Be the first to reply.</p>
                </div>
              ) : (
                <div className="space-y-4">

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {ticket.author?.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-gray-700">{ticket.author?.name}</p>
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                          Author
                        </span>
                        <p className="text-xs text-gray-400">{fmtDate(ticket.createdAt)}</p>
                      </div>
                      <div className="bg-teal-50 border border-teal-100 rounded-xl rounded-tl-none p-3.5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {ticket.description}
                      </div>
                    </div>
                  </div>

                  {ticket.responses.map((resp, idx) => {
                    const isAdmin = resp.senderRole === 'admin';
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                            isAdmin ? 'bg-teal-700 text-white' : 'bg-teal-100 text-teal-700'
                          }`}
                        >
                          {resp.sender?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 max-w-[85%]">
                          <div
                            className={`flex items-center gap-2 mb-1 ${
                              isAdmin ? 'justify-end' : ''
                            }`}
                          >
                            <p className="text-xs font-semibold text-gray-700">
                              {resp.sender?.name}
                            </p>
                            {isAdmin && (
                              <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">
                                Support
                              </span>
                            )}
                            <p className="text-xs text-gray-400">{fmtDate(resp.createdAt)}</p>
                          </div>
                          <div
                            className={`p-3.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                              isAdmin
                                ? 'bg-teal-700 text-white rounded-tr-none'
                                : 'bg-gray-50 border border-gray-200 rounded-tl-none text-gray-700'
                            }`}
                          >
                            {resp.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
