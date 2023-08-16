import obsticles from '../obsticles.js';
import setup from '@/config/setup';
class Vampire {

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
                "newNs": 1,
                "newEw": 0
            }
        },
        "S" : {
            "moves": {
                "newNs": -2,
                "newEw": 0
            }
        },
        "E" : {
            "moves": {
                "newNs": 0,
                "newEw": -2
            }
        },
        "W" : {
            "moves": {
                "newNs": 0,
                "newEw": 1                        
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

        let respawned = false;
        let respawnedTo = [];        
        let filtered_obsticles = obsticles;
        let enDirection = this.allowedMoves[this.directionMoved];        
        
        //// Check Skel, bat etc by type....
        switch(true){
            case (this.player1.currentNorthSouth <= newNs)            
            && this.directionMoved === 'N' 
            && !filtered_obsticles.includes(this.grid[parseInt(newNs-1)][newEw]):
                newNs--;
                break;
            case (this.player1.currentNorthSouth >= newNs)
            && this.directionMoved === 'S' 
            && !filtered_obsticles.includes(this.grid[parseInt(newNs+1)][newEw]):
                newNs++;
                break;
            case (this.player1.currentEastWest >= newEw)
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

        /// select a random place to spawn...
        let spawn = parseInt(Math.random(0,8) * 10);
        if(spawn > 6 && !respawned) {                       
                    
            let f = Math.floor(Math.random() * (this.gridSize[0]-3) + 2);
            let g = Math.floor(Math.random() * (this.gridSize[1]-5) + 3);
            console.log('try set spawned enemy: ', '@NS(f)', f, '@EW(g)', g);
            
            if(!filtered_obsticles.includes(this.grid[f][g])) {  
                                            
                //enemy.currentNorthSouth = f;
                //enemy.currentEastWest = g;
                /// TODO: Vampire stays as bat for two rounds then pops back as a Vamp.
                console.log('set enemy respawn ok : ', 'currentNorthSouth(f): ' + f, 'currentEastWest(g): ' + g, enemy);
                respawned = true;
                respawnedTo = [f,g];

                this.grid[this.prevNorthSouth][this.prevEastWest] = setup.chars.deadEnemy;
                this.grid[f][g] = setup.chars.bat;
                newNs = f;
                newEw = g;
                this.okMove = true;
                
            }

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
            okMove: this.okMove,
            respawned: respawned,
            respawnedTo: respawnedTo
        };

        console.log('UPDATED TO -> ... ', updated);

        return updated;
    }
}
export default Vampire;