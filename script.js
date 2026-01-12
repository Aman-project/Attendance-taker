// Hardcoded EmailJS Configuration
const EMAILJS_CONFIG = {
    SERVICE_ID: "service_7ywtjw4",
    TEMPLATE_ID: "template_ldl0bbk",
    PUBLIC_KEY: "gcy3ybHS_nUWzQCVJ"
};

// State Management
let sessionData = {
    course: '',
    year: '',
    subject: '',
    section: '',
    quantity: 0,
    startTime: null,
    absentees: []
};

// DOM Elements
const views = {
    setup: document.getElementById('setup-view'),
    attendance: document.getElementById('attendance-view'),
    success: document.getElementById('success-view'),
    emailModal: document.getElementById('email-modal')
};
const forms = {
    setup: document.getElementById('setup-form'),
    email: document.getElementById('email-form')
};
const inputs = {
    course: document.getElementById('course'),
    year: document.getElementById('year'),
    subject: document.getElementById('subject'),
    section: document.getElementById('section'),
    quantity: document.getElementById('quantity'),
    recipientEmail: document.getElementById('recipient-email')
};
const displays = {
    subject: document.getElementById('display-subject'),
    section: document.getElementById('display-section'),
    date: document.getElementById('display-date'),
    time: document.getElementById('display-time'),
    absentCount: document.getElementById('absent-count'),
    grid: document.getElementById('students-grid')
};
const loader = document.getElementById('loader');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        console.log("EmailJS Initialized");
    } catch (e) {
        console.error("Failed to init EmailJS", e);
        alert("Error initializing Email Service.");
    }

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered!', reg))
            .catch(err => console.error('Service Worker Registration Failed', err));
    }

    restoreSession(); // Restore state on load
    setupEventListeners();
});

function saveSession() {
    localStorage.setItem('ats_session', JSON.stringify(sessionData));
}

function restoreSession() {
    const saved = localStorage.getItem('ats_session');
    if (saved) {
        try {
            sessionData = JSON.parse(saved);

            // Default new fields if missing (migration for old sessions)
            if (!sessionData.course) sessionData.course = '';
            if (!sessionData.year) sessionData.year = '';

            // Restore Inputs
            inputs.course.value = sessionData.course || '';
            inputs.year.value = sessionData.year || '';
            inputs.subject.value = sessionData.subject || '';
            inputs.section.value = sessionData.section || '';
            inputs.quantity.value = sessionData.quantity || '';

            // If we had an active session, go to attendance view
            if (sessionData.quantity > 0) {
                renderAttendanceView();

                // Restore Checkboxes
                if (sessionData.absentees && sessionData.absentees.length > 0) {
                    sessionData.absentees.forEach(id => {
                        const cb = document.querySelector(`.student-checkbox[value="${id}"]`);
                        if (cb) cb.checked = true;
                    });
                    updateStats(); // Update visuals
                }
            }
        } catch (e) {
            console.error("Error restoring session", e);
            localStorage.removeItem('ats_session');
        }
    }
}

function setupEventListeners() {
    // Start Attendance
    forms.setup.addEventListener('submit', (e) => {
        e.preventDefault();
        sessionData.course = inputs.course.value;
        sessionData.year = inputs.year.value;
        sessionData.subject = inputs.subject.value;
        sessionData.section = inputs.section.value;
        sessionData.quantity = parseInt(inputs.quantity.value);
        sessionData.startTime = new Date();
        sessionData.absentees = []; // Reset absentees on new start

        if (sessionData.quantity > 0) {
            saveSession(); // Save state
            renderAttendanceView();
        }
    });

    // Back Button
    document.getElementById('back-btn').addEventListener('click', () => {
        if (confirm("Are you sure? This will discard your current attendance progress.")) {
            localStorage.removeItem('ats_session');
            switchView('setup');
        }
    });

    // Copy Button
    document.getElementById('copy-btn').addEventListener('click', () => {
        const absentees = Array.from(document.querySelectorAll('.student-checkbox:checked')).map(cb => cb.value);
        if (absentees.length === 0) {
            alert('No students marked absent.');
            return;
        }
        const textToCopy = absentees.join(', ');
        navigator.clipboard.writeText(textToCopy).then(() => {
            const btn = document.getElementById('copy-btn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!`;
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

    // View List Button
    document.getElementById('view-btn').addEventListener('click', () => {
        const absentees = Array.from(document.querySelectorAll('.student-checkbox:checked')).map(cb => cb.value);
        const listContent = document.getElementById('modal-list-content');

        if (absentees.length === 0) {
            listContent.textContent = "None";
            listContent.classList.remove('text-red-300');
            listContent.classList.add('text-green-400');
        } else {
            listContent.textContent = absentees.join(', ');
            listContent.classList.remove('text-green-400');
            listContent.classList.add('text-red-300');
        }

        const modal = document.getElementById('list-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });

    // Close List Modal
    document.getElementById('close-list-btn').addEventListener('click', () => {
        const modal = document.getElementById('list-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    // Submit Report Click - Opens Email Modal
    document.getElementById('submit-btn').addEventListener('click', prepareReportSubmission);

    // Cancel Email Modal
    document.getElementById('cancel-email-btn').addEventListener('click', () => {
        views.emailModal.classList.add('hidden');
        views.emailModal.classList.remove('flex');
    });

    // Final Send
    forms.email.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = inputs.recipientEmail.value;
        if (email) {
            sendEmailFinal(email);
        }
    });
}


function switchView(viewName) {
    // Only hide main views, not the modal
    if (viewName !== 'emailModal') {
        ['setup', 'attendance', 'success'].forEach(v => {
            views[v].classList.add('hidden');
        });
        views[viewName].classList.remove('hidden');
    }

    // Reset specific states if needed
    if (viewName === 'setup') {
        const container = document.getElementById('main-container');
        container.style.minHeight = '600px';
    }
}

function renderAttendanceView() {
    // Update Header
    displays.subject.textContent = `${sessionData.course} ${sessionData.year} - ${sessionData.subject}`;
    displays.section.textContent = `Sec ${sessionData.section}`;

    const now = new Date();
    displays.date.textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    displays.time.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Generate Grid
    displays.grid.innerHTML = '';
    for (let i = 1; i <= sessionData.quantity; i++) {
        const card = document.createElement('label');
        card.className = "cursor-pointer group relative";
        card.innerHTML = `
            <input type="checkbox" class="student-checkbox hidden" value="${i}" onchange="updateStats()">
            <div class="bg-gray-700/50 border-2 border-transparent hover:border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center h-24 transition-all duration-200">
                <span class="id-text text-2xl font-bold text-gray-300">#${i}</span>
                <span class="status-text text-xs uppercase font-bold mt-1 opacity-0 transition-opacity">Absent</span>
            </div>
        `;
        displays.grid.appendChild(card);
    }

    switchView('attendance');
    updateStats();
}

function updateStats() {
    const checkedBoxes = document.querySelectorAll('.student-checkbox:checked');
    const absentCount = checkedBoxes.length;
    displays.absentCount.textContent = absentCount;

    // Update session data and save
    sessionData.absentees = Array.from(checkedBoxes).map(cb => cb.value);
    saveSession();
}

function prepareReportSubmission() {
    const absentees = Array.from(document.querySelectorAll('.student-checkbox:checked')).map(cb => cb.value);
    sessionData.absentees = absentees;

    if (absentees.length === 0) {
        if (!confirm("No students marked absent. Continue?")) return;
    }

    // Open Email Modal
    views.emailModal.classList.remove('hidden');
    views.emailModal.classList.add('flex');
    inputs.recipientEmail.focus();
}

async function sendEmailFinal(recipientEmail) {
    views.emailModal.classList.add('hidden');
    views.emailModal.classList.remove('flex');
    loader.classList.remove('hidden');
    loader.classList.add('flex');

    const absentees = sessionData.absentees;

    // Create HTML Table for Email
    let tableRows = '';
    if (absentees.length === 0) {
        tableRows = `<tr><td colspan="2" style="padding:10px; text-align:center; color:green;">All Students Present</td></tr>`;
    } else {
        absentees.forEach(id => {
            tableRows += `
                <tr>
                    <td style="padding:8px; border-bottom:1px solid #eee;">#${id}</td>
                    <td style="padding:8px; border-bottom:1px solid #eee; color:red; font-weight:bold;">ABSENT</td>
                </tr>
            `;
        });
    }

    const emailTable = `
        <table style="width:100%; border:1px solid #ddd; border-collapse:collapse; font-family:sans-serif;">
            <thead style="background-color:#f8f9fa;">
                <tr>
                    <th style="padding:10px; text-align:left; border-bottom:2px solid #ddd;">Student ID</th>
                    <th style="padding:10px; text-align:left; border-bottom:2px solid #ddd;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;

    const templateParams = {
        email_subject: `Attendance Report: ${sessionData.course} ${sessionData.year} - ${sessionData.subject} (Sec ${sessionData.section})`,
        name: "Attendance Taker",
        email: recipientEmail,
        subject_name: sessionData.subject,
        course_name: sessionData.course,
        year: sessionData.year,
        section_name: sessionData.section,
        date: displays.date.textContent,
        time: displays.time.textContent,
        total_students: sessionData.quantity,
        absent_count: absentees.length,
        absent_list_table: emailTable,
        recipient_email: recipientEmail
    };

    try {
        await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);
        loader.classList.add('hidden');
        loader.classList.remove('flex');

        // Clear session on success
        localStorage.removeItem('ats_session');

        switchView('success');
    } catch (error) {
        console.error('Email Error:', error);
        loader.classList.add('hidden');
        loader.classList.remove('flex');
        alert('Failed to send email. Check your console for details.');
    }
}
