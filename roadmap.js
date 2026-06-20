/* ============================================
   ROADMAP PAGE JS — The Filmmaker's Engine
   ============================================ */

const STORAGE_KEY = 'filmmakers_roadmap_v1';

// ── LOAD STATE ──
function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch(e) { return {}; }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── REVENUE TRACKER ──
function initRevenueTracker() {
  const state = loadState();
  const total = state.revenue || 0;
  updateRevenueUI(total);

  document.getElementById('log-revenue-btn').addEventListener('click', () => {
    const input = document.getElementById('revenue-input');
    const amount = parseFloat(input.value);
    if (!amount || amount <= 0) return;

    const state = loadState();
    state.revenue = (state.revenue || 0) + amount;
    saveState(state);
    updateRevenueUI(state.revenue);
    input.value = '';

    // flash
    const btn = document.getElementById('log-revenue-btn');
    btn.textContent = '✓ Logged!';
    btn.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
    setTimeout(() => {
      btn.textContent = '+ Log Payment';
      btn.style.background = '';
    }, 1500);
  });

  document.getElementById('reset-revenue-btn').addEventListener('click', () => {
    if (!confirm('Reset all logged revenue? This cannot be undone.')) return;
    const state = loadState();
    state.revenue = 0;
    saveState(state);
    updateRevenueUI(0);
  });
}

function updateRevenueUI(total) {
  const target = 250000;
  const pct = Math.min((total / target) * 100, 100);

  document.getElementById('revenue-display').textContent =
    '$' + total.toLocaleString('en-US', { maximumFractionDigits: 0 });
  document.getElementById('progress-bar-fill').style.width = pct + '%';
  document.getElementById('nav-progress-text').textContent =
    '$' + total.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' / $250,000';
}

// ── MONTH CARD EDIT MODE ──
function toggleEdit(btn) {
  const card = btn.closest('.month-card');
  const isEditing = btn.textContent === 'Save';

  if (isEditing) {
    saveCard(card);
    btn.textContent = 'Edit';
    btn.classList.remove('saving');
  } else {
    enterEditMode(card);
    btn.textContent = 'Save';
    btn.classList.add('saving');
  }
}

function enterEditMode(card) {
  const month = card.dataset.month;

  // Title
  const titleDisplay = card.querySelector('.month-title-display');
  const titleInput = card.querySelector('.month-title-input');
  titleDisplay.style.display = 'none';
  titleInput.style.display = 'block';
  titleInput.value = titleDisplay.textContent;

  // Lists
  card.querySelectorAll('.month-list').forEach(list => {
    list.classList.add('edit-mode');
    const items = [...list.querySelectorAll('li')];
    items.forEach(li => {
      const ta = document.createElement('textarea');
      ta.className = 'step-item-input';
      ta.value = li.textContent;
      li.innerHTML = '';
      li.appendChild(ta);
    });

    // Add button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-item-btn';
    addBtn.textContent = '+ Add item';
    addBtn.onclick = () => {
      const li = document.createElement('li');
      const ta = document.createElement('textarea');
      ta.className = 'step-item-input';
      ta.value = '';
      ta.placeholder = 'New item...';
      li.appendChild(ta);
      list.insertBefore(li, addBtn.parentElement.nextSibling || null);
      list.appendChild(li);
      ta.focus();
    };
    const wrapperLi = document.createElement('li');
    wrapperLi.appendChild(addBtn);
    list.appendChild(wrapperLi);
  });

  // Inversion trap
  const trap = card.querySelector('.inversion-trap');
  if (trap) {
    const trapInput = document.createElement('textarea');
    trapInput.className = 'inversion-trap-input';
    trapInput.value = trap.textContent;
    trap.replaceWith(trapInput);
  }
}

function saveCard(card) {
  const month = card.dataset.month;

  // Title
  const titleInput = card.querySelector('.month-title-input');
  const titleDisplay = card.querySelector('.month-title-display');
  const newTitle = titleInput.value.trim() || titleDisplay.textContent;
  titleDisplay.textContent = newTitle;
  titleDisplay.style.display = 'block';
  titleInput.style.display = 'none';

  // Lists
  card.querySelectorAll('.month-list').forEach(list => {
    list.classList.remove('edit-mode');
    const items = [...list.querySelectorAll('li')];
    const addBtnLi = items.find(li => li.querySelector('.add-item-btn'));
    if (addBtnLi) addBtnLi.remove();

    [...list.querySelectorAll('li')].forEach(li => {
      const ta = li.querySelector('.step-item-input');
      if (ta) {
        const val = ta.value.trim();
        if (val) { li.textContent = val; }
        else { li.remove(); }
      }
    });
  });

  // Inversion trap
  const trapInput = card.querySelector('.inversion-trap-input');
  if (trapInput) {
    const trap = document.createElement('div');
    trap.className = 'inversion-trap editable-trap';
    trap.textContent = trapInput.value.trim() || trapInput.placeholder || '';
    trapInput.replaceWith(trap);
  }

  // Persist to localStorage
  const state = loadState();
  if (!state.cards) state.cards = {};
  state.cards[month] = {
    title: newTitle,
    sections: []
  };
  // Gather all list items
  card.querySelectorAll('.month-section').forEach((section, i) => {
    const items = [...section.querySelectorAll('li')].map(li => li.textContent.trim()).filter(Boolean);
    const trap = section.querySelector('.inversion-trap');
    state.cards[month].sections = state.cards[month].sections || [];
    state.cards[month].sections.push({ items, trap: trap ? trap.textContent : null });
  });

  saveState(state);
}

// ── RESTORE SAVED CARD DATA ──
function restoreCardData() {
  const state = loadState();
  if (!state.cards) return;

  Object.entries(state.cards).forEach(([month, data]) => {
    const card = document.querySelector(`.month-card[data-month="${month}"]`);
    if (!card) return;

    if (data.title) {
      card.querySelector('.month-title-display').textContent = data.title;
      card.querySelector('.month-title-input').value = data.title;
    }
  });
}

// ── 3 AM LOCKOUT ──
function checkLockout() {
  const overlay = document.getElementById('lockout-overlay');
  const timeEl = document.getElementById('lockout-time');

  function tick() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    if (h >= 3 && h < 6) {
      overlay.style.display = 'flex';
      const unlockHour = 6;
      const diffMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), unlockHour, 0, 0) - now;
      const dh = Math.floor(diffMs / 3600000);
      const dm = Math.floor((diffMs % 3600000) / 60000);
      const ds = Math.floor((diffMs % 60000) / 1000);
      timeEl.textContent = `Unlocks in ${dh}h ${dm}m ${ds}s`;
    } else {
      overlay.style.display = 'none';
    }
  }

  tick();
  setInterval(tick, 1000);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initRevenueTracker();
  restoreCardData();
  checkLockout();
});
