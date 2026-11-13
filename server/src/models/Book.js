const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  bookId: {
    type: String
  },
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true
  },
  genre: {
    type: String,
    required: [true, 'Genre is required']
  },
  publicationDate: {
    type: Date
  },
  status: {
    type: String,
    default: 'Published & Live'
  },
  mrp: {
    type: Number,
    default: 0
  },
  authorRoyaltyPerCopy: {
    type: Number,
    default: 0
  },
  copiesSold: {
    type: Number,
    default: 0
  },
  royaltyEarned: {
    type: Number,
    default: 0
  },
  royaltyPaid: {
    type: Number,
    default: 0
  },
  royaltyPending: {
    type: Number,
    default: 0
  },
  lastRoyaltyPayoutDate: {
    type: Date
  },
  printPartner: {
    type: String
  },
  availableOn: [
    {
      type: String
    }
  ],
  platformSales: {
    amazonIn: { type: Number, default: 0 },
    flipkart: { type: Number, default: 0 },
    amazonUS: { type: Number, default: 0 },
    amazonUK: { type: Number, default: 0 },
    bookleafStore: { type: Number, default: 0 }
  },
  coverImage: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Book', BookSchema);
