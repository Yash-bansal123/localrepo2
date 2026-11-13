const { validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Book = require('../models/Book');
const { generateDraft } = require('../utils/ai');
const { emitTicketUpdated } = require('../socket');

const PRIORITY_WEIGHT = { Critical: 0, High: 1, Medium: 2, Low: 3 };

const getAllTickets = async (req, res, next) => {
  try {
    const {
      status, category, priority,
      search, sort, page = 1, limit = 20
    } = req.query;

    const query = {};

    if (status)   query.status   = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    let tickets = await Ticket.find(query)
      .populate('author', 'name email')
      .populate('book', 'title isbn')
      .populate('assignedTo', 'name')
      .select('-internalNotes')
      .lean();

    if (search) {
      const re = new RegExp(search, 'i');
      tickets = tickets.filter(t =>
        re.test(t.subject) ||
        re.test(t.description) ||
        re.test(t.author?.name || '')
      );
    }

    if (sort === 'newest') {
      tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {

      tickets.sort((a, b) => {
        const pw = (PRIORITY_WEIGHT[a.priority] ?? 2) - (PRIORITY_WEIGHT[b.priority] ?? 2);
        if (pw !== 0) return pw;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
    }

    const total = tickets.length;

    const pageNum  = parseInt(page, 10)  || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const start    = (pageNum - 1) * limitNum;
    const paginated = tickets.slice(start, start + limitNum);

    res.json({ success: true, total, page: pageNum, limit: limitNum, tickets: paginated });
  } catch (error) {
    next(error);
  }
};

const getAdminTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('author', 'name email createdAt')
      .populate('book', 'title isbn status royaltyPending genre mrp')
      .populate('assignedTo', 'name email')
      .populate('responses.sender', 'name role')
      .populate('internalNotes.addedBy', 'name');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (!ticket.aiDraft) {
      try {
        const draft = await generateDraft(ticket, ticket.book);
        if (draft) {
          ticket.aiDraft = draft;
          await ticket.save();
        }
      } catch (err) {
        console.warn('Error generating AI draft:', err.message);
      }
    }

    const totalBooks = await Book.countDocuments({ author: ticket.author._id });

    res.json({ success: true, ticket, authorTotalBooks: totalBooks });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    emitTicketUpdated(ticket.author, {
      ticketId: ticket._id,
      status: ticket.status
    });

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const assignTicket = async (req, res, next) => {
  try {
    const { assignToMe, assignTo } = req.body;
    const assignedTo = assignToMe ? req.user.id : assignTo;

    if (!assignedTo) {
      return res.status(400).json({ success: false, message: 'Provide assignToMe:true or assignTo:userId' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo, updatedAt: new Date() },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const addInternalNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note is required' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          internalNotes: {
            note: note.trim(),
            addedBy: req.user.id,
            createdAt: new Date()
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    ).populate('internalNotes.addedBy', 'name');

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const respondToTicket = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || message.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Message must be at least 5 characters' });
    }

    const existing = await Ticket.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const updateFields = {
      $push: {
        responses: {
          sender: req.user.id,
          senderRole: 'admin',
          message: message.trim(),
          createdAt: new Date()
        }
      },
      updatedAt: new Date()
    };
    if (existing.status === 'Open') updateFields.status = 'In Progress';

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updateFields, { new: true })
      .populate('responses.sender', 'name role')
      .populate('author', 'name email')
      .populate('book', 'title isbn');

    emitTicketUpdated(ticket.author?._id || ticket.author, {
      ticketId: ticket._id,
      status: ticket.status,
      lastMessage: message.trim()
    });

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { category } = req.body;
    const valid = ['Royalty & Payments','ISBN & Metadata Issues','Printing & Quality','Distribution & Availability','Book Status & Production Updates','General Inquiry'];
    if (!category || !valid.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { category, aiOverridden: true, updatedAt: new Date() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const updatePriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    const valid = ['Critical','High','Medium','Low'];
    if (!priority || !valid.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority' });
    }
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { priority, aiOverridden: true, updatedAt: new Date() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const regenerateDraftHandler = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('book', 'title isbn status royaltyPending mrp');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const draft = await generateDraft(ticket, ticket.book);
    ticket.aiDraft = draft;
    await ticket.save();

    res.json({ success: true, aiDraft: draft, ticket });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'Open' }),
      Ticket.countDocuments({ status: 'In Progress' }),
      Ticket.countDocuments({ status: 'Resolved' }),
      Ticket.countDocuments({ status: 'Closed' }),
    ]);

    const urgent = await Ticket.find({
      status: { $in: ['Open', 'In Progress'] },
      priority: { $in: ['Critical', 'High'] }
    })
      .populate('author', 'name email')
      .populate('book', 'title')
      .select('subject priority status createdAt author book category')
      .sort({ createdAt: 1 })
      .limit(5)
      .lean();

    res.json({ success: true, stats: { total, open, inProgress, resolved, closed }, urgent });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTickets,
  getAdminTicketById,
  updateStatus,
  assignTicket,
  addInternalNote,
  respondToTicket,
  updateCategory,
  updatePriority,
  regenerateDraftHandler,
  getDashboardStats,
};
