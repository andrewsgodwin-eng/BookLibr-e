// Application State
let catalog = [];
let totalRequestsCount = 0;

const FALLBACK_COVER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80";

// DOM Selectors
const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const statVolumes = document.getElementById('statVolumes');
const statAuthors = document.getElementById('statAuthors');
const statRequests = document.getElementById('statRequests');
const inspectorConsole = document.getElementById('inspectorConsole');

// Acquire Form & Preview Selectors
const addBookForm = document.getElementById('addBookForm');
const newTitleInput = document.getElementById('newTitle');
const newAuthorInput = document.getElementById('newAuthor');
const newYearInput = document.getElementById('newYear');
const newGenreInput = document.getElementById('newGenre');
const newCoverInput = document.getElementById('newCover');
const previewCoverImg = document.getElementById('previewCoverImg');
const previewTitleText = document.getElementById('previewTitleText');
const previewAuthorText = document.getElementById('previewAuthorText');
const previewYearText = document.getElementById('previewYearText');
const previewGenreTag = document.getElementById('previewGenreTag');

// Edit Modal Selectors
const editModal = document.getElementById('editModal');
const editBookForm = document.getElementById('editBookForm');
const editBookId = document.getElementById('editBookId');
const editTitle = document.getElementById('editTitle');
const editAuthor = document.getElementById('editAuthor');
const editYear = document.getElementById('editYear');
const editGenre = document.getElementById('editGenre');
const editCover = document.getElementById('editCover');

// ----------------------------------------------------
// PAGE NAVIGATION ROUTER
// ----------------------------------------------------
function navigateTo(pageId) {
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.target === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Switch view containers
  document.querySelectorAll('.page-view').forEach(view => {
    if (view.id === `page-${pageId}`) {
      view.classList.add('active-page');
    } else {
      view.classList.remove('active-page');
    }
  });

  // Update URL hash without reload
  if (window.location.hash !== `#${pageId}`) {
    history.pushState(null, null, `#${pageId}`);
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('popstate', () => {
  const hash = window.location.hash.replace('#', '') || 'collection';
  navigateTo(hash);
});

// ----------------------------------------------------
// LIVE API INSPECTOR LOGGING
// ----------------------------------------------------
function logInspector(method, url, status, data) {
  totalRequestsCount++;
  statRequests.textContent = totalRequestsCount;

  const timestamp = new Date().toLocaleTimeString();
  let statusColor = '#34d399';
  if (status >= 400) statusColor = '#f87171';
  else if (status === 201) statusColor = '#60a5fa';

  const entry = document.createElement('div');
  entry.style.cssText = 'border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1rem; margin-bottom: 1rem;';
  entry.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.8rem;">
      <span>
        <strong style="color:var(--mustard-bright); font-size:0.85rem;">${method}</strong> 
        <span style="font-weight:600; color:#fff;">${escapeHtml(url)}</span>
      </span>
      <span>
        <span style="color:${statusColor}; font-weight:700;">HTTP ${status}</span> • ${timestamp}
      </span>
    </div>
    <pre style="color:#d4af37; white-space:pre-wrap; word-break:break-all; font-size:0.8rem;">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
  `;

  inspectorConsole.insertBefore(entry, inspectorConsole.firstChild);
}

function clearConsole() {
  inspectorConsole.innerHTML = `
    <div style="color:#888; font-style:italic;">Console cleared. Awaiting requests...</div>
  `;
}

// ----------------------------------------------------
// TOAST NOTIFICATIONS
// ----------------------------------------------------
function showToast(message, isError = false) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'fashion-toast';
  if (isError) toast.style.borderLeftColor = 'var(--burgundy-hover)';
  toast.innerHTML = `<span>${isError ? '⚠️' : '📖'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. GET /books
async function fetchBooks() {
  try {
    const res = await fetch('/books');
    const data = await res.json();
    logInspector('GET', '/books', res.status, data);

    if (res.ok && data.success) {
      catalog = data.data;
      renderBooks(catalog);
      updateStats();
    } else {
      showToast(data.message || 'Error retrieving collection', true);
    }
  } catch (err) {
    console.error(err);
    logInspector('GET', '/books', 500, { error: err.message });
    showToast('Cannot connect to Booklibr\'e server', true);
  }
}

// 2. GET /books/:id (Inspector Test)
async function inspectSingleBook(id) {
  try {
    const res = await fetch(`/books/${id}`);
    const data = await res.json();
    logInspector('GET', `/books/${id}`, res.status, data);
    showToast(`Inspected volume #${id}`);
  } catch (err) {
    showToast('Failed to fetch book', true);
  }
}

// 3. Test 404 Route (Inspector Test)
async function inspect404Test() {
  try {
    const res = await fetch('/books/999');
    const data = await res.json();
    logInspector('GET', '/books/999', res.status, data);
    showToast('Tested 404 response successfully');
  } catch (err) {
    console.error(err);
  }
}

// 4. POST /books (Add Volume)
async function handleCreateBook(bookData) {
  try {
    const res = await fetch('/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    const data = await res.json();
    logInspector('POST', '/books', res.status, data);

    if (res.ok && data.success) {
      showToast(`Archived: "${data.data.title}"`);
      addBookForm.reset();
      updatePreview();
      await fetchBooks();
      navigateTo('collection');
    } else {
      showToast(data.message || 'Creation failed', true);
    }
  } catch (err) {
    console.error(err);
    showToast('Network error while archiving volume', true);
  }
}

// 5. PUT /books/:id (Amend Volume)
async function handleUpdateBook(id, bookData) {
  try {
    const res = await fetch(`/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    const data = await res.json();
    logInspector('PUT', `/books/${id}`, res.status, data);

    if (res.ok && data.success) {
      showToast(`Updated: "${data.data.title}"`);
      closeEditModal();
      fetchBooks();
    } else {
      showToast(data.message || 'Update failed', true);
    }
  } catch (err) {
    console.error(err);
    showToast('Network error while updating volume', true);
  }
}

// 6. DELETE /books/:id (Remove Volume)
async function deleteBook(id, title) {
  if (!confirm(`Are you certain you wish to delete "${title}" (ID: ${id}) from Booklibr'e?`)) {
    return;
  }

  try {
    const res = await fetch(`/books/${id}`, { method: 'DELETE' });
    const data = await res.json();
    logInspector('DELETE', `/books/${id}`, res.status, data);

    if (res.ok && data.success) {
      showToast(`Removed volume #${id}`);
      fetchBooks();
    } else {
      showToast(data.message || 'Deletion failed', true);
    }
  } catch (err) {
    console.error(err);
    showToast('Network error while removing volume', true);
  }
}

// ----------------------------------------------------
// UI RENDERING WITH CUSTOM PICTURES
// ----------------------------------------------------
function renderBooks(books) {
  booksGrid.innerHTML = '';

  if (!books || books.length === 0) {
    booksGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--cream-card); border: 1px solid var(--cream-border); border-radius: 4px;">
        <h3 style="font-family: var(--font-fashion); font-size: 1.6rem; font-weight: 700; color: var(--text-dark-primary); margin-bottom: 0.5rem;">No Matching Volumes</h3>
        <p style="font-family: var(--font-editorial); font-size: 1.3rem; font-style: italic; color: var(--text-dark-author); margin-bottom: 1.5rem;">The catalog holds no works matching your search criteria.</p>
        <button class="btn-high-fashion" onclick="navigateTo('acquire')" style="max-width: 280px; margin: 0 auto;">Acquire A Volume</button>
      </div>
    `;
    return;
  }

  books.forEach(book => {
    const coverUrl = book.cover || FALLBACK_COVER;
    const card = document.createElement('div');
    card.className = 'editorial-card';
    card.innerHTML = `
      <div class="card-cover-container">
        <img class="card-cover-img" src="${coverUrl}" alt="${escapeHtml(book.title)}" onerror="this.src='${FALLBACK_COVER}'">
        <div class="card-cover-overlay">
          <span class="card-vol-badge">VOL • 0${book.id}</span>
          <span class="card-genre-badge">${escapeHtml(book.genre || 'Classic')}</span>
        </div>
      </div>

      <div class="card-body-content">
        <h3 class="card-title">${escapeHtml(book.title)}</h3>
        <p class="card-author">by ${escapeHtml(book.author)}</p>
        
        <div class="card-meta-line">
          <span>Edition Year: <strong style="color:var(--text-dark-primary);">${book.year || 'Unknown'}</strong></span>
          <span>REST ID: <strong style="color:var(--burgundy-primary);">#${book.id}</strong></span>
        </div>
      </div>

      <div class="card-actions-strip">
        <button class="btn-card-action edit" onclick="openEditModal(${book.id})">✏️ Amend</button>
        <button class="btn-card-action delete" onclick="deleteBook(${book.id}, '${escapeHtml(book.title)}')">🗑️ Remove</button>
      </div>
    `;
    booksGrid.appendChild(card);
  });
}

function updateStats() {
  statVolumes.textContent = catalog.length;
  const uniqueAuthors = new Set(catalog.map(b => b.author.trim().toLowerCase())).size;
  statAuthors.textContent = uniqueAuthors;
}

// ----------------------------------------------------
// PRESET COVERS & LIVE PREVIEW
// ----------------------------------------------------
function selectPresetCover(url) {
  newCoverInput.value = url;
  document.querySelectorAll('.preset-thumb').forEach(thumb => {
    if (thumb.src === url) {
      thumb.classList.add('active-thumb');
    } else {
      thumb.classList.remove('active-thumb');
    }
  });
  updatePreview();
}

function updatePreview() {
  const title = newTitleInput.value.trim() || 'The Odyssey';
  const author = newAuthorInput.value.trim() || 'Homer';
  const year = newYearInput.value || '1920';
  const genre = newGenreInput.value.trim() || 'Epic Poetry';
  const cover = newCoverInput.value.trim() || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';

  previewTitleText.textContent = title;
  previewAuthorText.textContent = `by ${author}`;
  previewYearText.textContent = year;
  previewGenreTag.textContent = genre;
  previewCoverImg.src = cover;
  previewCoverImg.onerror = () => { previewCoverImg.src = FALLBACK_COVER; };
}

[newTitleInput, newAuthorInput, newYearInput, newGenreInput, newCoverInput].forEach(input => {
  input.addEventListener('input', updatePreview);
});

// ----------------------------------------------------
// EDIT MODAL
// ----------------------------------------------------
function openEditModal(id) {
  const book = catalog.find(b => b.id === id);
  if (!book) return;

  editBookId.value = book.id;
  editTitle.value = book.title;
  editAuthor.value = book.author;
  editYear.value = book.year || new Date().getFullYear();
  editGenre.value = book.genre || 'Classic Fiction';
  editCover.value = book.cover || '';

  document.getElementById('editModalTitle').textContent = `Amend Volume #${id}`;
  editModal.classList.add('active');
  editTitle.focus();
}

function closeEditModal() {
  editModal.classList.remove('active');
}

editBookForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = parseInt(editBookId.value, 10);
  const payload = {
    title: editTitle.value.trim(),
    author: editAuthor.value.trim(),
    year: parseInt(editYear.value, 10) || new Date().getFullYear(),
    genre: editGenre.value.trim(),
    cover: editCover.value.trim() || undefined
  };
  handleUpdateBook(id, payload);
});

// Add Book submission
addBookForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const payload = {
    title: newTitleInput.value.trim(),
    author: newAuthorInput.value.trim(),
    year: parseInt(newYearInput.value, 10) || new Date().getFullYear(),
    genre: newGenreInput.value.trim(),
    cover: newCoverInput.value.trim() || undefined
  };
  handleCreateBook(payload);
});

// Real-time search filter
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    renderBooks(catalog);
    return;
  }
  const filtered = catalog.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    (book.genre && book.genre.toLowerCase().includes(query)) ||
    String(book.year).includes(query) ||
    String(book.id) === query
  );
  renderBooks(filtered);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '') || 'collection';
  navigateTo(hash);
  fetchBooks();
  updatePreview();
});
