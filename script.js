// --- DATA MANAGEMENT ---
let users = JSON.parse(localStorage.getItem('library_users') || '[]');
let allBooks = JSON.parse(localStorage.getItem('library_books') || '[]');
let currentUser = localStorage.getItem('library_session');

// --- AUTHENTICATION ---
function login() {
    const u = document.getElementById('usernameInput').value.trim();
    const p = document.getElementById('passwordInput').value;
    const user = users.find(x => x.username === u && x.password === p);

    if (user) {
        currentUser = u;
        localStorage.setItem('library_session', u);
        showApp();
    } else {
        const err = document.getElementById('loginError');
        err.innerText = "Chybné jméno nebo heslo";
        err.style.display = "block";
    }
}

function register() {
    const u = document.getElementById('usernameInput').value.trim();
    const p = document.getElementById('passwordInput').value;
    if (u.length < 3) return alert("Jméno musí mít aspoň 3 znaky");
    if (users.find(x => x.username === u)) return alert("Uživatel již existuje");
    
    users.push({username: u, password: p});
    localStorage.setItem('library_users', JSON.stringify(users));
    login();
}

function logout() {
    localStorage.removeItem('library_session');
    location.reload();
}

// --- UI CONTROL ---
function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'flex';
    document.getElementById('loggedUserName').innerText = currentUser;
    renderBooks(getUserBooks().filter(b => b.ownership !== 'Wishlist'));
}

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function handleMenuClick(el, type) {
    document.querySelectorAll('#menuList li').forEach(li => li.classList.remove('active'));
    el.classList.add('active');
    if (window.innerWidth <= 768) toggleMenu();
    
    let filtered = getUserBooks();
    if (type === 'all') filtered = filtered.filter(b => b.ownership !== 'Wishlist');
    else if (type === 'owned') filtered = filtered.filter(b => b.ownership === 'Vlastní');
    else if (type === 'read') filtered = filtered.filter(b => b.readStatus === 'Dočteno');
    else if (type === 'wishlist') filtered = filtered.filter(b => b.ownership === 'Wishlist');
    
    document.getElementById('pageTitle').innerText = el.innerText;
    renderBooks(filtered);
}

// --- BOOKS LOGIC ---
function getUserBooks() {
    return allBooks.filter(b => b.owner === currentUser);
}

function renderBooks(books = getUserBooks()) {
    const grid = document.getElementById('booksGrid');
    grid.innerHTML = books.map(book => `
        <div class="book-card" onclick="editBook(${book.id})">
            <div class="book-cover">${book.title}</div>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div style="font-size:12px; color:#6b7280;">${book.author}</div>
                <span class="badge ${book.format === 'E-book' ? 'badge-ebook' : 'badge-physical'}">${book.format}</span>
            </div>
        </div>
    `).join('');
}

function searchBooks() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = getUserBooks().filter(b => 
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
    renderBooks(filtered);
}

// --- MODAL LOGIC ---
function openModal() {
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    document.getElementById('modalTitle').innerText = "Nová kniha";
    document.getElementById('deleteBtnContainer').classList.add('hidden');
    document.getElementById('bookModal').style.display = 'flex';
}

function closeModal() { 
    document.getElementById('bookModal').style.display = 'none'; 
}

function editBook(id) {
    const book = allBooks.find(b => b.id === id);
    if (!book) return;
    document.getElementById('bookId').value = book.id;
    document.getElementById('bTitle').value = book.title;
    document.getElementById('bAuthor').value = book.author;
    document.getElementById('bFormat').value = book.format;
    document.getElementById('bReadStatus').value = book.readStatus;
    document.getElementById('bOwnership').value = book.ownership;
    document.getElementById('modalTitle').innerText = "Upravit knihu";
    document.getElementById('deleteBtnContainer').classList.remove('hidden');
    document.getElementById('bookModal').style.display = 'flex';
}

function saveBook(e) {
    e.preventDefault();
    const id = document.getElementById('bookId').value;
    const bookData = {
        id: id ? parseInt(id) : Date.now(),
        owner: currentUser,
        title: document.getElementById('bTitle').value,
        author: document.getElementById('bAuthor').value,
        format: document.getElementById('bFormat').value,
        readStatus: document.getElementById('bReadStatus').value,
        ownership: document.getElementById('bOwnership').value
    };

    if (id) {
        const idx = allBooks.findIndex(b => b.id === parseInt(id));
        allBooks[idx] = bookData;
    } else {
        allBooks.push(bookData);
    }

    localStorage.setItem('library_books', JSON.stringify(allBooks));
    closeModal();
    renderBooks();
}

function deleteBook() {
    const id = parseInt(document.getElementById('bookId').value);
    if (confirm("Opravdu smazat?")) {
        allBooks = allBooks.filter(b => b.id !== id);
        localStorage.setItem('library_books', JSON.stringify(allBooks));
        closeModal();
        renderBooks();
    }
}

window.onload = () => {
    if (currentUser) showApp();
};
