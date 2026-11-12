/* PD Dahlia: sinkronisasi website publik dengan Supabase. */
(() => {
  const SUPABASE_URL = 'https://mzauoerwaetnowqshulz.supabase.co';
  const SUPABASE_ANON_KEY = 'ISI_ANON_PUBLIC_KEY_ANDA';
  const CACHE_KEY = 'pddahlia-cache-v1';
  const CACHE_MS = 60 * 1000;
  if (SUPABASE_URL.includes('ISI_') || SUPABASE_ANON_KEY.includes('ISI_')) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rp = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const date = value => value ? new Date(value + 'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}) : 'hari ini';
  if (new URLSearchParams(location.search).get('nocache') !== '1') {
    try { const saved=JSON.parse(localStorage.getItem(CACHE_KEY)); if(saved && Date.now()-saved.time<CACHE_MS){render(saved.data);return;} } catch(_) {}
  }
  load();
  async function load(){
    try {
      const headers={apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+SUPABASE_ANON_KEY};
      const base=SUPABASE_URL.replace(/\/$/,'');
      const [pr,sr]=await Promise.all([fetch(base+'/rest/v1/products?select=*&aktif=eq.true&order=urutan.asc',{headers}),fetch(base+'/rest/v1/settings?select=*&id=eq.1',{headers})]);
      if(!pr.ok||!sr.ok) throw new Error('Data toko gagal dimuat');
      const data={products:await pr.json(),settings:(await sr.json())[0]||{}};
      try{localStorage.setItem(CACHE_KEY,JSON.stringify({time:Date.now(),data}));}catch(_){}
      render(data);
    } catch(error){console.warn('[PD Dahlia]',error.message);}
  }
  function render({products=[],settings={}}){
    const headline=document.querySelector('[data-hero-headline]'); if(headline&&settings.hero_headline) headline.textContent=settings.hero_headline;
    const subheadline=document.querySelector('[data-hero-subheadline]'); if(subheadline&&settings.hero_subheadline) subheadline.textContent=settings.hero_subheadline;
    const areas=document.querySelector('[data-area-list]'); if(areas&&Array.isArray(settings.area_kirim)) areas.innerHTML=settings.area_kirim.map(x=>'<li>📍 '+esc(x)+'</li>').join('');
    const stockDate=document.querySelector('[data-tanggal]'); if(stockDate&&settings.stok_tanggal) stockDate.textContent=date(settings.stok_tanggal);
    const note=document.querySelector('[data-stok-catatan]'); if(note&&settings.stok_catatan) note.textContent=settings.stok_catatan;
    const grid=document.querySelector('[data-produk-grid]');
    if(grid) grid.innerHTML=products.map(p=>{
      const chips=(p.chips||[]).map(x=>'<span>'+esc(x)+'</span>').join('');
      const price=p.harga_max&&p.harga_max!==p.harga_min?rp(p.harga_min)+' – '+rp(p.harga_max):rp(p.harga_min);
      const msg=`Halo PD Dahlia, saya mau pesan ${p.nama}. Stok hari ini masih ada? Berapa harga per ${p.unit||'kg'}?`;
      const wa=(settings.wa_number||'6281234567890').replace(/\D/g,'');
      return `<article class="kartu"><span class="kartu-emoji">${esc(p.emoji||'🥩')}</span><h3>${esc(p.nama)}</h3><p>${esc(p.deskripsi||'')}</p><div class="chips-mini">${chips}</div><div class="harga"><small>Mulai</small>${price} / ${esc(p.unit||'kg')}</div><a class="btn btn-wa" href="https://wa.me/${wa}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Tanya Harga</a></article>`;
    }).join('');
    const stock=document.querySelector('[data-stok-list]'); if(stock) stock.innerHTML=products.map(p=>`<li><span>${esc(p.nama)}</span><span class="${p.tersedia?'ada':'habis'}">${p.tersedia?'✅ Tersedia':'❌ Habis'}</span></li>`).join('');
    if(settings.wa_number){const num=settings.wa_number.replace(/\D/g,'');document.querySelectorAll('[data-wa]').forEach(a=>{const msg=a.getAttribute('data-msg')||'Halo PD Dahlia, saya mau pesan daging sapi. Boleh info stok dan harga hari ini?';a.href=`https://wa.me/${num}?text=${encodeURIComponent(msg)}`;});}
  }
})();


