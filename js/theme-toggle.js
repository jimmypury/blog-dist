(function() {
  var storageKey = 'cactus-theme';
  var root = document.documentElement;
  var menu = document.getElementById('floating-menu');
  var menuToggle = document.getElementById('floating-menu-toggle');
  var menuActions = document.getElementById('floating-menu-actions');
  var themeToggle = document.getElementById('theme-toggle');
  var topButton = document.getElementById('floating-top');
  var shareToggle = document.getElementById('floating-share-toggle');
  var shareStatus = document.getElementById('floating-share-status');
  var shareStatusTimer = null;

  function getStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {}
  }

  function setTheme(theme) {
    var nextTheme = theme === 'light' ? 'light' : 'dark';
    var icon = themeToggle ? themeToggle.querySelector('i') : null;
    var label = nextTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

    root.setAttribute('data-theme', nextTheme);

    if (themeToggle && icon) {
      icon.className = nextTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('title', label);
    }
  }

  function setMenuOpen(isOpen) {
    if (!menu || !menuToggle || !menuActions) return;
    var menuIcon = menuToggle.querySelector('i');

    menu.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuActions.setAttribute('aria-hidden', String(!isOpen));

    if (menuIcon) {
      menuIcon.className = isOpen ? 'fa-solid fa-chevron-down' : 'fa-solid fa-bars';
    }

  }

  function showShareStatus(message) {
    if (!shareStatus) return;

    window.clearTimeout(shareStatusTimer);
    shareStatus.textContent = message;
    shareStatus.classList.add('is-visible');
    shareStatusTimer = window.setTimeout(function() {
      shareStatus.classList.remove('is-visible');
    }, 1800);
  }

  function copyShareUrl(url) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(url).then(function() {
        return true;
      }).catch(function() {
        return copyShareUrlFallback(url);
      });
    }

    return Promise.resolve(copyShareUrlFallback(url));
  }

  function copyShareUrlFallback(url) {
    var input = document.createElement('textarea');
    input.value = url;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();

    var copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {}

    document.body.removeChild(input);
    return copied;
  }

  function sharePost() {
    if (!shareToggle) return;

    var shareData = {
      title: shareToggle.getAttribute('data-share-title') || document.title,
      url: shareToggle.getAttribute('data-share-url') || window.location.href.split('#')[0]
    };

    if (typeof navigator.share === 'function') {
      navigator.share(shareData).then(function() {
        setMenuOpen(false);
      }).catch(function(error) {
        if (error && error.name === 'AbortError') return;

        copyShareUrl(shareData.url).then(function(copied) {
          if (copied) {
            showShareStatus(shareToggle.getAttribute('data-share-copied'));
            setMenuOpen(false);
          }
        });
      });
      return;
    }

    copyShareUrl(shareData.url).then(function(copied) {
      if (copied) {
        showShareStatus(shareToggle.getAttribute('data-share-copied'));
        setMenuOpen(false);
      }
    });
  }

  function updateTopButton() {
    if (!topButton) return;
    topButton.hidden = window.scrollY <= 50;
  }

  function getGiscusTheme(theme) {
    var container = document.getElementById('giscus_thread');
    if (!container) return theme === 'light' ? 'light' : 'dark';

    return theme === 'light'
      ? container.getAttribute('data-giscus-light-theme') || 'light'
      : container.getAttribute('data-giscus-dark-theme') || 'dark';
  }

  function setGiscusTheme(theme) {
    var container = document.querySelector('.giscus');
    var iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe || !iframe.contentWindow) return;

    if (container) {
      container.classList.add('is-switching');
    }

    iframe.contentWindow.postMessage({
      giscus: {
        setConfig: {
          theme: getGiscusTheme(theme)
        }
      }
    }, 'https://giscus.app');

    window.setTimeout(function() {
      if (container) {
        container.classList.remove('is-switching');
      }
    }, 260);
  }

  setTheme(getStoredTheme() || root.getAttribute('data-theme') || 'dark');

  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      setMenuOpen(!menu.classList.contains('is-open'));
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      var currentTheme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      var nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

      setTheme(nextTheme);
      storeTheme(nextTheme);
      setGiscusTheme(nextTheme);
    });
  }

  if (topButton) {
    topButton.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setMenuOpen(false);
    });
    updateTopButton();
    window.addEventListener('scroll', updateTopButton, { passive: true });
  }

  if (shareToggle) {
    shareToggle.addEventListener('click', sharePost);
  }

  document.addEventListener('click', function(event) {
    if (menu && !menu.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      setMenuOpen(false);
      if (menuToggle) menuToggle.focus();
    }
  });
}());
