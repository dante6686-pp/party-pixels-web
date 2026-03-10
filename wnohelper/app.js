
let state=null
let history=[]

const setup=document.getElementById("setup")
const game=document.getElementById("game")

const playerNamesDiv=document.getElementById("playerNames")
const playerCount=document.getElementById("playerCount")

const startBtn=document.getElementById("startBtn")
const startHP=document.getElementById("startHP")

const roundEl=document.getElementById("round")
const currentPlayerEl=document.getElementById("currentPlayer")

const playersDiv=document.getElementById("players")

const nextTurn=document.getElementById("nextTurn")
const undo=document.getElementById("undo")

const resetBtn=document.getElementById("resetBtn")

function createNameFields(){
playerNamesDiv.innerHTML=""
for(let i=0;i<playerCount.value;i++){
let input=document.createElement("input")
input.value="Gracz "+(i+1)
playerNamesDiv.appendChild(input)
}
}

playerCount.onchange=createNameFields
createNameFields()

function startGame(){
let players=[]
let inputs=playerNamesDiv.querySelectorAll("input")

for(let i=0;i<inputs.length;i++){
players.push({
name:inputs[i].value,
hp:Number(startHP.value),
disgrace:false,
skip:false,
dead:false
})
}

state={
round:1,
current:0,
players:players
}

setup.classList.add("hidden")
game.classList.remove("hidden")
resetBtn.classList.remove("hidden")

render()
}

startBtn.onclick=startGame

function render(){

roundEl.innerText=state.round
currentPlayerEl.innerText=state.players[state.current].name

playersDiv.innerHTML=""

if(state.players.length>2) playersDiv.classList.add("multi")
else playersDiv.classList.remove("multi")

state.players.forEach((p,i)=>{

let div=document.createElement("div")
div.className="player"

if(i===state.current) div.classList.add("active")

div.innerHTML=`
<b>${p.name}</b>
<div class="hp">❤️ ${p.hp}</div>
<button onclick="hp(${i},-1)">-1</button>
<button onclick="hp(${i},1)">+1</button>
<button onclick="disgrace(${i})">${p.disgrace?"Usuń Hańbę":"Daj Hańbę"}</button>
`

playersDiv.appendChild(div)

})
}

function hp(i,d){

history.push(JSON.stringify(state))

state.players[i].hp+=d

if(state.players[i].hp<=0){
state.players[i].hp=0
state.players[i].dead=true
}

render()
}

function disgrace(i){

history.push(JSON.stringify(state))

let p=state.players[i]

if(!p.disgrace){
p.disgrace=true
p.skip=true
}else{
p.disgrace=false
p.skip=false
}

render()
}

nextTurn.onclick=function(){

history.push(JSON.stringify(state))

let p=state.players[state.current]

if(p.disgrace && p.skip){
p.skip=false
p.disgrace=false
}

let prev=state.current

do{
state.current=(state.current+1)%state.players.length
}while(state.players[state.current].dead)

if(state.current<=prev) state.round++

render()

}

undo.onclick=function(){
if(history.length){
state=JSON.parse(history.pop())
render()
}
}

resetBtn.onclick=function(){
location.reload()
}
