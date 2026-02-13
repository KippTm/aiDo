// State management
let notes = [];
let currentNote = null;
let isEditing = false;

// DOM elements
const notesStack = document.getElementById('notesStack');
const addNoteBtn = document.getElementById('addNoteBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    addNoteBtn.addEventListener('click', createNewNote);
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
    
    // Get preview text (first 50 chars of content)
    const preview = note.content ? 
        note.content.substring(0, 50) + (note.content.length > 50 ? '...' : '') : 
        'Empty note';

    postIt.innerHTML = `
        <div class="post-it-inner">
            <div class="post-it-title">${escapeHtml(note.title || 'Untitled')}</div>
            <div class="post-it-preview">${escapeHtml(preview)}</div>
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

// Create new note
async function createNewNote() {
    try {
        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'New Note',
                content: ''
            })
        });

        if (!response.ok) throw new Error('Failed to create note');

        const newNote = await response.json();
        notes.push(newNote);
        renderNotes();
        selectNote(newNote);
    } catch (error) {
        console.error('Error creating note:', error);
        
        // Mock creation for testing
        const newNote = {
            id: Date.now(),
            title: 'New Note',
            content: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        notes.push(newNote);
        renderNotes();
        selectNote(newNote);
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
