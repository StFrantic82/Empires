const E=require('../engine.js');
const o=JSON.parse(process.argv[3]),N=30,n=4;const R=[];
for(let s=1;s<=N;s++){const G=E.newGame(['a','b','c','d'],o,9000+s*7919);let g=0;try{while(!G.over&&g++<3000)E.botTurn(G);}catch(e){console.log('ERR',e.message)}if(G.over)R.push(G);}
const why=r=>R.filter(G=>G.endReason===r).length;const avg=f=>(R.reduce((a,G)=>a+f(G),0)/R.length).toFixed(1);
console.log(process.argv[2].padEnd(34),'| tours/j',avg(G=>G.players.reduce((a,p)=>a+p.st.turns,0)/n),'| guilde',avg(G=>G.players.reduce((a,p)=>a+p.st.guild,0)/n),'| bât',avg(G=>G.players.reduce((a,p)=>a+p.st.built,0)/n),'| fin Merv',why('Merveilles'),'Ville',why('Ville complète'),'Pioche',why('Pioche épuisée'),'| gagnant',avg(G=>Math.max(...G.final.map(f=>f.total))));
