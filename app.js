import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { mandalaData } from "./data.js?v=5";
import { antiMandalaData } from "./anti_data.js?v=5";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKzF0Iv3RU_xz6zX6aj0_9iqQYzxC5y6A",
  authDomain: "life-board-3bca2.firebaseapp.com",
  projectId: "life-board-3bca2",
  storageBucket: "life-board-3bca2.firebasestorage.app",
  messagingSenderId: "29788080086",
  appId: "1:29788080086:web:31c138ad8aa20fe6dec677"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// State Management
let currentData = mandalaData;
let currentAntiData = antiMandalaData;
let activeCellId = null;
let activeBlockId = null;
let isEditing = false;
let activeIsAnti = false;
let currentUser = null;


// The layout order of the 9 blocks
const blockOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

const container = document.getElementById('mandala-container');
const antiContainer = document.getElementById('anti-mandala-container');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalTitleInput = document.getElementById('modal-title-input');
const modalDesc = document.getElementById('modal-desc');
const modalContent = document.getElementById('modal-content');
const editBtn = document.getElementById('edit-btn');

// Auth UI Elements
const signInBtn = document.getElementById('google-signin-btn');
const signOutBtn = document.getElementById('signout-btn');
const userInfo = document.getElementById('user-info');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');

// -----------------------------------------
// AUTHENTICATION & CLOUD SYNC
// -----------------------------------------
const provider = new GoogleAuthProvider();

signInBtn.addEventListener('click', () => {
  signInWithPopup(auth, provider).catch((error) => {
    console.error("Error signing in with Google", error);
  });
});

signOutBtn.addEventListener('click', () => {
  signOut(auth).catch((error) => {
    console.error("Error signing out", error);
  });
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    signInBtn.style.display = 'none';
    userInfo.style.display = 'flex';
    userName.textContent = user.displayName;
    userAvatar.src = user.photoURL;
    
    await loadDataFromCloud();
  } else {
    currentUser = null;
    signInBtn.style.display = 'flex';
    userInfo.style.display = 'none';
    
    currentData = mandalaData;
    currentAntiData = antiMandalaData;
    renderAllGrids();
  }
});

async function loadDataFromCloud() {
  if (!currentUser) return;
  
  const docRef = doc(db, "mandala_boards", currentUser.uid);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const savedData = docSnap.data();
      currentData = savedData.boardData || mandalaData;
      currentAntiData = savedData.antiBoardData || antiMandalaData;
      
      
      // Auto-merge logic for both boards
      const blockI = currentData["I"];
      const blockE = currentData["E"];
      const antiBlockA = currentAntiData["A"];
      let dataChanged = false;
        
        // Migration: Rename "Dating & Communication" to "Communication"
        if (currentData["I"]) {
          if (currentData["I"].title.includes("Dating")) {
            currentData["I"].title = currentData["I"].title.replace("Dating & ", "");
            dataChanged = true;
          }
          if (currentData["I"].cells && currentData["I"].cells[4] && currentData["I"].cells[4].title.includes("DATING")) {
            currentData["I"].cells[4].title = currentData["I"].cells[4].title.replace("DATING & ", "");
            if (currentData["I"].cells[4].steps && currentData["I"].cells[4].steps[4]) {
              currentData["I"].cells[4].steps[4] = currentData["I"].cells[4].steps[4].replace("DATING & ", "");
            }
            dataChanged = true;
          }
        }
        if (currentData["E"] && currentData["E"].cells && currentData["E"].cells[8] && currentData["E"].cells[8].title.includes("DATING")) {
          currentData["E"].cells[8].title = currentData["E"].cells[8].title.replace("DATING & ", "");
          dataChanged = true;
        }

        // Migration: Rename Placeholder I4 to Speak with Absolute Conviction
        if (currentData["I"] && currentData["I"].cells && currentData["I"].cells[3] && currentData["I"].cells[3].title === "Placeholder I4") {
          currentData["I"].cells[3].title = "Speak with Absolute Conviction";
          dataChanged = true;
        }
      
      if (blockI && blockI.cells && blockI.cells[4] && blockI.cells[4].title.includes("Placeholder")) {
        currentData["I"] = mandalaData["I"];
        dataChanged = true;
      }
      
      if (blockE && blockE.cells && blockE.cells[0] && blockE.cells[0].title.includes("Focus Domain")) {
        currentData["E"] = mandalaData["E"];
        dataChanged = true;
      }
      
      if (antiBlockA && antiBlockA.cells && antiBlockA.cells[0] && antiBlockA.cells[0].title.includes("Placeholder")) {
        console.log("Parse errors detected in Anti-Mandala. Updating cloud database...");
        currentAntiData = antiMandalaData;
        dataChanged = true;
      }
      
      // Force sync color properties from the templates to ensure aesthetic updates propagate
      for (const key of blockOrder) {
        if (currentData[key] && mandalaData[key] && currentData[key].color !== mandalaData[key].color) {
          currentData[key].color = mandalaData[key].color;
          dataChanged = true;
        }
        if (currentAntiData[key] && antiMandalaData[key] && currentAntiData[key].color !== antiMandalaData[key].color) {
          currentAntiData[key].color = antiMandalaData[key].color;
          dataChanged = true;
        }
      }
      
      if (dataChanged || !savedData.antiBoardData) {
        await saveDataToCloud();
      }
      
    } else {
      currentData = mandalaData;
      currentAntiData = antiMandalaData;
      await saveDataToCloud();
    }
    renderAllGrids();
  } catch (error) {
    console.error("Error loading data from cloud:", error);
    alert("Could not connect to database. Make sure you set it up in Test Mode!");
  }
}

async function saveDataToCloud() {
  if (!currentUser) {
    alert("You must be signed in to save changes!");
    return;
  }
  
  const docRef = doc(db, "mandala_boards", currentUser.uid);
  try {
    await setDoc(docRef, { 
      boardData: currentData,
      antiBoardData: currentAntiData,
      
    });
  } catch (error) {
    console.error("Error saving data to cloud:", error);
    alert("Failed to save. Check your database rules.");
  }
}

// -----------------------------------------
// UI LOGIC
// -----------------------------------------

document.addEventListener('mousemove', (e) => {
  const blocks = document.querySelectorAll('.mandala-block');
  blocks.forEach(block => {
    const rect = block.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    block.style.setProperty('--mouse-x', `${x}px`);
    block.style.setProperty('--mouse-y', `${y}px`);
    
    const cells = block.querySelectorAll('.mandala-cell');
    cells.forEach(cell => {
      const cellRect = cell.getBoundingClientRect();
      const cellX = e.clientX - cellRect.left;
      const cellY = e.clientY - cellRect.top;
      cell.style.setProperty('--mouse-x', `${cellX}px`);
      cell.style.setProperty('--mouse-y', `${cellY}px`);
    });
  });
});

function renderGrid(targetContainer, dataObj, isAnti) {
  targetContainer.innerHTML = '';
  blockOrder.forEach((blockKey, blockIndex) => {
    const blockData = dataObj[blockKey];
    if (!blockData) return;

    const blockElement = document.createElement('div');
    blockElement.classList.add('mandala-block');

    blockData.cells.forEach((cellData, index) => {
      const cellElement = document.createElement('div');
      cellElement.classList.add('mandala-cell');
      
      cellElement.style.color = blockData.color;
      cellElement.style.setProperty('--hover-color', `${blockData.color}40`);
      cellElement.style.setProperty('--glow-color', `${blockData.color}66`);
      
      if (index === 4) {
        cellElement.classList.add('center-cell');
        cellElement.style.backgroundColor = `${blockData.color}15`; 
        if (blockIndex === 4) {
          cellElement.classList.add('absolute-center');
        }
      }

      // Check completion status
      const stepsCount = cellData.steps ? cellData.steps.filter(s => s.trim() && !isHeaderStep(s)).length : 0;
      if (cellData.completedSteps && stepsCount > 0) {
        const completedCount = cellData.completedSteps.filter(v => v).length;
        if (completedCount >= stepsCount) {
          cellElement.classList.add('completed');
        }
      }

      const titleElement = document.createElement('span');
      titleElement.classList.add('cell-title');
      titleElement.textContent = cellData.title;

      cellElement.appendChild(titleElement);

      cellElement.addEventListener('click', () => {
        openModal(blockKey, index, isAnti);
      });

      blockElement.appendChild(cellElement);
    });

    targetContainer.appendChild(blockElement);
  });
}

function renderAllGrids() {
  renderGrid(container, currentData, false);
  renderGrid(antiContainer, currentAntiData, true);
}

// Initial render
renderAllGrids();

function openModal(blockKey, cellIndex, isAnti) {
  const dataObj = isAnti ? currentAntiData : currentData;
  const blockData = dataObj[blockKey];
  const cellData = blockData.cells[cellIndex];
  const color = blockData.color;
  
  activeBlockId = blockKey;
  activeCellId = cellIndex;
  activeIsAnti = isAnti;
  isEditing = false;
  
  modalTitle.textContent = `${cellData.id}: ${cellData.title}`;
  modalTitle.style.color = color;
  editBtn.style.color = color;
  editBtn.style.borderColor = `${color}66`;
  
  renderModalContent(cellData, color);
  
  modalContent.style.borderColor = `${color}40`;
  modalContent.style.boxShadow = `0 30px 60px rgba(0,0,0,0.8), 0 0 100px ${color}15`;
  modalOverlay.classList.add('active');
}

function isHeaderStep(step) {
  return step.toUpperCase() === step && step.length > 3 && step.includes(':');
}

  function renderModalContent(cellData, color) {
    modalDesc.innerHTML = '';
    
    if (isEditing) {
      editBtn.textContent = 'Save';
      
      modalTitle.style.display = 'none';
      modalTitleInput.style.display = 'block';
      modalTitleInput.value = cellData.title;
      modalTitleInput.style.color = color;
      
      const stepsContainer = document.createElement('div');
    stepsContainer.classList.add('edit-steps-container');
    
    const steps = cellData.steps && cellData.steps.length > 0 ? cellData.steps : [""];
    
    steps.forEach((step, idx) => {
      const textarea = document.createElement('textarea');
      textarea.value = step;
      textarea.classList.add('step-textarea');
      textarea.rows = 2;
      stepsContainer.appendChild(textarea);
    });
    
    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Add Item';
    addBtn.classList.add('add-step-btn');
    addBtn.style.color = color;
    addBtn.addEventListener('click', () => {
      const textarea = document.createElement('textarea');
      textarea.value = "";
      textarea.classList.add('step-textarea');
      textarea.rows = 2;
      stepsContainer.insertBefore(textarea, addBtn);
    });
    
    stepsContainer.appendChild(addBtn);
    modalDesc.appendChild(stepsContainer);
      } else {
      editBtn.textContent = 'Edit';
      
      modalTitle.style.display = 'block';
      modalTitleInput.style.display = 'none';
      modalTitle.textContent = `${cellData.id}: ${cellData.title}`;
      
      if (cellData.steps && cellData.steps.length > 0) {
      if (!cellData.completedSteps) cellData.completedSteps = [];
      
      const listContainer = document.createElement('div');
      
      cellData.steps.forEach((step, idx) => {
        if (!step.trim()) return;
        
        const isHeader = isHeaderStep(step);
        
        if (isHeader) {
          const headerEl = document.createElement('div');
          headerEl.textContent = step;
          headerEl.style.fontWeight = 'bold';
          headerEl.style.marginTop = '1.5rem';
          headerEl.style.marginBottom = '0.5rem';
          headerEl.style.color = color;
          listContainer.appendChild(headerEl);
        } else {
          // Render as Interactive Checkbox
          const container = document.createElement('label');
          container.classList.add('step-checkbox-container');
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.classList.add('step-checkbox');
          
          // Check if it's completed
          if (cellData.completedSteps[idx]) {
            checkbox.checked = true;
          }
          
          const textSpan = document.createElement('span');
          textSpan.classList.add('step-text');
          textSpan.textContent = step;
          if (checkbox.checked) textSpan.classList.add('checked');
          
          // Checkbox logic
          checkbox.addEventListener('change', async (e) => {
            cellData.completedSteps[idx] = e.target.checked;
            if (e.target.checked) {
              textSpan.classList.add('checked');
            } else {
              textSpan.classList.remove('checked');
            }
            
            // Re-render the grid behind the modal so it instantly glows if fully checked
            renderAllGrids();
            
            // Save state to cloud seamlessly
            saveDataToCloud();
          });
          
          container.appendChild(checkbox);
          container.appendChild(textSpan);
          listContainer.appendChild(container);
        }
      });
      modalDesc.appendChild(listContainer);
    } else {
      modalDesc.textContent = "No data available.";
    }

    // Add Zen Mode Button to Modal
    const zenBtn = document.createElement('button');
    zenBtn.textContent = '⏱️ Start 50m Focus Block';
    zenBtn.classList.add('start-zen-btn');
    zenBtn.addEventListener('click', () => {
      startZenMode(cellData.title);
      closeModal();
    });
    modalDesc.appendChild(zenBtn);
  }
}

// -----------------------------------------
// ZEN MODE / POMODORO LOGIC
// -----------------------------------------
const zenOverlay = document.getElementById('zen-overlay');
const zenTitle = document.getElementById('zen-title');
const zenTimerDisplay = document.getElementById('zen-timer');
const exitZenBtn = document.getElementById('exit-zen-btn');
const ambientAudio = document.getElementById('ambient-audio');
let zenInterval;

function startZenMode(taskTitle) {
  zenTitle.textContent = "Focusing on: " + taskTitle;
  zenOverlay.classList.add('active');
  
  if (ambientAudio) {
    ambientAudio.volume = 0.5;
    ambientAudio.play().catch(e => console.log('Audio play prevented by browser', e));
  }
  
  let timeLeft = 50 * 60; // 50 minutes
  
  updateTimerDisplay(timeLeft);
  
  clearInterval(zenInterval);
  zenInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(zenInterval);
      zenTitle.textContent = "Session Complete!";
      if (ambientAudio) ambientAudio.pause();
    }
  }, 1000);
}

function updateTimerDisplay(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  zenTimerDisplay.textContent = `${m}:${s}`;
}

if (exitZenBtn) {
  exitZenBtn.addEventListener('click', () => {
    zenOverlay.classList.remove('active');
    clearInterval(zenInterval);
    if (ambientAudio) {
      ambientAudio.pause();
      ambientAudio.currentTime = 0;
    }
  });
}

  editBtn.addEventListener('click', async () => {
    const dataObj = activeIsAnti ? currentAntiData : currentData;
    const blockData = dataObj[activeBlockId];
    const cellData = blockData.cells[activeCellId];
    
    if (isEditing) {
      if (modalTitleInput.value.trim() !== '') {
        cellData.title = modalTitleInput.value.trim();
      }

      const textareas = modalDesc.querySelectorAll('.step-textarea');
      const newSteps = [];
      textareas.forEach(ta => {
        if (ta.value.trim() !== '') {
          newSteps.push(ta.value.trim());
        }
      });
      cellData.steps = newSteps;
      
      saveDataToCloud(); // Fire-and-forget sync for instant UI
      
      // Update grid UI with the new title
      if (activeIsAnti) {
        renderGrid(antiContainer, currentAntiData, true);
      } else {
        renderGrid(container, currentData, false);
      }
    }
    
    isEditing = !isEditing;
    renderModalContent(cellData, blockData.color);
  });

function closeModal() {
  modalOverlay.classList.remove('active');
  isEditing = false;
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});

// -----------------------------------------
// ANALYTICS & DAILY WINS LOGIC
// -----------------------------------------
const analyticsBtn = document.getElementById('analytics-btn');
const analyticsModal = document.getElementById('analytics-modal');
const closeAnalyticsBtn = document.getElementById('close-analytics-btn');
const totalProgressFill = document.getElementById('total-progress-fill');
const totalProgressText = document.getElementById('total-progress-text');
const analyticsStats = document.getElementById('analytics-stats');





if (analyticsBtn) {
  analyticsBtn.addEventListener('click', () => {
    analyticsModal.classList.add('active');
    calculateAnalytics();
  });
}

if (closeAnalyticsBtn) {
  closeAnalyticsBtn.addEventListener('click', () => {
    analyticsModal.classList.remove('active');
  });
}

function calculateAnalytics() {
  let totalSteps = 0;
  let completedSteps = 0;
  
  let antiTotal = 0;
  let antiCompleted = 0;
  
  let mainTotal = 0;
  let mainCompleted = 0;

  for (const key in currentData) {
    if (currentData[key] && currentData[key].steps) {
      const validSteps = currentData[key].steps.filter(s => s.trim());
      mainTotal += validSteps.length;
      if (currentData[key].completedSteps) {
        mainCompleted += currentData[key].completedSteps.filter(v => v).length;
      }
    }
  }

  for (const key in currentAntiData) {
    if (currentAntiData[key] && currentAntiData[key].steps) {
      const validSteps = currentAntiData[key].steps.filter(s => s.trim() && !isHeaderStep(s));
      antiTotal += validSteps.length;
      if (currentAntiData[key].completedSteps) {
        antiCompleted += currentAntiData[key].completedSteps.filter(v => v).length;
      }
    }
  }

  totalSteps = mainTotal + antiTotal;
  completedSteps = mainCompleted + antiCompleted;
  
  const percent = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
  
  totalProgressFill.style.width = percent + '%';
  totalProgressText.textContent = percent + '% Complete';
  
  analyticsStats.innerHTML = `
    <div class="stat-box">
      <div class="stat-title">Total Goals</div>
      <div class="stat-value">${mainCompleted}/${mainTotal}</div>
    </div>
    <div class="stat-box">
      <div class="stat-title">Habits Killed</div>
      <div class="stat-value">${antiCompleted}/${antiTotal}</div>
    </div>
  `;
}



