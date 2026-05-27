const DEFAULT_STATE = {
  pages: [
    {
      id: 'page-default',
      name: 'Main',
      boards: [
        {
          id: 'board-default',
          name: 'General',
          bookmarks: []
        }
      ]
    }
  ],
  settings: {
    theme: 'dark',
    background: '#1a1b1e'
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['pages', 'settings'], (result) => {
    if (!result.pages || !result.settings) {
      chrome.storage.local.set(DEFAULT_STATE, () => {
        console.log('MyMarks initialized with default state.');
      });
    }
  });
});
