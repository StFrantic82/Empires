const E=require('../engine.js');const fs=require('fs');
const files=process.argv.slice(2);let R=[],cs={},n;
for(const f of files){if(!fs.existsSync(f))continue;const d=JSON.parse(fs.readFileSync(f));n=d.n;R=R.concat(d.R);for(const k in d.cs){const c=(cs[k]=cs[k]||{b:0,held:0,wins:0});c.b+=d.cs[k].b;c.held+=d.cs[k].held;c.wins+=d.cs[k].wins;}}
const avg=f=>(R.reduce((a,x)=>a+f(x),0)/R.length).toFixed(1);const why=r=>Math.round(100*R.filter(x=>x.r===r).length/R.length);
console.log(n+'j',R.length,'parties | tours',avg(x=>x.t),'bât',avg(x=>x.b),'activ',avg(x=>x.a),'retraites',avg(x=>x.ej),'marqueurs/j',avg(x=>x.mk),'roue fin',avg(x=>x.wh),'| fin Merv',why('Merveilles')+'% Ville',why('Ville complète')+'% Pioche',why('Pioche épuisée')+'%');
console.log(' pts moy: bât',avg(x=>x.f.reduce((a,f)=>a+f[0],0)/n),'fin',avg(x=>x.f.reduce((a,f)=>a+f[1],0)/n),'merv',avg(x=>x.f.reduce((a,f)=>a+f[2],0)/n),'jetons',avg(x=>x.f.reduce((a,f)=>a+f[3],0)/n),'| gagnant',avg(x=>Math.max(...x.f.map(f=>f[4]))),'écart',avg(x=>Math.max(...x.f.map(f=>f[4]))-Math.min(...x.f.map(f=>f[4]))),'| 1er joueur gagne',Math.round(100*R.filter(x=>x.w===x.start).length/R.length)+'%');
if(process.env.CARDS){const base=1/n;const rows=E.CARDS.map(c=>{const s=cs[c.id]||{b:0,held:0,wins:0};return [c.id,c.name,c.lvl,E.cardValue(c),c.pv,(s.b/R.length).toFixed(2),s.held?Math.round(100*s.wins/s.held):'-',s.held]});
 rows.sort((a,b)=>a[2]-b[2]||b[5]-a[5]);for(const r of rows)console.log(r.join(' | '));}
