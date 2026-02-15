// State management
let notes = [];
let currentNote = null;
let isEditing = false;

// DOM elements
const notesStack = document.getElementById('notesStack');
const addNoteBtn = document.getElementById('addNoteBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const noteIframe = document.getElementById('noteIframe');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    addNoteBtn.addEventListener('click', openNewNoteModal);
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Listen for messages from iframe
    window.addEventListener('message', handleIframeMessage);
}

// Load notes from server
async function loadNotes() {
    try {
        const response = await fetch('/api/notes');
        if (!response.ok) throw new Error('Failed to load notes');
        
        notes = await response.json();
        renderNotes();
    } catch (error) {
        console.error('Error loading notes:', error);
        // If the API endpoint doesn't exist yet, you can test with mock data
        // Uncomment below for testing without backend:
        // notes = mockNotes();
        // renderNotes();
    }
}

// Mock data for testing (remove when backend is ready)
function mockNotes() {
    return [
        {
            id: 1,
            title: 'Shopping List',
            content: 'Milk\nBread\nEggs\nCoffee',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 2,
            title: 'Meeting Notes',
            content: 'Discuss project timeline\nReview budget\nAssign tasks',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 3,
            title: 'Ideas',
            content: 'New feature for app\nBlog post topics\nWeekend plans',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString()
        }
    ];
}

// Render notes in the stack
function renderNotes() {
    notesStack.innerHTML = '';
    
    // Sort notes by updated_at (newest first)
    const sortedNotes = [...notes].sort((a, b) => 
        new Date(b.updated_at) - new Date(a.updated_at)
    );

    sortedNotes.forEach((note, index) => {
        const postIt = createPostItElement(note, index);
        notesStack.appendChild(postIt);
    });
}

// Create post-it element
function createPostItElement(note, index) {
    const postIt = document.createElement('div');
    postIt.className = 'post-it';
    postIt.dataset.noteId = note.id;
    
    // Show title as the main visible text
    const title = note.title || 'Untitled';

    postIt.innerHTML = `
        <div class="post-it-inner">
            <div class="post-it-title">${escapeHtml(title)}</div>
            <div class="post-it-preview">${escapeHtml(title)}</div>
        </div>
    `;

    postIt.addEventListener('click', () => selectNote(note));

    return postIt;
}

// Select a note (just update active state for now)
function selectNote(note) {
    currentNote = note;
    
    // Update active state
    document.querySelectorAll('.post-it').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`[data-note-id="${note.id}"]`)?.classList.add('active');
}

// Open modal for new note
function openNewNoteModal() {
    modalTitle.textContent = 'New Note';
    noteIframe.src = '/note_form';
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Open modal for editing note
function openEditNoteModal(noteId) {
    modalTitle.textContent = 'Edit Note';
    noteIframe.src = `/note_form?id=${noteId}`;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    modalOverlay.classList.remove('active');
    noteIframe.src = '';
    document.body.style.overflow = '';
}

// Handle messages from iframe
function handleIframeMessage(event) {
    if (event.data.type === 'closeModal') {
        closeModal();
    } else if (event.data.type === 'noteSaved') {
        // Reload notes after saving
        loadNotes();
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today at ' + date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
    } else if (diffDays === 1) {
        return 'Yesterday at ' + date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
    } else if (diffDays < 7) {
        return diffDays + ' days ago';
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
