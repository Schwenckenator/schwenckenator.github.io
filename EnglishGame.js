var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var data;

var sentenceStartY = -10;
//var sentenceX = canvas.width/2; var sentenceY = 0;
//var sentenceXOffset = 0;

var baseSentenceDx = 0; var baseSentenceDy = 0.25;
//var sentenceDx = baseSentenceDx; var sentenceDy = baseSentenceDy;
var wrongSentenceDdy = 0.05;
var gotWrongAnswer = false;

var pauseTicks = 15;
var pauseRemaining = 0;
var isPaused = false;
var ticks = 0;
var sinOffset = 0;
var baseFreq = 0.01;
var changeFreq = 0.001;
var freq = baseFreq;

var chosenAnswerIndex = 0;
var answerX = [canvas.width * 0.25, canvas.width * 0.75];
var answerY = canvas.height - 30;

var score = 0;
var lives = 3;

var sentence = {
    text: "",
    x:0,
    y:0,
    dx:0,
    dy:0,
    xOffset:0
};

var answerLeft;
var answerRight;
var correctAnswer;

var rightPressed = false;
var leftPressed = false;
var rightWasPressed = false;
var leftWasPressed = false;

var updateLoop;

var isGameOver = false;

var canLaser = true;
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
     
    sentence.x = canvas.width/2;
    sentence.y = sentenceStartY;
    sentence.dx = baseSentenceDx;
    sentence.dy = baseSentenceDy;
    freq = baseFreq;

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
            NextSentence();
            isPaused = false;
        }else{
            pauseRemaining--;
        }
        return;
    }


    if(gotWrongAnswer){
        sentence.dy += wrongSentenceDdy;
    }else{
        let amp = 50;

        sentence.xOffset = amp*(Math.sin(freq*ticks + sinOffset));
    }

    sentence.y += sentence.dy;
    
    if(canLaser){
        GetKeys();
    }
    

    if(sentence.y > canvas.height - 60){
        lives -= 1;
        CalculateDy();
        canLaser = true;
        gotWrongAnswer = false;
        
        if(GameOverCheck()){
            GameOver();
        }else{
            NextSentence();
        }
    }
    ticks++;
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
            isPaused = true;
            pauseRemaining = pauseTicks;
        }else{
            Incorrect();
        }
        isLaser = pauseTicks;
        laserX = sentence.x + sentence.xOffset + ctx.measureText(sentence.text).width/2;
        laserY = sentence.y;

        console.log("Laser X: "+laserX+"; Laser Y: "+laserY);

    }

}

function Correct(){
    score += 1;
    laserColour = "green";
}

function Incorrect(){
    laserColour = "red";
    canLaser = false;
    gotWrongAnswer = true;
}

function NextSentence(){
    sentence.y = sentenceStartY;
    sentence.xOffset = 0;
    ticks = 0;
    sinOffset = Math.random() * 2 * Math.PI;
    freq = baseFreq + score * changeFreq;
    CalculateDy();
    
    GetSentence();
}

function CalculateDy(){
    sentence.dy = 0.25 + score * 0.05;
}

function GameOverCheck(){
    return lives < 0;
}

function GameOver(){
    isGameOver = true;
    lives = 0;
    sentence.y = -30;
    isLaser = 0;
}

function GetSentence(){
    let index = RandIndex(data.sentences.length);
    let text = ProcessText(data.sentences[index].text);

    sentence.text = text[0].toUpperCase() + text.slice(1);

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
    sentence.x = centreX(sentence.text, canvas.width/2);
    ctx.fillText(sentence.text, sentence.x+sentence.xOffset, sentence.y);
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
    console.log("Key down handler");
    if(e.key == "Right" || e.key == "ArrowRight"){
        console.log("Right pressed");
        rightPressed = true;
    }
    if(e.key == "Left" || e.key == "ArrowLeft"){
        console.log("Left pressed");
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
 * @param {String} text 
 */
function ProcessText(text){
    if(!text.includes("%")){
        return text;
    }

    // Text includes a % sign
    //debugger;
    let finishedText = text;
    console.log("New Sentence is: " + text);
    while(finishedText.includes("%")){
        console.log("Sentence is currently: " + finishedText);
        let str = finishedText;
        let wildCard = str.split("%")[1];
        let replacement = "";
        
        for(const partOfSpeech of data.partsOfSpeech){
            console.log(partOfSpeech.name);
            if(wildCard == partOfSpeech.keyword){
                console.log("Found keyword "+partOfSpeech.keyword);
                replacement = partOfSpeech.words[RandIndex(partOfSpeech.words.length)];
                break;
            }
        }
        
        finishedText = finishedText.replace("%"+wildCard+"%", replacement);
    }
    console.log("Finished sentence is: " + finishedText);
    return finishedText;
    
}

function RandIndex(max){
    return Math.floor(Math.random() * max);
}

//#endregion
Init();
