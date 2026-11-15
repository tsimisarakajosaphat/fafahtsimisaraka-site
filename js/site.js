/* Site Fafah Tsimisaraka — tout le contenu vient de data/content.json (modifiable dans /admin) */
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // *mot* = italique orange · [mot] = surligné
  const fmt = s => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\[([^\]]+)\]/g, '<span class="hl">$1</span>');
  const safeUrl = u => /^(https?:\/\/|mailto:|tel:|#|img\/|\.\/)/i.test(String(u || '').trim()) ? String(u).trim() : '#';
  const ytId = u => { const m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null; };
  // L'aperçu Claude bloque les lecteurs YouTube : on y affiche la miniature + un lien
  const ytEmbed = id => window.__PREVIEW
    ? `<a href="https://youtu.be/${id}" target="_blank" rel="noopener" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#000 url(https://i.ytimg.com/vi/${id}/hqdefault.jpg) center/cover;color:#fff;text-align:center;font-size:15px"><span style="background:rgba(0,0,0,.7);padding:14px 22px;border-radius:999px">Lecture disponible sur le site en ligne · Ouvrir sur YouTube ↗</span></a>`
    : ytEmbed2(id);
  const ytEmbed2 = id => `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="Vidéo YouTube"></iframe>`;
  const svg = p => (p = p.replace(/<(path|rect|circle)/g, '<$1 pathLength="1"'), `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`);
  const ICONS = {
    pen: svg('<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>'),
    film: svg('<rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="M7 4v16M17 4v16M2 9h5M2 15h5M17 9h5M17 15h5"/>'),
    motion: svg('<path d="M3 17c3-8 6-11 9-11s3.5 4 6 4 3-2 3-2"/><circle cx="18" cy="10" r="1.6" fill="currentColor"/><path d="M3 21h4M10 21h4M17 21h4" opacity=".6"/>'),
    cube: svg('<path d="M12 2.5 21 7.5v9L12 21.5 3 16.5v-9z"/><path d="M3 7.5l9 5 9-5M12 12.5v9"/>'),
    sparkle: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/><path d="M5 2.5l.6 1.4L7 4.5l-1.4.6L5 6.5l-.6-1.4L3 4.5l1.4-.6z"/>'),
    camera: svg('<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2.5"/>'),
    palette: svg('<path d="M12 22a10 10 0 1 1 10-10c0 2.8-2.2 4-4 4h-2a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 22z"/><circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="12" cy="7" r="1.2" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1.2" fill="currentColor"/>'),
    layout: svg('<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M3 9h18M9 21V9"/>'),
    photo: svg('<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.8"/><path d="m21 15-5-5L5 21"/>'),
    web: svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>'),
  };
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg>';

  const PARTS = ['profil', 'accueil', 'apropos', 'competences', 'outils', 'videos', 'projets', 'parcours', 'contact'];
  async function load() {
    try {
      const v = Date.now();
      const parts = await Promise.all(PARTS.map(p => fetch(`data/content/${p}.json?v=${v}`, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(p); return r.json(); })));
      return Object.assign({}, ...parts);
    } catch (e) {
      const fb = document.getElementById('content-fallback'); // utilisé seulement par l'aperçu
      if (fb) return JSON.parse(fb.textContent);
      throw e;
    }
  }

  load().then(render).catch(e => { console.error(e); document.body.insertAdjacentHTML('afterbegin', '<p style="padding:20px;color:#f88">Contenu introuvable (data/content.json).</p>'); });

  function render(C) {
    const P = C.profil || {}, H = C.hero || {}, A = C.apropos || {}, K = C.contact || {};
    if (C.seo) { document.title = C.seo.titre || document.title; $('mdesc')?.setAttribute('content', C.seo.description || ''); }

    /* carte */
    $('p-photo').src = P.photo || ''; $('p-photo').alt = 'Portrait de ' + (P.nom || '');
    $('p-avatar').src = P.avatar || P.photo || '';
    $('p-be').href = safeUrl(C.lien_behance);
    $('p-avail').classList.toggle('hidden', !P.disponible);
    $('p-availt').textContent = P.texte_disponible || '';
    $('p-intro').textContent = P.intro || '';
    $('p-nom').textContent = P.nom || '';
    $('p-sous').textContent = [P.titre, P.ville].filter(Boolean).join(' · ');

    /* hero */
    const h1 = $('h1');
    h1.innerHTML = fmt(H.titre || '').split(/(<[^>]+>[^<]*<\/[^>]+>|\s+)/).filter(Boolean)
      .map(p => /^\s+$/.test(p) ? ' ' : `<span class="w"><span>${p}</span></span>`).join('');
    h1.querySelectorAll('.w>span').forEach((s, i) => { s.style.transition = `transform 1s cubic-bezier(.2,.75,.2,1) ${.15 + i * .07}s`; requestAnimationFrame(() => requestAnimationFrame(() => s.style.transform = 'none')); });
    $('stats').innerHTML = (H.chiffres || []).map(c => `<div class="stat rv"><b data-count="${+c.valeur || 0}">0</b>${c.suffixe ? `<b><sup>${esc(c.suffixe)}</sup></b>` : ''}<small>${esc(c.label)}</small></div>`).join('');
    $('badge').textContent = H.badge || '';
    $('cl-t').textContent = H.clients_titre || '';
    const cl = (H.clients || []).map(n => `<span>${esc(n)}</span>`).join('');
    $('clients').innerHTML = cl + cl;

    /* à propos */
    $('ap-p').innerHTML = (A.paragraphes || []).map(p => `<p class="rv">${fmt(p)}</p>`).join('');
    $('ap-s').innerHTML = (A.secteurs || []).map(s => `<span>${esc(s)}</span>`).join('');
    if (A.image) $('ap-img').src = A.image; else $('ap-img').parentElement.classList.add('hidden');

    /* compétences */
    $('skills').innerHTML = (C.competences || []).map((k, i) => `<div class="skill"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="sico">${ICONS[k.icone] || ICONS.sparkle}</span><div><h3>${esc(k.titre)}</h3><p>${esc(k.texte)}</p></div></div>`).join('');

    /* outils */
    $('apps').innerHTML = (C.logiciels || []).map(l => { const p = Math.max(0, Math.min(100, +l.pourcentage || 0)); return `<div class="app" data-p="${p}" style="--p:${p}%"><div class="ico">${l.icone ? `<img src="${esc(l.icone)}" alt="${esc(l.nom)}">` : `<div class="ic" style="background:${esc(l.fond)};color:${esc(l.couleur)}">${esc(l.abrev)}</div>`}</div><div class="nm"><b>${esc(l.nom)}</b><small>${esc(l.usage)}</small></div><div class="bar"><div class="fill"><span class="pc">0%</span></div></div></div>`; }).join('');
    bars();
    const iaHtml = (C.ia || []).map(a => `<div class="ial">${a.logo ? `<img src="${esc(a.logo)}" alt="">` : ''}<div><b>${esc(a.nom)}</b><small>${esc(a.usage)}</small></div></div>`).join('');
    $('ais').innerHTML = `<div class="ia-track">${iaHtml}${iaHtml}</div>`;

    /* réalisations */
    const W = C.projets || [];
    $('be-all').href = safeUrl(C.lien_behance);
    $('be-all').classList.toggle('hidden', !C.lien_behance);
    const rows = [...document.querySelectorAll('#reel .row')];
    const half = Math.ceil(W.length / 2), sets = [W.slice(0, half), W.slice(half)];
    if (!sets[1].length) sets[1] = sets[0];
    rows.forEach((row, ri) => {
      const set = sets[ri];
      const reps = Math.max(3, Math.ceil(12 / Math.max(set.length, 1)));
      row.innerHTML = Array.from({ length: reps }, () => set).flat().map(w => `<div class="tile" data-i="${W.indexOf(w)}"><img src="${esc(w.image)}" alt="${esc(w.titre)}" loading="lazy"><div class="cap"><span>${esc(w.titre)}</span><small>${esc(w.categorie)}</small></div></div>`).join('');
      row.dataset.reps = reps;
    });
    carousel(rows);
    $('mosaic').innerHTML = W.concat(W).slice(0, 16).map(w => `<img src="${esc(w.image)}" alt="">`).join('');

    /* vidéos */
    const V = C.videos || {}, sid = ytId(V.showreel);
    const play = () => { const sr = $('showreel'); if (!sid || sr.querySelector('iframe')) return; sr.insertAdjacentHTML('beforeend', ytEmbed(sid)); $('sr-over').classList.add('hidden'); };
    if (sid) {
      $('showreel').classList.add('has-video');
      $('sr-poster').src = V.affiche || `https://i.ytimg.com/vi/${sid}/maxresdefault.jpg`;
      $('sr-poster').classList.remove('hidden'); $('mosaic').classList.add('hidden');
      $('sr-t').textContent = V.titre || 'Lancer la vidéo';
      $('sr-s').textContent = V.sous_titre || '';
      $('showreel').style.cursor = 'pointer';
      $('showreel').addEventListener('click', play);
    }
    const goPlay = () => { $('video').scrollIntoView({ behavior: 'smooth' }); setTimeout(play, 700); };
    $('badge-play').addEventListener('click', goPlay);
    $('badge-play').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goPlay(); } });
    const VL = (V.liste || []).filter(v => ytId(v.youtube));
    $('vgrid').innerHTML = VL.map((v, i) => `<div class="vcard rv" data-v="${i}"><img src="${esc(v.miniature || `https://i.ytimg.com/vi/${ytId(v.youtube)}/hqdefault.jpg`)}" alt="${esc(v.titre)}" loading="lazy"><div class="pl"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4v16l14-8z"/></svg></div><div class="vt">${esc(v.titre)}${v.categorie ? `<small>${esc(v.categorie)}</small>` : ''}</div></div>`).join('');

    /* parcours */
    $('tl').insertAdjacentHTML('beforeend', (C.experiences || []).map(x => `<div class="job rv"><div class="when">${esc(x.periode)}</div><div><h3>${esc(x.entreprise)} <small>${esc([x.lieu, x.type].filter(Boolean).join(' · '))}</small></h3><p>${esc(x.description)}</p></div></div>`).join(''));
    $('edu').innerHTML = (C.formations || []).map(f => `<div class="box rv"><b>${esc(f.titre)}</b><small>${esc(f.ecole)}</small></div>`).join('');

    /* contact */
    const links = [];
    if (K.email) links.push({ nom: 'E-mail', url: 'mailto:' + K.email, affichage: K.email });
    if (K.whatsapp) links.push({ nom: 'WhatsApp', url: 'https://wa.me/' + K.whatsapp.replace(/\D/g, ''), affichage: K.whatsapp });
    (K.reseaux || []).forEach(r => links.push(r));
    $('clinks').innerHTML = links.filter(l => l.nom !== 'E-mail').map(l => `<a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.nom)} ${arrow}</a>`).join('');
    $('c-phrase').textContent = K.phrase || '';
    $('c-sub').textContent = K.sous_phrase || '';
    $('c-mail').textContent = K.email || ''; $('c-mail').href = K.email ? 'mailto:' + K.email : '#';
    const ta = document.querySelector('.fl textarea'); ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; });
    $('ftype').addEventListener('change', e => e.target.classList.toggle('has', !!e.target.value));
    $('ftype').insertAdjacentHTML('beforeend', (K.types_projet || []).map(t => `<option>${esc(t)}</option>`).join(''));
    $('ft1').textContent = '© ' + new Date().getFullYear() + ' ' + (P.nom || '');
    $('ft2').textContent = [P.titre, P.ville].filter(Boolean).join(' · ');

    skillsAnim(); glassLight();
    lightbox(W, VL);
    typewriter(P.mots_animes || []);
    reveal(); scrollFx(); clock(); form(K);
  }

  /* carrousel infini, 2 rangées en sens opposés */
  function carousel(rows) {
    const st = rows.map(() => ({ x: 0, hover: false }));
    rows.forEach((r, i) => { r.onmouseenter = () => st[i].hover = true; r.onmouseleave = () => st[i].hover = false; });
    let lastY = scrollY, boost = 0;
    addEventListener('scroll', () => { boost += Math.abs(scrollY - lastY) * .04; lastY = scrollY; }, { passive: true });
    const unit = r => r.scrollWidth / (+r.dataset.reps || 3);
    requestAnimationFrame(() => rows.forEach((r, i) => st[i].x = -unit(r)));
    (function loop() {
      boost *= .92;
      rows.forEach((r, i) => {
        const s = st[i], u = unit(r);
        if (!u) return;
        s.x += ((s.hover ? .15 : .7) + boost) * +r.dataset.dir;
        if (s.x <= -u * 2) s.x += u; if (s.x >= 0) s.x -= u;
        r.style.transform = `translate3d(${s.x}px,0,0)`;
      });
      requestAnimationFrame(loop);
    })();
  }

  function lightbox(W, VL) {
    const lb = $('lb'); let cur = 0, mode = 'p';
    const close = () => { lb.classList.remove('open'); $('lbm').innerHTML = ''; };
    function show(i) {
      const list = mode === 'p' ? W : VL; if (!list.length) return;
      cur = (i + list.length) % list.length; const w = list[cur];
      if (mode === 'p') {
        $('lbm').innerHTML = `<img src="${esc(w.image)}" alt="${esc(w.titre)}">`;
        $('lbt').textContent = w.titre; $('lbc').textContent = w.categorie || '';
        $('lbl').href = safeUrl(w.lien); $('lbl').textContent = 'Voir le projet ↗'; $('lbl').classList.toggle('hidden', !w.lien);
      } else {
        $('lbm').innerHTML = `<div class="vbox">${ytEmbed(ytId(w.youtube))}</div>`;
        $('lbt').textContent = w.titre; $('lbc').textContent = w.categorie || '';
        $('lbl').href = w.youtube; $('lbl').textContent = 'Voir sur YouTube ↗'; $('lbl').classList.remove('hidden');
      }
      lb.classList.add('open');
    }
    $('reel').addEventListener('click', e => { const t = e.target.closest('.tile'); if (t) { mode = 'p'; show(+t.dataset.i); } });
    $('vgrid').addEventListener('click', e => { const t = e.target.closest('.vcard'); if (t) { mode = 'v'; show(+t.dataset.v); } });
    $('lbx').onclick = close; $('lbp').onclick = () => show(cur - 1); $('lbn').onclick = () => show(cur + 1);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
  }

  /* barres de maîtrise : se remplissent et comptent quand elles apparaissent */
  function bars() {
    const box = $('apps'); if (!box) return;
    const rows = [...box.querySelectorAll('.app[data-p]')];
    const anims = [];
    const reset = () => { anims.forEach(cancelAnimationFrame); rows.forEach(el => { el.classList.remove('in'); el.querySelector('.pc').textContent = '0%'; }); };
    const run = () => rows.forEach((el, i) => setTimeout(() => {
      el.classList.add('in');
      const pc = el.querySelector('.pc'), t = +el.dataset.p, t0 = performance.now();
      (function step(now) { const k = Math.min((now - t0) / 2000, 1); pc.textContent = Math.round(t * (1 - Math.pow(1 - k, 3))) + '%'; if (k < 1) anims[i] = requestAnimationFrame(step); })(t0);
    }, 250 + i * 180));
    let shown = false;
    // démarre quand le panneau des logiciels est bien visible à l'écran ; rejoue si on revient dessus
    new IntersectionObserver(es => es.forEach(e => {
      if (e.intersectionRatio >= .45 && !shown) { shown = true; run(); }
      else if (!e.isIntersecting && shown) { shown = false; reset(); }
    }), { threshold: [0, .45] }).observe(box.closest('.box') || box);
  }

  /* compétences : les cartes entrent une par une quand on arrive dans la section */
  function skillsAnim() {
    const box = $('skills'), cards = [...box.children];
    cards.forEach((c, i) => {
      const d = i * 0.14;
      c.style.transitionDelay = `${d}s, ${d}s, 0s`;
      c.querySelectorAll('h3,p').forEach((t, k) => t.style.transitionDelay = (d + .25 + k * .08) + 's');
      c.querySelector('.n').style.transitionDelay = (d + .3) + 's';
      c.querySelectorAll('.sico svg *').forEach(p => p.style.transitionDelay = (d + .2) + 's');
    });
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { box.classList.add('go'); setTimeout(() => cards.forEach(c => c.style.transitionDelay = '0s'), 2200); io.disconnect(); }
    }), { threshold: .3 });
    io.observe(box);
  }

  /* liquid glass : un reflet suit la souris sur les surfaces en verre */
  function glassLight() {
    if (matchMedia('(hover: none)').matches) return;
    document.addEventListener('pointermove', e => {
      const el = e.target.closest('.dock nav');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  function typewriter(words) {
    const tw = $('tw'); if (!words.length) return;
    let wi = 0, ci = 0, del = false;
    (function type() {
      const w = words[wi]; tw.textContent = w.slice(0, ci);
      if (!del && ci < w.length) { ci++; setTimeout(type, 85); }
      else if (!del) { del = true; setTimeout(type, 1600); }
      else if (ci > 0) { ci--; setTimeout(type, 40); }
      else { del = false; wi = (wi + 1) % words.length; setTimeout(type, 300); }
    })();
  }

  function reveal() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const el = e.target;
      const sib = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
      el.style.transitionDelay = Math.min(sib.indexOf(el), 6) * 0.08 + 's'; el.classList.add('in'); io.unobserve(el);
      el.querySelectorAll('[data-count]').forEach(n => {
        const t = +n.dataset.count, t0 = performance.now();
        (function step(now) { const p = Math.min((now - t0) / 1400, 1); n.textContent = Math.round(t * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
      });
    }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
  }

  function scrollFx() {
    const px = [...document.querySelectorAll('[data-parallax]')];
    const tl = $('tl'), prog = $('prog');
    const links = [...document.querySelectorAll('.dock a')], secs = links.map(a => document.querySelector(a.getAttribute('href')));
    function on() {
      const vh = innerHeight;
      px.forEach(el => { const r = el.parentElement.getBoundingClientRect(); const c = r.top + r.height / 2 - vh / 2; el.style.transform = `translate3d(0,${c * +el.dataset.parallax}px,0) scale(1.08)`; });
      const r = tl.getBoundingClientRect(); prog.style.height = Math.max(0, Math.min(r.height, vh * .6 - r.top)) + 'px';
      let a = 0; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < vh * .4) a = i; }); links.forEach((l, i) => l.classList.toggle('on', i === a));
    }
    addEventListener('scroll', on, { passive: true }); on();
  }

  function clock() {
    const tick = () => { const d = new Date(), o = { timeZone: 'Indian/Antananarivo' }; $('clock').innerHTML = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', ...o }) + '<br>' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', ...o }) + ' Tana'; };
    tick(); setInterval(tick, 30000);
  }

  function form(K) {
    const f = $('form'), out = $('sent');
    f.addEventListener('submit', async e => {
      e.preventDefault();
      if (!f.checkValidity()) { out.style.display = 'block'; out.style.color = '#ffb35c'; out.textContent = 'Merci de remplir votre nom, un e-mail valide et la description du projet.'; return; }
      const btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Envoi…';
      try {
        const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(f)).toString() });
        if (!r.ok) throw new Error('Erreur ' + r.status);
        out.style.color = '#3ddc84'; out.textContent = 'Merci ! Votre message est bien parti, je vous réponds rapidement.'; f.reset();
      } catch (err) {
        out.style.color = '#ffb35c'; out.textContent = "L'envoi n'a pas fonctionné. Écrivez-moi directement à " + (K.email || '') + '.';
      }
      out.style.display = 'block'; btn.disabled = false; btn.textContent = 'Envoyer le message';
    });
  }
})();
