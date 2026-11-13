const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Ticket = require('../models/Ticket');
const sampleData = require('../data/bookleaf_sample_data.json');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bookleaf';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding from official company dataset...');

    await User.deleteMany({});
    await Book.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Cleared existing data.');

    const admin = await User.create({
      name: 'BookLeaf Admin',
      email: 'admin@bookleaf.com',
      password: 'Admin@123',
      role: 'admin',
      bankAccountNumber: '987654321001',
      bankIFSC: 'HDFC0001234',
      bankAccountHolder: 'BookLeaf Support Ops'
    });

    let totalBooksCreated = 0;
    const authorSummaries = [];

    for (let i = 0; i < sampleData.authors.length; i++) {
      const a = sampleData.authors[i];
      const aliasIndex = i + 1;
      const aliasEmail = `author${aliasIndex}@test.com`;

      const authorUser = await User.create({
        authorId: a.author_id,
        name: a.name,
        email: a.email,
        aliasEmail: aliasEmail,
        phone: a.phone,
        city: a.city,
        joinedDate: a.joined_date ? new Date(a.joined_date) : new Date(),
        password: 'Author@123',
        role: 'author',
        bankAccountNumber: `10020030040${aliasIndex}`,
        bankIFSC: 'SBIN0001234',
        bankAccountHolder: a.name
      });

      for (const b of a.books) {
        await Book.create({
          author: authorUser._id,
          bookId: b.book_id,
          title: b.title,
          isbn: b.isbn,
          genre: b.genre,
          publicationDate: b.publication_date ? new Date(b.publication_date) : null,
          status: b.status,
          mrp: b.mrp || 0,
          authorRoyaltyPerCopy: b.author_royalty_per_copy || 0,
          copiesSold: b.total_copies_sold || 0,
          royaltyEarned: b.total_royalty_earned || 0,
          royaltyPaid: b.royalty_paid || 0,
          royaltyPending: b.royalty_pending || 0,
          lastRoyaltyPayoutDate: b.last_royalty_payout_date ? new Date(b.last_royalty_payout_date) : null,
          printPartner: b.print_partner || null,
          availableOn: b.available_on || []
        });
        totalBooksCreated++;
      }

      authorSummaries.push({
        id: a.author_id,
        name: a.name,
        email: a.email,
        alias: aliasEmail,
        booksCount: a.books.length
      });
    }

    console.log(`\nSeed successful! Created: 1 Admin + ${sampleData.authors.length} Authors, ${totalBooksCreated} Books from official company dataset.`);
    console.log('\n--- Login Credentials ---');
    console.log('Admin:   admin@bookleaf.com / Admin@123');
    authorSummaries.forEach((a) => {
      console.log(`Author:  ${a.email} (or ${a.alias}) / Author@123 -> ${a.name} (${a.booksCount} books)`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
