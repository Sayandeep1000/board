import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { mandalaData } from "./data.js";
import { antiMandalaData } from "./anti_data.js";

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
  signInWithRedirect(auth, provider).catch((error) => {
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
      antiBoardData: currentAntiData
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

function renderModalContent(cellData, color) {
  modalDesc.innerHTML = '';
  
  if (isEditing) {
    editBtn.textContent = 'Save';
    
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
    
    if (cellData.steps && cellData.steps.length > 0) {
      const ul = document.createElement('ul');
      ul.style.listStyleType = 'none';
      ul.style.padding = '0';
      ul.style.margin = '0';
      
      cellData.steps.forEach(step => {
        if (!step.trim()) return;
        const li = document.createElement('li');
        li.textContent = step;
        li.style.marginBottom = '0.75rem';
        li.style.position = 'relative';
        
        // Don't add bullet points to full uppercase title lines in Anti-Mandala
        const isHeader = step.toUpperCase() === step && step.length > 3 && step.includes(':');
        
        if (!isHeader) {
          li.style.paddingLeft = '1.5rem';
          const bullet = document.createElement('span');
          bullet.textContent = '•';
          bullet.style.color = color;
          bullet.style.position = 'absolute';
          bullet.style.left = '0';
          bullet.style.fontWeight = 'bold';
          li.prepend(bullet);
        } else {
          li.style.fontWeight = 'bold';
          li.style.marginTop = '1.5rem';
          li.style.color = color;
        }
        
        ul.appendChild(li);
      });
      modalDesc.appendChild(ul);
    } else {
      modalDesc.textContent = "No data available.";
    }
  }
}

editBtn.addEventListener('click', async () => {
  const dataObj = activeIsAnti ? currentAntiData : currentData;
  const blockData = dataObj[activeBlockId];
  const cellData = blockData.cells[activeCellId];
  
  if (isEditing) {
    const textareas = modalDesc.querySelectorAll('.step-textarea');
    const newSteps = [];
    textareas.forEach(ta => {
      if (ta.value.trim() !== '') {
        newSteps.push(ta.value.trim());
      }
    });
    cellData.steps = newSteps;
    
    await saveDataToCloud();
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
