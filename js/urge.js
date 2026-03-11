/* ══════════════════════════════════════════════
   urge.js — Urge Button & Vent Archive
══════════════════════════════════════════════ */

const Urge = (() => {

  function init() {
    const cfg = DWY.getConfig();
    if (cfg && cfg.name) {
      const toEl = document.getElementById('urge-to-name');
      if (toEl) toEl.textContent = cfg.name;
    }

    const textarea  = document.getElementById('urge-textarea');
    const charCount = document.getElementById('urge-char-count');
    const sendBtn   = document.getElementById('urge-send');
    const clearBtn  = document.getElementById('urge-clear');

    if (textarea) {
      textarea.addEventListener('input', () => {
        if (charCount) charCount.textContent = `${textarea.value.length} characters`;
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const text = textarea ? textarea.value.trim() : '';
        if (!text) {
          App.toast('Write something first.', 'error');
          return;
        }
        DWY.addUrgeItem(text);
        textarea.value = '';
        if (charCount) charCount.textContent = '0 characters';
        renderArchive();
        App.toast('Archived. Your streak is safe. 💛');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (textarea) textarea.value = '';
        if (charCount) charCount.textContent = '0 characters';
      });
    }

    renderArchive();
  }

  function renderArchive() {
    const list   = document.getElementById('urge-archive-list');
    const empty  = document.getElementById('urge-empty');
    if (!list) return;

    const items = DWY.getUrgeItems();

    // Clear non-empty children
    Array.from(list.children).forEach(child => {
      if (!child.id || child.id !== 'urge-empty') child.remove();
    });

    if (items.length === 0) {
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';

    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'archive-item';
      el.innerHTML = `
        <div class="archive-item-header">
          <span class="archive-item-date">${DWY.formatDateTime(item.date)}</span>
          <span class="archive-item-day">Day ${item.dayCount}</span>
        </div>
        <div class="archive-item-text">${escapeHtml(item.text)}</div>
        <div class="archive-item-actions">
          <button class="btn-danger" data-id="${item.id}">Delete</button>
        </div>
      `;
      el.querySelector('.btn-danger').addEventListener('click', (e) => {
        const id = Number(e.target.dataset.id);
        if (confirm('Delete this message permanently?')) {
          DWY.deleteUrgeItem(id);
          renderArchive();
        }
      });
      list.appendChild(el);
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/\n/g, '<br>');
  }

  return { init, renderArchive };
})();