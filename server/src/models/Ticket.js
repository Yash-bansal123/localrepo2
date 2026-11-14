const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      maxlength: [150, 'Subject cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters']
    },
    attachmentName: {
      type: String,
      default: null
    },
    category: {
      type: String,
      enum: [
        'Royalty & Payments',
        'ISBN & Metadata Issues',
        'Printing & Quality',
        'Distribution & Availability',
        'Book Status & Production Updates',
        'General Inquiry'
      ],
      default: 'General Inquiry'
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open'
    },
    aiCategory: {
      type: String
    },
    aiPriority: {
      type: String
    },
    aiConfidence: {
      type: Number
    },
    aiDraft: {
      type: String,
      default: ''
    },
    aiOverridden: {
      type: Boolean,
      default: false
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    internalNotes: [
      {
        note: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    responses: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        senderRole: { type: String },
        message: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Ticket', TicketSchema);
