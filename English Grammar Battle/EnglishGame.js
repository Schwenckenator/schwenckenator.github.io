var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var explosionSheet = document.getElementById("explosion");
var nightSky = document.getElementById("nightSky");
const explSpriteSize = 64;
const expColNum = 4;
const textColour = "#EEEEEE";
const uiColour = "#EEEEEE";
const textFlashColour = "#FF0000";
const backgroundColour = "#000936"

var data;

var sentenceStartY = -10;

var baseSentenceDx = 0; var baseSentenceDy = 0.25;
var wrongSentenceDdy = 0.05;
var gotWrongAnswer = false;

var freezeTicks = 15;
var freezeRemaining = 0;
var isFrozen = false;
var tick = 0;
var sinOffset = 0;
var baseFreq = 0.01;
var changeFreq = 0.001;
var freq = baseFreq;

var chosenAnswerIndex = 0;
var chosenAnswer;
var answerX = [canvas.width * 0.25, canvas.width * 0.75];
var answerY = canvas.height - 30;

var score = 0;
var lives = 3;

var sentence = {
    text: "",
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    xOffset: 0
};

var answerLeft = new answer("", 0);
var answerRight = new answer("", 1);
var correctAnswer;
var isMoveAnswer = false;
var answerMoveTime = 50; //ticks
var answerMoveTicksRemaining = 50;

var rightPressed = false;
var leftPressed = false;
var rightWasPressed = false;
var leftWasPressed = false;

var updateLoop;

var isGameOver = false;

var canAnswer = true;
var isLaser = 0;
var laserColour = "green";
var laserX;
var laserY;

var explosion = {
    isExplosion: false,
    frameNumber: 0,
    totalFrames: 16,
    pos: { x:0, y:0 },
    scale: { x:1, y:1 },
    GetFrameCrop: function(num){
        num = Math.floor(num);
        let x = (num % expColNum) * explSpriteSize;
        let y = Math.floor(num / expColNum) * explSpriteSize;
        return { x:x, y:y };
    },
    StartExp: function(x, y, sx=2, sy=2){
        this.frameNumber = 0;
        this.isExplosion = true;
        this.scale.x = sx;
        this.scale.y = sy;
        this.pos.x = x - (explSpriteSize / 2) * sx;
        this.pos.y = y - (explSpriteSize / 2) * sy;

    }
}

var correctSound = new sound("laser_shot_correct.mp3");
var wrongSound = new sound("laser_shot_incorrect.wav");
var explosionSound = new sound("explosion_large_08.wav");
var music = new sound("edm-detection-mode-by-kevin-macleod-from-filmmusic-io.mp3");

var isPaused = false;
var isStart = true;

function Init(){
    loadJSON(function(response){
        data = JSON.parse(response);
        updateLoop = setInterval(Update, 10);
    });
    
}

function StartGame(){
    if(isStart){
        //First time
        music.play();
        music.sound.loop = true;
    }

    isStart = false;
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
    if(!isStart && !isGameOver){
        Game();
    }
}

//#region Game

function Game(){
    if(isPaused) return;

    if(isFrozen){
        if(freezeRemaining <= 0){
            NextSentence();
            isFrozen = false;
        }else{
            freezeRemaining--;
        }
        return;
    }
    if(isMoveAnswer){
        chosenAnswer.x += chosenAnswer.dx;
        chosenAnswer.y += chosenAnswer.dy;
        if(answerMoveTicksRemaining-- <= 0){
            CheckAnswer();
            isMoveAnswer = false;
            chosenAnswer.dy = 0;
            chosenAnswer.dx = 0;
        }
        return;
    }
    

    if(gotWrongAnswer){
        sentence.dy += wrongSentenceDdy;
        chosenAnswer.dy += wrongSentenceDdy;
        chosenAnswer.y += chosenAnswer.dy;
    }else{
        let amp = 50;
        sentence.xOffset = amp*(Math.sin(freq*tick + sinOffset));
    }

    sentence.y += sentence.dy;
    
    if(canAnswer){
        GetKeys();
    }
    
    if(sentence.y > canvas.height - 60){
        lives -= 1;
        CalculateDy();
        canAnswer = true;
        gotWrongAnswer = false;

        let x = sentence.x + sentence.xOffset + ctx.measureText(sentence.text).width/2;
        let y =  sentence.y - 50;
        explosion.StartExp(x,y, 5, 5);
        explosionSound.playFromStart();
        
        if(GameOverCheck()){
            GameOver();
        }else{
            NextSentence();
        }
    }
    tick++;
}

function GetKeys(){
    
    if((leftPressed && !leftWasPressed) || (rightPressed && !rightWasPressed)){
        
        //let chosenAnswer;
        //Left pressed
        if(leftPressed){
            leftWasPressed = true; 
            chosenAnswer = answerLeft;
            chosenAnswerIndex = 0;
        }
        //Right pressed
        if(rightPressed){
            rightWasPressed = true;
            chosenAnswer = answerRight;
            chosenAnswerIndex = 1;
        }

        //isLaser = freezeTicks;
        laserX = sentence.x + sentence.xOffset + ctx.measureText(sentence.text).width/2;
        laserY = sentence.y;

        let senX = sentence.x+sentence.xOffset + ctx.measureText(sentence.text).width/2

        SetAnswerDxDy(chosenAnswer.x, chosenAnswer.y, senX, sentence.y, answerMoveTime);
        isMoveAnswer = true;


        console.log("Laser X: "+laserX+"; Laser Y: "+laserY);

    }

}

function CheckAnswer(){
    if(chosenAnswer.text === correctAnswer){
        Correct();
        explosion.StartExp(laserX, laserY);
    }else{
        Incorrect();
    }
}

function Correct(){
    score += 1;
    laserColour = "green";
    isFrozen = true;
    freezeRemaining = freezeTicks;
    correctSound.playFromStart();
    sentence.y = sentenceStartY;
    chosenAnswer.y = sentenceStartY;
}

function Incorrect(){
    laserColour = "red";
    canAnswer = false;
    gotWrongAnswer = true;
    wrongSound.playFromStart();
}

function NextSentence(){
    sentence.y = sentenceStartY;
    sentence.xOffset = 0;
    tick = 0;
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
    wrongAnswer = ProcessText(data.sentences[index].wrongAnswer);
    //Randomly order the answers
    let isLeftCorrect = Math.random() >= 0.5;
    if(isLeftCorrect){
        answerLeft = new answer(correctAnswer, 0);
        answerRight = new answer(wrongAnswer, 1);
    }else{
        answerLeft = new answer(wrongAnswer, 0);
        answerRight = new answer(correctAnswer, 1);
    }
}

function SetAnswerDxDy(ansX, ansY, senX, senY, moveTime){
    chosenAnswer.dx = (senX - ansX) / moveTime;
    chosenAnswer.dy = (senY - ansY) / moveTime;
    answerMoveTicksRemaining = moveTime;
}


//#endregion

//#region Draw

function Draw(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.drawImage(nightSky, 0, 0);

    if(isStart){
        DrawStartMenu();
        return;
    }

    if(isPaused){
        DrawPaused();
        return;
    }



    if(isGameOver){
        DrawGameOver();
        if(explosion.isExplosion){
            drawExplosion();
        }
        return;
    }

    drawSentence();
    drawUI();
    drawAnswers();
    if(isLaser > 0){
        isLaser--;
        drawLaser();
    }
    if(explosion.isExplosion){
        drawExplosion();
    }
}

function DrawPaused(){

    ctx.font = "48px Arial";
    ctx.fillStyle = textColour;
    let txt = "PAUSED";
    x = centreX(txt, canvas.width/2);
    ctx.fillText(txt,x,canvas.height/2 - 40);

    ctx.font = "24px Arial"
    txt = "Press Escape to continue.";
    x = centreX(txt, canvas.width/2);
    ctx.fillText(txt,x,canvas.height/2);
}

function DrawGameOver(){
    
    ctx.font = "48px Arial";
    ctx.fillStyle = textColour;
    let txt = "GAME OVER";
    x = centreX(txt, canvas.width/2);
    ctx.fillText(txt,x,canvas.height/2 - 40);
    ctx.font = "24px Arial"
    txt = "Final Score: "+score;
    x = centreX(txt, canvas.width/2);
    ctx.fillText(txt,x,canvas.height/2);
    ctx.font = "24px Arial"
    txt = "Press Enter to restart.";
    x = centreX(txt, canvas.width/2);
    ctx.fillText(txt,x,canvas.height/2 + 40);
}

function DrawStartMenu(){
    let txt;

    ctx.font = "48px Arial";
    ctx.fillStyle = uiColour;
    txt = "ENGLISH";
    x = centreX(txt, canvas.width/2);
    ctx.fillText(txt,x,canvas.height/2 - 40);

    txt = "GRAMMAR BATTLE";
    x = centreX(txt, canvas.width/2);
    ctx.fillText(txt,x,canvas.height/2 + 5);

    ctx.font = "24px Arial"
    txt = "Press Enter to start.";
    x = centreX(txt, canvas.width/2);
    ctx.fillText(txt,x,canvas.height/2 + 40);
}

function drawUI(){
    ctx.beginPath();

    ctx.fillStyle = backgroundColour;
    ctx.rect(0, canvas.height - 60, canvas.width, 60);
    ctx.fill();

    ctx.strokeStyle = uiColour;
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

    ctx.font = "16px Arial";
    ctx.fillStyle = uiColour;
    ctx.fillText("Score: "+score, 8, 20);
    ctx.fillText("Lives: "+lives, 8, 40);
    
}

function drawSentence(){
    ctx.font = "24px Arial";
    ctx.fillStyle = textColour;
    sentence.x = centreX(sentence.text, canvas.width/2);
    ctx.fillText(sentence.text, sentence.x+sentence.xOffset, sentence.y);
}

function drawAnswers(){
    if(isGameOver) return;

    ctx.font = "24px Arial";
    ctx.fillStyle = textColour;
    let x = centreX(answerLeft.text, answerLeft.x);
    ctx.fillText(answerLeft.text, x, answerLeft.y);
    
    ctx.font = "24px Arial";
    ctx.fillStyle = textColour;
    x = centreX(answerRight.text, answerRight.x);
    ctx.fillText(answerRight.text, x, answerRight.y);

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
}

function drawExplosion(){
    let coords = explosion.GetFrameCrop(explosion.frameNumber);
    
    ctx.drawImage(
        explosionSheet, 
        coords.x, 
        coords.y, 
        explSpriteSize, 
        explSpriteSize, 
        explosion.pos.x, 
        explosion.pos.y, 
        explSpriteSize * explosion.scale.x, 
        explSpriteSize * explosion.scale.x
    );
    
    explosion.frameNumber += 0.5; //Play at half speed
    if(explosion.frameNumber >= explosion.totalFrames){
        explosion.isExplosion = false;
    }
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

    if(e.key == "Escape" || e.key == "Esc"){
        console.log("Escape pressed");
        if(!isStart){
            TogglePause();
        }
    }
    if(isPaused) return;
    
    if(e.key == "Right" || e.key == "ArrowRight"){
        console.log("Right pressed");
        rightPressed = true;
    }
    if(e.key == "Left" || e.key == "ArrowLeft"){
        console.log("Left pressed");
        leftPressed = true;
    }
    if(e.key == "Enter" && (isGameOver || isStart)){
        StartGame();
    }

}

function TogglePause(){
    isPaused = !isPaused;
    if(isPaused){
        music.stop();
    }else{
        music.play();
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

document.addEventListener("touchstart", touchHandler, false);
//document.addEventListener("touchmove", touchMove, false);

function touchHandler(e){
    if(e.touches) {
        
        if(isStart || isGameOver){
            e.preventDefault();
            StartGame();
            return;
        }
        if(isPaused){
            e.preventDefault();
            TogglePause();
            return;
        }


        
        // playerX = e.touches[0].pageX - canvas.offsetLeft - playerWidth / 2;
        // playerY = e.touches[0].pageY - canvas.offsetTop - playerHeight / 2;
        // output.innerHTML = "Touch: "+ " x: " + playerX + ", y: " + playerY;
        e.preventDefault();
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

//#region Constructors

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.playFromStart = function(){
        this.sound.currentTime = 0;
        this.sound.play();
        console.log("Play sound from start"+this.sound.src);
    }
    this.play = function(){
        this.sound.play();
        console.log("Play sound "+this.sound.src);
    }
    this.stop = function(){
        this.sound.pause();
    }
  }

function answer(txt, pos){
    console.log("Answer function called");
    let ans = {
        text: txt,
        baseX: canvas.width * (0.25 + 0.5*pos),
        baseY: canvas.height - 30,
        x: canvas.width * (0.25 + 0.5*pos),
        y: canvas.height - 30,
        dx: 0,
        dy: 0
    }
    console.log(ans);
    return ans;
}

//#endregion

Init();
