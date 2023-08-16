import obsticles from '../obsticles.js';
import setup from '@/config/setup';
class Werewolf {

    grid;
    directionMoved;
    movesMade;
    message;
    player1;
    player2;
    isBlocked = false;
    isTrapped = false;
    okMove = false;

    allowedMoves = {
        "N" : {
            "moves": {
                "newNs": -1,
                "newEw": 0
            }
        },
        "S" : {
            "moves": {
                "newNs": 1,
                "newEw": 0
            }
        },
        "E" : {
            "moves": {
                "newNs": 0,
                "newEw": 1
            }
        },
        "W" : {
            "moves": {
                "newNs": 0,
                "newEw": -1
            }
        }
    }
    
    defaults = {
        "currentEastWest": 18,
        "currentNorthSouth": 0,
        "prevEastWest": 0,
        "prevNorthSouth": 0,
        "isTrapped": false,
        "isBocked": false
    }
    
    init(profile) {
        
        Object.assign(this, profile);
		
    }

    move(enemy, idx, newNs, newEw){   
        
        /// Set the previos position to the new position...
        this.prevNorthSouth = newNs;
        this.prevEastWest = newEw;
        this.okMove = true;
        console.log('---- is ',this);
        
        let filtered_obsticles = obsticles.map((obsticle) => {
            if(obsticle === setup.chars.spawned 
            || obsticle === setup.chars.unSpawned) {                       
                return null;
            }
            return obsticle;

        });
    
        console.log('obsticles werewolf', filtered_obsticles);

        let enDirection = this.allowedMoves[this.directionMoved];        
        
        //// Check Skel, bat etc by type....
        switch(true){
            case (this.player1.currentNorthSouth < newNs)            
            && this.directionMoved === 'N' 
            && !filtered_obsticles.includes(this.grid[parseInt(newNs-1)][newEw]):
                newNs--;
                break;
            case (this.player1.currentNorthSouth > newNs)
            && this.directionMoved === 'S' 
            && !filtered_obsticles.includes(this.grid[parseInt(newNs+1)][newEw]):
                newNs++;
                break;
            case (this.player1.currentEastWest > newEw)
            && this.directionMoved === 'E' 
            && !filtered_obsticles.includes(this.grid[parseInt(newNs)][newEw+1]):
                newEw++;
                break;
            case this.directionMoved === 'W'
            ///&& (this.movesMade % 3 === 0)
            && !filtered_obsticles.includes(this.grid[parseInt(newNs)][newEw-1]): 
                newEw--;
                break;
            //// Defaults....
            case !filtered_obsticles.includes(this.grid[parseInt(newNs+enDirection.moves.newNs)][parseInt(newEw+enDirection.moves.newEw)]):
                newEw = parseInt(newEw+enDirection.moves.newEw);
                newNs = parseInt(newNs+enDirection.moves.newNs);                     
                ///newNs--;
                break;
            default:
                this.okMove = false;
        }
                
        /// if another enemy is already occupying the grid space                
        this.isBlocked = filtered_obsticles.includes(this.grid[newNs][newEw]);
        console.log('is going to be blocked', this.grid[newNs][newEw], filtered_obsticles.includes(this.grid[newNs][newEw]), this.isBlocked);
        
        /// Free up some memory
        delete this.grid;

        let updated = {
            newEw: newEw,
            newNs: newNs,
            isBlocked: this.isBlocked,
            isTrapped: this.isTrapped,
            okMove: this.okMove
        };

        console.log('UPDATED TO -> ... ', updated);

        return updated;
    }
}
export default Werewolf;