import obsticles from '../obsticles.js';
import setup from '@/config/setup';
class Zombie {

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
        "isBocked": false
    }
    
    init(profile) {

        console.log('z profile', profile);
        Object.assign(this, profile);
		
    }

    move(){   

        this.okMove = true;
        console.log('---- is ', this);
    
        let filtered_obsticles = obsticles;        
        let enDirection = this.allowedMoves[this.directionMoved];
               
        //// Check Skel, bat etc by type....
        switch(true){
            case (this.player1.currentNorthSouth <= this.currentNorthSouth)            
            && this.directionMoved === 'N'
            && !filtered_obsticles.includes(this.grid[parseInt(this.currentNorthSouth-1)][this.currentEastWest]):
                this.currentNorthSouth--;
                break;
            case (this.player1.currentNorthSouth >= this.currentNorthSouth)
            && this.directionMoved === 'S'
            && !filtered_obsticles.includes(this.grid[parseInt(this.currentNorthSouth+1)][this.currentEastWest]):
                this.currentNorthSouth++;
                break;
            case (this.player1.currentEastWest >= this.currentEastWest)
            && this.directionMoved === 'E'
            && !filtered_obsticles.includes(this.grid[parseInt(this.currentNorthSouth)][this.currentEastWest+1]):
                this.currentEastWest++;
                break;
            case this.directionMoved === 'W'
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

        /// select a random place to spawn...
        let spawn = parseInt(Math.random(0,8) * 10);
        if(spawn > 6 && !this.respawned) {                       
                    
            let f = Math.floor(Math.random() * (this.gridSize[0]-3) + 2);
            let g = Math.floor(Math.random() * (this.gridSize[1]-5) + 3);
            console.log('try set spawned enemy: ', '@NS(f)', f, '@EW(g)', g);
            
            if(!filtered_obsticles.includes(this.grid[f][g])) {  
                                            
                console.log('set enemy respawn ok : ', 'currentNorthSouth(f): ' + f, 'currentEastWest(g): ' + g);
                this.respawned = true;
                this.respawnedTo = [f,g];

                this.grid[this.prevNorthSouth][this.prevEastWest] = setup.chars.unSpawned;
                this.grid[f][g] = setup.chars.spawned;
                this.currentNorthSouth = f;
                this.currentEastWest = g;
                this.okMove = true;
                this.spawnHold = 0;
                
            }

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
            respawnedTo: this.respawnedTo,
            spawnHold: this.spawnHold
        };

        console.log('UPDATED TO -> ... ', updated);

        return updated;
    }

    respawnRule(enemy, grid) {

        /// set me up somewhere new...
        if(enemy?.respawnedTo.length) {	
            console.log('%crespawn now...','color:yellow');			
            enemy.currentNorthSouth = enemy.respawnedTo[0];
            enemy.currentEastWest = enemy.respawnedTo[1];
            grid[enemy.prevNorthSouth][enemy.prevEastWest] = setup.chars.openGround;
        }

        ///spawn the norms...
        console.log('%cnormal respawn and reset','color:green');
        grid[enemy.respawnedTo[0]][enemy.respawnedTo[1]] = setup.chars[enemy.type];
        enemy.respawnedTo = [];
        enemy.isBlocked = false;
        enemy.respawned = false;
        enemy.spawnHold = 0;
        enemy.multiply = parseInt(Math.random(0,8) * 10) > 7;

        return {enemy:enemy,grid:grid};
    }
}
export default Zombie;