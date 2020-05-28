var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var data;

var sentenceX = canvas.width/2; var sentenceY = 0;

var sentenceDx = 0; var sentenceDy = 0.25;

var pauseTicks = 15;
var pauseRemaining = 0;
var isPaused = false;

var chosenAnswerIndex = 0;
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

var isGameOver = false;

var isLaser = 0;
var laserColour = "green";
var laserX;
var laserY;

function Init(){
    loadJSON(function(response){
        data = JSON.parse(response);
        StartGame();
        updateLoop = setInterval(Update, 10);
    });
}

function StartGame(){
    isGameOver = false;
    score = 0;
    lives = 3;
    sentenceX = canvas.width/2;
    sentenceY = -10;
    sentenceDx = 0;
    sentenceDy = 0.25;

    GetSentence();
}

function Update(){
    Draw();
    
    if(!isGameOver){
        Game();
    }
}

//#region Game

function Game(){
    if(isPaused){
        if(pauseRemaining <= 0){
            if(GameOverCheck()){
                GameOver();
            }else{
                NextSentence();
            }
            isPaused = false;
        }else{
            pauseRemaining--;
        }
        
    }else{
        sentenceX += sentenceDx;
        sentenceY += sentenceDy;
    }

    GetKeys();

    if(sentenceY > canvas.height - 60){
        lives -= 1;
        sentenceY = 0;
    }
    
}

function GetKeys(){
    if((leftPressed && !leftWasPressed) || (rightPressed && !rightWasPressed)){
        let answer;
        //Left pressed
        if(leftPressed){
            leftWasPressed = true; 
            answer = answerLeft;
            chosenAnswerIndex = 0;
        }
        //Right pressed
        if(rightPressed){
            rightWasPressed = true;
            answer = answerRight;
            chosenAnswerIndex = 1;
        }

        if(answer === correctAnswer){
            Correct();
        }else{
            Incorrect();
        }

        laserX = sentenceX + ctx.measureText(sentence).width/2;
        laserY = sentenceY;

        console.log("Laser X: "+laserX+"; Laser Y: "+laserY);

        isPaused = true;
        pauseRemaining = pauseTicks;
    }

}

function Correct(){
    score += 1;
    isLaser = 15;
    laserColour = "green";
}

function Incorrect(){
    lives -= 1;
    isLaser = 15;
    laserColour = "red";
}

function NextSentence(){
    sentenceY = -10;
    sentenceDy = 0.25 + score * 0.05;
    
    GetSentence();
}

function GameOverCheck(){
    return lives < 0;
}

function GameOver(){
    isGameOver = true;
    lives = 0;
    sentenceY = -30;
    isLaser = 0;
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



//#endregion

//#region Draw

function Draw(){
    ctx.clearRect(0,0, canvas.width, canvas.height);

    drawSentence();
    drawUI();
    drawAnswers();
    if(isLaser > 0){
        isLaser--;
        drawLaser();
    }
}

function drawUI(){
    ctx.font = "16px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText("Score: "+score, 8, 20);
    ctx.fillText("Lives: "+lives, 8, 40);

    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = "3";
    
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

    if(isGameOver){
        ctx.font = "48px Arial";
        ctx.fillStyle = "#000000";
        let txt = "GAME OVER";
        x = centreX(txt, canvas.width/2);
        ctx.fillText(txt,x,canvas.height/2);
        ctx.font = "24px Arial"
        txt = "Press Enter to restart.";
        x = centreX(txt, canvas.width/2);
        ctx.fillText(txt,x,canvas.height/2 + 40);
    }
}

function drawSentence(){
    ctx.font = "24px Arial";
    ctx.fillStyle = "#000000";
    //sentenceX = (canvas.width/2) -  (ctx.measureText(sentence).width/2)
    sentenceX = centreX(sentence, canvas.width/2);
    //console.log(sentenceX +" "+ sentenceY);
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
    ctx.strokeStyle = laserColour;
    //ctx.rect(canvas.width/2 - 50, canvas.height/2- 50, 100, 100);
    ctx.lineWidth = 5;
    ctx.moveTo(answerX[chosenAnswerIndex], answerY);
    ctx.lineTo(laserX, laserY);
    
    //ctx.fill();
    ctx.stroke();
    ctx.closePath();
    
    ctx.beginPath();
    ctx.fillStyle = "orange";
    ctx.arc(laserX, laserY, 20, 0, Math.PI*2);
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
    if(e.key == "Enter" && isGameOver){
        StartGame();
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
        }else if(wildCard == "ANOUN"){
            replacement = data.nounsAnimate[RandIndex(data.nounsAnimate.length)];
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
