# 📖 Bibliothèque Royale — Luxury Book Management REST API

A REST API for managing a list of books built with **Node.js** and **Express**. All data is stored in memory (`{ id, title, author, year, genre }`), and the project includes an interactive web interface with an aesthetic palette of **warm cream**, **burgundy**, **mustard gold**, **dark berry**, and **charcoal**.

---

## 🏛️ Features & Deliverables

- **Pure In-Memory Storage**: Zero external database dependencies required.
- **Full CRUD REST API**:
  - `GET /books` — Retrieve all books in catalog
  - `GET /books/:id` — Retrieve a single book by ID
  - `POST /books` — Create a new book volume
  - `PUT /books/:id` — Update an existing book by ID
  - `DELETE /books/:id` — Remove a book from memory
- **Luxury UI Client**:
  - Served automatically at `http://localhost:3000`
  - Crafted with the requested palette:
    - **Warm Cream**: `#FAF8F2` & `#F5EFE3` (parchment backdrops and cards)
    - **Burgundy**: `#7E182B` (royal buttons, badges, highlights)
    - **Mustard Gold**: `#D4A328` (borders, crests, accents)
    - **Dark Berry**: `#290818` (regal navbar and card headers)
    - **Charcoal**: `#18181C` (typography, console panel, footer)
  - Features real-time API inspector console, live search/filtering, modal forms, and toast notifications.
- **Postman Testing Ready**: Pre-configured `book_api.postman_collection.json` included in the root and downloadable from the web UI.

---

## 🚀 Quick Start Guide

### 1. Open Terminal and Navigate to the Project

```bash
cd C:\Users\andrews\.gemini\antigravity\scratch\book-management-api
```

### 2. Start the Server

```bash
npm start
```
*(Alternatively, for auto-reload during development: `npm run dev`)*

The server will initialize on port **3000**:
```
======================================================
✨ Grand Luxury Book Management API is running!
📡 URL: http://localhost:3000
📚 Endpoints:
   - GET    /books
   - GET    /books/:id
   - POST   /books
   - PUT    /books/:id
   - DELETE /books/:id
======================================================
```

### 3. Open in Browser
Visit **`http://localhost:3000`** in your browser to view and interact with the luxury management dashboard.

---

## 📮 Testing with Postman (Free)

1. Open **Postman**.
2. Click **Import** (top left).
3. Select the file:
   ```
   C:\Users\andrews\.gemini\antigravity\scratch\book-management-api\public\book_api.postman_collection.json
   ```
4. All 5 requests are pre-configured:
   - `1. GET All Books` -> `GET http://localhost:3000/books`
   - `2. GET Single Book by ID` -> `GET http://localhost:3000/books/1`
   - `3. POST Create New Book` -> `POST http://localhost:3000/books` (with sample JSON body)
   - `4. PUT Update Book by ID` -> `PUT http://localhost:3000/books/1` (with sample JSON body)
   - `5. DELETE Book by ID` -> `DELETE http://localhost:3000/books/2`

---

## 💻 Testing with cURL (Terminal / Command Prompt)

### 1. GET all books
```bash
curl -X GET http://localhost:3000/books
```

### 2. GET a single book by ID
```bash
curl -X GET http://localhost:3000/books/1
```

### 3. POST a new book
```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"The Count of Monte Cristo\", \"author\": \"Alexandre Dumas\", \"year\": 1844, \"genre\": \"Adventure Fiction\"}"
```

### 4. PUT update an existing book
```bash
curl -X PUT http://localhost:3000/books/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"The Great Gatsby (Diamond Jubilee Edition)\", \"author\": \"F. Scott Fitzgerald\"}"
```

### 5. DELETE a book by ID
```bash
curl -X DELETE http://localhost:3000/books/2
```

---

## 📂 Project Structure

```
book-management-api/
├── package.json                   # Project metadata and dependencies (express)
├── server.js                      # Express application, routes & in-memory store
├── README.md                      # Documentation & instructions
└── public/                        # Luxury web UI
    ├── index.html                 # HTML5 layout & modal structures
    ├── style.css                  # Custom luxury styling (Cream, Burgundy, Mustard, Berry, Charcoal)
    ├── app.js                     # REST API client & real-time console
    └── book_api.postman_collection.json # Ready-to-import Postman collection
```
