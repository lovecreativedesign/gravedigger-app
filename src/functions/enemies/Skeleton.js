import obsticles from '../obsticles.js';
class Skeleton {

    allowedMoves = {
        "N" : {
            "moves": {
                "nS": 1,
                "eW": 0
            }
        },
        "S" : {
            "moves": {
                "nS": -1,
                "eW": 0
            }
        },
        "E" : {
            "moves": {
                "nS": 0,
                "eW": -1
            }
        },
        "W" : {
            "moves": {
                "nS": 0,
                "eW": 1
            }
        }
    }
    defaults = {
        "currentEastWest": 18,
        "currentNorthSouth": 0,
        "prevEastWest": 0,
        "prevNorthSouth": 0,
        "isTrapped": false,
        "isBlocked": false
    }
    
    init(profile) {
        
        Object.assign(this, profile);
		
    }

    move(){   
        
        this.okMove = true;
        console.log('---- is ',this);
        let filtered_obsticles = obsticles;
        let enDirection = this.allowedMoves[this.directionMoved];        
        
        //// Check Skel, bat etc by type....
        switch(true){
            case (this.player1.currentNorthSouth < this.currentNorthSouth)            
            && this.directionMoved === 'N' 
            && !filtered_obsticles.includes(this.grid[parseInt(this.currentNorthSouth-1)][this.currentEastWest]):
                this.currentNorthSouth--;
                break;
            case (this.player1.currentNorthSouth > this.currentNorthSouth)
            && this.directionMoved === 'S' 
            && !filtered_obsticles.includes(this.grid[parseInt(this.currentNorthSouth+1)][this.currentEastWest]):
                this.currentNorthSouth++;
                break;
            case (this.player1.currentEastWest > this.currentEastWest)
            && this.directionMoved === 'E' 
            && !filtered_obsticles.includes(this.grid[parseInt(this.currentNorthSouth)][this.currentEastWest+1]):
                this.currentEastWest++;
                break;
            case this.directionMoved === 'W'
            && (this.movesMade % 3 === 0)
            && !filtered_obsticles.includes(this.grid[parseInt(this.currentNorthSouth)][this.currentEastWest-1]): 
                this.currentEastWest--;
                break;
            //// Defaults....
            case !filtered_obsticles.includes(this.grid[parseInt(this.currentNorthSouth+enDirection.moves.nS)][parseInt(this.currentEastWest+enDirection.moves.eW)]):
                this.currentEastWest = parseInt(this.currentEastWest+enDirection.moves.eW);
                this.currentNorthSouth = parseInt(this.currentNorthSouth+enDirection.moves.nS);                     
                ///this.currentNorthSouth--;
                break;
            default:
                this.okMove = false;
        }
                
        /// if another enemy is already occupying the grid space                
        this.isBlocked = filtered_obsticles.includes(this.grid[this.currentNorthSouth][this.currentEastWest]);
        console.log('is going to be blocked', this.grid[this.currentNorthSouth][this.currentEastWest], filtered_obsticles.includes(this.grid[this.currentNorthSouth][this.currentEastWest]), this.isBlocked);
        
        /// Free up some memory
        delete this.grid;

        let updated = {
            currentNorthSouth: this.currentNorthSouth,
            currentEastWest: this.currentEastWest,
            prevNorthSouth: this.prevNorthSouth,
            prevEastWest: this.prevEastWest,          
            isBlocked: this.isBlocked,
            isTrapped: this.isTrapped,
            okMove: this.okMove,
            respawned: this.respawned,
            respawnedTo: this.respawnedTo
        };

        console.log('UPDATED TO -> ... ', updated);

        return updated;
    }
}
export default Skeleton;