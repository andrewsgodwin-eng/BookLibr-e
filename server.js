const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and urlencoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Default curated book images (warm antique leather & gilded volumes)
const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80"
];

// In-memory data store for books
let books = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    year: 1925,
    genre: "Classic Fiction",
    cover: DEFAULT_COVERS[0]
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    year: 1960,
    genre: "Southern Gothic",
    cover: DEFAULT_COVERS[1]
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: "Dystopian Political Fiction",
    cover: DEFAULT_COVERS[2]
  },
  {
    id: 4,
    title: "Remembrance of Things Past",
    author: "Marcel Proust",
    year: 1913,
    genre: "Philosophical Literature",
    cover: DEFAULT_COVERS[3]
  },
  {
    id: 5,
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    year: 1890,
    genre: "Gothic Philosophical",
    cover: DEFAULT_COVERS[4]
  }
];

// Helper to calculate next available ID
let nextId = 6;

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. GET /books - Return all books
app.get('/books', (req, res) => {
  res.status(200).json({
    success: true,
    count: books.length,
    data: books
  });
});

// 2. GET /books/:id - Return a single book by ID
app.get('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  if (isNaN(bookId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Book ID provided. ID must be an integer.'
    });
  }

  const book = books.find(b => b.id === bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: `Book with ID ${bookId} not found in Booklibr'e.`
    });
  }

  res.status(200).json({
    success: true,
    data: book
  });
});

// 3. POST /books - Add a new book from request body
app.post('/books', (req, res) => {
  const { title, author, year, genre, cover } = req.body;

  // Validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: "title" is required and must be a non-empty string.'
    });
  }

  if (!author || typeof author !== 'string' || !author.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: "author" is required and must be a non-empty string.'
    });
  }

  const randomCover = DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)];

  const newBook = {
    id: nextId++,
    title: title.trim(),
    author: author.trim(),
    year: year ? parseInt(year, 10) || new Date().getFullYear() : new Date().getFullYear(),
    genre: genre && typeof genre === 'string' && genre.trim() ? genre.trim() : 'Classic Fiction',
    cover: cover && typeof cover === 'string' && cover.trim() ? cover.trim() : randomCover
  };

  books.push(newBook);

  res.status(201).json({
    success: true,
    message: 'Book successfully added to Booklibr\'e.',
    data: newBook
  });
});

// 4. PUT /books/:id - Update an existing book by ID
app.put('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  if (isNaN(bookId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Book ID. ID must be an integer.'
    });
  }

  const bookIndex = books.findIndex(b => b.id === bookId);
  if (bookIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Cannot update: Book with ID ${bookId} was not found.`
    });
  }

  const { title, author, year, genre, cover } = req.body;

  if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: "title" cannot be empty.'
    });
  }

  if (author !== undefined && (!author || typeof author !== 'string' || !author.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: "author" cannot be empty.'
    });
  }

  books[bookIndex] = {
    ...books[bookIndex],
    title: title !== undefined ? title.trim() : books[bookIndex].title,
    author: author !== undefined ? author.trim() : books[bookIndex].author,
    year: year !== undefined ? (parseInt(year, 10) || books[bookIndex].year) : books[bookIndex].year,
    genre: genre !== undefined && typeof genre === 'string' ? genre.trim() : books[bookIndex].genre,
    cover: cover !== undefined && typeof cover === 'string' && cover.trim() ? cover.trim() : books[bookIndex].cover
  };

  res.status(200).json({
    success: true,
    message: `Book ID ${bookId} has been successfully updated.`,
    data: books[bookIndex]
  });
});

// 5. DELETE /books/:id - Remove a book by ID
app.delete('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  if (isNaN(bookId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Book ID. ID must be an integer.'
    });
  }

  const bookIndex = books.findIndex(b => b.id === bookId);
  if (bookIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Cannot delete: Book with ID ${bookId} was not found.`
    });
  }

  const [deletedBook] = books.splice(bookIndex, 1);

  res.status(200).json({
    success: true,
    message: `Book "${deletedBook.title}" (ID: ${bookId}) has been removed.`,
    data: deletedBook
  });
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    app: "Booklibr'e",
    documentation: {
      getAll: 'GET /books',
      getOne: 'GET /books/:id',
      create: 'POST /books (JSON body with { title, author, year, genre, cover })',
      update: 'PUT /books/:id (JSON body with fields to modify)',
      delete: 'DELETE /books/:id'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`✨ Booklibr'e REST API is live!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📚 Endpoints: GET /books, POST /books, PUT /books/:id, DELETE /books/:id`);
  console.log(`======================================================\n`);
});
