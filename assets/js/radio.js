/* ============================================================
 * Radio 业余无线电台页渲染脚本
 * - 按当前语言加载 assets/i18n/radio_{lang}.json
 * - 渲染：呼号大卡 / 简介 / 基本信息 / QSL 申请框 / QRZ 链接
 * - 监听 cn-en-translate.js 在切换语言后触发的 i18n:ready 事件重新渲染
 * ============================================================ */
(function () {
  'use strict';

  var renderedLang = null;
  var pendingLang = null;

  function currentLang() {
    var l = (document.documentElement.lang || window.__I18N_LANG__ || 'en').toLowerCase();
    if (l === 'zh-cn' || l === 'zh') return 'cn';
    if (l === 'ja' || l === 'jp') return 'jp';
    return 'en';
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function setText(el, text) {
    if (el) el.textContent = text || '';
  }

  function render(data) {
    var meta = data.meta || {};

    setText(document.getElementById('radio-kicker'), meta.kicker);
    setText(document.getElementById('radio-subtitle'), meta.subtitle);
    setText(document.getElementById('radio-intro'), data.intro);

    /* 基本信息 */
    var factsEl = document.getElementById('radio-facts');
    var factsHtml = '';
    (data.facts || []).forEach(function (f) {
      factsHtml += '<li>' +
        '<span class="radio-page__fact-icon"><i class="uil ' + escHtml(f.icon || 'uil-user') + '"></i></span>' +
        '<span class="radio-page__fact-label">' + escHtml(f.label) + '</span>' +
        '<span class="radio-page__fact-value">' + escHtml(f.value) + '</span>' +
        '</li>';
    });
    if (factsEl) factsEl.innerHTML = factsHtml;

    /* QSL 申请 */
    var qsl = data.qsl || {};
    setText(document.getElementById('radio-qsl-title'), qsl.title);
    setText(document.getElementById('radio-qsl-note'), qsl.note);

    var cardsEl = document.getElementById('radio-qsl-cards');
    var cardsHtml = '';
    (qsl.cards || []).forEach(function (c) {
      cardsHtml += '<div class="radio-page__qsl-card">' +
        '<div class="radio-page__qsl-card-head">' +
          '<i class="uil uil-envelope radio-page__qsl-card-icon"></i>' +
          '<span>' + escHtml(c.label) + '</span>' +
        '</div>' +
        (c.tip ? '<p class="radio-page__qsl-card-tip">' + escHtml(c.tip) + '</p>' : '') +
        '<a class="radio-page__qsl-card-btn" href="' + escHtml(c.url) + '" target="_blank" rel="noopener">' +
          escHtml(c.btnText || 'Open') +
          '<i class="uil uil-arrow-up-right"></i>' +
        '</a>' +
        '</div>';
    });
    if (cardsEl) cardsEl.innerHTML = cardsHtml;

    /* QRZ */
    var qrz = data.qrz || {};
    var qrzEl = document.getElementById('radio-qrz');
    if (qrzEl) {
      qrzEl.innerHTML = '<i class="uil uil-globe"></i>' + escHtml(qrz.text || '');
      if (qrz.url) qrzEl.setAttribute('href', qrz.url);
    }
  }

  function loadAndRender(lang) {
    if (lang === renderedLang) return;
    if (lang === pendingLang) return;
    pendingLang = lang;
    fetch('assets/i18n/radio_' + lang + '.json')
      .then(function (r) {
        if (!r.ok) throw new Error('radio_' + lang + '.json not found');
        return r.json();
      })
      .then(function (data) {
        pendingLang = null;
        renderedLang = lang;
        render(data);
      })
      .catch(function (err) {
        pendingLang = null;
        if (window.console) console.warn('Radio content load failed:', err);
      });
  }

  function init() {
    document.addEventListener('i18n:ready', function () {
      loadAndRender(currentLang());
    });
    loadAndRender(currentLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
