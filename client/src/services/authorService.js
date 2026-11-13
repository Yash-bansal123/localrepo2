import api from './api';

export const getMyBooks = () => api.get('/books/my-books');

export const createTicket = (data) => api.post('/tickets', data);
export const getMyTickets = () => api.get('/tickets/my-tickets');
export const getTicketById = (id) => api.get(`/tickets/${id}`);
