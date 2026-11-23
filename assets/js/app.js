/* ==========================================================================
   安徽数字非遗博物馆 · 交互
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  const M = window.MUSEUM;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const cat = (id) => M.categories.find((c) => c.id === id) || M.categories[0];
  const byId = (id) => M.projects.find((p) => p.id === id);

  function levelOf(p) {
    if (p.human) return { text: '人类非遗', cls: 'human' };
    if (p.level === 'provincial') return { text: '省级', cls: 'prov' };
    return { text: '国家级', cls: 'nation' };
  }

  const NAV = [
    { href: 'index.html', label: '首页', key: 'home' },
    { href: 'heritage.html', label: '非遗名录', key: 'heritage' },
    { href: 'map.html', label: '文化地理', key: 'map' },
    { href: 'gallery.html', label: '数字展厅', key: 'gallery' },
    { href: 'about.html', label: '关于', key: 'about' },
  ];

  /* ------------------------------------------------------------ 页头 / 页脚 */
  function renderHeader(active) {
    const host = $('#site-header');
    if (!host) return;
    host.innerHTML = `
      <div class="wrap">
        <a class="brand" href="index.html" aria-label="安徽数字非遗博物馆 · 回到首页">
          <span class="seal">皖</span>
          <span class="brand-text">
            <span class="brand-cn">安徽数字非遗博物馆</span>
            <span class="brand-en">Anhui Digital Museum of ICH</span>
          </span>
        </a>
        <nav class="nav" id="nav" aria-label="主导航">
          ${NAV.map(
            (n) =>
              `<a href="${n.href}"${n.key === active ? ' aria-current="page"' : ''}>${n.label}</a>`
          ).join('')}
        </nav>
        <button class="nav-toggle" id="nav-toggle" aria-label="展开导航" aria-expanded="false">
          <span></span>
        </button>
      </div>`;
    const btn = $('#nav-toggle');
    const nav = $('#nav');
    if (btn) {
      btn.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
      });
    }
  }

  function renderFooter() {
    const host = $('#site-footer');
    if (!host) return;
    host.innerHTML = `
      <div class="wrap">
        <div class="footer-top">
          <div class="footer-brand">
            <h4>安徽数字非遗</h4>
            <p>一座以数字方式保存、解释与重新观看安徽非物质文化遗产的线上博物馆。数据以官方公布口径为准，图像为示意性再创作。</p>
          </div>
          <div class="footer-col">
            <h5>浏览</h5>
            ${NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join('')}
          </div>
          <div class="footer-col">
            <h5>来源</h5>
            <a href="https://ct.ah.gov.cn/" target="_blank" rel="noopener">安徽省文化和旅游厅</a>
            <a href="https://www.ihchina.cn/" target="_blank" rel="noopener">中国非物质文化遗产网</a>
            <a href="about.html">数据与版权说明</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} 安徽数字非遗博物馆 · 概念设计</span>
          <span>数据更新 ${M.meta.updated}　·　名录为节选示例</span>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------ 占位视觉 */
  const MTN = {
    a: 'M0,128 C58,112 92,130 142,120 C192,110 224,132 272,122 C318,113 352,130 400,120 L400,200 L0,200 Z',
    b: 'M0,156 C50,144 92,160 150,150 C208,140 248,162 306,152 C348,146 378,156 400,150 L400,200 L0,200 Z',
  };

  function artifact(p, opts = {}) {
    const c = cat(p.cat);
    const lv = levelOf(p);
    const mark = p.mark || p.name.slice(0, 1);
    const src = `assets/img/${p.id}.jpg`;
    return `
      <figure class="artifact" style="--accent:${c.color}" ${opts.tall ? 'data-tall="1"' : ''}>
        <span class="artifact-mark">${mark}</span>
        <svg class="artifact-mountain" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
          <path d="${MTN.a}" fill="${c.color}" fill-opacity=".09"></path>
          <path d="${MTN.b}" fill="${c.color}" fill-opacity=".14" stroke="${c.color}" stroke-opacity=".32" stroke-width="1" vector-effect="non-scaling-stroke"></path>
        </svg>
        <img class="artifact-img" src="${src}" alt="${p.name} · 意象图"
             onload="this.closest('.artifact').classList.add('has-img')"
             onerror="this.remove()">
        <span class="artifact-tag">${c.name}</span>
        ${p.human || p.level !== 'provincial' ? `<span class="artifact-level">${lv.text}</span>` : ''}
        <span class="artifact-seal">藏</span>
      </figure>`;
  }

  function card(p) {
    return `
      <a class="card card-anim reveal" href="detail.html#${p.id}">
        ${artifact(p)}
        <div class="card-body">
          <h3 class="card-title">${p.name}</h3>
          <p class="card-meta">${p.city}　·　${levelOf(p).text}${p.batch && p.batch !== '省级' ? '　·　' + p.batch : ''}</p>
          <p class="card-desc">${p.summary}</p>
        </div>
      </a>`;
  }

  /* ------------------------------------------------------------ 动效 */
  function initReveal(root = document) {
    const items = $$('.reveal', root);
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    items.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
      io.observe(el);
    });
    // 兜底：无论观察器是否触发，2 秒后全部显示，避免内容被藏住
    setTimeout(() => items.forEach((el) => el.classList.add('is-in')), 2000);
  }

  function initCounters() {
    const nodes = $$('[data-count]');
    if (!nodes.length) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // 尊重系统设置：直接保留预渲染的最终数值
    const run = (el) => {
      const target = Number(el.dataset.count);
      const dur = 1400;
      let finished = false;
      const finish = () => {
        if (!finished) { finished = true; el.textContent = target; }
      };
      if (!window.requestAnimationFrame) return finish();
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
        else finish();
      };
      requestAnimationFrame(step);
      setTimeout(finish, dur + 600); // 后台标签页或 rAF 被限流时的兜底
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    nodes.forEach((n) => io.observe(n));
  }

  /* ------------------------------------------------------------ 首页 */
  function initHome() {
    const host = $('#home-featured');
    if (host) {
      const picks = ['sanzhao', 'huangmei', 'jieshou', 'minju', 'yudeng', 'jiuhua']
        .map(byId)
        .filter(Boolean);
      host.innerHTML = picks.map(card).join('');
    }

    const statHost = $('#home-stats');
    if (statHost) {
      statHost.innerHTML = M.stats
        .map(
          (s) => `
        <div class="stat">
          <b><span data-count="${s.n}">${s.n}</span><em>${s.unit}</em></b>
          <span>${s.label}</span>
          <i>${s.note}</i>
        </div>`
        )
        .join('');
    }

    const catHost = $('#home-cats');
    if (catHost) {
      const count = (id) => M.projects.filter((p) => p.cat === id).length;
      catHost.innerHTML = M.categories
        .map(
          (c) => `
        <a class="cat reveal" href="heritage.html?cat=${c.id}" style="--accent:${c.color}">
          <span class="cat-glyph" style="color:${c.color}">${c.code}</span>
          <b>${c.name}</b>
          <span>${c.en}</span>
        </a>`
        )
        .join('');
    }

    const regionHost = $('#home-regions');
    if (regionHost) {
      regionHost.innerHTML = M.regions
        .map(
          (r) => `
        <article class="region reveal">
          <div class="region-media">
            <img src="assets/img/region-${r.id}.jpg" alt="${r.name} 意象图" onerror="this.remove()">
          </div>
          <div class="region-body">
            <span class="region-no">${r.no}</span>
            <h3>${r.name}</h3>
            <span class="region-sub">${r.en}</span>
            <p>${r.desc}</p>
            <ul>${r.items.map((i) => `<li>${i}</li>`).join('')}</ul>
          </div>
        </article>`
        )
        .join('');
    }

    const galHost = $('#home-gallery');
    if (galHost) {
      const picks = ['huimo', 'yudeng', 'nuoxi'].map(byId).filter(Boolean);
      galHost.innerHTML = picks
        .map(
          (p) => `
        <a class="tile reveal" href="gallery.html" style="--accent:${cat(p.cat).color}">
          <img class="tile-img" src="assets/img/${p.id}.jpg" alt="${p.name}" onerror="this.remove()">
          <figcaption>${p.name}</figcaption>
        </a>`
        )
        .join('');
    }
  }

  /* ------------------------------------------------------------ 名录 */
  function initHeritage() {
    const list = $('#list');
    if (!list) return;
    const search = $('#q');
    const areaSel = $('#area');
    const batchSel = $('#batch');
    const chipWrap = $('#chips');
    const countEl = $('#count');
    const params = new URLSearchParams(location.search);
    let activeCat = params.get('cat') || 'all';
    if (params.get('q')) search.value = params.get('q');
    if (params.get('area')) areaSel.value = params.get('area');

    chipWrap.innerHTML =
      `<button class="chip" data-cat="all" aria-pressed="${activeCat === 'all'}">全部门类</button>` +
      M.categories
        .map(
          (c) =>
            `<button class="chip" data-cat="${c.id}" aria-pressed="${activeCat === c.id}">${c.name}</button>`
        )
        .join('');

    const batches = Array.from(new Set(M.projects.map((p) => p.batch).filter((b) => b && b !== '省级'))).sort();
    batchSel.innerHTML =
      `<option value="all">全部批次</option>` +
      batches.map((b) => `<option value="${b}">${b} 年</option>`).join('');

    function apply() {
      const kw = (search.value || '').trim().toLowerCase();
      const area = areaSel.value;
      const batch = batchSel.value;
      const out = M.projects.filter((p) => {
        if (activeCat !== 'all' && p.cat !== activeCat) return false;
        if (area !== 'all' && p.area !== area) return false;
        if (batch !== 'all' && p.batch !== batch) return false;
        if (!kw) return true;
        const hay = [p.name, p.city, p.summary, p.tagline, cat(p.cat).name, (p.keywords || []).join('')]
          .join(' ')
          .toLowerCase();
        return hay.includes(kw);
      });
      countEl.textContent = out.length;
      list.innerHTML = out.length
        ? out.map(card).join('')
        : `<p class="empty">没有找到匹配的项目。<br>试试更换门类，或清空搜索。</p>`;
      initReveal(list);
    }

    chipWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      activeCat = btn.dataset.cat;
      $$('.chip', chipWrap).forEach((c) => c.setAttribute('aria-pressed', String(c === btn)));
      apply();
    });
    ['input', 'change'].forEach((ev) => {
      search.addEventListener(ev, apply);
      areaSel.addEventListener(ev, apply);
      batchSel.addEventListener(ev, apply);
    });
    apply();
  }

  /* ------------------------------------------------------------ 详情 */
  function initDetail() {
    const host = $('#detail');
    if (!host) return;
    const id = decodeURIComponent(location.hash.replace('#', ''));
    const p = byId(id) || M.projects[0];
    const c = cat(p.cat);
    const lv = levelOf(p);

    document.title = `${p.name} · 安徽数字非遗博物馆`;

    const pool = M.projects.filter((x) => x.id !== p.id);
    const related = [
      ...pool.filter((x) => x.cat === p.cat),
      ...pool.filter((x) => x.cat !== p.cat && x.area === p.area),
      ...pool,
    ]
      .filter((x, i, arr) => arr.findIndex((y) => y.id === x.id) === i)
      .slice(0, 3);

    host.innerHTML = `
      <div class="wrap">
        <div class="detail-crumb">
          <a href="index.html">首页</a><span>/</span>
          <a href="heritage.html">名录</a><span>/</span>
          <a href="heritage.html?cat=${p.cat}">${c.name}</a>
        </div>
      </div>

      <div class="wrap detail-hero">
        <div class="detail-visual">
          <figure class="artifact" style="--accent:${c.color}">
            <span class="artifact-mark">${p.mark || p.name.slice(0, 1)}</span>
            <img class="artifact-img" src="assets/img/${p.id}.jpg" alt="${p.name} · 意象图"
                 onload="this.closest('.artifact').classList.add('has-img')" onerror="this.remove()">
            <span class="artifact-tag">${c.name}</span>
            <span class="artifact-level">${lv.text}</span>
            <span class="artifact-seal">藏</span>
          </figure>
        </div>

        <div>
          <span class="detail-cat">${c.name} / ${c.en}</span>
          <h1 class="detail-title">${p.name}</h1>
          <p class="detail-sub">${p.tagline}　·　${p.city}　·　${p.en}</p>

          <table class="meta-table">
            <tr><th>门类</th><td>${c.name}（${c.code}）</td></tr>
            <tr><th>流布</th><td>${p.city}　·　${p.area}</td></tr>
            <tr><th>级别</th><td>${lv.text}${p.human ? `（${p.human} 年列入）` : ''}</td></tr>
            <tr><th>批次</th><td>${p.batch === '省级' ? '安徽省级代表性项目' : `国家级 · ${p.batch} 年公布`}</td></tr>
            <tr><th>馆藏号</th><td>AH-${p.batch === '省级' ? 'P' : p.batch}-${c.code}-${String(
      M.projects.indexOf(p) + 1
    ).padStart(2, '0')}</td></tr>
          </table>

          <div class="prose">
            ${p.paras.map((t) => `<p>${t}</p>`).join('')}
          </div>

          <div class="tags">
            ${(p.keywords || []).map((k) => `<span>${k}</span>`).join('')}
          </div>
        </div>
      </div>

      ${
        p.steps && p.steps.length
          ? `<div class="wrap detail-block">
               <h3>工艺程式 <em>PROCESS</em></h3>
               <div class="steps">
                 ${p.steps.map((s) => `<div class="step"><div><b>${s.t}</b><p>${s.d}</p></div></div>`).join('')}
               </div>
             </div>`
          : ''
      }

      <div class="wrap detail-block">
        <h3>相关典藏 <em>RELATED</em></h3>
        <div class="related">${related.map(card).join('')}</div>
      </div>`;


    initReveal(host);
  }

  /* ------------------------------------------------------------ 文化地理 */
  function initMap() {
    const host = $('#regions');
    if (host) {
      host.innerHTML = M.regions
        .map(
          (r) => `
        <article class="region reveal">
          <div class="region-media">
            <img src="assets/img/region-${r.id}.jpg" alt="${r.name} 意象图" onerror="this.remove()">
          </div>
          <div class="region-body">
            <span class="region-no">${r.no}</span>
            <h3>${r.name}</h3>
            <span class="region-sub">${r.en}</span>
            <p>${r.desc}</p>
            <ul>${r.items.map((i) => `<li>${i}</li>`).join('')}</ul>
          </div>
        </article>`
        )
        .join('');
    }
    const cityHost = $('#cities');
    if (cityHost) {
      cityHost.innerHTML = M.cities
        .map(
          (c) => `
        <a class="city" href="heritage.html?q=${encodeURIComponent(c.name)}">
          <b>${c.name}</b>
          <span>${c.area}<br><em>${c.count} 项</em></span>
        </a>`
        )
        .join('');
    }
  }

  /* ------------------------------------------------------------ 展厅 */
  function initGallery() {
    const host = $('#gallery-tiles');
    if (!host) return;
    const picks = ['xuanzhi', 'huimo', 'sheyan', 'zhucha', 'huangmei', 'sanzhao'];
    const items = picks.map(byId).filter(Boolean);
    host.innerHTML = items
      .map((p, i) => {
        const c = cat(p.cat);
        return `
        <a class="tile reveal" href="detail.html#${p.id}" style="--accent:${c.color}">
          <img class="tile-img" src="assets/img/${p.id}.jpg" alt="${p.name}" onerror="this.remove()">
          <figcaption>${p.name} / 影像 0${i + 1}</figcaption>
        </a>`;
      })
      .join('');
  }

  /* ------------------------------------------------------------ 图标 */
  function icon(id) {
    const P = {
      literature: '<path d="M4 5h9a3 3 0 0 1 3 3v11a2.5 2.5 0 0 0-2.5-2H4z"/><path d="M20 5h-3a3 3 0 0 0-3 3v11a2.5 2.5 0 0 1 2.5-2H20z"/>',
      music: '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
      dance: '<circle cx="12" cy="5" r="2"/><path d="M12 8v6l-4 6M12 14l4 6M8 11h8"/>',
      opera: '<path d="M4 9c0-3 3-5 8-5s8 2 8 5v5c0 4-3 6-8 6s-8-2-8-6z"/><path d="M9 11h.01M15 11h.01"/><path d="M9 15c1.5 1 4.5 1 6 0"/>',
      quyi: '<path d="M5 10a7 7 0 0 1 14 0v4a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M15 14v-3"/>',
      sport: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>',
      art: '<path d="M4 20l6-16 5 9 2-3 3 10z"/><path d="M4 20h16"/>',
      craft: '<path d="M6 4l4 4-2 2 6 6 2-2 4 4-4 4-4-4"/><path d="M4 8h4M8 4v4"/>',
      medicine: '<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="6"/>',
      folklore: '<path d="M4 20V9l8-5 8 5v11z"/><path d="M9 20v-6h6v6"/>',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${P[id] || P.craft}</svg>`;
  }

  /* ------------------------------------------------------------ 启动 */

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page || 'home';
    renderHeader(page);
    renderFooter();
    ({ home: initHome, heritage: initHeritage, detail: initDetail, map: initMap, gallery: initGallery, about: () => {} }[
      page
    ] || (() => {}))();
    initReveal();
    initCounters();
  });
})();
