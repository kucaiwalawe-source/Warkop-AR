const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rp=n=>'Rp '+Math.round(n).toLocaleString('id-ID');
const dk=t=>new Date(t).toLocaleDateString('sv-SE');
const tm=t=>new Date(t).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
const dt=t=>new Date(t).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
const uid=()=>Math.random().toString(36).slice(2,8);
const KEY='warkop_v2';
let S,U=null,cart={},tab='kasir',editId=null,rr=false;

/* ===== DATA ===== */
function seed(){
 const barang=[
  {id:'b1',nama:'Kopi bubuk',sat:'gram',stok:2000,min:500,beli:120},
  {id:'b2',nama:'Gula pasir',sat:'gram',stok:3000,min:800,beli:16},
  {id:'b3',nama:'Susu kental manis',sat:'ml',stok:1500,min:500,beli:25},
  {id:'b4',nama:'Mi instan',sat:'bungkus',stok:40,min:10,beli:3000},
  {id:'b5',nama:'Telur',sat:'butir',stok:30,min:10,beli:2200},
  {id:'b6',nama:'Air mineral',sat:'botol',stok:24,min:6,beli:2000},
  {id:'b7',nama:'Teh celup',sat:'sachet',stok:12,min:15,beli:500}];
 const kat=['Kopi','Minuman','Makanan'];
 const menu=[
  {id:'m1',nama:'Kopi Hitam',kat:'Kopi',harga:5000,sat:'gelas',aktif:true,resep:[['b1',12],['b2',15]]},
  {id:'m2',nama:'Kopi Susu',kat:'Kopi',harga:8000,sat:'gelas',aktif:true,resep:[['b1',12],['b2',10],['b3',30]]},
  {id:'m3',nama:'Es Teh',kat:'Minuman',harga:4000,sat:'gelas',aktif:true,resep:[['b7',1],['b2',20]]},
  {id:'m4',nama:'Mi Rebus Telur',kat:'Makanan',harga:10000,sat:'porsi',aktif:true,resep:[['b4',1],['b5',1]]},
  {id:'m5',nama:'Mi Goreng',kat:'Makanan',harga:9000,sat:'porsi',aktif:true,resep:[['b4',1]]},
  {id:'m6',nama:'Air Mineral',kat:'Minuman',harga:4000,sat:'botol',aktif:true,resep:[['b6',1]]}];
 let r=7;const rnd=()=>(r=(r*9301+49297)%233280)/233280;const trx=[];
 for(let d=6;d>=0;d--){const n=6+Math.floor(rnd()*8);for(let i=0;i<n;i++){
  const x=new Date();x.setDate(x.getDate()-d);x.setHours(7+Math.floor(rnd()*15),Math.floor(rnd()*60),0,0);
  if(x>new Date())continue;const items=[];
  for(let j=0,k=1+Math.floor(rnd()*3);j<k;j++){const m=menu[Math.floor(rnd()*menu.length)];if(!items.find(y=>y.id===m.id))items.push({id:m.id,nama:m.nama,qty:1+Math.floor(rnd()*2),harga:m.harga});}
  const total=items.reduce((a,y)=>a+y.qty*y.harga,0);trx.push({t:x.getTime(),items,total,bayar:total,metode:rnd()<.7?'Tunai':'QRIS',kasir:'Kasir'});}}
 trx.sort((a,b)=>a.t-b.t);const c={};
 trx.forEach(x=>{const k=dk(x.t);c[k]=(c[k]||0)+1;x.no='TRX-'+k.replace(/-/g,'')+'-'+String(c[k]).padStart(3,'0')});
 return {barang,kat,menu,trx,mut:[],users:[
  {u:'pemilik',p:'pemilik123',nama:'Pemilik',role:'pemilik'},
  {u:'kasir',p:'kasir123',nama:'Kasir',role:'kasir'}]};
}
function load(){try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){S=null}if(!S)S=seed()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',2400)}
const B=id=>S.barang.find(b=>b.id===id);
const low=()=>S.barang.filter(b=>b.stok<=b.min);
const isOwner=()=>U&&U.role==='pemilik';
function maxP(m){return Math.min(9999,...m.resep.map(([b,q])=>{const x=B(b);return x?Math.floor(x.stok/q):0}))}

/* ===== AUTENTIKASI ===== */
function doLogin(){
 const u=S.users.find(x=>x.u===$('#lu').value.trim().toLowerCase()&&x.p===$('#lp').value);
 if(!u){toast('Username atau password salah');return}
 U=u;try{sessionStorage.setItem('warkop_u',u.u)}catch(e){}
 $('#lp').value='';tab='kasir';renderAll()}
function logout(){U=null;cart={};try{sessionStorage.removeItem('warkop_u')}catch(e){}renderAll()}

/* ===== NAV ===== */
const TABS=()=>isOwner()?[['kasir','Kasir'],['produk','Produk'],['stok','Stok'],['laporan','Laporan']]:[['kasir','Kasir'],['stok','Stok']];
function rNav(){const L=low().length;
 $('#nav').innerHTML=TABS().map(([k,n])=>`<button class="${tab===k?'on':''}" onclick="go('${k}')">${n}${k==='stok'&&L?`<span class="badge">${L}</span>`:''}</button>`).join('');
 $('#usr').innerHTML=`👤 ${esc(U.nama)} <small>(${U.role})</small> <button class="btn sm sec" onclick="logout()">Keluar</button>`;
 document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id===tab));
 const w=$('#warn');w.style.display=L?'block':'none';
 w.innerHTML='⚠️ <b>Stok menipis:</b> '+low().map(b=>`${esc(b.nama)} (${b.stok} ${esc(b.sat)})`).join(', ')}
function go(t){tab=t;renderAll()}

/* ===== KASIR ===== */
function rKf(){const s=$('#kf'),v=s.value;s.innerHTML='<option value="">Semua kategori</option>'+S.kat.map(k=>`<option>${esc(k)}</option>`).join('');s.value=v}
function rGrid(){const q=$('#q').value.toLowerCase(),k=$('#kf').value;
 $('#grid').innerHTML=S.menu.filter(m=>m.aktif&&m.nama.toLowerCase().includes(q)&&(!k||m.kat===k)).map(m=>{const p=maxP(m);
  return `<button class="mi" ${p<=0?'disabled':''} onclick="add('${m.id}')"><b>${esc(m.nama)}</b>${rp(m.harga)}<br><span>${p<=0?'Stok habis':p<9999?'Sisa '+p+' '+esc(m.sat):esc(m.kat)}</span></button>`}).join('')||'<p style="color:var(--mut)">Tidak ada produk.</p>'}
function add(id){const m=S.menu.find(x=>x.id===id);if((cart[id]||0)+1>maxP(m)){toast('Stok tidak cukup');return}cart[id]=(cart[id]||0)+1;rCart()}
function chg(id,d){const m=S.menu.find(x=>x.id===id);const n=(cart[id]||0)+d;if(n>maxP(m)){toast('Stok tidak cukup');return}if(n<=0)delete cart[id];else cart[id]=n;rCart()}
const total=()=>Object.entries(cart).reduce((a,[id,q])=>a+q*S.menu.find(m=>m.id===id).harga,0);
function rCart(){const e=Object.entries(cart);
 $('#cart').innerHTML=e.length?e.map(([id,q])=>{const m=S.menu.find(x=>x.id===id);return `<div class="row l"><div>${esc(m.nama)}<br><small style="color:var(--mut)">${rp(m.harga)} × ${q} = ${rp(m.harga*q)}</small></div><div class="q"><button onclick="chg('${id}',-1)">−</button>${q}<button onclick="chg('${id}',1)">+</button></div></div>`}).join(''):'<p style="color:var(--mut)">Pilih produk di sebelah kiri.</p>';
 $('#tot').textContent=rp(total());rKem()}
function rKem(){const t=total(),b=+$('#byr').value||0,tun=$('#met').value==='Tunai';$('#byr').disabled=!tun;$('#kem').textContent=tun?rp(Math.max(0,b-t)):'-'}
function nextNo(){const k=dk(Date.now());const n=S.trx.filter(x=>dk(x.t)===k).length+1;return 'TRX-'+k.replace(/-/g,'')+'-'+String(n).padStart(3,'0')}
function pay(){const t=total();if(!t){toast('Keranjang masih kosong');return}
 const met=$('#met').value;const bayar=met==='Tunai'?(+$('#byr').value||0):t;
 if(bayar<t){toast('Uang diterima kurang');return}
 const need={};Object.entries(cart).forEach(([id,q])=>S.menu.find(m=>m.id===id).resep.forEach(([b,u])=>need[b]=(need[b]||0)+u*q));
 for(const b in need)if(!B(b)||B(b).stok<need[b]){toast('Stok '+(B(b)?B(b).nama:'')+' tidak cukup');return}
 const no=nextNo(),now=Date.now();
 for(const b in need){B(b).stok-=need[b];S.mut.unshift({t:now,b:B(b).nama,j:'Keluar',q:need[b],u:B(b).sat,k:'Penjualan '+no})}
 const items=Object.entries(cart).map(([id,q])=>{const m=S.menu.find(x=>x.id===id);return {id,nama:m.nama,qty:q,harga:m.harga}});
 S.trx.push({no,t:now,items,total:t,bayar,metode:met,kasir:U.nama});S.mut=S.mut.slice(0,200);save();
 cart={};$('#byr').value='';showStruk(no);renderAll()}
function showStruk(no){const x=S.trx.find(y=>y.no===no);if(!x)return;
 $('#sk').innerHTML=`<div style="text-align:center"><b>WARKOP AR</b><br>Terima kasih sudah mampir</div><hr>${esc(x.no)}<br>${dt(x.t)} ${tm(x.t)}<br>Kasir: ${esc(x.kasir||'-')}<hr>`+
 x.items.map(i=>`${esc(i.nama)}<div class="r"><span>${i.qty} × ${rp(i.harga).slice(3)}</span><span>${rp(i.qty*i.harga).slice(3)}</span></div>`).join('')+
 `<hr><div class="r"><b>TOTAL</b><b>${rp(x.total)}</b></div><div class="r"><span>${esc(x.metode)}</span><span>${rp(x.bayar)}</span></div><div class="r"><span>Kembali</span><span>${rp(x.bayar-x.total)}</span></div><hr><div style="text-align:center">Selamat menikmati ☕</div>`;
 $('#modal').style.display='flex'}

/* ===== PRODUK DAN HARGA (pemilik) ===== */
function rRows(v){
 const o='<option value="">— bahan —</option>'+S.barang.map(b=>`<option value="${b.id}">${esc(b.nama)} (${esc(b.sat)})</option>`).join('');
 $('#pf_r').innerHTML=[0,1,2].map(i=>`<div class="row" style="padding:0;gap:6px"><select id="pr_b${i}">${o}</select><input id="pr_q${i}" type="number" placeholder="jumlah" style="width:90px"></div>`).join('');
 (v||[]).forEach(([b,q],i)=>{if(i<3){$('#pr_b'+i).value=b;$('#pr_q'+i).value=q}})}
function rProd(){
 const v=[0,1,2].map(i=>$('#pr_b'+i)?[$('#pr_b'+i).value,$('#pr_q'+i).value]:['','']);rRows(v);
 const pk=$('#pf_k'),pv=pk.value;pk.innerHTML=S.kat.map(k=>`<option>${esc(k)}</option>`).join('');if(pv)pk.value=pv;
 $('#ptb').innerHTML='<tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Satuan</th><th>Status</th><th></th></tr>'+S.menu.map(m=>`<tr><td>${esc(m.nama)}</td><td>${esc(m.kat)}</td><td>${rp(m.harga)}</td><td>${esc(m.sat)}</td><td><span class="st ${m.aktif?'ok':'lo'}">${m.aktif?'Aktif':'Nonaktif'}</span></td><td><button class="btn sm sec" onclick="editP('${m.id}')">Ubah</button> <button class="btn sm sec" onclick="togP('${m.id}')">${m.aktif?'Nonaktifkan':'Aktifkan'}</button></td></tr>`).join('');
 $('#ktl').innerHTML=S.kat.map((k,i)=>`<div class="row l"><span>${esc(k)}</span>${S.menu.some(m=>m.kat===k)?'<small style="color:var(--mut)">dipakai</small>':`<button class="btn sm sec" onclick="delK(${i})">Hapus</button>`}</div>`).join('');
 $('#mintb').innerHTML='<tr><th>Barang</th><th>Stok minimum</th></tr>'+S.barang.map(b=>`<tr><td>${esc(b.nama)}</td><td><input type="number" value="${b.min}" min="0" style="width:90px;margin:0" onchange="setMin('${b.id}',this.value)"> ${esc(b.sat)}</td></tr>`).join('')}
function saveP(){const n=$('#pf_n').value.trim(),h=+$('#pf_h').value;if(!n||!(h>0)){toast('Nama dan harga wajib diisi');return}
 const resep=[0,1,2].map(i=>[$('#pr_b'+i).value,+$('#pr_q'+i).value]).filter(r=>r[0]&&r[1]>0);
 const o={nama:n,kat:$('#pf_k').value,harga:h,sat:$('#pf_s').value.trim()||'porsi',aktif:$('#pf_a').checked,resep};
 if(editId)Object.assign(S.menu.find(m=>m.id===editId),o);else S.menu.push({id:'m'+uid(),...o});
 save();toast('Produk disimpan');clrP();renderAll()}
function editP(id){const m=S.menu.find(x=>x.id===id);editId=id;$('#pf_t').textContent='Ubah Produk';
 $('#pf_n').value=m.nama;$('#pf_k').value=m.kat;$('#pf_h').value=m.harga;$('#pf_s').value=m.sat;$('#pf_a').checked=m.aktif;rRows(m.resep)}
function clrP(){editId=null;$('#pf_t').textContent='Tambah Produk';['pf_n','pf_h','pf_s'].forEach(i=>$('#'+i).value='');$('#pf_a').checked=true;rRows([])}
function togP(id){const m=S.menu.find(x=>x.id===id);m.aktif=!m.aktif;delete cart[id];save();renderAll()}
function addK(){const n=$('#kt_n').value.trim();if(!n||S.kat.includes(n)){toast('Nama kosong atau sudah ada');return}S.kat.push(n);save();$('#kt_n').value='';renderAll()}
function delK(i){S.kat.splice(i,1);save();renderAll()}
function setMin(id,v){B(id).min=Math.max(0,+v||0);save();renderAll()}

/* ===== STOK ===== */
function rStok(){
 $('#stokForms').style.display=isOwner()?'':'none';
 $('#ro').textContent=isOwner()?'':'Mode lihat saja. Pencatatan stok dilakukan oleh pemilik.';
 $('#stk').innerHTML='<tr><th>Barang</th><th>Stok</th><th>Minimum</th><th>Status</th></tr>'+S.barang.map(b=>`<tr><td>${esc(b.nama)}</td><td>${b.stok} ${esc(b.sat)}</td><td>${b.min}</td><td><span class="st ${b.stok<=b.min?'lo':'ok'}">${b.stok<=b.min?'Menipis':'Aman'}</span></td></tr>`).join('');
 const o=S.barang.map(b=>`<option value="${b.id}">${esc(b.nama)} (${esc(b.sat)})</option>`).join('');
 ['in_b','out_b'].forEach(i=>{const s=$('#'+i),v=s.value;s.innerHTML=o;if(v)s.value=v});
 $('#mut').innerHTML='<tr><th>Waktu</th><th>Barang</th><th>Jenis</th><th>Jumlah</th><th>Keterangan</th></tr>'+(S.mut.slice(0,15).map(m=>`<tr><td>${dt(m.t)} ${tm(m.t)}</td><td>${esc(m.b)}</td><td><span class="st ${m.j==='Masuk'?'ok':'lo'}">${m.j}</span></td><td>${m.q} ${esc(m.u)}</td><td>${esc(m.k)}</td></tr>`).join('')||'<tr><td colspan="5" style="color:var(--mut)">Belum ada mutasi.</td></tr>')}
function doIn(){const b=B($('#in_b').value),q=+$('#in_q').value,h=+$('#in_h').value;if(!b||!(q>0)){toast('Isi jumlah dengan benar');return}
 b.stok+=q;if(h>0)b.beli=h/q;S.mut.unshift({t:Date.now(),b:b.nama,j:'Masuk',q,u:b.sat,k:$('#in_s').value||'Pembelian'});save();
 ['in_q','in_h','in_s'].forEach(i=>$('#'+i).value='');toast('Barang masuk dicatat');renderAll()}
function doOut(){const b=B($('#out_b').value),q=+$('#out_q').value;if(!b||!(q>0)){toast('Isi jumlah dengan benar');return}
 if(q>b.stok){toast('Melebihi stok yang ada');return}b.stok-=q;S.mut.unshift({t:Date.now(),b:b.nama,j:'Keluar',q,u:b.sat,k:$('#out_k').value});save();$('#out_q').value='';toast('Barang keluar dicatat');renderAll()}
function addB(){const n=$('#nb_n').value.trim(),s=$('#nb_s').value.trim();if(!n||!s){toast('Nama dan satuan wajib diisi');return}
 S.barang.push({id:'b'+uid(),nama:n,sat:s,stok:+$('#nb_q').value||0,min:+$('#nb_m').value||0,beli:0});save();['nb_n','nb_s','nb_q','nb_m'].forEach(i=>$('#'+i).value='');toast('Barang ditambahkan');renderAll()}

/* ===== LAPORAN (pemilik) ===== */
function cost(m){return m.resep.reduce((a,[b,q])=>a+(B(b)?B(b).beli*q:0),0)}
function qp(k){const t=new Date(),a=new Date(t);if(k==='minggu')a.setDate(a.getDate()-6);else if(k==='bulan')a.setDate(1);$('#d1').value=dk(a);$('#d2').value=dk(t);rLap()}
function printLap(){document.body.classList.add('pl');try{window.print()}catch(e){toast('Cetak tidak tersedia di sini')}setTimeout(()=>document.body.classList.remove('pl'),800)}
function rLap(){
 if(!$('#d1').value||!$('#d2').value)return qp('minggu');
 const a=new Date($('#d1').value+'T00:00:00'),z=new Date($('#d2').value+'T23:59:59');
 if(a>z){toast('Tanggal awal melebihi tanggal akhir');return}
 const L=S.trx.filter(x=>x.t>=a.getTime()&&x.t<=z.getTime());
 $('#lper').textContent='Periode: '+dt(a)+' – '+dt(z);
 const sum=L.reduce((s,x)=>s+x.total,0),item=L.reduce((s,x)=>s+x.items.reduce((b,i)=>b+i.qty,0),0);
 const hpp=L.reduce((s,x)=>s+x.items.reduce((b,i)=>{const m=S.menu.find(y=>y.id===i.id);return b+(m?cost(m)*i.qty:0)},0),0);
 $('#stats').innerHTML=[['Total penjualan',rp(sum)],['Jumlah transaksi',L.length],['Rata-rata/transaksi',rp(L.length?sum/L.length:0)],['Item terjual',item],['Estimasi laba kotor',rp(sum-hpp)]].map(([k,v])=>`<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');
 const bk=new Map(),one=dk(a)===dk(z);
 if(one){for(let h=5;h<=23;h++)bk.set(h,0);L.forEach(x=>{const h=new Date(x.t).getHours();if(bk.has(h))bk.set(h,bk.get(h)+x.total)})}
 else{const d=new Date(a);for(let i=0;i<62&&d<=z;i++){bk.set(dk(d),0);d.setDate(d.getDate()+1)}L.forEach(x=>{const k=dk(x.t);if(bk.has(k))bk.set(k,bk.get(k)+x.total)})}
 const mx=Math.max(1,...bk.values());
 $('#chart').innerHTML=[...bk].map(([k,v])=>`<div title="${k}: ${rp(v)}"><i style="height:${v/mx*88}%"></i><small>${one?k:String(k).slice(8)}</small></div>`).join('');
 const pm={};L.forEach(x=>pm[x.metode]=(pm[x.metode]||0)+x.total);
 $('#pm').innerHTML=Object.entries(pm).map(([k,v])=>`<div class="row l"><span>${esc(k)}</span><b>${rp(v)}</b></div>`).join('')||'<p style="color:var(--mut)">Belum ada data.</p>';
 const tp={};L.forEach(x=>x.items.forEach(i=>{const m=S.menu.find(y=>y.id===i.id);tp[i.nama]=tp[i.nama]||{q:0,v:0,k:m?m.kat:'-'};tp[i.nama].q+=i.qty;tp[i.nama].v+=i.qty*i.harga}));
 $('#top').innerHTML='<tr><th>Produk</th><th>Kategori</th><th>Terjual</th><th>Nilai penjualan</th></tr>'+(Object.entries(tp).sort((x,y)=>y[1].q-x[1].q).map(([n,o])=>`<tr><td>${esc(n)}</td><td>${esc(o.k)}</td><td>${o.q}</td><td>${rp(o.v)}</td></tr>`).join('')||'<tr><td colspan="4" style="color:var(--mut)">Belum ada data.</td></tr>');
 $('#trx').innerHTML='<tr><th>No. transaksi</th><th>Waktu</th><th>Kasir</th><th>Item</th><th>Total</th><th>Metode</th><th class="np"></th></tr>'+L.slice().reverse().slice(0,100).map(x=>`<tr><td>${esc(x.no)}</td><td>${dt(x.t)} ${tm(x.t)}</td><td>${esc(x.kasir||'-')}</td><td>${x.items.reduce((s,i)=>s+i.qty,0)}</td><td>${rp(x.total)}</td><td>${esc(x.metode)}</td><td class="np"><button class="btn sm" onclick="showStruk('${x.no}')">Struk</button></td></tr>`).join('')}
function reset(){const b=$('#rst');if(!rr){rr=true;b.textContent='Klik lagi untuk konfirmasi reset';setTimeout(()=>{rr=false;b.textContent='Reset'},3000);return}
 rr=false;S=seed();U=S.users.find(x=>x.u===U.u);save();cart={};b.textContent='Reset';toast('Data direset');renderAll()}

/* ===== RENDER ===== */
function renderAll(){
 $('#login').style.display=U?'none':'flex';$('#app').style.display=U?'block':'none';
 if(!U)return;
 if(!TABS().some(t=>t[0]===tab))tab='kasir';
 rNav();rKf();rGrid();rCart();rStok();
 if(isOwner()){rProd();rLap()}}
load();
try{U=S.users.find(x=>x.u===sessionStorage.getItem('warkop_u'))||null}catch(e){U=null}
renderAll();
