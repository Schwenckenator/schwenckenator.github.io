var ironOre = 0;
var ironPlates = 0;

var ironMiners = 0;
var ironSmelters = 0;

var robots = 0;
var factories = 0;

function robotClick(number){
    robots += number;
    document.getElementById("robotCount").innerHTML = robots;
}

function mineIron(number){
    ironOre += number;
    document.getElementById("ironOreCount").innerHTML = ironOre;
}

function smeltIron(number){
    let smeltable = Math.min(ironOre, number);
    if(ironOre > 0){
        ironPlates += smeltable;
        ironOre -= smeltable;
        document.getElementById("ironPlateCount").innerHTML = ironPlates;
        document.getElementById("ironOreCount").innerHTML = ironOre;
    }
    
}

function constructIronMiner(){
    let minerCost = Math.floor(10 * Math.pow(1.1, ironMiners));

    if(ironPlates >= minerCost){
        ironMiners += 1;
        ironPlates -= minerCost;
        document.getElementById("ironMiners").innerHTML = ironMiners;
        document.getElementById("ironPlateCount").innerHTML = ironPlates;
        document.getElementById("ironMinerError").innerHTML = "";
    }else{
        document.getElementById("ironSmelterError").innerHTML = "Not enough Iron Plates!";
    }

    let nextCost = Math.floor(10 * Math.pow(1.1, ironMiners)); 
    document.getElementById("ironMinerCost").innerHTML = nextCost + " Iron Plates";
}

function constructIronSmelter(){
    let smelterCost = Math.floor(10 * Math.pow(1.1, ironSmelters));

    if(ironPlates >= smelterCost){
        ironSmelters += 1;
        ironPlates -= smelterCost;
        document.getElementById("ironSmelters").innerHTML = ironSmelters;
        document.getElementById("ironPlateCount").innerHTML = ironPlates;
        document.getElementById("ironSmelterError").innerHTML = "";
    }else{
        document.getElementById("ironSmelterError").innerHTML = "Not enough Iron Plates!";
    }

    let nextCost = Math.floor(10 * Math.pow(1.1, ironSmelters)); 
    document.getElementById("ironSmelterCost").innerHTML = nextCost + " Iron Plates";
}

window.setInterval(function(){
    mineIron(ironMiners);
    smeltIron(ironSmelters);
}, 1000);
