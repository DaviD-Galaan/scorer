const END_SET = 11;

const sequence = {
    "AX": ["AX","XB","BY","YA"],
    "AY": ["AY","YB","BX","XA"],
    "BX": ["BX","XA","AY","YB"],
    "BY": ["BY","YA","AX","XB"],

    "XA": ["XA","AY","YB","BX"],
    "XB": ["XB","BY","YA","AX"],
    "YA": ["YA","AX","XB","BY"],
    "YB": ["YB","BX","XA","AY"],
}

const switchReceiver = {
    "AX": "AY",
    "AY": "AX",
    "BX": "BY",
    "BY": "BX",
    "XA": "XB",
    "XB": "XA",
    "YA": "YB",
    "YB": "YA", 
}

export default class Game {
    get(data) {
        //console.log(data);
        this.id = data.id;
        this.type = data.type;
        this.playerA = data.playerA;
        this.playerB = data.playerB;
        this.playerX = data.playerX;
        this.playerY = data.playerY;
        
        this.clubA = data.clubA;
        this.clubB = data.clubB;
        this.clubX = data.clubX;
        this.clubY = data.clubY;

        this.firstServer = data.firstServer ?? "";
        this.scoreAB = data.scoreAB ? data.scoreAB.map(s => {return parseInt(s)}) : [];
        this.scoreXY = data.scoreXY ? data.scoreXY.map(s => {return parseInt(s)}) : [];
        this.setAB = data.setAB;
        this.setXY = data.setXY;
        this.woAB = data.woAB;
        this.woXY = data.woXY;
        this.score = data.score;

        this.winner = data.winner;
        this.sets = parseInt(data.sets);
        this.currentSet = data.scoreAB ? data.scoreAB.length : 0;
        this.currentScoreAB = data.scoreAB ? data.scoreAB[this.currentSet - 1] : 0;
        this.currentScoreXY = data.scoreXY ? data.scoreXY[this.currentSet - 1] : 0;  
        this.direction = "rtl";
        this.endGame = this.setAB > this.sets/2 || this.setXY > this.sets/2;
        this.serverReceiver = (data.details && data.details.serverReceiver) ? data.details.serverReceiver : [];
        this.events = (data.details && data.details.events) ? data.details.events : [];
    }
    
    changeScore(player, points)
    {
        let serverReceiverUpdated = false;

        if(this.winner != "0")
            return serverReceiverUpdated;

        
        
        let currentSetIdx = this.currentSet-1;
        if(points < 0 && this.endGame) {
            if(player=='AB' && this.setAB > this.sets/2) {
                this.setAB--;
                this.endGame = false;
            }
            if(player=='XY' && this.setXY > this.sets/2) {
                this.setXY--;
                this.endGame = false;
            }   
        }
        if(this.endGame)
            return serverReceiverUpdated;
        if( points > 0 && 
            (   this.setAB > this.sets/2 ||
                this.setXY > this.sets/2 ) )
        {
            return serverReceiverUpdated;
        }
        else if( points                     < 0 && 
                currentSetIdx               > 0 &&
                this.scoreAB[currentSetIdx] == 0 &&
                this.scoreXY[currentSetIdx] == 0 )
        {
            this.scoreAB.pop();
            this.scoreXY.pop();
            this.serverReceiver.pop();
            serverReceiverUpdated = true;
            
            this.currentSet--;
            if(this.scoreAB[this.currentSet-1] > this.scoreXY[this.currentSet-1])
            {
                this.scoreAB[this.currentSet-1]--;
                this.setAB--;
            }
            else
            {
                this.scoreXY[this.currentSet-1]--;
                this.setXY--;
            }
        } else if(  this.currentSet == this.sets                            &&
                    this.scoreAB[this.currentSet-1] < parseInt(END_SET/2)   && 
                    this.scoreXY[this.currentSet-1] < parseInt(END_SET/2)   &&
                    this.serverReceiver[this.sets]) {
            this.serverReceiver.pop();
            if(this.save) this.save();
        }
        
        else if(player=='AB')
        {
            this.scoreAB[currentSetIdx]+= points;
            if(this.scoreAB[currentSetIdx] < 0 )
                this.scoreAB[currentSetIdx] = 0;

            else if( this.scoreAB[currentSetIdx] >= END_SET && 
                this.scoreAB[currentSetIdx] >= this.scoreXY[currentSetIdx]+2)
            {
                this.setAB++;
                if(this.setAB > this.sets/2)
                    this.endGame = true;
                else
                {
                    currentSetIdx = this.currentSet++;
                    this.scoreAB[currentSetIdx] = this.scoreXY[currentSetIdx] = 0;
                }
            }
        }
        else if(player=='XY')
        {
            this.scoreXY[currentSetIdx]+= points;
            if(this.scoreXY[currentSetIdx] < 0 )
                this.scoreXY[currentSetIdx] = 0;

            else if( this.scoreXY[currentSetIdx] >= END_SET && 
                this.scoreXY[currentSetIdx] >= this.scoreAB[currentSetIdx]+2)
            {
                this.setXY++;
                if(this.setXY > this.sets/2)
                    this.endGame = true;
                else
                {
                    currentSetIdx = this.currentSet++;
                    this.scoreAB[currentSetIdx] = this.scoreXY[currentSetIdx] = 0;
                }
            }
        }
        this.currentScoreAB = this.scoreAB[this.currentSet - 1];
        this.currentScoreXY = this.scoreXY[this.currentSet - 1];  

        return serverReceiverUpdated;
    }

    getCurrentServer() {
        const nbrPointsInCurrentSet = this.scoreAB[this.currentSet - 1] + this.scoreXY[this.currentSet - 1];

        if(this.type == "D") {
            if(!this.serverReceiver[this.currentSet -1])
                return "";

            let currentSequence = this.serverReceiver[this.currentSet -1];
            const placeInSequence = parseInt(nbrPointsInCurrentSet / 2) % 4;
            if(this.currentSet == this.sets) {
                if(this.scoreAB[this.currentSet-1] >= parseInt(END_SET/2) || this.scoreXY[this.currentSet-1]  >= parseInt(END_SET/2)) {
                    if(!this.serverReceiver[this.currentSet]) {
                        this.serverReceiver[this.currentSet] = Object.keys(sequence).filter(s => 
                            sequence[s][placeInSequence] == switchReceiver[sequence[currentSequence][placeInSequence]]
                        )[0];
                    }
                    currentSequence = this.serverReceiver[this.currentSet];
                }
            }
            if(this.scoreAB[this.currentSet-1] < END_SET && this.scoreXY[this.currentSet-1] < END_SET)
                return sequence[currentSequence][placeInSequence];
            else
                return sequence[currentSequence][(nbrPointsInCurrentSet - 2) % 4];
        } else {
            const servers = "AX";
            
            const currentSetfirstServer = (this.firstServer=='A') ? servers[(this.currentSet + 1)%2] : servers[(this.currentSet)%2];
            
            if(this.scoreAB[this.currentSet-1] < END_SET && this.scoreXY[this.currentSet-1] < END_SET)
                return (currentSetfirstServer=='A') ? servers[parseInt(nbrPointsInCurrentSet / 2) % 2] : servers[parseInt(nbrPointsInCurrentSet/2 + 1)%2];
            else
                return (currentSetfirstServer=='A') ? servers[nbrPointsInCurrentSet%2] : servers[(nbrPointsInCurrentSet + 1)%2];
        }
    }
    getDetails() {
        return {
            events: this.events,
            serverReceiver: this.serverReceiver
        }
    }
}