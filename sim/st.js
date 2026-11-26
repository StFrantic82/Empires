const E=require('../engine.js');
const n=+process.argv[2],N=+process.argv[3],seed=+process.argv[4],out=process.argv[5];
const cs={},R=[];let avail={};
for(let s=1;s<=N;s++){const G=E.newGame(Array.from({length:n},(_,i)=>'B'+i),{},seed+s*7919);let g=0;try{while(!G.over&&g++<3000)E.botTurn(G);}catch(e){continue}if(!G.over)continue;
 R.push({r:G.endReason,t:G.players.reduce((a,p)=>a+p.st.turns,0)/n,b:G.players.reduce((a,p)=>a+p.st.built,0)/n,a:G.players.reduce((a,p)=>a+p.st.acts,0)/n,ej:G.players.reduce((a,p)=>a+p.st.ejected,0)/n,f:G.final.map(f=>[f.bat,f.fin,f.wond,f.tokens,f.total]),w:G.winner,start:G.start,mk:E.placedOnWonders(G)/n,wh:G.players.reduce((a,p)=>a+E.wheelCount(p),0)/n});
 for(const id in G.cs||{}){const c=(cs[id]=cs[id]||{b:0,held:0,wins:0});c.b+=G.cs[id].b;}
 G.players.forEach((p,i)=>p.grid.forEach(cell=>{if(cell){const c=(cs[cell.id]=cs[cell.id]||{b:0,held:0,wins:0});c.held++;if(i===G.winner)c.wins++;}}));}
require('fs').writeFileSync(out,JSON.stringify({n,R,cs}));
