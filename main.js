const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('bookForm');
    bookForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const bookId = document.getElementById('bookId').value;
        if (bookId) {
            saveEditBook(parseInt(bookId));
        } else {
            addBook();
        }

        const searchBook = document.getElementById('searchBookTitle');
        searchBook.addEventListener('input', (event) => {
            searchBook(event.target.value);
        });
        document.getElementById('bookId').value = '';
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const inputSearch = document.querySelector('#searchBookTitle').value;
        searchBook(inputSearch);
    })
});

function addBook() {
    const judul = document.getElementById('bookFormTitle').value;
    const penulis = document.getElementById('bookFormAuthor').value;
    const tahun = Number(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsCompleted').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID,judul, penulis, tahun, isComplete);
   
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    };
}

function makeBook(bookObject) {
    const bookTitle = document.createElement('h2');
    bookTitle.setAttribute('data-testid', 'bookItemTitle' );
    bookTitle.innerText = bookObject.title;

    const authorBook = document.createElement('p');
    authorBook.setAttribute('data-testid', 'bookItemAuthor');
    authorBook.innerText = "Penulis : " + bookObject.author;

    const yearBook = document.createElement('p');
    yearBook.setAttribute('data-testid', 'bookItemYear');
    yearBook.innerText = "Tahun : " + bookObject.year;  

    const container = document.createElement('div');
    container.setAttribute('data-bookid', bookObject.id);
    container.setAttribute('data-testid', 'bookItem');
    container.classList.add('itemBook');
    container.append(bookTitle, authorBook, yearBook);

    const buttonEdit = document.createElement('button');
    buttonEdit.setAttribute('data-testid', 'bookItemEditButton');
    buttonEdit.classList.add('edit-button');
    buttonEdit.innerText = 'Edit';
    buttonEdit.addEventListener('click', () => {
            editBook(bookObject.id);
    });

    const buttonDelete = document.createElement('button');
    buttonDelete.setAttribute('data-testid', 'bookItemDeleteButton');
    buttonDelete.classList.add('delete-button');
    buttonDelete.innerText = 'Hapus';
    buttonDelete.addEventListener('click', () => {
        removeBookFromCompleted(bookObject.id);
       });

    if (bookObject.isComplete) {
        const buttonUndo = document.createElement('button');
        buttonUndo.setAttribute('data-testid', 'bookItemIsCompleteButton');
        buttonUndo.classList.add('undo-button');
        buttonUndo.innerText = 'Belum dibaca';
        buttonUndo.addEventListener('click', () => {
            undoBookFromCompleted(bookObject.id);
        });

        container.append(buttonUndo, buttonEdit, buttonDelete);
    } else {
        const buttonComplete = document.createElement('button');
        buttonComplete.setAttribute('data-testid', 'bookItemIsCompleteButton');
        buttonComplete.classList.add('complete-button');
        buttonComplete.innerText = "Sudah dibaca";
        buttonComplete.addEventListener('click', () => {
            addBookToCompleted(bookObject.id);
        });

        container.append(buttonComplete, buttonEdit, buttonDelete);
    }

    return container;
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function editBook(bookId) {
    const book = books.find((book) => 
        book.id === bookId);

    if (!book) return;
    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsCompleted').checked = book.isComplete;
    document.getElementById('bookId').value = bookId;
}

function saveEditBook(bookId) {
    const bookIndex = books.findIndex((book) => 
        book.id === bookId);

    if (bookIndex === -1) return;
    books[bookIndex].title = document.getElementById('bookFormTitle').value;
    books[bookIndex].author = document.getElementById('bookFormAuthor').value;
    books[bookIndex].year = Number(document.getElementById('bookFormYear').value);
    books[bookIndex].isComplete = document.getElementById('bookFormIsCompleted').checked;

    alert('Buku ini diedit');
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
} 

let search = '';
function searchBook(query) {
    search = query.toLowerCase();

    const item = document.querySelectorAll('[data-testid="bookItemTitle"]');
    if (search == '') {
        item.forEach(n => {
            n.parentElement.parentElement.style.display = 'block'
        })
    } else {
        item.forEach (n => {
            if (n.textContent.toLowerCase() != search) {
                n.parentElement.parentElement.style.display = 'none'
            } else {
                n.parentElement.parentElement.style.display = 'block'
            }
        })
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function filteredBook() {
    if (search === '') {
        return books;
    }
    return books.filter((book) => {
        book.title.toLowerCase().includes(search)
    });
}

document.addEventListener(RENDER_EVENT, () => {
    const uncompletedBook = document.getElementById('incompleteBookList');
    uncompletedBook.innerHTML = '';

    const completedBook = document.getElementById('completeBookList');
    completedBook.innerHTML = '';

    const filteredBook = filteredBookk();
    for (const bookItem of filteredBook) {
        const bookElement = makeBook(bookItem);

        if(!bookItem.isComplete)
            uncompletedBook.append(bookElement);
        else
            completedBook.append(bookElement);
    }
});

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY ='Bookshelf-Apps';

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert('Browser tidak mendukung local storage');
        return false;
    }
        return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}
