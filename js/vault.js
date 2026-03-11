/* ══════════════════════════════════════════════
   vault.js — Future-Self Vault (time-locked letters)
══════════════════════════════════════════════ */

const Vault = (() => {

  function init() {
    // Default unlock date = 30 days from now
    const unlockInput = document.getElementById('vault-unlock-date');
    if (unlockInput && !unlockInput.value) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      unlockInput.value = d.toISOString().split('T')[0];
    }

    const sealBtn = document.getElementById('vault-seal');
    if (sealBtn) {
      sealBtn.addEventListener('click', () => {
        const text        = document.getElementById('vault-textarea').value.trim();
        const unlockDate  = document.getElementById('vault-unlock-date').value;
        const title       = document.getElementById('vault-title').value.trim();

        if (!text) {
          App.toast('Write something to seal.', 'error');
          return;
        }
        if (!unlockDate) {
          App.toast('Choose an unlock date.', 'error');
          return;
        }
        if (new Date(unlockDate) <= new Date()) {
          App.toast('Unlock date must be in the future.', 'error');
          return;
        }

        DWY.addVaultItem({ text, unlockDate, title: title || 'To my future self' });
        document.getElementById('vault-textarea').value = '';
        document.getElementById('vault-title').value    = '';
        renderVault();
        App.toast('Letter sealed. ✦ It will wait for you.');
      });
    }

    renderVault();
  }

  function renderVault() {
    const list  = document.getElementById('vault-list');
    const empty = document.getElementById('vault-empty');
    if (!list) return;

    const items = DWY.getVaultItems();

    Array.from(list.children).forEach(child => {
      if (!child.id || child.id !== 'vault-empty') child.remove();
    });

    if (items.length === 0) {
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';

    items.forEach(item => {
      const unlocked = DWY.isVaultUnlocked(item.unlockDate);
      const el = document.createElement('div');
      el.className = `vault-item ${unlocked ? '' : 'locked'}`;

      const unlockFormatted = new Date(item.unlockDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const writtenFormatted = DWY.formatDate(item.written);

      el.innerHTML = `
        <div class="vault-item-header">
          <div class="vault-item-title">${escapeHtml(item.title)}</div>
          <span class="vault-item-status ${unlocked ? 'unlocked' : 'locked'}">
            ${unlocked ? '✦ Unlocked' : '🔒 Sealed'}
          </span>
        </div>
        <div class="vault-item-meta">
          Written ${writtenFormatted} · Unlocks ${unlockFormatted}
        </div>
        <div class="vault-item-content">
          ${unlocked
            ? `<p class="vault-item-body">${previewText(item.text)}</p>
               <div style="margin-top:0.75rem; display:flex; gap:0.75rem; justify-content:flex-end;">
                 <button class="btn-ghost btn-sm" data-read="${item.id}">Read Full Letter</button>
                 <button class="btn-danger" data-del="${item.id}">Delete</button>
               </div>`
            : `<div class="vault-item-locked-msg">
                 <span>🔒</span>
                 <span>This letter is sealed until ${unlockFormatted}.</span>
               </div>
               <div style="margin-top:0.75rem; display:flex; justify-content:flex-end;">
                 <button class="btn-danger" data-del="${item.id}">Delete</button>
               </div>`
          }
        </div>
      `;

      const readBtn = el.querySelector('[data-read]');
      if (readBtn) {
        readBtn.addEventListener('click', () => openLetter(item));
      }

      const delBtn = el.querySelector('[data-del]');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          if (confirm('Permanently delete this letter?')) {
            DWY.deleteVaultItem(item.id);
            renderVault();
          }
        });
      }

      list.appendChild(el);
    });
  }

  function openLetter(item) {
    const content = document.getElementById('modal-content');
    if (!content) return;

    const writtenFormatted = DWY.formatDate(item.written);
    content.innerHTML = `
      <p class="modal-title">${escapeHtml(item.title)}</p>
      <p class="modal-meta">Written on ${writtenFormatted}</p>
      <div class="modal-body">${escapeHtml(item.text)}</div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  function previewText(text) {
    const preview = text.slice(0, 200);
    return escapeHtml(preview) + (text.length > 200 ? '…' : '');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/\n/g, '<br>');
  }

  return { init, renderVault };
})();