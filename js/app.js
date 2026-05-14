/* ===== 光予 · App Logic ===== */
(function() {
  'use strict';

  // ===== State =====
  let currentPage = 'home';
  let isPeriod = false;
  let sleepMode = false;
  let recording = false;
  let recordTimer = null;
  let recordSeconds = 0;
  let noteStreak = 5;
  let moodToday = null;
  let sleepLongPressTimer = null;

  // ===== Init =====
  function init() {
    registerSW();
    bindNav();
    bindSleepPage();
    bindRecordPage();
    bindNoteCats();
    bindFlowerIcon();
    updateRings();
    maybeShowMorning();
    // auto-period: toggle with flower icon
    console.log('🌿 光予 已就绪 — 小光和小予在等你');
  }

  // ===== PWA Service Worker =====
  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  // ===== Page Switching =====
  window.switchPage = function(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const page = document.getElementById('page-' + name);
    if (page) page.classList.add('active');
    if (isPeriod && name === 'home') page.classList.add('period-active');

    const nav = document.querySelector('.nav-item[data-page="' + name + '"]');
    if (nav) nav.classList.add('active');

    currentPage = name;

    // Show/hide FAB
    const fab = document.querySelector('.fab');
    if (fab) fab.style.display = (name === 'home') ? 'flex' : 'none';

    if (name === 'home') updateRings();
    if (name === 'note' && document.getElementById('noteSaved').style.display !== 'none') {
      resetNoteEditor();
    }
  };

  // ===== Bottom Nav Binding =====
  function bindNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function() {
        const pageName = this.dataset.page;
        switchPage(pageName);
      });
    });
  }

  // ===== Morning Summary Modal =====
  function maybeShowMorning() {
    const today = new Date().toDateString();
    const shown = localStorage.getItem('morning_shown_' + today);
    if (!shown) {
      setTimeout(() => {
        document.getElementById('morningModal').classList.add('show');
        localStorage.setItem('morning_shown_' + today, '1');
      }, 800);
    }
  }
  window.closeModal = function() {
    document.getElementById('morningModal').classList.remove('show');
  };

  // ===== Ring Animation =====
  function updateRings() {
    const energyPct = 0.7;  // 70% of daily target
    const stepsPct = 0.7;   // 4200/6000

    // Energy ring
    const eRing = document.getElementById('energyRing');
    if (eRing) {
      const circumference = 264; // 2π*42
      eRing.style.strokeDashoffset = circumference * (1 - energyPct);
    }

    // Steps ring
    const sRing = document.getElementById('stepsRing');
    if (sRing) {
      const circumference = 264;
      sRing.style.strokeDashoffset = circumference * (1 - stepsPct);
    }
  }

  // ===== Sleep Page =====
  function bindSleepPage() {
    const ring = document.getElementById('sleepRing');
    const cat = document.getElementById('sleepCat');
    const status = document.getElementById('sleepStatus');
    if (!ring) return;

    // Long press to start sleep
    ring.addEventListener('pointerdown', function(e) {
      e.preventDefault();
      sleepLongPressTimer = setTimeout(() => {
        sleepMode = true;
        ring.classList.add('pressed');
        cat.classList.add('breathing');
        if (status) status.textContent = '小光睡着了…zzZ';
        navigator.vibrate && navigator.vibrate([50, 100, 50]);
      }, 2000);
    });

    ring.addEventListener('pointerup', function() {
      clearTimeout(sleepLongPressTimer);
    });

    ring.addEventListener('pointerleave', function() {
      clearTimeout(sleepLongPressTimer);
    });

    // Swipe up to wake
    ring.addEventListener('pointerup', function() {
      if (sleepMode) {
        sleepMode = false;
        ring.classList.remove('pressed');
        cat.classList.remove('breathing');
        if (status) status.textContent = '早安，小予在伸懒腰…';
        setTimeout(() => {
          if (status) status.textContent = '昨晚睡了 7h 32min · 质量 ✨';
          setTimeout(() => switchPage('home'), 1500);
        }, 1000);
      }
    });
  }

  // ===== Record Treehole Page =====
  function bindRecordPage() {
    const ring = document.getElementById('recordRing');
    const ripple = document.getElementById('recordRipple');
    const cat = document.getElementById('recordCat');
    if (!ring) return;

    ring.addEventListener('pointerdown', function(e) {
      e.preventDefault();
      recording = true;
      ring.classList.add('recording');
      ripple.classList.add('active');
      cat.classList.add('breathing');
      recordSeconds = 0;
      recordTimer = setInterval(() => {
        recordSeconds++;
        // tail sway simulation via cat scale
        if (cat && recordSeconds % 2 === 0) {
          cat.style.transform = cat.style.transform.includes('scale(1.8)') ? 'scale(1.82) rotate(1deg)' : 'scale(1.8)';
        }
      }, 1000);
      navigator.vibrate && navigator.vibrate(30);
    });

    ring.addEventListener('pointerup', function() {
      if (recording) {
        recording = false;
        clearInterval(recordTimer);
        ring.classList.remove('recording');
        ripple.classList.remove('active');
        cat.classList.remove('breathing');
        if (recordSeconds >= 3) {
          alert('🌿 小光已替你封存好啦。\n' + Math.floor(recordSeconds) + ' 秒的声音，收进玻璃罐里了。');
        }
      }
    });

    ring.addEventListener('pointerleave', function() {
      if (recording) {
        recording = false;
        clearInterval(recordTimer);
        ring.classList.remove('recording');
        ripple.classList.remove('active');
        cat.classList.remove('breathing');
      }
    });
  }

  // ===== Food Camera =====
  window.simulateFoodPhoto = function() {
    const result = document.getElementById('foodResult');
    if (result) {
      result.classList.add('show');
      result.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('foodRecognized').textContent = '这个菜菜有点神秘，你能告诉它叫什么吗？';
      navigator.vibrate && navigator.vibrate(20);
    }
  };

  window.saveFood = function() {
    const name = document.getElementById('foodNameInput').value || '一道温暖的菜';
    document.getElementById('foodRecognized').textContent = '「' + name + '」记下啦，约 380 kcal';
    document.getElementById('foodNameInput').style.display = 'none';
    document.querySelector('#foodResult button').style.display = 'none';
    navigator.vibrate && navigator.vibrate([15, 50, 15]);
    // Update energy ring
    const eRing = document.getElementById('energyRing');
    if (eRing) {
      eRing.style.strokeDashoffset = 53; // ~80% full
    }
    setTimeout(() => switchPage('home'), 1500);
  };

  // ===== Mood Picker =====
  window.pickMood = function(mood) {
    moodToday = mood;
    document.querySelectorAll('.mood-option').forEach(o => o.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    navigator.vibrate && navigator.vibrate(25);
    setTimeout(() => {
      if (mood === '低落') {
        alert('小光安静地走到屏幕中央，轻轻卧下。\n\n今天不用勉强，想说什么就去树洞吧。');
        switchPage('record');
      } else {
        const tips = {
          '元气': '小予竖着耳朵蹦了蹦！今天做点喜欢的事吧 🌟',
          '一般': '小予歪着头看了看你。平平淡淡也是很棒的一天 🍃'
        };
        document.getElementById('dailyTipText').textContent = '小予说，' + tips[mood].split(' ').slice(1).join(' ');
        switchPage('home');
      }
    }, 600);
  };

  // ===== Flash Note =====
  window.openNote = function() {
    resetNoteEditor();
    switchPage('note');
  };

  function bindNoteCats() {
    document.querySelectorAll('#noteCats .note-cat').forEach(cat => {
      cat.addEventListener('click', function() {
        document.querySelectorAll('#noteCats .note-cat').forEach(c => c.classList.remove('picked'));
        this.classList.add('picked');
      });
    });
  }

  function resetNoteEditor() {
    document.getElementById('noteEditor').style.display = 'flex';
    document.getElementById('noteSaved').style.display = 'none';
    document.getElementById('noteText').value = '';
    document.getElementById('starBtn').textContent = '☆';
    document.getElementById('starBtn').classList.remove('lit');
  }

  window.lightStar = function() {
    const text = document.getElementById('noteText').value.trim();
    if (!text) {
      document.getElementById('noteText').placeholder = '写点什么吧，哪怕只是一句话…';
      document.getElementById('noteText').focus();
      return;
    }

    const star = document.getElementById('starBtn');
    star.textContent = '⭐';
    star.classList.add('lit');
    navigator.vibrate && navigator.vibrate([20, 50, 20, 30]);

    // Particle burst
    createSparkles(star);

    setTimeout(() => {
      document.getElementById('noteEditor').style.display = 'none';
      document.getElementById('noteSaved').style.display = 'block';

      noteStreak++;
      if (noteStreak >= 7) {
        setTimeout(() => {
          const card = document.getElementById('noteSaved');
          card.innerHTML = '<span style="font-size:48px;">🏆</span>' +
            '<p style="margin-top:8px;color:var(--twilight);">连续七天！小予给你画了奖状</p>' +
            '<p style="font-size:12px;color:var(--twilight-light);">（它画的太阳像个煎蛋，但它很认真）🐶</p>' +
            '<p style="font-size:11px;color:var(--warm-gold);margin-top:4px;">七日闪光者 ✨</p>';
        }, 500);
        noteStreak = 0;
      }

      // Add to home preview
      addNoteToPreview(text);
    }, 800);
  };

  function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'sparkle-particle';
      const angle = (Math.PI * 2 * i) / 12;
      const dist = 30 + Math.random() * 40;
      particle.style.left = (cx + Math.cos(angle) * dist) + 'px';
      particle.style.top = (cy + Math.sin(angle) * dist) + 'px';
      particle.style.position = 'fixed';
      particle.style.animationDelay = (i * 0.04) + 's';
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }
  }

  function addNoteToPreview(text) {
    const container = document.getElementById('notesPreview');
    if (!container) return;
    const colors = ['green', 'pink', 'gold'];
    const now = new Date();
    const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    const card = document.createElement('div');
    card.className = 'note-card';
    card.style.animation = 'slideUp 0.5s ease-out';
    card.innerHTML = '<div class="note-line ' + colors[Math.floor(Math.random() * 3)] + '"></div>' +
      '<span class="note-text">' + text.substring(0, 30) + '</span>' +
      '<span class="note-time">' + time + '</span>';
    container.insertBefore(card, container.firstChild);
  }

  // ===== Period Mode =====
  function bindFlowerIcon() {
    const icon = document.getElementById('flowerIcon');
    if (!icon) return;
    icon.addEventListener('click', function() {
      isPeriod = !isPeriod;
      if (isPeriod) {
        icon.classList.add('period');
        icon.textContent = '🌺';
        document.getElementById('dailyTipText').textContent = '小光说，今天经期第2天。它已经给你叼来了小暖水袋，小予今天也会乖乖的。喝点热的好不好？';
        document.querySelector('.speaker').textContent = '— 小光，尾巴轻轻搭在暖水袋上';
        const homePage = document.getElementById('page-home');
        if (homePage && currentPage === 'home') homePage.classList.add('period-active');
        // Lower step goal
        const sRing = document.getElementById('stepsRing');
        if (sRing) sRing.style.strokeDashoffset = 53; // ~80% implies lower goal
        document.querySelector('#stepsCard .ring-sub').textContent = '今日不用勉强';
      } else {
        icon.classList.remove('period');
        icon.textContent = '🌸';
        document.getElementById('dailyTipText').textContent = '小光说，今天很适合慢慢散步';
        document.querySelector('.speaker').textContent = '— 小光，尾巴轻轻摇了摇';
        const homePage = document.getElementById('page-home');
        if (homePage) homePage.classList.remove('period-active');
        document.querySelector('#stepsCard .ring-sub').textContent = '4,200 / 6,000';
      }
    });
  }

  // ===== Launch =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
