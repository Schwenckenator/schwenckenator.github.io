var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var allSentences;

var sentenceX = canvas.width/2;
var sentenceY = 0;

var sentenceDx = 0;
var sentenceDy = 0.25;

const answerX = [canvas.width * 0.25, canvas.width * 0.75];
const answerY = canvas.height - 30;

var score = 0;
var lives = 3;

//These will need to be put in a file
//var sentence = "Hello, my name ___ John.";
//var answerLeft = "are"
//var answerRight = "is"
//var correctAnswer = "is";
var sentence;
var answerLeft;
var answerRight;
var correctAnswer;

var rightPressed = false;
var leftPressed = false;
var rightWasPressed = false;
var leftWasPressed = false;

var updateLoop;

function Init(){
    loadJSON(function(response){
        allSentences = JSON.parse(response);
        StartGame();
    });
}

function Update(){
    Draw();
    Game();
}

//#region Game

function Game(){

    sentenceX += sentenceDx;
    sentenceY += sentenceDy;

    GetKeys();
    

    if(sentenceY > canvas.height - 60){
        lives -= 1;
        sentenceY = 0;
    }

    GameOverCheck();
}

function GetKeys(){
    if(leftPressed && !leftWasPressed){
        if(answerLeft === correctAnswer){
            score += 1;
        }else{
            lives -= 1;
        }
        sentenceY = 0;
        leftWasPressed = true;
        GetSentence();
    }

    if(rightPressed && !rightWasPressed){
        if(answerRight === correctAnswer){
            score += 1;
        }else{
            lives -= 1;
        }
        sentenceY = 0;
        rightWasPressed = true
        GetSentence();
    }
}

function GameOverCheck(){
    if(lives < 0){
        lives = 0;
        alert("Game OVER");
        clearInterval(updateLoop);
        sentenceY = -30;
        Draw();
    }
}

function GetSentence(){
    let index = Math.floor(Math.random() * allSentences.sentences.length);
    sentence = allSentences.sentences[index].text;
    correctAnswer = allSentences.sentences[index].correctAnswer;
    
    answerLeft = allSentences.sentences[index].correctAnswer;
    answerRight = allSentences.sentences[index].wrongAnswer;
    
}

function StartGame(){
    score = 0;
    lives = 3;
    sentenceX = canvas.width/2;
    sentenceY = 0;
    GetSentence();
    updateLoop = setInterval(Update, 10);
}

//#endregion

//#region Draw

function Draw(){
    ctx.clearRect(0,0, canvas.width, canvas.height);

    drawSentence();
    drawUI();
    drawAnswers();
}

function drawUI(){
    ctx.font = "16px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText("Score: "+score, 8, 20);
    ctx.fillText("Lives: "+lives, 8, 40);

    ctx.beginPath();
    
    let x1 = 0;
    let x2 = canvas.width;
    let y = canvas.height - 60;
    
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);

    let x= canvas.width/2;
    let y1 = y;
    let y2 = canvas.height;

    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
    ctx.closePath();
}

function drawSentence(){
    ctx.font = "24px Arial";
    ctx.fillStyle = "#000000";
    sentenceX = (canvas.width/2) -  (ctx.measureText(sentence).width/2)
    ctx.fillText(sentence, sentenceX, sentenceY);
}

function drawAnswers(){
    ctx.font = "24px Arial";
    ctx.fillStyle = "#000000";

    ctx.fillText(answerLeft, answerX[0], answerY);
    
    ctx.font = "24px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(answerRight, answerX[1], answerY);

}

//#endregion

//#region Input
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e){
    if(e.key == "Right" || e.key == "ArrowRight"){
        rightPressed = true;
    }
    if(e.key == "Left" || e.key == "ArrowLeft"){
        leftPressed = true;
    }
}

function keyUpHandler(e){
    if(e.key == "Right" || e.key == "ArrowRight"){
        rightPressed = false;
        rightWasPressed = false;
    }
    if(e.key == "Left" || e.key == "ArrowLeft"){
        leftPressed = false;
        leftWasPressed = false;
    }
}

//#endregion

//#region LoadFile

function loadJSON(callback){
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'Sentences.json', true);
    xobj.onreadystatechange = function(){
        if(xobj.readyState == 4 && xobj.status == "200"){
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

//#endregion
Init();
