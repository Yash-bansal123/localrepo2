const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../models/User');
const Book = require('../models/Book');
const Ticket = require('../models/Ticket');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bookleaf');
    console.log('MongoDB connected for seeding...');

    await User.deleteMany({});
    await Book.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Cleared existing data.');

    const admin = await User.create({
      name: 'BookLeaf Admin',
      email: 'admin@bookleaf.com',
      password: 'Admin@123',
      role: 'admin'
    });

    const author1 = await User.create({
      name: 'Priya Sharma',
      email: 'author1@test.com',
      password: 'Author@123',
      role: 'author',
      bankAccountNumber: '1234567890123456',
      bankIFSC: 'SBIN0001234',
      bankAccountHolder: 'Priya Sharma'
    });

    const author2 = await User.create({
      name: 'Rohit Verma',
      email: 'author2@test.com',
      password: 'Author@123',
      role: 'author',
      bankAccountNumber: '9876543210987654',
      bankIFSC: 'HDFC0005678',
      bankAccountHolder: 'Rohit Verma'
    });

    const author3 = await User.create({
      name: 'Ananya Iyer',
      email: 'author3@test.com',
      password: 'Author@123',
      role: 'author',
      bankAccountNumber: '5678901234567890',
      bankIFSC: 'ICIC0009012',
      bankAccountHolder: 'Ananya Iyer'
    });

    const author4 = await User.create({
      name: 'Vikram Desai',
      email: 'author4@test.com',
      password: 'Author@123',
      role: 'author',
      bankAccountNumber: '3456789012345678',
      bankIFSC: 'AXIS0003456',
      bankAccountHolder: 'Vikram Desai'
    });

    const author5 = await User.create({
      name: 'Emily Johnson',
      email: 'author5@test.com',
      password: 'Author@123',
      role: 'author',
      bankAccountNumber: '2345678901234567',
      bankIFSC: 'BARB0002345',
      bankAccountHolder: 'Emily Johnson'
    });

    const author6 = await User.create({
      name: 'Arjun Patel',
      email: 'author6@test.com',
      password: 'Author@123',
      role: 'author',
      bankAccountNumber: '6789012345678901',
      bankIFSC: 'PUNB0006789',
      bankAccountHolder: 'Arjun Patel'
    });

    const author7 = await User.create({
      name: 'Sarah Mitchell',
      email: 'author7@test.com',
      password: 'Author@123',
      role: 'author',
      bankAccountNumber: '7890123456789012',
      bankIFSC: 'CITI0007890',
      bankAccountHolder: 'Sarah Mitchell'
    });

    const author8 = await User.create({
      name: 'Kavitha Reddy',
      email: 'author8@test.com',
      password: 'Author@123',
      role: 'author',
      bankAccountNumber: '8901234567890123',
      bankIFSC: 'UBIN0008901',
      bankAccountHolder: 'Kavitha Reddy'
    });

    const author9 = await User.create({
      name: 'Michael Chen',
      email: 'author9@test.com',
      password: 'Author@123',
      role: 'author',
      bankAccountNumber: '0123456789012345',
      bankIFSC: 'BOFA0000123',
      bankAccountHolder: 'Michael Chen'
    });

    const author10 = await User.create({
      name: 'Deepa Nair',
      email: 'author10@test.com',
      password: 'Author@123',
      role: 'author',
      bankAccountNumber: '4567890123456789',
      bankIFSC: 'KTKB0004567',
      bankAccountHolder: 'Deepa Nair'
    });

    console.log('Created 11 users (1 admin + 10 authors).');

    const books = await Book.insertMany([

      {
        author: author1._id,
        title: 'The Silent River',
        isbn: '978-93-12345-01-2',
        genre: 'Fiction',
        publicationDate: new Date('2025-03-15'),
        status: 'Published & Live',
        mrp: 299,
        copiesSold: 1240,
        royaltyEarned: 18400,
        royaltyPaid: 12000,
        royaltyPending: 6400,
        platformSales: { amazonIn: 520, flipkart: 310, amazonUS: 180, amazonUK: 90, bookleafStore: 140 },
        coverImage: ''
      },
      {
        author: author1._id,
        title: 'Whispers of Himalaya',
        isbn: '978-93-12345-03-6',
        genre: 'Poetry',
        status: 'Typesetting',
        mrp: 249,
        copiesSold: 0,
        royaltyEarned: 0,
        royaltyPaid: 0,
        royaltyPending: 0,
        platformSales: { amazonIn: 0, flipkart: 0, amazonUS: 0, amazonUK: 0, bookleafStore: 0 },
        coverImage: ''
      },
      {
        author: author1._id,
        title: 'Monsoon Melodies',
        isbn: '978-93-12345-04-3',
        genre: 'Romance',
        publicationDate: new Date('2025-08-20'),
        status: 'Published & Live',
        mrp: 329,
        copiesSold: 640,
        royaltyEarned: 9200,
        royaltyPaid: 5000,
        royaltyPending: 4200,
        platformSales: { amazonIn: 280, flipkart: 160, amazonUS: 90, amazonUK: 40, bookleafStore: 70 },
        coverImage: ''
      },

      {
        author: author2._id,
        title: 'Startup Sutras',
        isbn: '978-93-12345-02-9',
        genre: 'Business',
        publicationDate: new Date('2025-01-10'),
        status: 'Published & Live',
        mrp: 399,
        copiesSold: 850,
        royaltyEarned: 14200,
        royaltyPaid: 14200,
        royaltyPending: 0,
        platformSales: { amazonIn: 380, flipkart: 200, amazonUS: 120, amazonUK: 60, bookleafStore: 90 },
        coverImage: ''
      },
      {
        author: author2._id,
        title: 'Code & Chai',
        isbn: '978-93-12345-05-0',
        genre: 'Technology',
        status: 'Printing',
        mrp: 449,
        copiesSold: 0,
        royaltyEarned: 0,
        royaltyPaid: 0,
        royaltyPending: 0,
        platformSales: { amazonIn: 0, flipkart: 0, amazonUS: 0, amazonUK: 0, bookleafStore: 0 },
        coverImage: ''
      },

      {
        author: author3._id,
        title: 'Daughters of the Deccan',
        isbn: '978-93-12345-06-7',
        genre: 'Historical Fiction',
        publicationDate: new Date('2025-05-22'),
        status: 'Published & Live',
        mrp: 349,
        copiesSold: 980,
        royaltyEarned: 15200,
        royaltyPaid: 10000,
        royaltyPending: 5200,
        platformSales: { amazonIn: 420, flipkart: 250, amazonUS: 140, amazonUK: 70, bookleafStore: 100 },
        coverImage: ''
      },
      {
        author: author3._id,
        title: 'Spice Route Diaries',
        isbn: '978-93-12345-07-4',
        genre: 'Travel',
        status: 'Cover Design',
        mrp: 279,
        copiesSold: 0,
        royaltyEarned: 0,
        royaltyPaid: 0,
        royaltyPending: 0,
        platformSales: { amazonIn: 0, flipkart: 0, amazonUS: 0, amazonUK: 0, bookleafStore: 0 },
        coverImage: ''
      },

      {
        author: author4._id,
        title: 'The Last Maharaja',
        isbn: '978-93-12345-08-1',
        genre: 'Historical Fiction',
        publicationDate: new Date('2024-11-05'),
        status: 'Published & Live',
        mrp: 499,
        copiesSold: 2100,
        royaltyEarned: 32500,
        royaltyPaid: 25000,
        royaltyPending: 7500,
        platformSales: { amazonIn: 900, flipkart: 520, amazonUS: 310, amazonUK: 170, bookleafStore: 200 },
        coverImage: ''
      },
      {
        author: author4._id,
        title: 'Desert Winds',
        isbn: '978-93-12345-09-8',
        genre: 'Adventure',
        status: 'Proofreading',
        mrp: 349,
        copiesSold: 0,
        royaltyEarned: 0,
        royaltyPaid: 0,
        royaltyPending: 0,
        platformSales: { amazonIn: 0, flipkart: 0, amazonUS: 0, amazonUK: 0, bookleafStore: 0 },
        coverImage: ''
      },

      {
        author: author5._id,
        title: 'Brooklyn Nights',
        isbn: '978-93-12345-10-4',
        genre: 'Contemporary Fiction',
        publicationDate: new Date('2025-06-12'),
        status: 'Published & Live',
        mrp: 379,
        copiesSold: 1560,
        royaltyEarned: 22800,
        royaltyPaid: 15000,
        royaltyPending: 7800,
        platformSales: { amazonIn: 200, flipkart: 80, amazonUS: 780, amazonUK: 340, bookleafStore: 160 },
        coverImage: ''
      },
      {
        author: author5._id,
        title: 'Letters to Nowhere',
        isbn: '978-93-12345-11-1',
        genre: 'Literary Fiction',
        status: 'Editing',
        mrp: 299,
        copiesSold: 0,
        royaltyEarned: 0,
        royaltyPaid: 0,
        royaltyPending: 0,
        platformSales: { amazonIn: 0, flipkart: 0, amazonUS: 0, amazonUK: 0, bookleafStore: 0 },
        coverImage: ''
      },

      {
        author: author6._id,
        title: 'Fintech Revolution',
        isbn: '978-93-12345-12-8',
        genre: 'Business',
        publicationDate: new Date('2025-02-28'),
        status: 'Published & Live',
        mrp: 599,
        copiesSold: 720,
        royaltyEarned: 18000,
        royaltyPaid: 18000,
        royaltyPending: 0,
        platformSales: { amazonIn: 300, flipkart: 180, amazonUS: 110, amazonUK: 50, bookleafStore: 80 },
        coverImage: ''
      },
      {
        author: author6._id,
        title: 'Market Mindset',
        isbn: '978-93-12345-13-5',
        genre: 'Self-Help',
        status: 'Distribution Setup',
        mrp: 349,
        copiesSold: 0,
        royaltyEarned: 0,
        royaltyPaid: 0,
        royaltyPending: 0,
        platformSales: { amazonIn: 0, flipkart: 0, amazonUS: 0, amazonUK: 0, bookleafStore: 0 },
        coverImage: ''
      },

      {
        author: author7._id,
        title: 'The Art of Letting Go',
        isbn: '978-93-12345-14-2',
        genre: 'Self-Help',
        publicationDate: new Date('2025-04-18'),
        status: 'Published & Live',
        mrp: 299,
        copiesSold: 3200,
        royaltyEarned: 44800,
        royaltyPaid: 30000,
        royaltyPending: 14800,
        platformSales: { amazonIn: 400, flipkart: 220, amazonUS: 1500, amazonUK: 680, bookleafStore: 400 },
        coverImage: ''
      },

      {
        author: author8._id,
        title: 'Quantum Dreams',
        isbn: '978-93-12345-15-9',
        genre: 'Science Fiction',
        status: 'ISBN Assignment',
        mrp: 399,
        copiesSold: 0,
        royaltyEarned: 0,
        royaltyPaid: 0,
        royaltyPending: 0,
        platformSales: { amazonIn: 0, flipkart: 0, amazonUS: 0, amazonUK: 0, bookleafStore: 0 },
        coverImage: ''
      },

      {
        author: author9._id,
        title: 'Silicon Minds',
        isbn: '978-93-12345-16-6',
        genre: 'Technology',
        publicationDate: new Date('2025-09-01'),
        status: 'Published & Live',
        mrp: 449,
        copiesSold: 410,
        royaltyEarned: 7200,
        royaltyPaid: 3000,
        royaltyPending: 4200,
        platformSales: { amazonIn: 50, flipkart: 20, amazonUS: 200, amazonUK: 90, bookleafStore: 50 },
        coverImage: ''
      },

      {
        author: author10._id,
        title: 'Ayurveda for Modern Life',
        isbn: '978-93-12345-17-3',
        genre: 'Health & Wellness',
        publicationDate: new Date('2025-07-14'),
        status: 'Manuscript Received',
        mrp: 329,
        copiesSold: 0,
        royaltyEarned: 0,
        royaltyPaid: 0,
        royaltyPending: 0,
        platformSales: { amazonIn: 0, flipkart: 0, amazonUS: 0, amazonUK: 0, bookleafStore: 0 },
        coverImage: ''
      },
      {
        author: author10._id,
        title: 'Kerala Kitchen Stories',
        isbn: '978-93-12345-18-0',
        genre: 'Cookbook',
        publicationDate: new Date('2025-10-05'),
        status: 'Published & Live',
        mrp: 499,
        copiesSold: 560,
        royaltyEarned: 11200,
        royaltyPaid: 8000,
        royaltyPending: 3200,
        platformSales: { amazonIn: 240, flipkart: 150, amazonUS: 70, amazonUK: 30, bookleafStore: 70 },
        coverImage: ''
      }
    ]);

    console.log(`Created ${books.length} books.`);
    console.log(`\nSeed successful: 11 users, 18 books`);
    console.log('\n--- Test Login Credentials ---');
    console.log('Admin:    admin@bookleaf.com / Admin@123');
    console.log('Author1:  author1@test.com / Author@123  (Priya Sharma)');
    console.log('Author2:  author2@test.com / Author@123  (Rohit Verma)');
    console.log('Author3:  author3@test.com / Author@123  (Ananya Iyer)');
    console.log('Author4:  author4@test.com / Author@123  (Vikram Desai)');
    console.log('Author5:  author5@test.com / Author@123  (Emily Johnson)');
    console.log('Author6:  author6@test.com / Author@123  (Arjun Patel)');
    console.log('Author7:  author7@test.com / Author@123  (Sarah Mitchell)');
    console.log('Author8:  author8@test.com / Author@123  (Kavitha Reddy)');
    console.log('Author9:  author9@test.com / Author@123  (Michael Chen)');
    console.log('Author10: author10@test.com / Author@123 (Deepa Nair)');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
