let state = { pages: [], settings: { theme: 'dark', background: '#121212' }, widgetPositions: {} };
let activePageId = null;

// DOM Elements
const pagesContainer = document.getElementById('pages-container');
const boardsContainer = document.getElementById('boards-container');
const addPageBtn = document.getElementById('add-page-btn');
const addBoardBtn = document.getElementById('add-board-btn');

// Modal Elements
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close-btn');
const modalForm = document.getElementById('modal-form');
const modalTitle = document.getElementById('modal-title');
const modalItemType = document.getElementById('modal-item-type');
const modalItemId = document.getElementById('modal-item-id');
const itemTitleInput = document.getElementById('item-title');
const itemUrlInput = document.getElementById('item-url');
const groupUrl = document.getElementById('group-url');

// Wallpaper Elements
const wallpapersBtn = document.getElementById('wallpapers-btn');
const wallpaperModal = document.getElementById('wallpaper-modal');
const closeWallpaperBtn = document.getElementById('close-wallpaper-btn');
const wallpaperGrid = document.getElementById('wallpaper-grid');

const WALLPAPERS = [
  { id: 'default', name: 'Solid Color', url: '' },
  { id: 'space1', name: 'Deep Space', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop' },
  { id: 'space2', name: 'Planet Earth', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop' },
  { id: 'spider1', name: 'Spider-Man NWH', url: 'https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtecsmEZzVN0U.jpg' },
  { id: 'spider2', name: 'Spider-Verse', url: 'https://image.tmdb.org/t/p/original/7dMxeTGeK9O6bO6w1aXz3GlaVHb.jpg' },
  { id: 'marvel1', name: 'Avengers Endgame', url: 'https://image.tmdb.org/t/p/original/orjiB3oUIsyz60hoEqkiGpy5CeO.jpg' },
  { id: 'marvel2', name: 'Iron Man', url: 'https://image.tmdb.org/t/p/original/7lmBufEG7P7Y1HClYK3gCxYrKGQ.jpg' },
  { id: 'god1', name: 'Lord Shiva', url: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=1920&auto=format&fit=crop' },
  { id: 'god2', name: 'Greek Gods', url: 'https://images.unsplash.com/photo-1544485521-1254e4df5e20?q=80&w=1920&auto=format&fit=crop' },
  { id: 'car1', name: 'Sports Car', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop' },
  { id: 'car2', name: 'Classic Mustang', url: 'https://images.unsplash.com/photo-1503376712394-b295eb1df697?q=80&w=1920&auto=format&fit=crop' },
  { id: 'girl1', name: 'Neon Portrait', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1920&auto=format&fit=crop' },
  { id: 'girl2', name: 'Aesthetic Girl', url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1920&auto=format&fit=crop' },
  { id: 'user_pinterest', name: 'Pinterest Pick', url: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg' },
  { id: 'mountains', name: 'Mountains', url: 'https://images.unsplash.com/photo-1506744626753-edaeb5d8c57a?q=80&w=1920&auto=format&fit=crop' }
];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadState();
});

function loadState() {
  chrome.storage.local.get(['pages', 'settings'], (result) => {
    if (result.pages && result.settings) {
      state.pages = result.pages;
      state.settings = result.settings;
      if (state.pages.length > 0 && !activePageId) {
        activePageId = state.pages[0].id;
      }
      if (result.widgetPositions) {
        state.widgetPositions = result.widgetPositions;
      }
      applySettings();
      renderPages();
      renderBoards();
      applyWidgetPositions();
    }
  });
}

function saveState() {
  chrome.storage.local.set({ pages: state.pages, settings: state.settings, widgetPositions: state.widgetPositions });
}

function applySettings() {
  const videoBg = document.getElementById('video-bg');
  
  // We enforce dark mode via CSS unconditionally, but optionally could keep attribute
  document.documentElement.setAttribute('data-theme', 'dark');
  state.settings.theme = 'dark';
  
  // Check if we have a video wallpaper
  if (state.settings.videoWallpaper === 'local') {
    // Load local video from IndexedDB
    document.body.style.backgroundImage = 'none';
    loadVideoBlob().then(blob => {
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        videoBg.src = blobUrl;
        videoBg.style.display = 'block';
        handleChargingChange();
      }
    });
  } else if (state.settings.videoWallpaper) {
    // URL-based video
    document.body.style.backgroundImage = 'none';
    videoBg.src = state.settings.videoWallpaper;
    videoBg.style.display = 'block';
    handleChargingChange();
  } else {
    // No video — hide video, use image background
    videoBg.style.display = 'none';
    videoBg.src = '';
    
    if (state.settings.background && state.settings.background !== 'default' && state.settings.background.startsWith('http')) {
      document.body.style.backgroundImage = `url('${state.settings.background}')`;
    } else {
      document.body.style.backgroundImage = 'none';
    }
  }
}

// Battery-aware video wallpaper & Battery Saver Mode
let batteryObj = null;

function handleChargingChange() {
  const videoBg = document.getElementById('video-bg');
  const statusEl = document.getElementById('video-status');
  const batteryBtn = document.getElementById('battery-saver-btn');
  
  if (!state.settings.batterySaver) {
    state.settings.batterySaver = 'auto'; // default
  }
  
  let isBatterySaverActive = false;
  if (state.settings.batterySaver === 'on') {
    isBatterySaverActive = true;
  } else if (state.settings.batterySaver === 'off') {
    isBatterySaverActive = false;
  } else {
    // 'auto'
    isBatterySaverActive = batteryObj ? !batteryObj.charging : false;
  }
  
  // Update button visual state
  if (batteryBtn) {
    if (state.settings.batterySaver === 'auto') {
      batteryBtn.textContent = isBatterySaverActive ? '🔋 Auto (Active)' : '🔋 Auto';
      batteryBtn.style.color = isBatterySaverActive ? '#ffb199' : 'var(--text-secondary)';
      batteryBtn.title = 'Battery Saver Mode: Auto (Currently ' + (isBatterySaverActive ? 'Active' : 'Idle') + ')';
    } else if (state.settings.batterySaver === 'on') {
      batteryBtn.textContent = '🔋 Saver ON';
      batteryBtn.style.color = '#ffb199';
      batteryBtn.title = 'Battery Saver Mode: Always ON';
    } else {
      batteryBtn.textContent = '🔋 Saver OFF';
      batteryBtn.style.color = 'var(--text-secondary)';
      batteryBtn.title = 'Battery Saver Mode: Always OFF';
    }
  }

  // Toggle class for CSS animations
  if (isBatterySaverActive) {
    document.documentElement.classList.add('battery-saver');
  } else {
    document.documentElement.classList.remove('battery-saver');
  }
  
  if (!state.settings.videoWallpaper) return;
  
  if (isBatterySaverActive) {
    // On battery — pause video to save power
    videoBg.pause();
    if (statusEl) statusEl.textContent = '⏸️ Video paused (Battery Saver active)';
  } else {
    // Charging — resume video
    if (videoBg.src && videoBg.style.display === 'block') {
      videoBg.play().catch(() => {});
    }
    if (statusEl && state.settings.videoWallpaper === 'local') {
      statusEl.textContent = '✅ Local video active: ' + (state.settings.videoFileName || 'video file');
    } else if (statusEl && state.settings.videoWallpaper) {
      statusEl.textContent = '✅ URL video active';
    }
  }
}

if (navigator.getBattery) {
  navigator.getBattery().then(battery => {
    batteryObj = battery;
    // Check immediately on load
    handleChargingChange();
    // Listen for plug/unplug events
    battery.addEventListener('chargingchange', handleChargingChange);
  });
}

// Hook up Battery Saver Button click handler
document.addEventListener('DOMContentLoaded', () => {
  const batteryBtn = document.getElementById('battery-saver-btn');
  if (batteryBtn) {
    batteryBtn.addEventListener('click', () => {
      if (!state.settings.batterySaver) {
        state.settings.batterySaver = 'auto';
      }
      
      // Cycle modes: auto -> on -> off -> auto
      if (state.settings.batterySaver === 'auto') {
        state.settings.batterySaver = 'on';
      } else if (state.settings.batterySaver === 'on') {
        state.settings.batterySaver = 'off';
      } else {
        state.settings.batterySaver = 'auto';
      }
      
      saveState();
      handleChargingChange();
    });
  }
});



// Rendering Pages
function renderPages() {
  pagesContainer.innerHTML = '';
  state.pages.forEach(page => {
    const el = document.createElement('div');
    el.className = `page-item ${page.id === activePageId ? 'active' : ''}`;
    el.dataset.id = page.id;
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = page.name;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.innerHTML = '✎';
    editBtn.onclick = (e) => { e.stopPropagation(); openModal('edit-page', page.id, page.name); };
    
    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.innerHTML = '🗑';
    delBtn.onclick = (e) => { e.stopPropagation(); deletePage(page.id); };
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(delBtn);
    
    el.appendChild(titleSpan);
    el.appendChild(actionsDiv);
    
    el.addEventListener('click', () => {
      activePageId = page.id;
      renderPages();
      renderBoards();
    });
    
    pagesContainer.appendChild(el);
  });
}

// Rendering Boards
function renderBoards(searchQuery = '') {
  boardsContainer.innerHTML = '';
  if (!activePageId) return;
  
  const activePage = state.pages.find(p => p.id === activePageId);
  if (!activePage) return;
  
  activePage.boards.forEach((board, index) => {
    // Filter bookmarks if search query exists
    const filteredBookmarks = board.bookmarks.filter(bm => 
      bm.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      bm.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (searchQuery && filteredBookmarks.length === 0) return; // Hide empty boards when searching
    
    const boardEl = document.createElement('div');
    boardEl.className = 'board';
    boardEl.dataset.id = board.id;
    
    const x = board.x !== undefined ? board.x : (32 + (index * 324));
    const y = board.y !== undefined ? board.y : 32;
    boardEl.style.left = x + 'px';
    boardEl.style.top = y + 'px';
    
    const header = document.createElement('div');
    header.className = 'board-header';
    header.innerHTML = `
      <h3>${board.name}</h3>
      <div class="board-actions">
        <button class="icon-btn edit-board-btn" data-id="${board.id}">✎</button>
        <button class="icon-btn del-board-btn" data-id="${board.id}">🗑</button>
      </div>
    `;
    
    const listEl = document.createElement('div');
    listEl.className = 'bookmarks-list';
    listEl.dataset.boardId = board.id;
    
    const bookmarksToRender = searchQuery ? filteredBookmarks : board.bookmarks;
    
    bookmarksToRender.forEach(bm => {
      const bmEl = document.createElement('a');
      bmEl.className = 'bookmark-card';
      bmEl.href = bm.url;
      bmEl.dataset.id = bm.id;
      
      const img = document.createElement('img');
      img.src = bm.favicon || `https://www.google.com/s2/favicons?domain=${new URL(bm.url).hostname}&sz=64`;
      img.onerror = () => { img.src = 'icon16.png'; };
      
      const info = document.createElement('div');
      info.className = 'bookmark-info';
      info.innerHTML = `
        <div class="bookmark-title">${bm.title}</div>
      `;
      
      const actions = document.createElement('div');
      actions.className = 'actions';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.innerHTML = '✎';
      editBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); openModal('edit-bookmark', bm.id, bm.title, bm.url, board.id); };
      
      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.innerHTML = '🗑';
      delBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); deleteBookmark(board.id, bm.id); };
      
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      
      bmEl.appendChild(img);
      bmEl.appendChild(info);
      bmEl.appendChild(actions);
      listEl.appendChild(bmEl);
    });
    
    const addBtn = document.createElement('button');
    addBtn.className = 'add-bookmark-btn';
    addBtn.textContent = '+ Add Bookmark';
    addBtn.onclick = () => openModal('add-bookmark', board.id);
    
    boardEl.appendChild(header);
    boardEl.appendChild(listEl);
    boardEl.appendChild(addBtn);
    
    boardsContainer.appendChild(boardEl);
    
    // Make bookmarks sortable
    if (typeof Sortable !== 'undefined' && !searchQuery) {
      new Sortable(listEl, {
        group: 'bookmarks',
        animation: 150,
        onEnd: handleBookmarkReorder
      });
    }
  });
  
  // Boards are now freely draggable, so no Sortable initialization for boardsContainer here.
  
  // Attach board event listeners
  document.querySelectorAll('.edit-board-btn').forEach(btn => {
    btn.onclick = (e) => openModal('edit-board', btn.dataset.id, e.target.closest('.board').querySelector('h3').textContent);
  });
  document.querySelectorAll('.del-board-btn').forEach(btn => {
    btn.onclick = (e) => deleteBoard(btn.dataset.id);
  });
}

// Drag and Drop Handlers
function handleBoardReorder(evt) {
  const activePage = state.pages.find(p => p.id === activePageId);
  const boardItem = activePage.boards.splice(evt.oldIndex, 1)[0];
  activePage.boards.splice(evt.newIndex, 0, boardItem);
  saveState();
}

function handleBookmarkReorder(evt) {
  const activePage = state.pages.find(p => p.id === activePageId);
  const oldBoardId = evt.from.dataset.boardId;
  const newBoardId = evt.to.dataset.boardId;
  
  const oldBoard = activePage.boards.find(b => b.id === oldBoardId);
  const newBoard = activePage.boards.find(b => b.id === newBoardId);
  
  const bookmark = oldBoard.bookmarks.splice(evt.oldIndex, 1)[0];
  newBoard.bookmarks.splice(evt.newIndex, 0, bookmark);
  saveState();
}

// CRUD Operations
addPageBtn.onclick = () => openModal('add-page');
addBoardBtn.onclick = () => openModal('add-board');

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function deletePage(id) {
  if(confirm('Delete this page and all its boards?')) {
    state.pages = state.pages.filter(p => p.id !== id);
    if (activePageId === id) activePageId = state.pages.length ? state.pages[0].id : null;
    saveState();
    renderPages();
    renderBoards();
  }
}

function deleteBoard(id) {
  if(confirm('Delete this board and all its bookmarks?')) {
    const page = state.pages.find(p => p.id === activePageId);
    page.boards = page.boards.filter(b => b.id !== id);
    saveState();
    renderBoards();
  }
}

function deleteBookmark(boardId, bookmarkId) {
  if(confirm('Delete this bookmark?')) {
    const page = state.pages.find(p => p.id === activePageId);
    const board = page.boards.find(b => b.id === boardId);
    board.bookmarks = board.bookmarks.filter(bm => bm.id !== bookmarkId);
    saveState();
    renderBoards();
  }
}

// Modal Logic
function openModal(type, id = '', title = '', url = '', parentId = '') {
  modalItemType.value = type;
  modalItemId.value = id;
  modalItemId.dataset.parentId = parentId; // Used for edit-bookmark to know which board
  
  itemTitleInput.value = title;
  itemUrlInput.value = url;
  
  if (type.includes('bookmark')) {
    groupUrl.style.display = 'block';
    itemUrlInput.required = true;
    modalTitle.textContent = type === 'add-bookmark' ? 'Add Bookmark' : 'Edit Bookmark';
  } else {
    groupUrl.style.display = 'none';
    itemUrlInput.required = false;
    modalTitle.textContent = type.includes('page') ? 
      (type === 'add-page' ? 'Add Page' : 'Edit Page') : 
      (type === 'add-board' ? 'Add Board' : 'Edit Board');
  }
  
  modal.classList.remove('hidden');
  itemTitleInput.focus();
}

function closeModal() {
  modal.classList.add('hidden');
  modalForm.reset();
}

closeBtn.onclick = closeModal;
window.onclick = (e) => { 
  if (e.target === modal) closeModal(); 
  if (e.target === wallpaperModal) wallpaperModal.classList.add('hidden');
};

modalForm.onsubmit = (e) => {
  e.preventDefault();
  const type = modalItemType.value;
  const id = modalItemId.value;
  const title = itemTitleInput.value.trim();
  const url = itemUrlInput.value.trim();
  
  if (type === 'add-page') {
    const newPage = { id: generateId(), name: title, boards: [] };
    state.pages.push(newPage);
    activePageId = newPage.id;
  } else if (type === 'edit-page') {
    state.pages.find(p => p.id === id).name = title;
  } else if (type === 'add-board') {
    const page = state.pages.find(p => p.id === activePageId);
    page.boards.push({ id: generateId(), name: title, bookmarks: [] });
  } else if (type === 'edit-board') {
    const page = state.pages.find(p => p.id === activePageId);
    page.boards.find(b => b.id === id).name = title;
  } else if (type === 'add-bookmark') {
    const page = state.pages.find(p => p.id === activePageId);
    const board = page.boards.find(b => b.id === id); // id is boardId here
    let finalUrl = url.startsWith('http') ? url : 'https://' + url;
    board.bookmarks.push({ 
      id: generateId(), 
      title: title, 
      url: finalUrl,
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(finalUrl).hostname}&sz=64`
    });
  } else if (type === 'edit-bookmark') {
    const page = state.pages.find(p => p.id === activePageId);
    const boardId = modalItemId.dataset.parentId;
    const board = page.boards.find(b => b.id === boardId);
    const bm = board.bookmarks.find(b => b.id === id);
    bm.title = title;
    
    let finalUrl = url.startsWith('http') ? url : 'https://' + url;
    bm.url = finalUrl;
    try {
      bm.favicon = `https://www.google.com/s2/favicons?domain=${new URL(finalUrl).hostname}&sz=64`;
    } catch(e) {}
  }
  
  saveState();
  renderPages();
  renderBoards();
  closeModal();
};

// Wallpaper Modal Logic
wallpapersBtn.onclick = () => {
  renderWallpapers();
  // Populate video URL input if one is saved (not for local files)
  const videoInput = document.getElementById('video-url-input');
  if (state.settings.videoWallpaper && state.settings.videoWallpaper !== 'local') {
    videoInput.value = state.settings.videoWallpaper;
  } else {
    videoInput.value = '';
  }
  updateVideoStatus();
  wallpaperModal.classList.remove('hidden');
};

closeWallpaperBtn.onclick = () => {
  wallpaperModal.classList.add('hidden');
};

// Video Wallpaper Handlers

// IndexedDB helper for storing large video blobs
function openVideoDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('AmitMarksVideoDB', 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('videos');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveVideoBlob(blob) {
  const db = await openVideoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('videos', 'readwrite');
    tx.objectStore('videos').put(blob, 'wallpaper');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadVideoBlob() {
  const db = await openVideoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('videos', 'readonly');
    const req = tx.objectStore('videos').get('wallpaper');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteVideoBlob() {
  const db = await openVideoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('videos', 'readwrite');
    tx.objectStore('videos').delete('wallpaper');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function updateVideoStatus() {
  const statusEl = document.getElementById('video-status');
  if (state.settings.videoWallpaper === 'local') {
    statusEl.textContent = '✅ Local video active: ' + (state.settings.videoFileName || 'video file');
  } else if (state.settings.videoWallpaper) {
    statusEl.textContent = '✅ URL video active';
  } else {
    statusEl.textContent = '';
  }
}

// "Choose from PC" button
document.getElementById('pick-video-btn').onclick = () => {
  document.getElementById('video-file-input').click();
};

// File input change handler
document.getElementById('video-file-input').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Show loading
  const statusEl = document.getElementById('video-status');
  statusEl.textContent = '⏳ Loading video...';
  
  try {
    // Store blob in IndexedDB
    await saveVideoBlob(file);
    
    // Update state
    state.settings.videoWallpaper = 'local';
    state.settings.videoFileName = file.name;
    state.settings.background = 'default';
    saveState();
    
    // Apply the video
    const videoBg = document.getElementById('video-bg');
    const blobUrl = URL.createObjectURL(file);
    document.body.style.backgroundImage = 'none';
    videoBg.src = blobUrl;
    videoBg.style.display = 'block';
    handleChargingChange();
    
    updateVideoStatus();
    wallpaperModal.classList.add('hidden');
  } catch (err) {
    statusEl.textContent = '❌ Error: ' + err.message;
  }
  
  // Reset file input
  e.target.value = '';
};

// "Set URL" button
document.getElementById('set-video-wp-btn').onclick = async () => {
  const url = document.getElementById('video-url-input').value.trim();
  if (!url) return;
  await deleteVideoBlob();
  state.settings.videoWallpaper = url;
  state.settings.videoFileName = '';
  state.settings.background = 'default';
  saveState();
  applySettings();
  wallpaperModal.classList.add('hidden');
};

// "Remove Video" button
document.getElementById('clear-video-wp-btn').onclick = async () => {
  await deleteVideoBlob();
  state.settings.videoWallpaper = '';
  state.settings.videoFileName = '';
  document.getElementById('video-url-input').value = '';
  saveState();
  applySettings();
  updateVideoStatus();
};

function renderWallpapers() {
  wallpaperGrid.innerHTML = '';
  WALLPAPERS.forEach(wp => {
    const el = document.createElement('div');
    el.className = 'wallpaper-item';
    if (wp.url) {
      el.style.backgroundImage = `url('${wp.url}')`;
    } else {
      el.style.backgroundColor = state.settings.theme === 'dark' ? '#121212' : '#f0f2f5';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '12px';
      el.textContent = 'Solid Color';
    }
    
    if (!state.settings.videoWallpaper && (state.settings.background === wp.url || (wp.id === 'default' && (!state.settings.background || state.settings.background === 'default' || !state.settings.background.startsWith('http'))))) {
      el.classList.add('selected');
    }
    
    el.onclick = () => {
      // When user picks an image wallpaper, clear video wallpaper
      state.settings.videoWallpaper = '';
      state.settings.background = wp.id === 'default' ? 'default' : wp.url;
      document.getElementById('video-url-input').value = '';
      saveState();
      applySettings();
      renderWallpapers();
    };
    
    wallpaperGrid.appendChild(el);
  });
}

// --- Widget Logic ---

function applyWidgetPositions() {
  const widgets = document.querySelectorAll('.widget');
  widgets.forEach(widget => {
    const id = widget.id;
    if (state.widgetPositions[id]) {
      widget.style.left = state.widgetPositions[id].x + 'px';
      widget.style.top = state.widgetPositions[id].y + 'px';
      widget.style.right = 'auto'; // Remove default right if left is set
    }
  });
}

// Drag & Drop for Widgets & Boards
let draggedWidget = null;
let draggedBoard = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

document.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('drag-handle')) {
    draggedWidget = e.target.closest('.widget');
    const rect = draggedWidget.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    // Ensure dragged widget is on top
    document.querySelectorAll('.widget').forEach(w => w.style.zIndex = 10);
    draggedWidget.style.zIndex = 20;
    
    // Convert right-based positioning to left-based
    draggedWidget.style.left = rect.left + 'px';
    draggedWidget.style.right = 'auto';
  } else {
    const boardHeader = e.target.closest('.board-header');
    if (boardHeader && !e.target.closest('.board-actions') && !e.target.closest('.bookmarks-list')) {
      draggedBoard = boardHeader.closest('.board');
      const rect = draggedBoard.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      
      // Ensure dragged board is on top
      document.querySelectorAll('.board').forEach(b => b.style.zIndex = 10);
      draggedBoard.style.zIndex = 20;
    }
  }
});

document.addEventListener('mousemove', (e) => {
  if (draggedWidget) {
    let newX = e.clientX - dragOffsetX;
    let newY = e.clientY - dragOffsetY;
    
    // Keep within bounds
    newX = Math.max(0, Math.min(newX, window.innerWidth - draggedWidget.offsetWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - draggedWidget.offsetHeight));
    
    draggedWidget.style.left = newX + 'px';
    draggedWidget.style.top = newY + 'px';
  } else if (draggedBoard) {
    const containerRect = boardsContainer.getBoundingClientRect();
    let newX = e.clientX - containerRect.left - dragOffsetX;
    let newY = e.clientY - containerRect.top - dragOffsetY;
    
    // Don't strictly constrain to bounds to allow free placement, but prevent negative top maybe?
    // newY = Math.max(0, newY);
    
    draggedBoard.style.left = newX + 'px';
    draggedBoard.style.top = newY + 'px';
  }
});

document.addEventListener('mouseup', () => {
  if (draggedWidget) {
    const id = draggedWidget.id;
    const rect = draggedWidget.getBoundingClientRect();
    state.widgetPositions[id] = { x: rect.left, y: rect.top };
    saveState();
    draggedWidget = null;
  }
  if (draggedBoard) {
    const boardId = draggedBoard.dataset.id;
    const page = state.pages.find(p => p.id === activePageId);
    if (page) {
      const board = page.boards.find(b => b.id === boardId);
      if (board) {
        board.x = parseInt(draggedBoard.style.left, 10);
        board.y = parseInt(draggedBoard.style.top, 10);
        saveState();
      }
    }
    draggedBoard = null;
  }
});

// --- Ambient Player & Web Audio API & Timer ---
const ambientAudio = document.getElementById('ambient-audio');
const playBtn = document.getElementById('play-btn');
const audioSelect = document.getElementById('audio-select');

const timerInput = document.getElementById('timer-input');
const timerToggleBtn = document.getElementById('timer-toggle-btn');
const timerDisplay = document.getElementById('timer-display');
const timerInputGroup = timerInput.closest('.timer-input-group');

let audioCtx = null;
let mainGainNode = null;
let activeSource = null;
let isPlaying = false;
let mediaElementSource = null;

// Timer State
let timerInterval = null;
let timeLeft = 0; // seconds
let timerRunning = false;

function initAudio() {
  if (audioCtx) return;
  
  // Use standard or webkit AudioContext
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContextClass();
  
  // Main volume controls (for fades)
  mainGainNode = audioCtx.createGain();
  mainGainNode.gain.setValueAtTime(0.5, audioCtx.currentTime); // default 50% vol
  mainGainNode.connect(audioCtx.destination);
}

// Procedural Audio Generators
function startBrownNoise() {
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
  }

  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  // Add a mild lowpass to make it extra cozy
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 400;

  noiseSource.connect(lp);
  lp.connect(mainGainNode);
  noiseSource.start();

  return {
    stop: () => {
      try { noiseSource.stop(); } catch(e) {}
    }
  };
}

function startWaves() {
  // Pink noise approximation for a softer wave swell
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11;
    b6 = white * 0.115926;
  }

  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  // Lowpass filter for sweeping
  const filterNode = audioCtx.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.Q.value = 1.2;
  filterNode.frequency.value = 250;

  // Highpass to remove muddy sub-bass
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 40;

  // Swelling LFO
  const lfoNode = audioCtx.createOscillator();
  lfoNode.type = 'sine';
  lfoNode.frequency.value = 0.08; // Wave swell speed (12.5 seconds)

  // Modulate filter frequency between 100Hz and 600Hz
  const lfoFilterGain = audioCtx.createGain();
  lfoFilterGain.gain.value = 250; 

  // Modulate volume gain
  const waveGain = audioCtx.createGain();
  waveGain.gain.value = 0.15; // base volume

  const lfoVolGain = audioCtx.createGain();
  lfoVolGain.gain.value = 0.1; // +/- 0.1 volume variance

  // Connections
  lfoNode.connect(lfoFilterGain);
  lfoFilterGain.connect(filterNode.frequency);

  lfoNode.connect(lfoVolGain);
  lfoVolGain.connect(waveGain.gain);

  noiseSource.connect(hp);
  hp.connect(filterNode);
  filterNode.connect(waveGain);
  waveGain.connect(mainGainNode);

  lfoNode.start();
  noiseSource.start();

  return {
    stop: () => {
      try { noiseSource.stop(); } catch(e) {}
      try { lfoNode.stop(); } catch(e) {}
    }
  };
}

function startAudioElement(src) {
  if (!mediaElementSource) {
    mediaElementSource = audioCtx.createMediaElementSource(ambientAudio);
    mediaElementSource.connect(mainGainNode);
  }
  ambientAudio.src = src;
  ambientAudio.play().catch(err => console.log("Audio play failed:", err));
  
  return {
    stop: () => {
      ambientAudio.pause();
    }
  };
}

function playAudio() {
  initAudio();
  
  // Resume context if suspended (browser security)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  // Stop existing source
  if (activeSource) {
    activeSource.stop();
  }
  
  // Reset volume in case it was faded out
  mainGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
  mainGainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  
  const type = audioSelect.value;
  if (type === 'waves') {
    activeSource = startWaves();
  } else if (type === 'noise') {
    activeSource = startBrownNoise();
  } else {
    activeSource = startAudioElement(type);
  }
  
  playBtn.textContent = '⏸';
  isPlaying = true;
}

function stopAudio(fadeTime = 0) {
  if (!isPlaying) return;
  
  if (fadeTime > 0 && audioCtx) {
    // Elegant fade out
    mainGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    mainGainNode.gain.setValueAtTime(mainGainNode.gain.value, audioCtx.currentTime);
    mainGainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + fadeTime);
    
    setTimeout(() => {
      if (activeSource) {
        activeSource.stop();
        activeSource = null;
      }
      playBtn.textContent = '▶';
      isPlaying = false;
    }, fadeTime * 1000);
  } else {
    if (activeSource) {
      activeSource.stop();
      activeSource = null;
    }
    playBtn.textContent = '▶';
    isPlaying = false;
  }
}

// Timer Logic
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  const mins = parseInt(timerInput.value, 10) || 25;
  timeLeft = mins * 60;
  
  // If audio is not playing, start it now
  if (!isPlaying) {
    playAudio();
  }
  
  timerRunning = true;
  timerToggleBtn.textContent = '✕';
  timerInputGroup.style.display = 'none';
  timerDisplay.classList.remove('hidden');
  updateTimerDisplay();
  
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      resetTimerUI();
      // Elegant 5-second fadeout when timer ends
      stopAudio(5);
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  resetTimerUI();
}

function resetTimerUI() {
  timerRunning = false;
  timerToggleBtn.textContent = '⏱️';
  timerInputGroup.style.display = 'flex';
  timerDisplay.classList.add('hidden');
}

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timerDisplay.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Event Listeners
playBtn.addEventListener('click', () => {
  if (isPlaying) {
    stopAudio();
    stopTimer(); // also stop timer if user stops audio
  } else {
    playAudio();
  }
});

audioSelect.addEventListener('change', () => {
  if (isPlaying) {
    playAudio();
  }
});

timerToggleBtn.addEventListener('click', () => {
  if (timerRunning) {
    stopTimer();
  } else {
    startTimer();
  }
});
