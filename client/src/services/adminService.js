import api from './api';

export const getDashboardStats = () => api.get('/admin/dashboard');

export const getAllTickets    = (params) => api.get('/admin/tickets', { params });
export const getAdminTicket  = (id)      => api.get(`/admin/tickets/${id}`);
export const updateStatus    = (id, status)   => api.patch(`/admin/tickets/${id}/status`,   { status });
export const assignTicket    = (id, payload)  => api.patch(`/admin/tickets/${id}/assign`,   payload);
export const addInternalNote = (id, note)     => api.post(`/admin/tickets/${id}/internal-notes`, { note });
export const respondToTicket = (id, message)  => api.post(`/admin/tickets/${id}/respond`,   { message });
export const updateCategory  = (id, category) => api.patch(`/admin/tickets/${id}/category`, { category });
export const updatePriority  = (id, priority) => api.patch(`/admin/tickets/${id}/priority`, { priority });
export const regenerateDraft = (id)           => api.post(`/admin/tickets/${id}/regenerate-draft`);
