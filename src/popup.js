/* ChatGPT Themer — lógica del popup. */
(function () {
  'use strict';

  const CT = window.CT;
  const WIDTH_BASE = 38; // rem mínimos del slider de ancho (0 = por defecto)

  const $ = function (id) { return document.getElementById(id); };
  const el = {
    enabled: $('enabled'), grid: $('grid'), tabs: $('tabs'), status: $('status'),
    accent: $('accent'), accentReset: $('accentReset'),
    fontSize: $('fontSize'), fontSizeOut: $('fontSizeOut'),
    chatWidth: $('chatWidth'), chatWidthOut: $('chatWidthOut'),
    fontFamily: $('fontFamily'), compact: $('compact'),
    hideAvatars: $('hideAvatars'), showWidget: $('showWidget'), reset: $('reset')
  };

  let settings = Object.assign({}, CT.DEFAULTS);
  let saveTimer = null;

  /* ------------------------------------------------------ persistencia */

  function save(patch, immediate) {
    settings = Object.assign({}, settings, patch);
    paint();
    clearTimeout(saveTimer);
    const write = function () {
      chrome.storage.sync.set({ [CT.STORAGE_KEY]: settings });
    };
    if (immediate) write(); else saveTimer = setTimeout(write, 120);
  }

  /* ------------------------------------------------------------ pintado */

  function themeCard(id, theme) {
    const v = theme.vars;
    const card = document.createElement('button');
    card.className = 'card';
    card.type = 'button';
    card.dataset.themeId = id;
    card.dataset.group = theme.group;
    card.setAttribute('role', 'radio');
    card.title = theme.name;

    const side = v ? v.sidebarSurfacePrimary : '#171717';
    const main = v ? v.mainSurfacePrimary : '#212121';
    const bubble = v ? v.mainSurfaceSecondary : '#303030';
    const text = v ? v.textPrimary : '#ececec';
    const accent = theme.accent || '#3a83f7';

    card.innerHTML =
      '<span class="prev">' +
        '<span class="side" style="background:' + side + '"></span>' +
        '<span class="main" style="background:' + main + '">' +
          '<span class="bar" style="background:' + text + '"></span>' +
          '<span class="bar s" style="background:' + text + '"></span>' +
          '<span class="bar" style="background:' + bubble + ';opacity:1"></span>' +
          '<span class="dot" style="background:' + accent + '"></span>' +
        '</span>' +
      '</span>' +
      '<span class="tick">✓</span>';

    const name = document.createElement('b');
    name.textContent = theme.name;
    card.appendChild(name);

    card.addEventListener('click', function () { save({ theme: id }, true); });
    return card;
  }

  function buildGrid() {
    const frag = document.createDocumentFragment();
    Object.keys(CT.THEMES).forEach(function (id) {
      frag.appendChild(themeCard(id, CT.THEMES[id]));
    });
    el.grid.appendChild(frag);
  }

  function buildFonts() {
    Object.keys(CT.FONTS).forEach(function (value) {
      const o = document.createElement('option');
      o.value = value;
      o.textContent = CT.FONTS[value];
      el.fontFamily.appendChild(o);
    });
  }

  function paint() {
    const theme = CT.THEMES[settings.theme] || CT.THEMES.default;

    document.body.classList.toggle('off', !settings.enabled);
    el.enabled.checked = settings.enabled;

    el.grid.querySelectorAll('.card').forEach(function (c) {
      c.setAttribute('aria-checked', String(c.dataset.themeId === settings.theme));
    });

    el.accent.value = settings.accent || theme.accent || '#3a83f7';
    el.accentReset.style.visibility = settings.accent ? 'visible' : 'hidden';

    el.fontSize.value = settings.fontSize || CT.DEFAULTS.fontSize;
    el.fontSizeOut.textContent = el.fontSize.value + ' px';

    el.chatWidth.value = settings.chatWidth ? settings.chatWidth - WIDTH_BASE : 0;
    el.chatWidthOut.textContent = settings.chatWidth
      ? settings.chatWidth + ' rem'
      : 'Por defecto';

    el.fontFamily.value = settings.fontFamily || '';
    el.compact.checked = !!settings.compact;
    el.hideAvatars.checked = !!settings.hideAvatars;
    el.showWidget.checked = !!settings.showWidget;
  }

  function filter(group) {
    el.grid.querySelectorAll('.card').forEach(function (c) {
      c.hidden = group !== 'all' && c.dataset.group !== group;
    });
  }

  /* ------------------------------------------------------------ eventos */

  el.enabled.addEventListener('change', function () { save({ enabled: this.checked }, true); });
  el.accent.addEventListener('input', function () { save({ accent: this.value }); });
  el.accentReset.addEventListener('click', function () { save({ accent: '' }, true); });
  el.fontSize.addEventListener('input', function () { save({ fontSize: +this.value }); });
  el.chatWidth.addEventListener('input', function () {
    save({ chatWidth: +this.value ? WIDTH_BASE + +this.value : 0 });
  });
  el.fontFamily.addEventListener('change', function () { save({ fontFamily: this.value }, true); });
  el.compact.addEventListener('change', function () { save({ compact: this.checked }, true); });
  el.hideAvatars.addEventListener('change', function () { save({ hideAvatars: this.checked }, true); });
  el.showWidget.addEventListener('change', function () { save({ showWidget: this.checked }, true); });
  el.reset.addEventListener('click', function () { save(CT.DEFAULTS, true); });

  el.tabs.addEventListener('click', function (e) {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    el.tabs.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('is-active', t === tab);
    });
    filter(tab.dataset.group);
    el.grid.scrollTop = 0;
  });

  /* -------------------------------------------------------------- init */

  buildGrid();
  buildFonts();

  chrome.storage.sync.get(CT.STORAGE_KEY, function (data) {
    settings = Object.assign({}, CT.DEFAULTS, data && data[CT.STORAGE_KEY]);
    paint();
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = (tabs && tabs[0] && tabs[0].url) || '';
    const ok = /^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test(url);
    el.status.textContent = ok
      ? 'Los cambios se aplican al instante'
      : 'Abre chatgpt.com para ver los cambios';
  });
})();
