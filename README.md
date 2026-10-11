# 君夏终 · 个人小站

一个手写的纯静态个人网站，支持 **简体中文 / English / 日本語** 三语切换，带亮/暗主题。

- 线上地址：<https://bh6caz.us.ci>
- 博客：<https://jxz.us.ci>
- 邮箱：123@jxz.us.ci

没有构建步骤，不需要 `npm install`，克隆下来就能跑。

---

## 页面

| 文件 | 访问路径 | 内容 |
| --- | --- | --- |
| `index.html` | `/` | 首页：Hero / 关于我 / 作品集 / 联系方式 |
| `radio.html` | `/radio.html` | 业余无线电（呼号 BH6CAZ、QSL 卡片申请等） |
| `about.html` | `/about.html` | 关于我（含三语长文自我介绍） |

---

## 本地预览

> ⚠️ **必须通过 http 访问，不能直接双击打开 HTML。**
> 语言切换依赖 `fetch()` 读取 `assets/i18n/*.json`，而浏览器禁止 `file://` 发起 fetch —— 直接双击页面会停在 HTML 里写死的默认文案上。

仓库自带一个极简静态服务器（`_serve.js`，仅依赖 Node 内置模块，仅供本地预览）：

```bash
node _serve.js
# 打开 http://127.0.0.1:8080/index.html
```

端口被占用时换一个：

```bash
# Windows (PowerShell)
$env:PORT=8081; node _serve.js
# macOS / Linux
PORT=8081 node _serve.js
```

---

## 目录结构

```
.
├── index.html                  首页
├── radio.html                  业余无线电页
├── about.html                  关于页
├── _serve.js                   本地预览服务器（开发用，不影响部署）
├── .gitattributes
├── README.md
└── assets/
    ├── css/
    │   └── styles__v_20261011b.css   全站样式：变量 / 响应式 / 暗色主题全在这一个文件
    ├── js/
    │   ├── app__v_20261010.js        公共脚本：导航、主题切换、i18n、打字机、滚动显现、滚动进度条
    │   ├── about__v_20261011.js      关于页渲染：读取 about_*.json 生成正文
    │   ├── radio.js                  电台页交互
    │   └── umami.js                  访问统计
    ├── i18n/
    │   ├── i18n_cn.json / i18n_en.json / i18n_jp.json        全站 UI 文案
    │   ├── about_cn.json / about_en.json / about_jp.json     关于页正文
    │   └── radio_cn.json / radio_en.json / radio_jp.json     电台页正文
    ├── fonts/
    │   ├── fonts.css                 字体与图标字体声明（已合并为 1 个文件）
    │   ├── poppins/                  拉丁文字
    │   ├── noto-sans-sc/             简体中文（按 unicode-range 切片，按需加载）
    │   ├── zen-maru-gothic/          日文
    │   └── unicons/                  图标字体
    ├── img/
    │   ├── avatar.jpg                首页头像
    │   ├── about-hero.webp           关于区配图
    │   ├── crac.webp                 电台页配图
    │   ├── mygo.svg                  页脚字标
    │   ├── favicon.ico
    │   ├── iwc-logo-lockup-color.svg IndieWeb Webring 徽标
    │   └── portfolio/                作品集配图（portfolio-1 ~ 4.jpg）
    └── vendor/
        └── swiper-bundle.min.css / swiper-bundle.min.js      轮播库（作品集区块）
```

---

## 技术栈

- **纯静态 HTML + CSS + 原生 JavaScript**，无框架、无打包器、无构建步骤
- **Swiper** —— 作品集轮播
- **Unicons** —— 图标字体
- **自托管 Google Fonts** —— Poppins（拉丁）/ Noto Sans SC（简中）/ Zen Maru Gothic（日文）
- **Umami** —— 访问统计（自托管，无 Cookie）
- **响应式** —— 移动端底部导航，桌面端顶部导航
- **亮 / 暗主题** —— 切换结果存在 `localStorage.theme`

---

## 多语言机制

1. 首屏在 `<head>` 里的内联脚本先读 `localStorage.lang`，并预取 `assets/i18n/i18n_<lang>.json`，避免文案闪烁；
2. 页面上所有需要翻译的元素用 `i18n="键名"` 标记，例如 `<h1 i18n="home__title">`；
3. `app__v_20261010.js` 里的 `applyI18n()` 把 JSON 里对应键的值写入元素的 `innerHTML`（因此文案里可以用 `<br/>`）；
4. 关于页与电台页另有自己的 JSON 与渲染脚本，结构与上同；
5. 切换语言时会派发 `i18n:ready` 事件，依赖文案的脚本（如打字机效果）监听它重新执行。

**语言只有三种，JSON 结构必须保持一致**：改文案时请同步修改 `_cn` / `_en` / `_jp` 三个文件，避免出现某一语言缺键。

### 加一条新文案

1. 在 HTML 里给元素加 `i18n="your_key"`；
2. 在 `i18n_cn.json`、`i18n_en.json`、`i18n_jp.json` 里各加一条同名的 `your_key`。

---

## 资源版本命名约定

CSS / JS 文件名带 `__v_YYYYMMDD` 后缀（如 `styles__v_20261011b.css`），用来做缓存失效。同一天内多次修订就加 `b`、`c` 后缀。

**修改这类文件后，务必同时：**

1. 把文件另存为新版本名（如 `styles__v_20261012.css`）；
2. 更新所有 HTML 里对该文件的引用。

否则浏览器会继续使用缓存里的旧版本。静态资源本身（图片、字体、JSON）不带版本号。

---

## 部署

纯静态站点，把整个仓库（除 `_serve.js` 外）上传到任意静态托管的根目录即可 —— GitHub Pages、Cloudflare Pages、Vercel、对象存储或自己的服务器都行。不需要任何构建命令。

---

## 声明与致谢

- 本站早期基于 [ASouthernCat/responsive-portfolio-website](https://github.com/ASouthernCat/responsive-portfolio-website) 与 [Bedimcode](https://www.youtube.com/c/Bedimcode) 的模板二次开发，此后做了大量重写。
- 许可协议：**AGPL-3.0**，全文见根目录 [`LICENSE`](LICENSE)。
- 字体版权归各字体作者所有，均以自托管方式引入。
- 站内文字与照片为个人原创内容，请勿直接转载。

---

## 联系方式

- 邮箱：123@jxz.us.ci
- GitHub：<https://github.com/abcdws11>
- 哔哩哔哩：<https://space.bilibili.com/3546557502720659>
