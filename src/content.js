/* ChatGPT Themer — content script.
   Se ejecuta en document_start: primero pinta desde la caché local (sin
   parpadeo) y luego se sincroniza con chrome.storage. */
(function () {
  'use strict';

  const CT = window.CT;
  const STYLE_ID = 'cgpt-themer-style';
  const WIDGET_ID = 'cgpt-themer-widget';

  let settings = Object.assign({}, CT.DEFAULTS);
  let styleEl = null;
  let widget = null; // se construye al insertarlo en <body> (ver buildWidget)

  /* ---------------------------------------------------------------- estilos */

  function ensureStyle() {
    if (styleEl && styleEl.isConnected) return styleEl;
    styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
    }
    (document.head || document.documentElement).appendChild(styleEl);
    return styleEl;
  }

  function render() {
    ensureStyle().textContent = CT.buildCSS(settings);
    if (widget) widget.sync();
  }

  function setSettings(next) {
    settings = Object.assign({}, CT.DEFAULTS, next || {});
    try {
      localStorage.setItem(CT.CACHE_KEY, JSON.stringify(settings));
    } catch (e) { /* modo privado / almacenamiento lleno */ }
    render();
    updateWidgetPresence();
  }

  function save(patch) {
    const next = Object.assign({}, settings, patch);
    setSettings(next);
    chrome.storage.sync.set({ [CT.STORAGE_KEY]: next });
  }

  /* --------------------------------------------------------------- widget */

  function buildWidget() {
    const host = document.createElement('div');
    host.id = WIDGET_ID;
    host.style.cssText = 'position:fixed;right:16px;bottom:88px;z-index:2147483000;';
    const shadow = host.attachShadow({ mode: 'open' });

    shadow.innerHTML = [
      '<style>',
      ':host,*{box-sizing:border-box}',
      '.btn{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.18);',
      'background:linear-gradient(135deg,#6d5efc,#22d3ee);color:#fff;font-size:18px;line-height:1;',
      'cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35);transition:transform .15s ease}',
      '.btn:hover{transform:scale(1.08)}',
      '.panel{position:absolute;right:0;bottom:50px;width:216px;padding:10px;border-radius:14px;',
      'background:#14151a;border:1px solid #2c2e38;box-shadow:0 18px 40px rgba(0,0,0,.5);',
      'font:13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;color:#e9e9ee;display:none}',
      '.panel.open{display:block}',
      '.hd{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8b8d9b;margin:2px 4px 8px}',
      '.list{max-height:290px;overflow:auto;display:flex;flex-direction:column;gap:2px}',
      '.opt{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;',
      'border:1px solid transparent;background:none;color:inherit;font:inherit;text-align:left;width:100%}',
      '.opt:hover{background:#ffffff12}',
      '.opt[aria-checked="true"]{background:#ffffff16;border-color:#6d5efc}',
      '.sw{width:20px;height:20px;border-radius:50%;overflow:hidden;display:flex;flex:0 0 auto;',
      'border:1px solid rgba(255,255,255,.25)}',
      '.sw i{flex:1}',
      '.ft{margin-top:8px;padding-top:8px;border-top:1px solid #2c2e38;text-align:center}',
      '.ft a{color:#8b8d9b;font-size:11px;text-decoration:none}',
      '.ft a:hover{color:#22d3ee}',
      '</style>',
      '<div class="panel" part="panel"><div class="hd">Tema</div>',
      '<div class="list"></div>',
      '<div class="ft"><a href="https://alberruche.com" target="_blank" rel="noopener">',
      'Developed by alberruche</a></div></div>',
      '<button class="btn" title="ChatGPT Themer">🎨</button>'
    ].join('');

    const panel = shadow.querySelector('.panel');
    const list = shadow.querySelector('.list');
    const btn = shadow.querySelector('.btn');

    Object.keys(CT.THEMES).forEach(function (id) {
      const theme = CT.THEMES[id];
      const opt = document.createElement('button');
      opt.className = 'opt';
      opt.type = 'button';
      opt.setAttribute('role', 'radio');
      opt.dataset.themeId = id;
      const sw = document.createElement('span');
      sw.className = 'sw';
      theme.swatch.forEach(function (c) {
        const i = document.createElement('i');
        i.style.background = c;
        sw.appendChild(i);
      });
      const label = document.createElement('span');
      label.textContent = theme.name;
      opt.append(sw, label);
      opt.addEventListener('click', function () { save({ theme: id }); });
      list.appendChild(opt);
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (e.composedPath().indexOf(host) === -1) panel.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') panel.classList.remove('open');
    });

    return {
      host: host,
      sync: function () {
        list.querySelectorAll('.opt').forEach(function (el) {
          el.setAttribute('aria-checked', String(el.dataset.themeId === settings.theme));
        });
      }
    };
  }

  function updateWidgetPresence() {
    if (!document.body) return;
    if (settings.enabled && settings.showWidget) {
      if (!widget) widget = buildWidget();
      if (!widget.host.isConnected) document.body.appendChild(widget.host);
      widget.sync();
    } else if (widget && widget.host.isConnected) {
      widget.host.remove();
    }
  }

  /* ------------------------------------------------- SPA: reponer si se va */

  function watch() {
    updateWidgetPresence();
    let queued = false;
    // Solo hijos directos de <html> y de <body>: basta para detectar que la SPA
    // ha reemplazado head/body o ha barrido nuestros nodos, sin el coste de
    // observar todo el árbol mientras se transmiten respuestas.
    const observer = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        if (!styleEl || !styleEl.isConnected) render();
        updateWidgetPresence();
      });
    });
    observer.observe(document.documentElement, { childList: true });
    observer.observe(document.body, { childList: true });
    if (document.head) observer.observe(document.head, { childList: true });
  }

  /* ------------------------------------------------- arranque sin parpadeo */
  /* Va al final del módulo a propósito: así todo el estado y las funciones
     ya están inicializados cuando se ejecuta el primer render(). */

  try {
    const cached = localStorage.getItem(CT.CACHE_KEY);
    if (cached) settings = Object.assign({}, CT.DEFAULTS, JSON.parse(cached));
  } catch (e) { /* ignorar caché corrupta */ }
  render();

  chrome.storage.sync.get(CT.STORAGE_KEY, function (data) {
    setSettings(data && data[CT.STORAGE_KEY]);
  });

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area !== 'sync' || !changes[CT.STORAGE_KEY]) return;
    setSettings(changes[CT.STORAGE_KEY].newValue);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watch, { once: true });
  } else {
    watch();
  }
})();
