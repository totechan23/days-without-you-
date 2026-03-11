/* ══════════════════════════════════════════════
   counter.js — Live granular time counter
══════════════════════════════════════════════ */

const Counter = (() => {

  let _interval = null;

  // Milestones in hours
  const MILESTONES = [
    { label: '24 hours',  hours: 24 },
    { label: '3 days',    hours: 72 },
    { label: '1 week',    hours: 168 },
    { label: '2 weeks',   hours: 336 },
    { label: '1 month',   hours: 720 },
    { label: '6 weeks',   hours: 1008 },
    { label: '2 months',  hours: 1440 },
    { label: '3 months',  hours: 2160 },
    { label: '6 months',  hours: 4320 },
    { label: '1 year',    hours: 8760 },
  ];

  const AFFIRMATIONS = [
    "Every second you choose yourself is an act of courage.",
    "You are not waiting. You are becoming.",
    "The silence you keep today protects the peace you're building.",
    "Distance is not emptiness. Distance is the space you're filling with yourself.",
    "You are not missing them. You are remembering yourself.",
    "The hardest part was the first hour. You've survived hundreds since.",
    "Healing isn't linear, but time always moves forward. So do you.",
    "The message you didn't send is the self-respect you kept.",
    "This counter isn't marking what you lost. It's measuring what you reclaimed.",
    "One more day is one more day you chose your own narrative.",
    "Your future self will thank the version of you reading this right now.",
    "The absence you feel is proof of the space you're learning to fill.",
    "You are not lonely. You are sovereign.",
    "Every hour is a quiet victory. Let yourself feel it.",
    "The version of you who started this journey is already behind you.",
  ];

  function pad(n) {
    return String(Math.floor(n)).padStart(2, '0');
  }

  function tick(startDate) {
    const now      = new Date();
    const start    = new Date(startDate);
    const diffMs   = now - start;

    if (diffMs < 0) {
      // Future date entered
      document.getElementById('cnt-days').textContent    = '0';
      document.getElementById('cnt-hours').textContent   = '00';
      document.getElementById('cnt-minutes').textContent = '00';
      document.getElementById('cnt-seconds').textContent = '00';
      return;
    }

    const totalSeconds  = Math.floor(diffMs / 1000);
    const totalMinutes  = Math.floor(diffMs / (1000 * 60));
    const totalHours    = Math.floor(diffMs / (1000 * 60 * 60));
    const days          = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours         = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes       = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds       = Math.floor((diffMs % (1000 * 60)) / 1000);

    document.getElementById('cnt-days').textContent    = days;
    document.getElementById('cnt-hours').textContent   = pad(hours);
    document.getElementById('cnt-minutes').textContent = pad(minutes);
    document.getElementById('cnt-seconds').textContent = pad(seconds);

    // Sub-label
    const subEl = document.getElementById('counter-total-hours');
    if (subEl) {
      if (totalHours < 24) {
        subEl.textContent = `${totalMinutes.toLocaleString()} total minutes`;
      } else {
        subEl.textContent = `${totalHours.toLocaleString()} total hours · ${totalMinutes.toLocaleString()} total minutes`;
      }
    }

    // Progress bar (0 → 90 days = full)
    const maxDays = 90;
    const pct = Math.min((days / maxDays) * 100, 100);
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = pct + '%';

    // Milestones
    updateMilestones(totalHours, totalMinutes);

    // Tick flash on seconds el
    const secEl = document.getElementById('cnt-seconds');
    if (secEl) {
      secEl.style.animation = 'none';
      void secEl.offsetWidth;
      secEl.style.animation = 'tickFlash 0.5s ease';
    }
  }

  function updateMilestones(totalHours, totalMinutes) {
    // Next milestone
    const next = MILESTONES.find(m => m.hours > totalHours);
    const nextEl = document.getElementById('ms-next-val');
    if (nextEl) {
      if (next) {
        const remaining = next.hours - totalHours;
        nextEl.textContent = `${next.label} (in ~${remaining}h)`;
      } else {
        nextEl.textContent = 'Over 1 year! 🎉';
      }
    }

    // Last achieved
    const achieved = [...MILESTONES].reverse().find(m => m.hours <= totalHours);
    const achievedEl = document.getElementById('ms-achieved-val');
    if (achievedEl) {
      achievedEl.textContent = achieved ? achieved.label : 'First milestone upcoming';
    }

    // Total minutes
    const minEl = document.getElementById('ms-minutes-val');
    if (minEl) {
      minEl.textContent = totalMinutes.toLocaleString();
    }
  }

  function start(startDate) {
    if (_interval) clearInterval(_interval);
    tick(startDate);
    _interval = setInterval(() => tick(startDate), 1000);
  }

  function stop() {
    if (_interval) clearInterval(_interval);
    _interval = null;
  }

  function setAffirmation() {
    const el = document.getElementById('affirmation-text');
    if (!el) return;
    const idx = Math.floor(Math.random() * AFFIRMATIONS.length);
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = AFFIRMATIONS[idx];
      el.style.opacity = '1';
      el.style.transition = 'opacity 0.5s ease';
    }, 200);
  }

  return { start, stop, setAffirmation, AFFIRMATIONS };
})();