//<---------------------BACKEND------------------>

//line 2-5 importing express,socket.io,http,chess.js
const express = require("express");
const socket = require("socket.io");
const http = require("http");
const{ Chess } = require("chess.js");
const path = require("path");

const app = express(); //creating express app instance
const server = http.createServer(app); //initialising http server with express

const io = socket(server); //socket ko chahiye http ka server jo express k server pe based ho

const chess = new Chess();

//setting up variables
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs"); //using this we can use ejs which is very similar to html
app.use(express.static(path.join(__dirname,"public"))); //by this we will be able to use static files like images, videos, fonts etc

//creating route jo render krke dega phla page i.e index page
app.get("/", (req,res) => {
    res.render("index", {title: "Chess Game"});
})


//<----------SOCKET FUNCTIONALITY------------>

//jab bhi koi banda connect hoga hmari site pe uss case mai ye function chalana uski unique information milegi jo uniquesocket m store hai and connected print krke dikha dena 
io.on("connection", function(uniquesocket){
    console.log("connected");  
   
    
    //<------------Client connection:---------->
    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", 'w');
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    }else{
        uniquesocket.emit("spectatorRole"); 
    }
 //<-----------Client disconnection:------------->
    uniquesocket.on("disconnect", function(){
        if(uniquesocket.id === players.white){
            delete players.white;
        }
        else if(uniquesocket.id === players.black){
            delete players.black;
        }
    });


    //<-------------Listen for "move" events: ---------->
    uniquesocket.on("move", (move)=> {
        try{
            //handling incorrect turn
            if(chess.turn() === "w" && uniquesocket.id !== players.white) return;

            if(chess.turn() === "b" && uniquesocket.id !== players.black) return;

            //if valid turn
            const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                io.emit("move", move);

                //handling board current state using FEN eqn that tells current state of chess board
                io.emit("boardState", chess.fen())
            }
            else{
                console.log("Invalid move: ", move);
                uniquesocket.emit("invalidMove", move);
            }

        }
        catch(err){
            console.log(err);
            uniquesocket.emit("Invalid move: ", move);
        }
    });
});



//server chalu krdia
server.listen(3000, function(){
    console.log("listening on port 3000");
});