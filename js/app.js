/* ══════════════════════════════════════════════
   app.js — Main app controller
   Handles: setup, navigation, modals, toasts
══════════════════════════════════════════════ */

const App = (() => {

  let _toastTimer = null;

  // ── Toast ──────────────────────────────────────
  function toast(msg, type = 'success') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = `toast ${type}`;
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
      el.classList.add('hidden');
    }, 3000);
  }

  // ── Page navigation ───────────────────────────
  function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const page = document.getElementById(`page-${pageId}`);
    if (page) page.classList.add('active');

    const link = document.querySelector(`[data-page="${pageId}"]`);
    if (link) link.classList.add('active');

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Page-specific re-renders
    if (pageId === 'urge')    Urge.renderArchive();
    if (pageId === 'vault')   Vault.renderVault();
    if (pageId === 'journal') Journal.renderJournal();
  }

  // ── Setup screen ──────────────────────────────
  function showSetup() {
    document.getElementById('screen-setup').classList.add('active');
    document.getElementById('screen-app').classList.remove('active');

    // Set default datetime to now
    const dtInput = document.getElementById('setup-date');
    if (dtInput) {
      const now = new Date();
      now.setSeconds(0, 0);
      dtInput.value = now.toISOString().slice(0, 16);
    }

    document.getElementById('setup-begin').addEventListener('click', handleSetup);
  }

  function handleSetup() {
    const name     = document.getElementById('setup-name').value.trim();
    const dateStr  = document.getElementById('setup-date').value;
    const word     = document.getElementById('setup-word').value.trim();

    if (!dateStr) {
      toast('Please enter the date of last contact.', 'error');
      return;
    }

    const startDate = new Date(dateStr);
    if (startDate > new Date()) {
      toast('That date is in the future. Enter when you last had contact.', 'error');
      return;
    }

    DWY.saveConfig({
      name:      name || null,
      startDate: startDate.toISOString(),
      word:      word || null,
      createdAt: new Date().toISOString(),
    });

    showApp();
  }

  // ── App screen ────────────────────────────────
  function showApp() {
    document.getElementById('screen-setup').classList.remove('active');
    document.getElementById('screen-app').classList.add('active');

    const cfg = DWY.getConfig();
    if (!cfg) return;

    // Update dashboard headings
    const eyebrow = document.getElementById('dashboard-eyebrow');
    const heading  = document.getElementById('dashboard-heading');

    if (cfg.name && eyebrow) {
      eyebrow.textContent = `Your journey without ${cfg.name}`;
    }
    if (cfg.word && heading) {
      heading.textContent = `${cfg.word}.`;
    }

    // Start counter
    Counter.start(cfg.startDate);
    Counter.setAffirmation();

    // Init modules
    Urge.init();
    Vault.init();
    Journal.init();

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(link.dataset.page);
      });
    });

    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.target));
    });

    // Affirmation refresh
    document.getElementById('affirmation-refresh')?.addEventListener('click', () => {
      Counter.setAffirmation();
    });

    // Reset streak
    document.getElementById('reset-btn')?.addEventListener('click', () => {
      if (confirm('Reset your streak? This will delete all your data including journal entries, vault letters, and archived messages.\n\nThis cannot be undone.')) {
        Counter.stop();
        DWY.clearAll();
        location.reload();
      }
    });

    // Mobile menu toggle
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // Click outside sidebar to close
    document.getElementById('content')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
    });

    // Modal close
    document.getElementById('modal-close')?.addEventListener('click', () => {
      document.getElementById('modal-overlay').classList.add('hidden');
    });

    document.getElementById('modal-overlay')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) {
        document.getElementById('modal-overlay').classList.add('hidden');
      }
    });

    // Keyboard: Escape closes modal
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.getElementById('sidebar').classList.remove('open');
      }
    });

    // Navigate to dashboard
    navigateTo('dashboard');
  }

  // ── Boot ──────────────────────────────────────
  function boot() {
    const cfg = DWY.getConfig();
    if (cfg && cfg.startDate) {
      showApp();
    } else {
      showSetup();
    }
  }

  // ── Init on DOM ready ─────────────────────────
  document.addEventListener('DOMContentLoaded', boot);

  return { toast, navigateTo };
})();