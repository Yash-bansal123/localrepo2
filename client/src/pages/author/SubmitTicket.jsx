import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBooks, createTicket } from '../../services/authorService';

const CATEGORIES = [
  'General Inquiry',
  'Royalty & Payments',
  'ISBN & Metadata Issues',
  'Printing & Quality',
  'Distribution & Availability',
  'Book Status & Production Updates',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-white text-sm font-medium animate-fade-in ${
      type === 'success' ? 'bg-teal-700' : 'bg-red-600'
    }`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

export default function SubmitTicket() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    bookId: 'general',
    subject: '',
    description: '',
    category: 'General Inquiry',
    priority: 'Medium',
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyBooks().then(r => setBooks(r.data.books || [])).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    else if (form.subject.trim().length < 5) errs.subject = 'Subject must be at least 5 characters';
    else if (form.subject.trim().length > 150) errs.subject = 'Subject cannot exceed 150 characters';
    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.trim().length < 20) errs.description = 'Description must be at least 20 characters';
    return errs;
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(e => ({ ...e, [field]: '' }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      setToast({ message: 'File size must be under 5MB', type: 'error' });
      return;
    }

    setFile(selected);
    if (selected.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(selected));
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setSubmitting(true);
    try {
      await createTicket({
        bookId: form.bookId === 'general' ? '' : form.bookId,
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        attachmentName: file ? file.name : null,
      });
      setToast({ message: 'Ticket submitted successfully!', type: 'success' });
      setTimeout(() => navigate('/dashboard/tickets'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to submit ticket';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const subjectLen = form.subject.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h2 className="text-xl font-bold text-gray-800">Submit a Query</h2>
        <p className="text-sm text-gray-500 mt-1">Raise a support request and our team will respond within 24–48 hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Regarding Book</label>
          <select
            value={form.bookId}
            onChange={e => handleChange('bookId', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white transition"
          >
            <option value="general">General / Account Level Query</option>
            {books.map(b => (
              <option key={b._id} value={b._id}>
                {b.title} ({b.isbn})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => handleChange('category', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white transition"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
            <select
              value={form.priority}
              onChange={e => handleChange('priority', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white transition"
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${subjectLen > 150 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
              {subjectLen}/150
            </span>
          </div>
          <input
            type="text"
            value={form.subject}
            onChange={e => handleChange('subject', e.target.value)}
            placeholder="e.g. Royalty payment not received for Q2 2025"
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${
              fieldErrors.subject ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {fieldErrors.subject && <p className="text-red-500 text-xs mt-1">{fieldErrors.subject}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            rows={5}
            placeholder="Describe your issue in detail... e.g. I haven't received royalty for Q1. My book 'The Silent River' has been published since March 2025 and shows 1240 copies sold, but no payment has been credited to my account."
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none transition ${
              fieldErrors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
          <p className="text-xs text-gray-400 mt-1">{form.description.length} chars (min 20)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Attach File <span className="text-gray-400 font-normal">(optional — image or document)</span>
          </label>
          
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-500 hover:bg-teal-50/20 transition cursor-pointer relative">
              <input
                type="file"
                id="file-upload"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center pointer-events-none">
                <span className="text-3xl mb-1">📎</span>
                <p className="text-sm font-medium text-gray-700">Click to browse or drop an image/file here</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG, PDF up to 5MB</p>
              </div>
            </div>
          ) : (
            <div className="border border-teal-200 bg-teal-50/70 rounded-xl p-3.5 flex items-center justify-between transition">
              <div className="flex items-center gap-3 overflow-hidden">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-teal-200 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 text-xl font-bold flex-shrink-0">
                    📄
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-teal-700">{(file.size / 1024).toFixed(1)} KB • Attached & ready</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition text-xs font-semibold flex items-center gap-1 border border-transparent hover:border-gray-200"
                title="Remove attachment"
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 focus:ring-4 focus:ring-teal-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
