document.addEventListener('DOMContentLoaded', () => {
  const titleInput = document.getElementById('site-title');
  const urlInput = document.getElementById('site-url');
  const faviconImg = document.getElementById('site-favicon');
  const pageSelect = document.getElementById('page-select');
  const boardSelect = document.getElementById('board-select');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  let extensionState = null;

  // Get current tab details
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab) {
      titleInput.value = activeTab.title;
      urlInput.value = activeTab.url;
      if (activeTab.favIconUrl) {
        faviconImg.src = activeTab.favIconUrl;
      }
    }
  });

  // Load pages and boards
  chrome.storage.local.get(['pages'], (result) => {
    if (result.pages && result.pages.length > 0) {
      extensionState = result.pages;
      
      // Populate Pages
      result.pages.forEach(page => {
        const option = document.createElement('option');
        option.value = page.id;
        option.textContent = page.name;
        pageSelect.appendChild(option);
      });

      // Handle Page Change -> update Boards
      pageSelect.addEventListener('change', () => {
        updateBoardsDropdown(pageSelect.value);
      });

      // Initialize Boards for the first page
      updateBoardsDropdown(result.pages[0].id);
    }
  });

  function updateBoardsDropdown(pageId) {
    boardSelect.innerHTML = '';
    const page = extensionState.find(p => p.id === pageId);
    if (page && page.boards) {
      page.boards.forEach(board => {
        const option = document.createElement('option');
        option.value = board.id;
        option.textContent = board.name;
        boardSelect.appendChild(option);
      });
    }
  }

  cancelBtn.addEventListener('click', () => {
    window.close();
  });

  saveBtn.addEventListener('click', () => {
    const pageId = pageSelect.value;
    const boardId = boardSelect.value;
    
    if (!pageId || !boardId) {
      alert("Please create a Page and a Board in the Dashboard first!");
      return;
    }

    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    const favicon = faviconImg.src;

    const page = extensionState.find(p => p.id === pageId);
    const board = page.boards.find(b => b.id === boardId);

    board.bookmarks.push({
      id: Math.random().toString(36).substr(2, 9),
      title: title,
      url: url,
      favicon: favicon
    });

    // Save back to storage
    chrome.storage.local.set({ pages: extensionState }, () => {
      saveBtn.textContent = 'Saved!';
      saveBtn.style.backgroundColor = '#10b981'; // Green color for success
      setTimeout(() => {
        window.close();
      }, 750);
    });
  });
});
