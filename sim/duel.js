const E=require('../engine.js');
const A=+process.argv[2],B=+process.argv[3],N=+process.argv[4],seed0=+process.argv[5]||1,n=+process.argv[6]||2;const WA=JSON.parse(process.argv[7]||'null'),WB=JSON.parse(process.argv[8]||'null');
let w=[0,0],sc=[0,0],games=0,turns=0,t0=Date.now(),built=[0,0];
for(let s=1;s<=N&&Date.now()-t0<100000;s++){const G=E.newGame(['a','b','c','d'].slice(0,n),{},seed0+s*7919);
 const lv=i=>((i+s)%2===0?A:B);let g=0;G.players.forEach((p,i)=>{const w=(i+s)%2===0?WA:WB;if(w)p.bw=w;});
 try{while(!G.over&&g++<3000){E.botTurn(G,0.6,lv(G.cur));turns++;}}catch(e){console.log('ERR',e.message);continue}
 if(!G.over)continue;games++;const tot=G.final.map(f=>f.total);const mx=Math.max(...tot);
 const grp=[[],[]];tot.forEach((t,i)=>grp[(i+s)%2].push(t));
 const ba=Math.max(...grp[0]),bb=Math.max(...grp[1]);if(ba>bb)w[0]++;else if(bb>ba)w[1]++;else{w[0]+=.5;w[1]+=.5}
 sc[0]+=grp[0].reduce((a,b)=>a+b,0)/grp[0].length;sc[1]+=grp[1].reduce((a,b)=>a+b,0)/grp[1].length;
 G.players.forEach((p,i)=>built[(i+s)%2]+=p.st.built/grp[(i+s)%2].length);}
console.log(`${process.argv[7]||''} niv${A} vs ${process.argv[8]||''} niv${B} | ${games} parties | victoires ${w[0]} - ${w[1]} | score moyen ${(sc[0]/games).toFixed(1)} - ${(sc[1]/games).toFixed(1)} | bât ${(built[0]/games).toFixed(1)} - ${(built[1]/games).toFixed(1)} | tours ${(turns/games/n).toFixed(1)} | ${((Date.now()-t0)/turns).toFixed(0)} ms/tour`);
