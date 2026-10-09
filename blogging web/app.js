// ===== Setup =====
const db = supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY);
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = d => new Date(d).toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'});
$('#yr').textContent = new Date().getFullYear();

// Theme toggle (remembered)
document.documentElement.dataset.theme = localStorage.getItem('theme') || 'light';
$('#theme').onclick = () => {
  const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t; localStorage.setItem('theme', t);
};

// ===== Auth header: "Login" or "Welcome, Name" + Logout =====
(async function authUI() {
  const { data } = await db.auth.getSession(), u = data.session?.user, box = $('#authbox');
  if (!u) { box.innerHTML = '<a class="btn ghost" href="auth.html">Login</a>'; return; }
  const name = u.user_metadata?.full_name || u.email.split('@')[0];
  const admin = u.email.toLowerCase() === CFG.ADMIN_EMAIL.toLowerCase();
  box.innerHTML = `<span class="wl">Welcome, ${esc(name)}</span>${admin ? '<a class="btn ghost" href="admin.html">Dashboard</a>' : ''}<button class="ghost" id="lo">Logout</button>`;
  $('#lo').onclick = async () => { await db.auth.signOut(); location.reload(); };
})();

// ===== Ads: puts your pasted code into every [data-ad] slot and makes <script> tags run =====
function fillAd(el, code) {
  if (!code || !code.trim()) return;
  el.innerHTML = code;
  el.querySelectorAll('script').forEach(old => {
    const s = document.createElement('script');
    [...old.attributes].forEach(a => s.setAttribute(a.name, a.value));
    s.text = old.text; old.replaceWith(s);
  });
}
const mountAds = () => document.querySelectorAll('[data-ad]').forEach(el => fillAd(el, ADS[el.dataset.ad]));
fillAd($('#popunder'), ADS.popunder);

// ===== Views =====
const card = p => `
  <a class="pc" href="#/post/${esc(p.slug)}">
    <img loading="lazy" src="${esc(p.cover_url) || 'data:image/gif;base64,R0lGODlhAQABAAAAACw='}" alt="${esc(p.title)}">
    <div><div class="meta"><span class="tag">${esc(p.category)}</span><small>${fmt(p.created_at)}</small></div>
    <h3>${esc(p.title)} <i>↗</i></h3><p>${esc(p.excerpt)}</p></div>
  </a>`;

async function home() {
  $('#app').innerHTML = '<div class="empty">Loading…</div>';
  const { data = [], error } = await db.from('posts').select('*').eq('published', true).order('created_at', { ascending: false });
  if (error) return $('#app').innerHTML = `<div class="empty">Check config.js: ${esc(error.message)}</div>`;
  data.sort((a, b) => (b.featured - a.featured)); // featured posts first
  const cats = ['All', ...new Set(data.map(p => p.category))];
  $('#app').innerHTML = `
    <section class="hero"><div class="eyebrow">Our blog</div><h1>Resources and insights</h1>
      <p>The latest industry news, interviews, guides and stories from our team.</p>
      <div class="sub" id="sub"><input id="se" type="email" placeholder="Enter your email"><button id="sb">Subscribe</button></div>
      <div class="hint">We care about your data in our privacy policy.</div></section>
    ${data.length ? `<div class="top3">${card(data[0])}<div class="stack">${data.slice(1, 3).map(card).join('')}</div></div>` : '<div class="empty">No posts yet.</div>'}
    <h2 class="sec" id="all">All blog posts</h2>
    <div class="pills">${cats.map((c, i) => `<button class="${i ? '' : 'on'}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
    <div class="grid" id="g"></div>`;
  const draw = c => $('#g').innerHTML = data.filter(p => c === 'All' || p.category === c).map(card).join('');
  draw('All');
  document.querySelectorAll('.pills button').forEach(b => b.onclick = () => {
    document.querySelectorAll('.pills button').forEach(x => x.classList.remove('on')); b.classList.add('on'); draw(b.dataset.c);
  });
  $('#sb').onclick = async () => {
    const email = $('#se').value.trim(); if (!email) return;
    const { error } = await db.from('subscribers').insert({ email });
    $('#sb').textContent = error ? 'Try again' : 'Subscribed ✓'; if (!error) $('#se').value = '';
  };
  mountAds();
}

async function post(slug) {
  const { data: p } = await db.from('posts').select('*').eq('slug', slug).maybeSingle();
  if (!p) return $('#app').innerHTML = `<div class="empty">Post not found. <a href="#/">Go home</a></div>`;
  document.title = p.title + ' – ' + CFG.SITE_NAME;
  // Put an ad slot after the 2nd paragraph
  const body = p.content.replace(/(<\/p>[\s\S]*?<\/p>)/, '$1<div class="ad" data-ad="inArticle"></div>');
  const url = encodeURIComponent(location.href), t = encodeURIComponent(p.title);
  $('#app').innerHTML = `<div class="layout"><article>
      <span class="tag">${esc(p.category)}</span><h1>${esc(p.title)}</h1><small>${fmt(p.created_at)}</small>
      ${p.cover_url ? `<img class="cover" src="${esc(p.cover_url)}" alt="">` : ''}
      <div class="body">${body}</div>
      <div class="share"><b>Share:</b>
        <a target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=${url}&text=${t}">X</a>
        <a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${url}">Facebook</a>
        <a target="_blank" rel="noopener" href="https://wa.me/?text=${t}%20${url}">WhatsApp</a>
        <button onclick="navigator.clipboard.writeText(location.href);this.textContent='Copied ✓'">Copy link</button></div>
      <section class="comments"><h2 class="sec">Comments</h2>
        <input id="cn" placeholder="Your name" maxlength="60"><textarea id="cb" rows="3" placeholder="Write a comment…" maxlength="1000"></textarea>
        <button id="cs">Post comment</button><div id="cl"></div></section>
    </article>
    <aside><div class="ad" data-ad="sidebar"></div></aside></div>`;
  const load = async () => {
    const { data = [] } = await db.from('comments').select('*').eq('post_id', p.id).order('created_at', { ascending: false });
    $('#cl').innerHTML = data.map(c => `<div class="cm"><b>${esc(c.name)}</b> <small>${fmt(c.created_at)}</small><br>${esc(c.body)}</div>`).join('') || '<p class="empty">Be the first to comment.</p>';
  };
  $('#cs').onclick = async () => {
    const name = $('#cn').value.trim(), b = $('#cb').value.trim();
    if (!name || !b) return alert('Please enter your name and comment.');
    const { error } = await db.from('comments').insert({ post_id: p.id, name, body: b });
    if (error) return alert(error.message);
    $('#cb').value = ''; load();
  };
  load(); mountAds(); scrollTo(0, 0);
}

// ===== Router (#/ = home, #/post/slug = article) =====
function route() {
  const m = location.hash.match(/^#\/post\/(.+)/);
  document.title = CFG.SITE_NAME;
  m ? post(decodeURIComponent(m[1])) : home();
}
addEventListener('hashchange', route); route();
