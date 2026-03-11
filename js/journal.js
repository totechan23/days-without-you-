/* ══════════════════════════════════════════════
   journal.js — Daily Journal with streak tracking
══════════════════════════════════════════════ */

const Journal = (() => {

  function init() {
    // Set today's date label
    const dateDisplay = document.getElementById('journal-date-display');
    if (dateDisplay) {
      dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
    }

    // Load today's entry if exists
    const today = DWY.getTodayEntry();
    const textarea = document.getElementById('journal-textarea');
    if (today && textarea) {
      textarea.value = today.text;
    }

    // Char count
    const charCount = document.getElementById('journal-char-count');
    if (textarea && charCount) {
      charCount.textContent = `${textarea.value.length} characters`;
      textarea.addEventListener('input', () => {
        charCount.textContent = `${textarea.value.length} characters`;
      });
    }

    // Save button
    const saveBtn = document.getElementById('journal-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const text = textarea ? textarea.value.trim() : '';
        if (!text) {
          App.toast('Write something first.', 'error');
          return;
        }
        DWY.saveJournalEntry(text);
        renderJournal();
        updateStreak();
        App.toast('Entry saved. ✦');
      });
    }

    updateStreak();
    renderJournal();
  }

  function getWritingStreak() {
    const entries  = DWY.getJournalEntries();
    if (entries.length === 0) return 0;

    const keys = entries.map(e => e.dateKey).sort().reverse(); // most recent first
    const today = DWY.toDateKey(new Date());

    let streak = 0;
    let current = today;

    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === current) {
        streak++;
        // move back one day
        const d = new Date(current);
        d.setDate(d.getDate() - 1);
        current = DWY.toDateKey(d);
      } else {
        break;
      }
    }
    return streak;
  }

  function updateStreak() {
    const badge = document.getElementById('journal-streak-badge');
    if (!badge) return;
    const streak = getWritingStreak();
    if (streak > 0) {
      badge.textContent = `✍︎ ${streak} day writing streak`;
      badge.style.display = 'inline';
    } else {
      badge.textContent = '';
    }
  }

  function renderJournal() {
    const list  = document.getElementById('journal-list');
    const empty = document.getElementById('journal-empty');
    if (!list) return;

    const entries = DWY.getJournalEntries();

    Array.from(list.children).forEach(child => {
      if (!child.id || child.id !== 'journal-empty') child.remove();
    });

    // Filter out today — it shows in the compose box above
    const today = DWY.toDateKey(new Date());
    const pastEntries = entries.filter(e => e.dateKey !== today);

    if (pastEntries.length === 0) {
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';

    pastEntries.forEach(entry => {
      const el = document.createElement('div');
      el.className = 'journal-item';

      const dateFormatted = new Date(entry.dateKey).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      el.innerHTML = `
        <div class="journal-item-header">
          <span class="journal-item-date">${dateFormatted}</span>
          <span class="journal-item-day-count">Day ${entry.dayCount}</span>
        </div>
        <p class="journal-item-preview">${escapeHtml(entry.text)}</p>
      `;

      el.addEventListener('click', () => openEntry(entry, dateFormatted));
      list.appendChild(el);
    });
  }

  function openEntry(entry, dateFormatted) {
    const content = document.getElementById('modal-content');
    if (!content) return;

    content.innerHTML = `
      <p class="modal-title" style="font-style:normal; font-size:1rem; font-family:var(--font-mono); text-transform:uppercase; letter-spacing:0.12em; color:var(--amber);">${dateFormatted}</p>
      <p class="modal-meta">Day ${entry.dayCount} of your journey</p>
      <div class="modal-body">${escapeHtml(entry.text)}</div>
      <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.75rem;">
        <button class="btn-danger" id="modal-del-entry">Delete Entry</button>
      </div>
    `;

    document.getElementById('modal-overlay').classList.remove('hidden');

    document.getElementById('modal-del-entry').addEventListener('click', () => {
      if (confirm('Delete this journal entry permanently?')) {
        DWY.deleteJournalEntry(entry.id);
        renderJournal();
        document.getElementById('modal-overlay').classList.add('hidden');
        App.toast('Entry deleted.');
      }
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/\n/g, '<br>');
  }

  return { init, renderJournal };
})();