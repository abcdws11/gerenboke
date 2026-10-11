/* ============================================================
 * About 个人介绍页渲染脚本
 * - 按当前语言加载 assets/i18n/about_{lang}.json
 * - 渲染：标题 / 隐藏彩蛋 / 正文区块（段落 / 分组 / 联系方式 / 友链）/ 结尾
 * - 支持 [text](url) markdown 链接、邮箱、裸 URL 自动转可点击链接
 * - 监听 cn-en-translate.js 在切换语言后触发的 i18n:ready 事件重新渲染
 * ============================================================ */
(function () {
  'use strict';

  var renderedLang = null;
  var pendingLang = null;

  /* 从 <html lang> 反推语言代码（切换语言时 documentElement.lang 最先更新） */
  function currentLang() {
    var l = (document.documentElement.lang || window.__I18N_LANG__ || 'en').toLowerCase();
    if (l === 'zh-cn' || l === 'zh') return 'cn';
    if (l === 'ja' || l === 'jp') return 'jp';
    return 'en';
  }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* 富文本：先把 [text](url) 提取为占位符，再转义 + 邮箱/裸 URL 链接化，最后还原 */
  function rich(text) {
    var links = [];
    var s = String(text);
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, function (m, t, u) {
      links.push('<a href="' + u + '" target="_blank" rel="noopener" class="about-page__link">' + t + '</a>');
      return '\u0000' + (links.length - 1) + '\u0000';
    });
    var html = escHtml(s);
    html = html.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1" class="about-page__link">$1</a>'
    );
    html = html.replace(
      /(https?:\/\/[^\s<>"'，。；、）】」』》\u4e00-\u9fff]+)/g,
      '<a href="$1" target="_blank" rel="noopener" class="about-page__link">$1</a>'
    );
    html = html.replace(/\u0000(\d+)\u0000/g, function (m, i) { return links[+i]; });
    /* 支持 *斜体*（英文中用于法律名称、作品/出版物名称等） */
    html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    return html;
  }

  /* 联系方式标签的分隔符：
     - 标签自带全角冒号「：」-> 不再补（中日文习惯）
     - 标签自带半角冒号「:」-> 补一个空格（英文习惯）
     - 标签没有冒号 -> 补全角冒号「：」 */
  function labelSep(raw) {
    var label = String(raw || '');
    if (/：\s*$/.test(label)) return '';
    if (/:\s*$/.test(label)) return ' ';
    return '：';
  }

  function setText(el, text) {
    if (el) el.textContent = text || '';
  }

  function paragraphsHtml(paragraphs) {
    var html = '';
    (paragraphs || []).forEach(function (p) {
      html += '<p class="about-page__p">' + rich(p) + '</p>';
    });
    return html;
  }

  function render(data) {
    var meta = data.meta || {};

    setText(document.getElementById('about-kicker'), meta.kicker);
    setText(document.getElementById('about-subtitle'), meta.subtitle);

    var hiddenEl = document.getElementById('about-hidden');
    if (hiddenEl) {
      if (meta.hidden) {
        hiddenEl.textContent = meta.hidden;
        hiddenEl.hidden = false;
      } else {
        hiddenEl.hidden = true;
      }
    }

    var noteEl = document.getElementById('about-note');
    if (noteEl) {
      if (meta.note) {
        noteEl.innerHTML = rich(meta.note);
        noteEl.hidden = false;
      } else {
        noteEl.hidden = true;
      }
    }

    var bodyEl = document.getElementById('about-body');
    var bodyHtml = '';
    (data.sections || []).forEach(function (sec) {
      bodyHtml += '<article class="about-page__section">';
      if (sec.title) {
        bodyHtml += '<h3 class="about-page__section-title">' + escHtml(sec.title) + '</h3>';
      }
      if (sec.type === 'groups') {
        (sec.groups || []).forEach(function (g) {
          bodyHtml += '<div class="about-page__group">';
          if (g.subtitle) {
            bodyHtml += '<h4 class="about-page__group-title">' + escHtml(g.subtitle) + '</h4>';
          }
          bodyHtml += paragraphsHtml(g.paragraphs);
          bodyHtml += '</div>';
        });
      } else if (sec.type === 'contact') {
        bodyHtml += '<div class="about-page__contact">';
        if (sec.email) {
          bodyHtml += '<div class="about-page__contact-item">' +
            '<i class="uil uil-envelope about-page__contact-icon"></i>' +
            '<span>' + rich(sec.emailLabel || '') + labelSep(sec.emailLabel) +
            '<a href="mailto:' + escHtml(sec.email) +
            '" class="about-page__link">' + escHtml(sec.email) + '</a></span></div>';
        }
        if (sec.wechatName) {
          bodyHtml += '<div class="about-page__contact-item">' +
            '<i class="uil uil-message about-page__contact-icon"></i>' +
            '<span>' + rich(sec.wechatLabel || '') + labelSep(sec.wechatLabel) + escHtml(sec.wechatName);
          if (sec.wechatId) {
            bodyHtml += '（' + escHtml(sec.wechatIdLabel || '') + escHtml(sec.wechatId) + '）';
          }
          bodyHtml += '</span></div>';
        }
        /* QQ：与微信同一种结构与样式，仅图标与文案不同 */
        if (sec.qqName || sec.qqId) {
          bodyHtml += '<div class="about-page__contact-item">' +
            '<i class="uil uil-comment-add about-page__contact-icon"></i>' +
            '<span>' + rich(sec.qqLabel || '') + labelSep(sec.qqLabel) + escHtml(sec.qqName || '');
          if (sec.qqId) {
            bodyHtml += '（' + escHtml(sec.qqIdLabel || '') + escHtml(sec.qqId) + '）';
          }
          bodyHtml += '</span></div>';
        }
        bodyHtml += '</div>';
      } else if (sec.type === 'links') {
        bodyHtml += '<ul class="about-page__links">';
        (sec.links || []).forEach(function (lk) {
          bodyHtml += '<li><a class="about-page__link-name" href="' + escHtml(lk.url) +
            '" target="_blank" rel="noopener">' + escHtml(lk.name) + '</a>';
          if (lk.desc) {
            bodyHtml += '<p class="about-page__link-desc">' + escHtml(lk.desc) + '</p>';
          }
          bodyHtml += '</li>';
        });
        bodyHtml += '</ul>';
      } else {
        bodyHtml += paragraphsHtml(sec.paragraphs);
      }
      bodyHtml += '</article>';
    });
    if (bodyEl) bodyEl.innerHTML = bodyHtml;

    setText(document.getElementById('about-closing'), data.closing);
  }

  function loadAndRender(lang) {
    if (lang === renderedLang) return;
    if (lang === pendingLang) return;
    pendingLang = lang;
    fetch('assets/i18n/about_' + lang + '.json')
      .then(function (r) {
        if (!r.ok) throw new Error('about_' + lang + '.json not found');
        return r.json();
      })
      .then(function (data) {
        pendingLang = null;
        renderedLang = lang;
        render(data);
      })
      .catch(function (err) {
        pendingLang = null;
        if (window.console) console.warn('About content load failed:', err);
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
