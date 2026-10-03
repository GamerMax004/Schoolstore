(function(){
  'use strict';
  const CART_KEY='schoolstore-cart-v2';
  const products=[
    {id:'shirt',name:'T-Shirts',category:'Textilien',price:17.95,tag:'Viele Farben & Größen',description:'T-Shirt · 17,95 €',kind:'shirt',available:true,colors:['Nebelblau','Hellgrau','Weiß','Schwarz','Navy','Beige'],colorValues:['#a3b4c4','#d3d3d3','#ffffff','#202020','#5a7a9c','#f5d7b2'],sizes:['8/10','12/14','S','M','L','XL','3XL']},
    {id:'hoodie',name:'Hoodies',category:'Textilien',price:38,tag:'Bequem & warm',description:'Hoodie · 38,00 €',kind:'hoodie',available:true,colors:['Schwarz','Hellgrau'],colorValues:['#202020','#d3d3d3'],sizes:['S','M','L']},
    {id:'ziphoodie',name:'Zip-Hoodies',category:'Textilien',price:40,tag:'Mit Reißverschluss',description:'Zip-Hoodie · 40,00 €',kind:'zip',available:true,colors:['Schwarz','Hellgrau'],colorValues:['#202020','#d3d3d3'],sizes:['S','M','L']},
    {id:'mug',name:'Tassen',category:'Accessoires',price:4.5,tag:'Für Kaffee, Tee & Kakao',description:'Schoolstore-Tasse · 4,50 €',kind:'mug',available:true,colors:[],colorValues:[],sizes:[]},
    {id:'starter',name:'Starterpakete',category:'Starterpakete',price:null,tag:'Preis folgt',description:'Für den perfekten Schulstart',kind:'starter',available:false,colors:[],colorValues:[],sizes:[]},
    {id:'starterplus',name:'Starterpakete+',category:'Starterpakete',price:null,tag:'Preis folgt',description:'Erweiterte Ausstattung',kind:'starterplus',available:false,colors:[],colorValues:[],sizes:[]}
  ];
  const art={
    shirt:function(c){return '<svg viewBox="0 0 180 210" aria-hidden="true"><path d="M54 18 22 36 4 76l31 12 11-20v118h88V68l11 20 31-12-18-40-32-18c-8 18-21 28-41 28S62 36 54 18Z" fill="'+c+'" stroke="#17251d" stroke-opacity=".12" stroke-width="2"/><path d="M66 32c6 13 14 20 24 20s18-7 24-20" fill="none" stroke="#17251d" stroke-opacity=".15" stroke-width="3"/><rect x="64" y="92" width="52" height="31" rx="2" fill="#59b200"/><text x="90" y="111" text-anchor="middle" font-family="Georgia" font-size="9" fill="white">Schoolstore</text><text x="90" y="119" text-anchor="middle" font-family="Arial" font-size="4.5" letter-spacing="1" fill="white">HGW · EST. 2022</text></svg>'},
    hoodie:function(c){return '<svg viewBox="0 0 180 210" aria-hidden="true"><path d="M59 47 27 58 8 83l12 92h140l12-92-19-25-32-11c-4 19-15 29-31 29S63 66 59 47Z" fill="'+c+'" stroke="#17251d" stroke-opacity=".12" stroke-width="2"/><path d="M64 48c1-21 11-34 26-34s25 13 26 34c-6 18-15 28-26 28S70 66 64 48Z" fill="'+c+'" stroke="#17251d" stroke-opacity=".14" stroke-width="2"/><path d="M90 78v25M77 79l5 29m26-29-5 29" stroke="#17251d" stroke-opacity=".2" stroke-width="2"/><rect x="61" y="119" width="58" height="31" rx="5" fill="#ffffff44"/><text x="90" y="138" text-anchor="middle" font-family="Georgia" font-size="8" fill="#30432f">Schoolstore</text></svg>'},
    zip:function(c){return '<svg viewBox="0 0 180 210" aria-hidden="true"><path d="M59 47 27 58 8 83l12 92h140l12-92-19-25-32-11c-4 19-15 29-31 29S63 66 59 47Z" fill="'+c+'" stroke="#17251d" stroke-opacity=".12" stroke-width="2"/><path d="M64 48c1-21 11-34 26-34s25 13 26 34c-6 18-15 28-26 28S70 66 64 48Z" fill="'+c+'" stroke="#17251d" stroke-opacity=".14" stroke-width="2"/><path d="M90 77v95" stroke="#f2f1e9" stroke-width="3"/><circle cx="90" cy="102" r="2" fill="#f2f1e9"/><rect x="61" y="119" width="27" height="27" rx="4" fill="#ffffff33"/><rect x="92" y="119" width="27" height="27" rx="4" fill="#ffffff33"/><text x="90" y="161" text-anchor="middle" font-family="Georgia" font-size="7" fill="#ffffff">Schoolstore</text></svg>'},
    mug:function(){return '<svg viewBox="0 0 180 210" aria-hidden="true"><path d="M42 58h91v95c0 13-10 23-23 23H65c-13 0-23-10-23-23V58Z" fill="#f7f7f1" stroke="#17251d" stroke-opacity=".15" stroke-width="2"/><path d="M133 77h10c19 0 22 35 0 35h-10" fill="none" stroke="#f7f7f1" stroke-width="13"/><path d="M133 77h10c19 0 22 35 0 35h-10" fill="none" stroke="#17251d" stroke-opacity=".12" stroke-width="2"/><ellipse cx="87" cy="60" rx="45" ry="8" fill="#fff" fill-opacity=".55"/><text x="87" y="109" text-anchor="middle" font-family="Georgia" font-size="11" fill="#35502c">Schoolstore</text><path d="M62 121h49" stroke="#59b200" stroke-width="3" stroke-linecap="round"/></svg>'},
    starter:function(){return '<svg viewBox="0 0 180 210" aria-hidden="true"><path d="M38 53h94l-6 128H44L38 53Z" fill="#c9d6ba" stroke="#17251d" stroke-opacity=".12" stroke-width="2"/><path d="M50 38h94l-6 128H56L50 38Z" fill="#e4dccb" stroke="#17251d" stroke-opacity=".12" stroke-width="2"/><path d="M62 23h94l-6 128H68L62 23Z" fill="#f7f7f1" stroke="#17251d" stroke-opacity=".12" stroke-width="2"/><rect x="82" y="67" width="54" height="33" fill="#59b200"/><text x="109" y="87" text-anchor="middle" font-family="Georgia" font-size="8" fill="white">Schoolstore</text><path d="M83 111h51m-51 8h40" stroke="#9aa694" stroke-width="3" stroke-linecap="round"/></svg>'},
    starterplus:function(){return '<svg viewBox="0 0 180 210" aria-hidden="true"><path d="M27 67h102l-8 116H35L27 67Z" fill="#c9d6ba" stroke="#17251d" stroke-opacity=".12" stroke-width="2"/><path d="M50 43h98l-7 128H57L50 43Z" fill="#f7f7f1" stroke="#17251d" stroke-opacity=".12" stroke-width="2"/><path d="M65 20h82v38H65Z" fill="#59b200"/><text x="106" y="44" text-anchor="middle" font-family="Georgia" font-size="9" fill="white">Schoolstore +</text><rect x="75" y="83" width="49" height="30" rx="15" fill="#e7b85d"/><path d="M99 91v15m-7-7h15" stroke="white" stroke-width="3" stroke-linecap="round"/><path d="M74 127h55m-55 8h39" stroke="#9aa694" stroke-width="3" stroke-linecap="round"/></svg>'}
  };
  const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(Number(n)||0);
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(_){return fallback}}
  let cart=read(CART_KEY,[]),filter='Alle',lastOrder=null;
  const grid=document.getElementById('productGrid');
  function renderProducts(){
    const shown=products.filter(p=>filter==='Alle'||p.category===filter);
    document.getElementById('shopCount').textContent=shown.length+' Artikel';
    grid.innerHTML=shown.map(p=>{
      const color=p.colors.length?'<label class="sr-only" for="color-'+p.id+'">Farbe</label><select id="color-'+p.id+'" data-color="'+p.id+'" aria-label="Farbe für '+p.name+'">'+p.colors.map((name,i)=>'<option value="'+i+'">'+name+'</option>').join('')+'</select>':'';
      const size=p.sizes.length?'<label class="sr-only" for="size-'+p.id+'">Größe</label><select id="size-'+p.id+'" data-size="'+p.id+'" aria-label="Größe für '+p.name+'">'+p.sizes.map(s=>'<option>'+s+'</option>').join('')+'</select>':'';
      const action=p.available?'<button class="add" data-add="'+p.id+'" aria-label="'+p.name+' in den Warenkorb">+</button>':'<span class="unavailable">Noch nicht bestellbar</span>';
      const price=p.price===null?'Preis folgt':money(p.price);
      return '<article class="card"><div class="visual"><span class="tag">'+p.tag+'</span><div class="art">'+art[p.kind](p.kind==='shirt'||p.kind==='hoodie'||p.kind==='zip'?'#d3d3d3':'')+'</div>'+action+'</div><div class="info"><div><h3>'+p.name+'</h3><div class="meta">'+p.description+'</div></div><div class="price">'+price+'</div></div>'+(color||size?'<div class="options">'+color+size+'</div>':'')+'</article>';
    }).join('');
  }
  function saveCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));renderCart()}
  function renderCart(){
    const count=cart.reduce((n,x)=>n+Number(x.qty||0),0),total=cart.reduce((n,x)=>n+Number(x.price||0)*Number(x.qty||0),0);
    document.getElementById('cartCount').textContent=count;document.getElementById('cartTotal').textContent=money(total);document.getElementById('checkoutQuantity').textContent=count;document.getElementById('checkoutTotal').textContent=money(total);document.getElementById('checkoutButton').disabled=!count;
    document.getElementById('cartItems').innerHTML=count?cart.map((x,i)=>'<div class="line"><div class="thumb">'+(x.kind==='mug'?'☕':'◒')+'</div><div><h3>'+esc(x.name)+'</h3><small>'+esc([x.colorName,x.size].filter(Boolean).join(' · ')||'Ohne Variante')+'</small><div class="qty"><button data-qty="'+i+'" data-delta="-1" aria-label="Menge verringern">−</button><span>'+Number(x.qty)+'</span><button data-qty="'+i+'" data-delta="1" aria-label="Menge erhöhen">+</button><button class="remove" data-remove="'+i+'">Entfernen</button></div></div><div class="line-price">'+money(Number(x.price||0)*Number(x.qty||0))+'</div></div>').join(''):'<div class="empty"><b>Hier ist noch Platz.</b>Wähle deine Schoolstore-Lieblingsstücke.</div>';
  }
  function openCart(){document.getElementById('backdrop').classList.add('open');document.getElementById('cartDrawer').classList.add('open');document.getElementById('cartDrawer').setAttribute('aria-hidden','false')}
  function closeCart(){document.getElementById('backdrop').classList.remove('open');document.getElementById('cartDrawer').classList.remove('open');document.getElementById('cartDrawer').setAttribute('aria-hidden','true')}
  function toast(text){const t=document.getElementById('toast');t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
  grid.addEventListener('click',e=>{
    const btn=e.target.closest('[data-add]');if(!btn)return;
    const p=products.find(x=>x.id===btn.dataset.add),colorSelect=document.querySelector('[data-color="'+p.id+'"]'),sizeSelect=document.querySelector('[data-size="'+p.id+'"]');
    const colorIndex=colorSelect?Number(colorSelect.value):-1,colorName=colorIndex>=0?p.colors[colorIndex]:'',colorValue=colorIndex>=0?p.colorValues[colorIndex]:'',size=sizeSelect?sizeSelect.value:'';
    const key=[p.id,colorName,size].join('|'),existing=cart.find(x=>x.key===key);
    if(existing)existing.qty++;else cart.push({key,id:p.id,name:p.name,kind:p.kind,price:p.price,color:colorValue,colorName,size,qty:1});
    saveCart();toast(p.name+' im Warenkorb');
  });
  grid.addEventListener('change',e=>{
    const select=e.target.closest('[data-color]');if(!select)return;
    const p=products.find(x=>x.id===select.dataset.color);if(!p)return;
    const artNode=select.closest('.card').querySelector('.art');artNode.innerHTML=art[p.kind](p.colorValues[Number(select.value)]);
  });
  document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');filter=btn.dataset.filter;renderProducts()}));
  document.getElementById('cartItems').addEventListener('click',e=>{const q=e.target.closest('[data-qty]'),r=e.target.closest('[data-remove]');if(q){const i=Number(q.dataset.qty);cart[i].qty+=Number(q.dataset.delta);if(cart[i].qty<1)cart.splice(i,1);saveCart()}if(r){cart.splice(Number(r.dataset.remove),1);saveCart()}});
  document.getElementById('openCart').addEventListener('click',openCart);document.getElementById('closeCart').addEventListener('click',closeCart);document.getElementById('backdrop').addEventListener('click',closeCart);
  document.getElementById('checkoutButton').addEventListener('click',()=>{if(!cart.length)return;closeCart();document.getElementById('checkoutModal').classList.add('open');document.getElementById('checkoutFormView').style.display='block';document.getElementById('receiptView').classList.remove('show')});
  document.getElementById('closeCheckout').addEventListener('click',()=>document.getElementById('checkoutModal').classList.remove('open'));
  document.getElementById('deliveryMethod').addEventListener('change',e=>{const child=e.target.value==='child';document.getElementById('childNameField').hidden=!child;document.getElementById('childClassField').hidden=!child;document.getElementById('otherPickupField').hidden=child;document.getElementById('childName').required=child;document.getElementById('childClass').required=child;document.getElementById('otherPickup').required=!child});
  document.getElementById('orderForm').addEventListener('submit',async e=>{
    e.preventDefault();if(!cart.length)return;
    const submit=e.currentTarget.querySelector('[type="submit"]'),label=submit.textContent;submit.disabled=true;submit.textContent='Wird übermittelt …';
    try{
      const f=new FormData(e.currentTarget),response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:f.get('name'),email:f.get('email'),payment:f.get('payment'),delivery:f.get('delivery'),childName:f.get('childName'),childClass:f.get('childClass'),otherPickup:f.get('otherPickup'),note:f.get('note'),items:cart.map(x=>({id:x.id,colorName:x.colorName,size:x.size,qty:x.qty}))})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Die Bestellung konnte nicht übermittelt werden.');
      lastOrder=data.order;document.getElementById('receiptName').textContent=String(lastOrder.customerName).split(' ')[0];
      const paymentInfo=lastOrder.payment==='transfer'?'<br><br><b>Überweisung innerhalb von 14 Tagen</b><br>Schoolstore eSG · IBAN DE41 3846 2135 1029 3090 15<br>Volksbank Oberberg eG':'<br><br><b>Barzahlung innerhalb von 7 Tagen</b><br>Bitte den Betrag im Lehrerzimmer bei Herrn Nievel oder Frau Köst abgeben.';
      document.getElementById('receiptDetails').innerHTML='<b>Bestellnummer:</b> '+esc(lastOrder.id)+'<br><b>Gesamtbetrag:</b> '+money(lastOrder.total)+'<br><b>Zahlungsart:</b> '+(lastOrder.payment==='transfer'?'Überweisung':'Barzahlung')+paymentInfo;
      document.getElementById('checkoutFormView').style.display='none';document.getElementById('receiptView').classList.add('show');cart=[];saveCart();e.currentTarget.reset();document.getElementById('deliveryMethod').dispatchEvent(new Event('change'));
    }catch(error){toast(error.message)}finally{submit.disabled=false;submit.textContent=label;}
  });
  document.getElementById('printReceipt').addEventListener('click',()=>window.printSchoolstoreInvoice(lastOrder));
  document.getElementById('receiptDone').addEventListener('click',()=>document.getElementById('checkoutModal').classList.remove('open'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();document.getElementById('checkoutModal').classList.remove('open')}});
  renderProducts();renderCart();document.getElementById('deliveryMethod').dispatchEvent(new Event('change'));
})();

