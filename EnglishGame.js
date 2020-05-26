var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var data;

var sentenceX = canvas.width/2;
var sentenceY = 0;

var sentenceDx = 0;
var sentenceDy = 0.25;

var answerX = [canvas.width * 0.25, canvas.width * 0.75];
var answerY = canvas.height - 30;

var score = 0;
var lives = 3;

var sentence;
var answerLeft;
var answerRight;
var correctAnswer;

var rightPressed = false;
var leftPressed = false;
var rightWasPressed = false;
var leftWasPressed = false;

var updateLoop;

var gameOver = false;

var isLaser = 0;
var laserColour = "green";

function Init(){
    loadJSON(function(response){
        data = JSON.parse(response);
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
    if((leftPressed && !leftWasPressed) || (rightPressed && !rightWasPressed)){
        let answer;
        //Left pressed
        if(leftPressed){
            leftWasPressed = true; 
            answer = answerLeft;
        }
        //Right pressed
        if(rightPressed){
            rightWasPressed = true;
            answer = answerRight;
        }

        if(answer === correctAnswer){
            Correct();
        }else{
            Incorrect();
        }

        sentenceY = 0;
        sentenceDy = 0.25 + score * 0.05;
        
        GetSentence();
    }

}

function Correct(){
    score += 1;
    isLaser = 10;
    laserColour = "green";
}

function Incorrect(){
    lives -= 1;
    isLaser = 10;
    laserColour = "red";
}

function GameOverCheck(){
    if(lives < 0){
        lives = 0;
        clearInterval(updateLoop);
        sentenceY = -30;
        gameOver = true;
        isLaser = 0;
        Draw();
    }
}

function GetSentence(){
    let index = RandIndex(data.sentences.length);
    sentence = ProcessText(data.sentences[index].text);

    sentence = sentence[0].toUpperCase() + sentence.slice(1);

    //sentence = allSentences.sentences[index].text;
    correctAnswer = ProcessText(data.sentences[index].correctAnswer);
    
    //Randomly order the answers
    let order = Math.random() >= 0.5;
    if(order){
        answerLeft = correctAnswer;
        answerRight = ProcessText(data.sentences[index].wrongAnswer);
    }else{
        answerRight = correctAnswer;
        answerLeft = ProcessText(data.sentences[index].wrongAnswer);
    }
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
    if(isLaser > 0){
        isLaser -= 1;
        drawLaser();
    }
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

    if(gameOver){
        ctx.font = "48px Arial";
        ctx.fillStyle = "#000000";
        let txt = "GAME OVER";
        x = centreX(txt, canvas.width/2);
        ctx.fillText("GAME OVER",x,canvas.height/2);
    }
}

function drawSentence(){
    ctx.font = "24px Arial";
    ctx.fillStyle = "#000000";
    //sentenceX = (canvas.width/2) -  (ctx.measureText(sentence).width/2)
    sentenceX = centreX(sentence, canvas.width/2);
    ctx.fillText(sentence, sentenceX, sentenceY);
}

function drawAnswers(){
    ctx.font = "24px Arial";
    ctx.fillStyle = "#000000";
    let x = centreX(answerLeft, canvas.width * 0.25);
    ctx.fillText(answerLeft, x, answerY);
    
    ctx.font = "24px Arial";
    ctx.fillStyle = "#000000";
    x = centreX(answerRight, canvas.width * 0.75);
    ctx.fillText(answerRight, x, answerY);

}

function drawLaser(){
    ctx.beginPath();
    ctx.fillStyle = laserColour;
    ctx.rect(canvas.width/2 - 50, canvas.height/2- 50, 100, 100);
    ctx.fill();
    ctx.closePath();
}

function centreX(text, x){
    return x - (ctx.measureText(text).width/2);
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

//#region Processing

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
/**
 * @param {String} text - The date
 */
function ProcessText(text){
    if(!text.includes("%")){
        return text;
    }

    // Text includes a % sign
    
    let finishedText = text;
    while(finishedText.includes("%")){
        let str = finishedText;
        let wildCard = str.split("%")[1];
        let replacement = "";
        
        if(wildCard == "NOUN"){
            replacement = data.nounsSingular[RandIndex(data.nounsSingular.length)];
        }else if(wildCard == "NOUNS"){
            replacement = data.nounsPlural[RandIndex(data.nounsPlural.length)];
        }else if(wildCard == "VERBT"){
            replacement = data.verbsT[RandIndex(data.verbsT.length)];
        }else if(wildCard == "VERBI"){
            replacement = data.verbsI[RandIndex(data.verbsI.length)];
        }else if(wildCard == "VERBING"){
            replacement = data.verbsGerund[RandIndex(data.verbsGerund.length)];
        }else if(wildCard == "ADJECTIVE"){
            replacement = data.adjectives[RandIndex(data.adjectives.length)];
        }
        
        finishedText = finishedText.replace("%"+wildCard+"%", replacement);
    }

    return finishedText;
    
}

function RandIndex(max){
    return Math.floor(Math.random() * max);
}

//#endregion
Init();
