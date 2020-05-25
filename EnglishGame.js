var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");


var x = canvas.width/2;
var y = 0;

var dx = 0;
var dy = 0.25;

var score = 0;

var sentence = "Hello, my name ___ John.";

function draw(){
    ctx.clearRect(0,0, canvas.width, canvas.height);

    drawSentence();
    drawScore();

    x += dx;
    y += dy;
}

function drawScore(){
    ctx.font = "16px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText("Score: "+score, 8, 20);
}

function drawSentence(){
    ctx.font = "24px Arial";
    ctx.fillStyle = "#000000";
    x = (canvas.width/2) -  (ctx.measureText(sentence).width/2)
    ctx.fillText(sentence, x, y);
}

setInterval(draw, 10);