
let state={
round:1,
current:0,
players:[
{name:"Gracz 1",hp:12},
{name:"Gracz 2",hp:12},
{name:"Gracz 3",hp:12},
{name:"Gracz 4",hp:12}
]
}

const playersDiv=document.getElementById("players")
const roundEl=document.getElementById("round")
const currentPlayerEl=document.getElementById("currentPlayer")

function render(){

roundEl.innerText=state.round
currentPlayerEl.innerText=state.players[state.current].name

playersDiv.innerHTML=""

state.players.forEach((p,i)=>{

let div=document.createElement("div")
div.className="player"

if(i===state.current) div.classList.add("active")

div.innerHTML=`
<b>${p.name}</b>
<div class="hp">❤️ ${p.hp}</div>
<button onclick="hp(${i},-1)">-1</button>
<button onclick="hp(${i},1)">+1</button>
`

playersDiv.appendChild(div)

})

}

function hp(i,d){
state.players[i].hp+=d
render()
}

document.getElementById("nextTurn").onclick=function(){
state.current=(state.current+1)%state.players.length
if(state.current===0) state.round++
render()
}

render()
