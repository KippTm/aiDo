document.addEventListener('DOMContentLoaded', () => {
    // ---- Note Management Logic ----
    const notesList = document.getElementById('notesList');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const modalOverlay = document.getElementById('noteModal');
    const noteIframe = document.getElementById('noteIframe');
    const closeModalBtn = document.getElementById('closeModalBtn');

    async function loadNotes() {
        try {
            const response = await fetch('/api/notes');
            const notes = await response.json();
            
            notesList.innerHTML = '';
            
            notes.forEach(note => {
                // Building the post-it stack programmatically
                const postIt = document.createElement('div');
                postIt.className = 'post-it';
                
                const inner = document.createElement('div');
                inner.className = 'post-it-inner';
                
                const title = document.createElement('div');
                title.className = 'post-it-title';
                title.textContent = note.title;
                
                const preview = document.createElement('div');
                preview.className = 'post-it-preview';
                // Trim content slightly for the preview
                preview.textContent = note.content ? note.content.substring(0, 45) + '...' : 'Empty note...';
                
                inner.appendChild(title);
                inner.appendChild(preview);
                postIt.appendChild(inner);
                
                postIt.addEventListener('click', () => openModal(note.id));
                notesList.appendChild(postIt);
            });
        } catch (error) {
            console.error('Failed to load notes:', error);
        }
    }

    function openModal(noteId = null) {
        const url = noteId ? `/note_form?id=${noteId}` : '/note_form';
        noteIframe.src = url;
        modalOverlay.classList.add('active');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        // Clear iframe source after transition finishes to prevent flicker
        setTimeout(() => { noteIframe.src = ''; }, 300); 
    }

    newNoteBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    window.addEventListener('message', (event) => {
        if (event.data.type === 'closeModal') {
            closeModal();
        } else if (event.data.type === 'noteSaved') {
            loadNotes();
        }
    });

    // ---- Dynamic Calendar Logic ----
    const calGrid = document.getElementById('calendarGrid');
    const monthYearDisplay = document.getElementById('currentMonthYear');
    let currentDate = new Date();

    function renderCalendar() {
        calGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const header = document.createElement('div');
            header.className = 'cal-day-header';
            header.textContent = day;
            calGrid.appendChild(header);
        });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

        // Blank spots for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            const empty = document.createElement('div');
            empty.className = 'cal-day empty';
            calGrid.appendChild(empty);
        }

        // Fill in the active days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'cal-day';
            dayEl.textContent = i;
            
            if (isCurrentMonth && i === today.getDate()) {
                dayEl.classList.add('today');
            }
            
            calGrid.appendChild(dayEl);
        }
    }

    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Calendar Sync Stub
    document.getElementById('syncCalendarBtn').addEventListener('click', () => {
        console.log("Initiate external calendar OAuth flow...");
        alert("The frontend framework is ready! To fetch live events, you will need to set up OAuth 2.0 and API calls in your Flask backend.");
    });

    // Initialization
    loadNotes();
    renderCalendar();
});
