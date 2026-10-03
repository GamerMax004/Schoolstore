import http from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, extname, normalize, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const envPath = resolve(ROOT, '.env');
if (existsSync(envPath)) for (const raw of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const line = raw.trim(); if (!line || line.startsWith('#')) continue;
  const at = line.indexOf('='); if (at > 0 && !process.env[line.slice(0, at).trim()]) process.env[line.slice(0, at).trim()] = line.slice(at + 1).trim();
}
const PORT = Number(process.env.PORT || 8766);
const HOST = process.env.HOST || '127.0.0.1';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
if (ADMIN_PASSWORD.length < 12) { console.error('Bitte zuerst setup.ps1 ausführen und ein Admin-Passwort mit mindestens 12 Zeichen anlegen.'); process.exit(1); }

const products = [
  { id:'shirt', name:'T-Shirt', category:'Textilien', price:17.95, colors:['Nebelblau','Hellgrau','Weiß','Schwarz','Navy','Beige'], colorValues:['#a3b4c4','#d3d3d3','#ffffff','#202020','#5a7a9c','#f5d7b2'], sizes:['8/10','12/14','S','M','L','XL','3XL'], available:true },
  { id:'hoodie', name:'Hoodie', category:'Textilien', price:38, colors:['Schwarz','Hellgrau'], colorValues:['#202020','#d3d3d3'], sizes:['S','M','L'], available:true },
  { id:'ziphoodie', name:'Zip-Hoodie', category:'Textilien', price:40, colors:['Schwarz','Hellgrau'], colorValues:['#202020','#d3d3d3'], sizes:['S','M','L'], available:true },
  { id:'mug', name:'Tasse', category:'Accessoires', price:4.5, colors:[], colorValues:[], sizes:[], available:true },
  { id:'starter', name:'Starterpaket', category:'Starterpakete', price:null, colors:[], colorValues:[], sizes:[], available:false },
  { id:'starterplus', name:'Starterpaket+', category:'Starterpakete', price:null, colors:[], colorValues:[], sizes:[], available:false }
];
const productById = new Map(products.map(p => [p.id,p]));
const dataDir = resolve(ROOT,'data'); mkdirSync(dataDir,{recursive:true});
const db = new DatabaseSync(resolve(dataDir,'schoolstore.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, customer_name TEXT NOT NULL, email TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Offen', paid INTEGER NOT NULL DEFAULT 0, total REAL NOT NULL, payload TEXT NOT NULL);`);
const insertOrder = db.prepare('INSERT INTO orders (id,created_at,customer_name,email,status,paid,total,payload) VALUES (?,?,?,?,?,?,?,?)');
const sessions = new Map(), attempts = new Map();
const hashSalt = randomBytes(16);
const passwordHash = scryptSync(ADMIN_PASSWORD, hashSalt, 64);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};
const json = (res, status, data, headers={}) => { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}); res.end(JSON.stringify(data)); };
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim()).filter(Boolean).map(s=>{const i=s.indexOf('=');return [s.slice(0,i),decodeURIComponent(s.slice(i+1))]}));}
function session(req,res){const c=cookies(req),id=c.schoolstore_session;let s=id&&sessions.get(id);if(!s){const sid=randomBytes(32).toString('base64url');s={csrf:randomBytes(24).toString('base64url'),admin:false,created:Date.now()};sessions.set(sid,s);res.setHeader('Set-Cookie',`schoolstore_session=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${process.env.NODE_ENV==='production'?'; Secure':''}`);return {id:sid,...s};}return {id,...s};}
function validCsrf(req,s){return req.headers['x-csrf-token']===s.csrf;}
function requireAdmin(req,res){const s=session(req,res);if(!s.admin){json(res,401,{error:'Bitte anmelden.'});return null;}if(!validCsrf(req,s)){json(res,403,{error:'Sitzung abgelaufen. Bitte Seite neu laden.'});return null;}return s;}
async function body(req){let raw='';for await(const part of req){raw+=part;if(raw.length>150000)throw new Error('Anfrage zu groß');}return raw?JSON.parse(raw):{};}
function getOrder(row){return {...JSON.parse(row.payload),id:row.id,date:row.created_at,status:row.status,paid:Boolean(row.paid),total:Number(row.total)};}
function orderRows(){return db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all().map(getOrder);}
function sendOrder(req,res){
  const sid=cookies(req).schoolstore_session||req.socket.remoteAddress||'unknown';const now=Date.now(),recent=(attempts.get(sid)||[]).filter(t=>now-t<60000);if(recent.length>=8){json(res,429,{error:'Bitte warte kurz und versuche es erneut.'});return;}recent.push(now);attempts.set(sid,recent);
  body(req).then(input=>{
    const name=String(input.name||'').trim(),email=String(input.email||'').trim();if(name.length<2||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||email.length>254)throw new Error('Bitte prüfe Name und E-Mail-Adresse.');
    if(input.delivery!=='child'&&input.delivery!=='other')throw new Error('Bitte wähle eine Abholung.');
    if(input.delivery==='child'&&(!String(input.childName||'').trim()||!String(input.childClass||'').trim()))throw new Error('Bitte ergänze Name und Klasse des Kindes.');
    if(input.delivery==='other'&&!String(input.otherPickup||'').trim())throw new Error('Bitte beschreibe die gewünschte Abholung.');
    if(!['transfer','cash'].includes(input.payment))throw new Error('Bitte wähle eine Zahlungsart.');
    if(!Array.isArray(input.items)||input.items.length<1||input.items.length>30)throw new Error('Der Warenkorb ist leer oder ungültig.');
    const items=input.items.map(line=>{const p=productById.get(String(line.id));const qty=Math.floor(Number(line.qty));if(!p?.available||!Number.isFinite(qty)||qty<1||qty>30)throw new Error('Ein Artikel ist nicht verfügbar.');const colorName=p.colors.length?String(line.colorName||''):'';const size=p.sizes.length?String(line.size||''):'';if(p.colors.length&&!p.colors.includes(colorName))throw new Error('Bitte prüfe die Farbwahl.');if(p.sizes.length&&!p.sizes.includes(size))throw new Error('Bitte prüfe die Größenwahl.');return {id:p.id,name:p.name,price:p.price,qty,colorName,color:p.colorValues[p.colors.indexOf(colorName)]||'',size};});
    const id='HGW-'+new Date().getFullYear()+'-'+randomBytes(3).toString('hex').toUpperCase(),date=new Date().toISOString(),total=Math.round(items.reduce((sum,x)=>sum+x.price*x.qty,0)*100)/100;
    const order={id,date,customerName:name,email,payment:input.payment,delivery:input.delivery,childName:String(input.childName||'').trim(),childClass:String(input.childClass||'').trim(),otherPickup:String(input.otherPickup||'').trim(),note:String(input.note||'').trim().slice(0,1000),items,total,status:'Offen',paid:false};
    insertOrder.run(id,date,name,email,'Offen',0,total,JSON.stringify(order));json(res,201,{order});
  }).catch(err=>json(res,400,{error:err.message||'Bestellung konnte nicht gespeichert werden.'}));
}
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{ok:true});
    if(req.method==='GET'&&url.pathname==='/api/catalog')return json(res,200,{products});
    if(req.method==='GET'&&url.pathname==='/api/admin/session'){const s=session(req,res);return json(res,200,{authenticated:s.admin,csrf:s.csrf});}
    if(req.method==='POST'&&url.pathname==='/api/orders')return sendOrder(req,res);
    if(req.method==='POST'&&url.pathname==='/api/admin/login'){
      const s=session(req,res);if(!validCsrf(req,s))return json(res,403,{error:'Seite bitte neu laden.'});
      const ip=req.socket.remoteAddress||'unknown',a=(attempts.get(ip)||[]).filter(t=>Date.now()-t<60000);if(a.length>=6)return json(res,429,{error:'Zu viele Anmeldeversuche. Bitte später erneut versuchen.'});a.push(Date.now());attempts.set(ip,a);
      const input=await body(req),candidate=scryptSync(String(input.password||''),hashSalt,64);if(!timingSafeEqual(candidate,passwordHash))return json(res,401,{error:'Passwort stimmt nicht.'});
      sessions.delete(s.id);const sid=randomBytes(32).toString('base64url'),fresh={csrf:randomBytes(24).toString('base64url'),admin:true,created:Date.now()};sessions.set(sid,fresh);return json(res,200,{authenticated:true,csrf:fresh.csrf},{'Set-Cookie':`schoolstore_session=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${process.env.NODE_ENV==='production'?'; Secure':''}`});
    }
    if(req.method==='POST'&&url.pathname==='/api/admin/logout'){const s=requireAdmin(req,res);if(!s)return; sessions.delete(s.id);res.setHeader('Set-Cookie','schoolstore_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(res,200,{ok:true});}
    if(url.pathname==='/api/admin/orders'&&req.method==='GET'){const s=session(req,res);if(!s.admin)return json(res,401,{error:'Bitte anmelden.'});const orders=orderRows();return json(res,200,{orders,stats:{open:orders.filter(o=>o.status==='Offen').length,progress:orders.filter(o=>o.status==='In Bearbeitung').length,done:orders.filter(o=>o.status==='Abgeschlossen').length,revenue:orders.filter(o=>o.status==='Abgeschlossen'&&o.paid).reduce((n,o)=>n+o.total,0)}});}
    const match=url.pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
    if(match&&req.method==='PATCH'){const s=requireAdmin(req,res);if(!s)return;const id=decodeURIComponent(match[1]),existing=db.prepare('SELECT * FROM orders WHERE id=?').get(id);if(!existing)return json(res,404,{error:'Bestellung nicht gefunden.'});const input=await body(req);const status=input.status===undefined?existing.status:String(input.status);if(!['Offen','In Bearbeitung','Abgeschlossen','Storniert'].includes(status))return json(res,400,{error:'Ungültiger Status.'});const paid=input.paid===undefined?Boolean(existing.paid):Boolean(input.paid);db.prepare('UPDATE orders SET status=?,paid=? WHERE id=?').run(status,paid?1:0,id);return json(res,200,{order:getOrder(db.prepare('SELECT * FROM orders WHERE id=?').get(id))});}
    if(url.pathname.startsWith('/api/'))return json(res,404,{error:'Endpunkt nicht gefunden.'});
    const pathname=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname),file=normalize(resolve(ROOT,'.'+pathname)),rel=relative(ROOT,file);if(isAbsolute(rel)||rel==='..'||rel.startsWith('..'+sep)||rel.startsWith('data'+sep)||rel==='.env'||rel.startsWith('.env.'))return json(res,403,{error:'Zugriff verweigert.'});if(!existsSync(file))return json(res,404,{error:'Datei nicht gefunden.'});res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Cache-Control':'no-cache'});res.end(readFileSync(file));
  }catch(err){console.error(err);if(!res.headersSent)json(res,500,{error:'Unerwarteter Serverfehler.'});}
});
server.listen(PORT,HOST,()=>console.log(`Schoolstore läuft auf http://localhost:${PORT} · Datenbank: ${resolve(dataDir,'schoolstore.sqlite')}`));
process.on('SIGINT',()=>{db.close();server.close(()=>process.exit(0));});
