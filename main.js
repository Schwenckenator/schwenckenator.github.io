var robotCount = 0;

function robotClick(number){
    robotCount += number;
    document.getElementById("robotCount").innerHTML = robotCount;
}