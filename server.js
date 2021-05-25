const http = require("http");
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./localStorageFile');
const websocketServer = require("websocket").server;
const httpServer = http.createServer();
httpServer.listen(process.env.PORT || 5000 , ()=> console.log("Server Listening on Port 5000"))


var data = "temp";
var val_inval = "temp";
var set_in = "temp";

const clients = {};

const wsServer = new websocketServer({
    "httpServer" : httpServer
})

wsServer.on("request", request =>{

    const connection = request.accept(null, request.origin);
    connection.on("open", ()=> console.log("Connection Opened!"))
    connection.on("close", ()=> console.log("Connection Closed!"))
    connection.on("message", message => {
        console.log(message.utf8Data)
       
        if(message.utf8Data !=="X" && message.utf8Data !=="O" && message.utf8Data !== "x" && message.utf8Data!=="o")
{
    if(isNaN(parseInt(message.utf8Data)))
    {
        console.log("wrong input data")
        data = "Wrong input - Enter again - X/O/Number";
        connection.send(data)
       
    }
    else
    {
      val_inval = validate_config(message.utf8Data)
      if (val_inval === "valid")
      { set_in = setIndex(message.utf8Data)
      if(set_in === "Won")
      {
    data = "You Won!!"
    connection.send(data)
    connection.send("Connect to play again!")
    connection.close()
      }
    else if(set_in === "Tie")
    {
    data = "It's a Tie"
    connection.send(data)
    connection.send("Connect to play again!")
    connection.close()
    }
    else
    {
    data = set_in
    connection.send("Your move : \n "+data)
    let x = decide_opp()
    data = x.data_ret
let board = x.board
if(data === "Lost")
{
    data = "You Lost...\n" + board
    connection.send(data)
    connection.send("Connect to play again!")
    connection.close()
}
else if(data === "Tie")
{
    data = "It's a tie!!"
    connection.send(data)
    connection.send("Connect to play again!")
    connection.close()
}
else
{
    data = "PC Move :\n"+data
    connection.send(data)
}
    }

      }
      else
      {
        connection.send("Invalid configuration, Enter Again!")
      }
    }
}
else{
    if(message.utf8Data=== "X" || message.utf8Data === "x")
{let xx = init_x()
  data = xx.data
connection.send(data)
}
else
{
  let oo = init_o()
  data = oo.data
  connection.send(data)
}

}


    })
    const clientId = guid();
    clients[clientId] = {
        "connection" : connection
    }

    /*const payLoad = {
        "method" : "connect", 
        "clientId" : clientId
    }

    connection.send(JSON.stringify(payLoad))*/
    connection.send("Let's start Tic - Tac - Toe!! Start with selecting your character X/O")
})

const parse = (ar) => {
    let str = ""
  
    for(let i=0;i<9;i++)
    {
      if(i>0 && i%3 === 0)
      str+="\n"
      if(ar[i] === 1)
      str+="X "
      else if(ar[i] === 2)
      str+="O "
      else
      str+="__"
      if((i+1)%3 !== 0)
      str+="|"
    }
    return str
  }
  
const winConfig = (ar,player) => {
    return ((ar[0]===player&&ar[1]===player&&ar[2]===player)
     || (ar[3]===player&&ar[4]===player&&ar[5]===player)
     || (ar[6]===player&&ar[7]===player&&ar[8]===player)
     || (ar[0]===player&&ar[3]===player&&ar[6]===player)
     || (ar[1]===player&&ar[4]===player&&ar[7]===player)
     || (ar[2]===player&&ar[5]===player&&ar[8]===player)
     || (ar[0]===player&&ar[4]===player&&ar[8]===player)
     || (ar[2]===player&&ar[4]===player&&ar[6]===player))
  }

const movesOver = ar => {
    for(let i=0;i<9;i++)
    if(ar[i] === 0)
    return false
    return true
  }
  
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();


function init_x()
{ let arr = [0,0,0,0,0,0,0,0,0]
  localStorage.setItem("arr",JSON.stringify(arr))
  localStorage.setItem("player","X")
  return {
    "data":"__|__|__\n__|__|__\n__|__|__"
  }

}
function init_o()
{let arr = [0,0,0,0,0,0,0,0,0]
  arr[Math.floor(Math.random() * 9)] = 1
  localStorage.setItem("arr",JSON.stringify(arr))
  localStorage.setItem("player","O")
  return {
    "data" : parse(arr)
  }
  
}

function validate_config(text)
{
  let arr = JSON.parse(localStorage.getItem("arr"))
  if(arr[text] !== 0)
  return "invalid"
  else
  return "valid"
}

function setIndex(text)
{
  let arr = JSON.parse(localStorage.getItem("arr"))
  let player = localStorage.getItem("player") === "X" ? 1 : 2
  arr[text] = player
  if(winConfig(arr,player))
  return "Won"
  if(movesOver(arr))
  return "Tie"
  console.log(player,arr)
  localStorage.setItem("arr",JSON.stringify(arr))
  return parse(arr)
}
function decide_opp()
{
  let arr = JSON.parse(localStorage.getItem("arr"))
  let opponent = localStorage.getItem("player") === "X" ? 2:1
  let moves = []
  for(let i=0;i<9;i++)
  if(arr[i] === 0)
  moves.push(i)

  arr[moves[Math.floor(Math.random() * moves.length)]] = opponent

  if(winConfig(arr,opponent))
  return {"data_ret" : "Lost","board":parse(arr)}
  else if(movesOver(arr))
  return {"data_ret" : "Tie"}

  localStorage.setItem("arr",JSON.stringify(arr))
  return {"data_ret" : parse(arr)}
}




    