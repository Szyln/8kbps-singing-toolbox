// 側邊欄專屬的多語言設定
const sidebarI18n = {
  ja: {
    menu_home: "歌える曲一覧",
    menu_tool: "行数表示ツール"
  },
  zh: {
    menu_home: "我的歌單一覽",
    menu_tool: "顯示行數工具"
  }
};

// 渲染側邊欄至畫面上
window.renderSidebar = function() {
  const currentLang = localStorage.getItem('appLang') || 'ja';
  const dict = sidebarI18n[currentLang];
  
  const sidebarHTML = `
    <div class="drawer-backdrop" id="drawer-backdrop" onclick="toggleDrawer()"></div>
    <nav class="nav-drawer" id="nav-drawer">
      <div class="drawer-header">
        <h2 class="drawer-title"></h2>
        <button class="drawer-close-btn" onclick="toggleDrawer()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="drawer-content">
        <a href="index.html" class="drawer-item" id="nav-home">
          <span class="material-symbols-outlined">library_music</span>
          <span data-sidebar-i18n="menu_home">${dict.menu_home}</span>
        </a>
        <a href="whichLine.html" class="drawer-item" id="nav-tool">
          <span class="material-symbols-outlined">format_list_numbered</span>
          <span data-sidebar-i18n="menu_tool">${dict.menu_tool}</span>
        </a>
      </div>
      <div class="drawer-footer" style="padding: 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: center; gap: 15px;">
        <a href="${window.AppConfig.xUrl}" target="_blank" class="social-icon" title="X (Twitter)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="${window.AppConfig.youtubeUrl}" target="_blank" class="social-icon yt" title="YouTube">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.582 6.186a2.684 2.684 0 0 0-1.884-1.895C17.973 3.846 12 3.846 12 3.846s-5.973 0-7.698.445a2.684 2.684 0 0 0-1.884 1.895C1.964 7.915 1.964 12 1.964 12s0 4.085.454 5.814a2.684 2.684 0 0 0 1.884 1.895c1.725.445 7.698.445 7.698.445s5.973 0 7.698-.445a2.684 2.684 0 0 0 1.884-1.895c.454-1.729.454-5.814.454-5.814s0-4.085-.454-5.814zM9.96 15.485V8.515L15.96 12l-6 3.485z"/></svg>
        </a>
      </div>
    </nav>
  `;
  
  // 將 HTML 插入到 <body> 最前方
  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

  // 自動判斷當前網址，為對應的選單加上 active 樣式
  const path = window.location.pathname;
  if (path.includes('whichLine.html')) {
    document.getElementById('nav-tool').classList.add('active');
  } else {
    document.getElementById('nav-home').classList.add('active');
  }
};

// 獨立出來的開關側邊欄邏輯
window.toggleDrawer = function() {
  const drawer = document.getElementById('nav-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer.classList.contains('active')) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
  } else {
    drawer.classList.add('active');
    backdrop.classList.add('active');
  }
};

// 獨立出來的側邊欄語言更新邏輯
window.updateSidebarLanguage = function() {
  const currentLang = localStorage.getItem('appLang') || 'ja';
  const dict = sidebarI18n[currentLang];
  document.querySelectorAll('[data-sidebar-i18n]').forEach(el => {
    const key = el.getAttribute('data-sidebar-i18n');
    if (dict[key]) {
      el.innerText = dict[key];
    }
  });
};