const { validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const Book = require('../models/Book');
const { classifyTicket, generateDraft } = require('../utils/ai');
const { emitNewTicket } = require('../socket');

const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI Classification timeout')), ms))
  ]);
};

const createTicket = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { subject, description, bookId, category, priority } = req.body;

    let bookRef = null;

    if (bookId && bookId !== 'general' && bookId !== '') {
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      if (book.author.toString() !== req.user.id) {
        return res.status(400).json({ success: false, message: 'Book does not belong to you' });
      }
      bookRef = bookId;
    }

    const ticket = await Ticket.create({
      author: req.user.id,
      book: bookRef,
      subject,
      description,
      category: category || 'General Inquiry',
      priority: priority || 'Medium',
      status: 'Open'
    });

    try {
      const aiResult = await withTimeout(classifyTicket(ticket), 3000);
      if (aiResult && aiResult.category) {
        ticket.aiCategory = aiResult.category;
        ticket.aiPriority = aiResult.priority;
        ticket.aiConfidence = aiResult.confidence;
        ticket.category = aiResult.category;
        ticket.priority = aiResult.priority;
        await ticket.save();
      }
    } catch (err) {
      console.warn('AI classification skipped or timed out:', err.message);
    }

    emitNewTicket(ticket);

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ author: req.user.id })
      .populate('book', 'title isbn')
      .select('subject description category priority status createdAt book')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('book', 'title isbn genre status royaltyPending mrp')
      .populate('responses.sender', 'name role')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }

    if (req.user.role !== 'admin') {
      ticket.internalNotes = undefined;
    } else {

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
    }

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

const regenerateDraftForTicket = async (req, res, next) => {
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

module.exports = { createTicket, getMyTickets, getTicketById, regenerateDraftForTicket };
