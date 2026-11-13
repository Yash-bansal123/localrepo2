const { validationResult } = require('express-validator');
const Book = require('../models/Book');

const getMyBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ author: req.user.id })
      .select('title isbn genre publicationDate status mrp copiesSold royaltyEarned royaltyPaid royaltyPending platformSales coverImage')
      .sort({ publicationDate: -1 });

    if (!books.length) {
      return res.json({
        success: true,
        count: 0,
        books: [],
        message: 'No books found'
      });
    }

    res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyBooks };
