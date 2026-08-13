/* ChatGPT Themer — service worker: atajos de teclado. */
importScripts('themes.js');

const CT = self.CT;

function withSettings(fn) {
  chrome.storage.sync.get(CT.STORAGE_KEY, function (data) {
    const current = Object.assign({}, CT.DEFAULTS, data && data[CT.STORAGE_KEY]);
    chrome.storage.sync.set({ [CT.STORAGE_KEY]: Object.assign(current, fn(current)) });
  });
}

chrome.commands.onCommand.addListener(function (command) {
  if (command === 'toggle-enabled') {
    withSettings(function (s) { return { enabled: !s.enabled }; });
  } else if (command === 'cycle-theme') {
    withSettings(function (s) {
      const ids = Object.keys(CT.THEMES);
      const next = ids[(ids.indexOf(s.theme) + 1) % ids.length];
      return { theme: next, enabled: true };
    });
  }
});
