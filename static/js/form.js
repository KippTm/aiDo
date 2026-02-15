const noteForm = document.getElementById('noteForm');
const noteId = document.getElementById('noteId');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const cancelBtn = document.getElementById('cancelBtn');
const titleError = document.getElementById('titleError');
const successMessage = document.getElementById('successMessage');

// Check if we're editing an existing note
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('id');

if (editId) {
    // Load existing note data
    loadNoteData(editId);
}

async function loadNoteData(id) {
    try {
        const response = await fetch(`/api/notes/${id}`);
        if (response.ok) {
            const note = await response.json();
            noteId.value = note.id;
            noteTitle.value = note.title;
            noteContent.value = note.content;
        }
    } catch (error) {
        console.error('Error loading note:', error);
    }
}

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validation
    if (!noteTitle.value.trim()) {
        titleError.style.display = 'block';
        noteTitle.focus();
        return;
    }
    titleError.style.display = 'none';

    const noteData = {
        title: noteTitle.value.trim(),
        content: noteContent.value.trim()
    };

    // If editing, include the ID
    if (noteId.value) {
        noteData.id = parseInt(noteId.value);
    }

    try {
        const url = noteId.value ? `/api/notes/${noteId.value}` : '/api/notes';
        const method = noteId.value ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noteData)
        });

        if (response.ok) {
            // Show success message
            successMessage.style.display = 'block';
            
            // Notify parent window
            window.parent.postMessage({ 
                type: 'noteSaved',
                data: noteData 
            }, '*');

            // Close modal after a short delay
            setTimeout(() => {
                window.parent.postMessage({ type: 'closeModal' }, '*');
            }, 800);
        } else {
            alert('Failed to save note. Please try again.');
        }
    } catch (error) {
        console.error('Error saving note:', error);
        alert('An error occurred. Please try again.');
    }
});

cancelBtn.addEventListener('click', () => {
    window.parent.postMessage({ type: 'closeModal' }, '*');
});

