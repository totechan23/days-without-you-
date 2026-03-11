/* ══════════════════════════════════════════════
   data.js — Storage layer & shared state
   All localStorage reads/writes go through here.
══════════════════════════════════════════════ */

const DWY = (() => {

  const KEYS = {
    config:  'dwy_config',
    urge:    'dwy_urge',
    vault:   'dwy_vault',
    journal: 'dwy_journal',
  };

  // ── Config (setup data) ──────────────────────
  function getConfig() {
    const raw = localStorage.getItem(KEYS.config);
    return raw ? JSON.parse(raw) : null;
  }

  function saveConfig(cfg) {
    localStorage.setItem(KEYS.config, JSON.stringify(cfg));
  }

  function clearConfig() {
    localStorage.removeItem(KEYS.config);
  }

  // ── Urge archive ─────────────────────────────
  function getUrgeItems() {
    const raw = localStorage.getItem(KEYS.urge);
    return raw ? JSON.parse(raw) : [];
  }

  function addUrgeItem(text) {
    const items = getUrgeItems();
    const cfg = getConfig();
    const dayCount = cfg ? getDaysSince(cfg.startDate) : 0;
    items.unshift({
      id:       Date.now(),
      text:     text.trim(),
      date:     new Date().toISOString(),
      dayCount: dayCount,
    });
    localStorage.setItem(KEYS.urge, JSON.stringify(items));
    return items[0];
  }

  function deleteUrgeItem(id) {
    const items = getUrgeItems().filter(i => i.id !== id);
    localStorage.setItem(KEYS.urge, JSON.stringify(items));
  }

  // ── Vault letters ────────────────────────────
  function getVaultItems() {
    const raw = localStorage.getItem(KEYS.vault);
    return raw ? JSON.parse(raw) : [];
  }

  function addVaultItem(item) {
    const items = getVaultItems();
    items.unshift({
      id:         Date.now(),
      title:      item.title || 'Untitled Letter',
      text:       item.text.trim(),
      unlockDate: item.unlockDate,
      written:    new Date().toISOString(),
    });
    localStorage.setItem(KEYS.vault, JSON.stringify(items));
    return items[0];
  }

  function deleteVaultItem(id) {
    const items = getVaultItems().filter(i => i.id !== id);
    localStorage.setItem(KEYS.vault, JSON.stringify(items));
  }

  // ── Journal entries ───────────────────────────
  function getJournalEntries() {
    const raw = localStorage.getItem(KEYS.journal);
    return raw ? JSON.parse(raw) : [];
  }

  function getTodayEntry() {
    const today = toDateKey(new Date());
    return getJournalEntries().find(e => e.dateKey === today) || null;
  }

  function saveJournalEntry(text) {
    const entries = getJournalEntries();
    const today   = toDateKey(new Date());
    const cfg     = getConfig();
    const dayCount = cfg ? getDaysSince(cfg.startDate) : 0;
    const existing = entries.findIndex(e => e.dateKey === today);
    const entry = {
      id:       existing >= 0 ? entries[existing].id : Date.now(),
      dateKey:  today,
      text:     text.trim(),
      saved:    new Date().toISOString(),
      dayCount: dayCount,
    };
    if (existing >= 0) {
      entries[existing] = entry;
    } else {
      entries.unshift(entry);
    }
    localStorage.setItem(KEYS.journal, JSON.stringify(entries));
    return entry;
  }

  function deleteJournalEntry(id) {
    const entries = getJournalEntries().filter(e => e.id !== id);
    localStorage.setItem(KEYS.journal, JSON.stringify(entries));
  }

  // ── Helpers ───────────────────────────────────
  function toDateKey(d) {
    return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
  }

  function getDaysSince(isoString) {
    const start = new Date(isoString);
    const now   = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  }

  function isVaultUnlocked(unlockDateStr) {
    const unlock = new Date(unlockDateStr);
    return new Date() >= unlock;
  }

  function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  function formatDateTime(isoString) {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }

  function clearAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }

  return {
    getConfig, saveConfig, clearConfig,
    getUrgeItems, addUrgeItem, deleteUrgeItem,
    getVaultItems, addVaultItem, deleteVaultItem,
    getJournalEntries, getTodayEntry, saveJournalEntry, deleteJournalEntry,
    getDaysSince, isVaultUnlocked, formatDate, formatDateTime, toDateKey,
    clearAll,
  };
})();
