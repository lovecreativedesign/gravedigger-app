<template>
    <h3 class="subtitle" >{{message}}</h3>
    <div class="section p-1 columns" >
        <div class="grid column is-half" >
            <div v-for="(gridItemRow, gridItemIdx) in this.grid" :key="gridItemIdx" class="grid-row" >
                <span :className="'grid-item ' + getIconClass(gridItem)" v-for="(gridItem, itemIdx) in gridItemRow" :key="itemIdx">
                    {{gridItem}}
                </span>
            </div>
        </div>
        <div class="column is-half has-text-left" >
            
                <div v-if="!playerHasMoved && isPlaying" class="has-text-left mb-3" >
                    <p>Move {{movesMade+1}}</p>
                    <div class="buttons has-addons">
                        <button class="button is-danger" @click="movePlayer('N')" >North</button>
                        <button class="button is-info" @click="movePlayer('S')" >South</button>
                        <button class="button is-primary has-text-dark" @click="movePlayer('E')" >East</button>
                        <button class="button is-warning" @click="movePlayer('W')" >West</button>
                    </div>
                </div>
                <div v-if="playerHasMoved && currentHoles < totalHoles && isPlaying" class="has-text-left mb-3" >
                    <p>Do you wish to dig a hole?</p>
                    <div class="buttons has-addons">
                        <button class="button is-primary has-text-dark" @click="digHole('Y')" >Yes</button>
                        <button class="button is-warning" @click="digHole('N')" >No</button>
                    </div>
                </div>
                <div class="has-text-right" >
                    <p class="has-text-4" >Level: {{level}}</p>
                    <p class="has-text-4" >Lives: <span v-for="(life) in player1.lives" :key="life" >❤️</span></p>
                    <p :className="(totalMoves -(movesMade+1) <= 10) ? 'is-size-3 has-text-danger' : 'is-size-4'" >{{totalMoves -(movesMade+1)}} minutes until midnight! 🕰️</p>
                    <p class="has-text-4" >{{totalHoles - holeCount}} holes you can dig 🕳️</p>
                </div>
            
        </div>
    </div>
    <div :className="'modal' + ((!isPlaying) ? ' is-active' : '')" >
        <div class="modal-background"></div>
        <div class="modal-content">
            <p>{{message}}</p>
            <p>Do you want to play again??</p>
            <button class="button is-large" aria-label="play-again" @click="resetGame" >Play Again?</button>
        </div>
    </div>
</template>
<script>
import setup from '@/config/setup.json'
import testScript from '@/functions/test.js'
export default {
    name: 'GameBoard',
    props: {
    },
    data(){
        return this.initialState()
    },
    mounted() {
        console.log('setup', setup, this);
        testScript.testFunc();
        this.buildGrid();
        addEventListener('keyup', this.keyUp);
    },
    methods: {
        initialState(){
            return {
                message: '',
                grid: [],
                level: 1,
                movesMade: 0,
                totalMoves: setup.totalMoves,
                currentHoles: 0,
                playerHasMoved: false,
                isPlaying: true,
                dugHole: false,
                holeCount: 0,
                totalHoles: setup.totalHoles,
                enemies: [],
                player1: {
                    currentEastWest: 1,
                    currentNorthSouth: 1,
                    lives: setup.lives,
                    inOldGrave: false
                },
                inOldGraveCount: 0,
                newNorthSouth: 0,
                newEastWest: 0,
                directionMoved: '',
                gravestones: [],
                gridSize: setup.gridSize
            };
        },
        buildGrid() {
            
            this.gridSize[0] = (this.level > 1 && this.level < 4) ? this.gridSize[0]+setup.gridMultiplyer[0] : this.gridSize[0];
            this.gridSize[1] = (this.level > 1 && this.level < 4) ? this.gridSize[1]+setup.gridMultiplyer[1] : this.gridSize[1];
            console.log('setup.gridSize', this.gridSize);
            /// Build Empty Grid
            for(let i=0; i<this.gridSize[0]; i++) {
                this.grid[i] = [];
                for(let j = 0; j<this.gridSize[1]; j++) {
                    
                    this.grid[i][j] = setup.chars.openGround;

                    /// Build the Horizontal Wall Top
                    this.grid[0][j] = setup.chars.wall;
                    if(i === this.gridSize[0]-1) {
                        console.log('i', i, setup.gridSize[0]-1)
                        /// Build the Horizontal Wall Below
                        this.grid[this.gridSize[0]-1][j] = setup.chars.wall;
                    }
                    
                }            
                
                /// Build the Varticle Wall
                this.grid[i][0] = setup.chars.wall;
                this.grid[i][this.gridSize[1]-1] = setup.chars.wall;
                
            }

            /// TODO: Make Exit Random
            this.grid[this.gridSize[0]-2][this.gridSize[1]-1] = setup.chars.exit;

            /// Plant some gravestones...
            /// between 1x1 and 9x19 etc 
            for(let g=0;g<this.gridSize[1];g++){
                let f = Math.floor(Math.random() * (this.gridSize[0]-3) + 2);
                let g = Math.floor(Math.random() * (this.gridSize[1]-5) + 3);
                this.grid[f][g] = setup.chars.gravestone;
            }

            /// Add Some Skelebones, Bats etc...
            this.setupEnemies();

            this.grid[1][1] = setup.chars.player1;
            //// ---- Do an enemy test.... this.grid[2][2] = setup.chars.deadEnemy;

            console.log('level', this.level, 'grid', this.grid, this.skeletons);

        },
        setupEnemies(){
            let lastPos = [];
            console.log(Object.keys(setup.levels[this.level-1]));
            Object.keys(setup.levels[this.level-1]).forEach((enemyType) => {
                console.log(enemyType, setup.levels[this.level-1][enemyType]);
                for(let s=0;s<setup.levels[this.level-1][enemyType];s++){                
                    let {...enemy} = setup.enemies[enemyType].defaults;
                    ///let f = Math.floor(Math.random() * 7 + 2);
                    ///let g = Math.floor(Math.random() * 7 + 2);
                    let f = Math.floor(Math.random() * (this.gridSize[0]-3) + 2);
                    let g = Math.floor(Math.random() * (this.gridSize[1]-5) + 3);
                    console.log(f, enemy);
                    if(lastPos.includes(f)) {
                        s--;
                    } else {
                        enemy.type = enemyType;
                        enemy.allowedMoves = setup.enemies[enemyType].allowedMoves;                
                        enemy.currentNorthSouth = f;
                        enemy.currentEastWest = g;
                        console.log(enemy);
                        this.enemies.push(enemy);
                        this.grid[f][g] = setup.chars[enemyType];
                        lastPos.push(f);
                    }
                }
            });
        },
        keyUp(e){            
            console.log('keyupcalled', e, this.playerHasMoved);
            let key = e.key.toUpperCase();
            if(!this.playerHasMoved) {
                let allowedKeys = ['N','S','E','W'];
                if(allowedKeys.includes(key)) {
                    this.movePlayer(key);
                }
            } else {
                let allowedKeys = ['Y','N'];
                if(allowedKeys.includes(key)) {
                    this.digHole(key);
                }
            }
            if(!this.isPlaying && key === 'ENTER'){
                this.resetGame();
            }
        },
        getIconClass(icon){
            return Object.keys(setup.chars).find(key => setup.chars[key] === icon);
        },
        movePlayer(d){
            
            if(!this.isPlaying){
                return false;
            }

            this.directionMoved = d;
            this.newEastWest = 0;
            this.newNorthSouth = 0;

            this.message = '';
            switch(this.directionMoved){
                case 'N':
                    this.newEastWest = this.player1.currentEastWest;
                    this.newNorthSouth = this.player1.currentNorthSouth-1;
                    break;
                case 'E':
                    this.newEastWest = this.player1.currentEastWest+1;
                    this.newNorthSouth = this.player1.currentNorthSouth;
                    break;
                case 'S':
                    this.newEastWest = this.player1.currentEastWest;
                    this.newNorthSouth = this.player1.currentNorthSouth+1;
                    break;
                case 'W':
                    this.newEastWest = this.player1.currentEastWest-1;
                    this.newNorthSouth = this.player1.currentNorthSouth;
                    break;

            }

            if(!this.checkMoveOk()) {
                
                this.playerHasMoved = true;
                
                if(this.holeCount >= this.totalHoles){
                    this.makeMove();
                }
            }
        },
        checkMoveOk(){
            let nS = this.newNorthSouth;
            let eW = this.newEastWest;
            console.log('new area', this.grid[nS][eW], this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest]);
            let obsticle = true;
            switch(true) {
                case this.grid[nS][eW] === setup.chars.exit:
                    this.endGame(true);
                    break;
                case this.player1.inOldGrave && this.inOldGraveCount < 5:
                    this.inOldGraveCount++;
                    this.movesMade++;
                    this.message = `You are stuck for a while trying to climb out... ${5-this.inOldGraveCount} left to wait`;
                    this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.deadEnemy;
                    this.moveEnemies();
                    break;
                case this.grid[nS][eW] === setup.chars.wall:
                    this.message = 'A Wall is in your way you cannot go that way';
                    break;
                case this.grid[nS][eW] === setup.chars.gravestone:
                    this.message = 'A Gravestone is in your way!';
                    break;
                case this.grid[nS][eW] === setup.chars.deadEnemy:
                    this.message = "You walked over an open grave and fell in! \n It takes 5 mins to climb out!";
                    this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.openGround;
                    //this.movesMade = this.movesMade+5;
                    this.player1.inOldGrave = true;
                    this.player1.currentNorthSouth = nS;
                    this.player1.currentEastWest = eW;
                    break;
                default:
                    console.log('XXXXXXX ----- I am Moving ----- XXXXXXX');
                    this.inOldGraveCount=0;
                    this.player1.inOldGrave = false;
                    obsticle = false;

            }
            
            return obsticle;
        },
        makeMove() {
            let nS = this.newNorthSouth;
            let eW = this.newEastWest;
            console.log('Player Move', this.grid[nS][eW]);
            let hasDied = false;

            let thingsThatKillMe = this.enemies.map(el => el.type).filter((value, index, self) => self.indexOf(value) === index);
            console.log('thingsThatKillMe', thingsThatKillMe, thingsThatKillMe.includes(this.grid[nS][eW]));
            
            switch(true) {
                case this.grid[nS][eW] === setup.chars.hole:
                    this.message = 'You Fell into a hole and died!';
                    this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.openGround;
                    this.grid[nS][eW] = setup.chars.died;
                    hasDied = true;                    
                    break;
                case this.grid[nS][eW] === setup.chars.skeleton
                || this.grid[nS-1][eW] === setup.chars.skeleton
                || this.grid[nS+1][eW] === setup.chars.skeleton
                || this.grid[nS][eW-1] === setup.chars.skeleton
                || this.grid[nS][eW+1] === setup.chars.skeleton:
                    this.message = 'Oh Dear! You ran into a '+setup.chars.skeleton+' and they ate you up!!';
                    this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.openGround;
                    this.grid[nS][eW] = setup.chars.died;
                    hasDied = true;
                    break;
                
                ///case this.grid[nS][eW] !== setup.chars.openGround && this.grid[nS][eW] !== setup.chars.deadEnemy:
                case thingsThatKillMe.includes(this.grid[nS][eW]):
                    this.message = 'A '+this.grid[nS][eW]+' ate you up!';
                    this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.openGround;
                    this.grid[nS][eW] = setup.chars.died;
                    hasDied = true;
                    break;
                case this.grid[nS][eW] === setup.chars.exit:
                    this.message = 'You won!!';
                    this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.openGround;
                    this.grid[nS][eW] = setup.chars.openGround;
                    this.endGame(true);
                    break;
                default:
                    this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = (this.dugHole) ? setup.chars.hole : setup.chars.openGround;
                    this.grid[nS][eW] = setup.chars.player1;
                    this.player1.currentNorthSouth = nS;
                    this.player1.currentEastWest = eW;
                    this.dugHole = false;
                    this.playerHasMoved = false;
                    this.movesMade++;
                    /// Now Move Skeletons etc...
                    this.moveEnemies();
            }

            if(hasDied && this.player1.lives < 0) {
                this.endGame();
            } else if(hasDied) {
                this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.openGround;
                this.player1.currentNorthSouth = 1;
                this.player1.currentEastWest = 1;
                this.grid[1][1] = setup.chars.player1;
                this.player1.lives--;
                this.playerHasMoved = false;
            }

            if(this.movesMade >= this.totalMoves-1) {
                this.message = 'Clock Struck Midnight!!!';
                this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.openGround;
                this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.died;
                this.endGame();
            }

        },
        digHole(yN){
            
            if(!this.isPlaying){
                return false;
            }

            const thisVal = yN;
            this.message = '';
            if(thisVal === 'Y' && this.holeCount <= this.totalHoles) {
                this.dugHole = true;
                this.holeCount++;
            }

            /// Check if move ok...
            this.makeMove();

        },
        moveEnemies(){
            
            let obsticles = [
                setup.chars.wall, 
                setup.chars.gravestone, 
                setup.chars.skeleton, 
                setup.chars.bat, 
                setup.chars.zombie,
                setup.chars.werewolf,
                setup.chars.vampire,
                setup.chars.ghost,
                setup.chars.goblin,
                setup.chars.ogre,
                setup.chars.exit
            ];

            const newEnemyPositions = this.enemies.map((enemy, i) => {
                
                let okMove = true;
                let newNs = enemy.currentNorthSouth;
                let newEw = enemy.currentEastWest;
                enemy.prevNorthSouth = newNs;
                enemy.prevEastWest = newEw;

                /*
                const fObsticles = obsticles.map((obsticle) => {
                    if((enemy.type === 'bat' 
                    || enemy.type === 'vampire') 
                    && obsticle === setup.chars.gravestone) {                       
                        return null;
                    }

                    return obsticle;

                });
                */

                const fObsticles = obsticles;
                let hasDied = false;

                console.log(`++++++++++++++----- enemy ${i} ${enemy.type} ----+++++++++++++`);
                
                console.log('this.directionMoved', this.directionMoved, enemy, 'CurrNs: ' + newNs, 'CurrEw: ' + newEw, 'checking...', 
                fObsticles,
                'Curr', this.grid[newNs][newEw], 
                'N', this.grid[newNs-1][newEw], 
                'S', this.grid[newNs+1][newEw], 
                'E', this.grid[newNs][newEw+1], 
                'W', this.grid[newNs][newEw-1]);
                console.log(enemy.allowedMoves[this.directionMoved]);

                let enDirection = enemy.allowedMoves[this.directionMoved];


                if(enemy.type === 'bat') {
                  /*
                  enemy.allowedMoves[this.directionMoved].moves.newNs = enemy.allowedMoves[this.directionMoved].moves.newEw;
                  enemy.allowedMoves[this.directionMoved].moves.newEw = enemy.allowedMoves[this.directionMoved].moves.newNs;
                  
                  
                  enemy.allowedMoves[this.directionMoved].moves.newNs = (enemy.allowedMoves[this.directionMoved].moves.newNs < 0) ? 1 : -1;
                  enemy.allowedMoves[this.directionMoved].moves.newEw = (enemy.allowedMoves[this.directionMoved].moves.newEw < 0) ? 1 : -1;
                  */

                  console.log('grid lens', this.grid, this.grid.length-1, this.grid[1].length-1);

                  switch(true) {
                    case newNs-1 === 0 && newEw+1 === this.grid[1].length-1:
                      console.log('bat has wall north west!', newNs-1,newEw+1);
                      enemy.allowedMoves[this.directionMoved].moves.newNs = 1;
                      enemy.allowedMoves[this.directionMoved].moves.newEw = -1;
                      break;
                    case newNs+1 === this.grid.length-1 && newEw+1 === this.grid[1].length-1:
                      console.log('bat has wall south west!', newNs+1,newEw+1);
                      enemy.allowedMoves[this.directionMoved].moves.newNs = -1;
                      enemy.allowedMoves[this.directionMoved].moves.newEw = -1;
                      break;
                    case newNs+1 === this.grid.length-1 && newEw-1 === 0:
                      console.log('bat has wall south west!', newNs+1,newEw-1);
                      enemy.allowedMoves[this.directionMoved].moves.newNs = -1;
                      enemy.allowedMoves[this.directionMoved].moves.newEw = 1;
                      break;
                    case newNs-1 === 0 && newEw-1 === 0:
                      console.log('bat has wall north west!', newNs-1,newEw-1);
                      enemy.allowedMoves[this.directionMoved].moves.newNs = 1;
                      enemy.allowedMoves[this.directionMoved].moves.newEw = 1;
                      break;
                    case newNs-1 === 0:
                      console.log('bat has wall north!', newNs-1);
                      enemy.allowedMoves[this.directionMoved].moves.newNs = 1;
                      break;
                    case newNs+1 === this.grid.length-1:
                      console.log('bat has wall South!', newNs+1);
                      enemy.allowedMoves[this.directionMoved].moves.newNs = -1;
                      break;
                    case newEw-1 === 0:
                      console.log('bat has wall East!', newEw-1);
                      enemy.allowedMoves[this.directionMoved].moves.newEw = 1;
                      break;
                    case newEw+1 === this.grid[1].length-1:
                      console.log('bat has wall West!', newEw+1);
                      enemy.allowedMoves[this.directionMoved].moves.newEw = -1;
                      break;
                    case this.grid[newNs+enemy.allowedMoves[this.directionMoved].moves.newNs][newEw+enemy.allowedMoves[this.directionMoved].moves.newEw] !== setup.chars.openGround
                      && this.grid[newNs+enemy.allowedMoves[this.directionMoved].moves.newNs][newEw+enemy.allowedMoves[this.directionMoved].moves.newEw] !== setup.chars.gravestone
                      && this.grid[newNs+enemy.allowedMoves[this.directionMoved].moves.newNs][newEw+enemy.allowedMoves[this.directionMoved].moves.newEw] !== setup.chars.hole
                      && this.grid[newNs+enemy.allowedMoves[this.directionMoved].moves.newNs][newEw+enemy.allowedMoves[this.directionMoved].moves.newEw] !== setup.chars.died
                      && this.grid[newNs+enemy.allowedMoves[this.directionMoved].moves.newNs][newEw+enemy.allowedMoves[this.directionMoved].moves.newEw] !== setup.chars.deadEnemy:

                      enemy.allowedMoves[this.directionMoved].moves.newNs = (enemy.allowedMoves[this.directionMoved].moves.newNs < 0) ? 1 : -1;
                      enemy.allowedMoves[this.directionMoved].moves.newEw = (enemy.allowedMoves[this.directionMoved].moves.newEw < 0) ? 1 : -1;                     
                      break;

                  }
                  /*if(newNs-1 === 0 || newNs+1 === this.grid.length-1){
                      enemy.allowedMoves[this.directionMoved].moves.newNs = (enemy.allowedMoves[this.directionMoved].moves.newNs < 0) ? 1 : -1;                      
                  } else if(newEw-1 === 0 || newEw+1 === this.grid[1].length-1) {
                      enemy.allowedMoves[this.directionMoved].moves.newEw = (enemy.allowedMoves[this.directionMoved].moves.newEw < 0) ? 1 : -1;                    
                  }*/

                }
                
                //// Check Skel, bat etc by type....
                switch(true){
                    case (this.player1.currentNorthSouth <= newNs)
                    && enemy.type === 'skeleton'
                    && this.directionMoved === 'N' 
                    && !fObsticles.includes(this.grid[parseInt(newNs-1)][newEw]):
                        newNs--;
                        break;
                    case (this.player1.currentNorthSouth >= newNs)
                    && enemy.type === 'skeleton'
                    && this.directionMoved === 'S' 
                    && !fObsticles.includes(this.grid[parseInt(newNs+1)][newEw]):
                        newNs++;
                        break;
                    case (this.player1.currentEastWest >= newEw)
                    && enemy.type === 'skeleton'
                    && this.directionMoved === 'E' 
                    && !fObsticles.includes(this.grid[parseInt(newNs)][newEw+1]):
                        newEw++;
                        break;
                    case this.directionMoved === 'W'
                    && enemy.type === 'skeleton'
                    && (this.movesMade % 3 === 0)
                    && !fObsticles.includes(this.grid[parseInt(newNs)][newEw-1]): 
                        newEw--;
                        break;
                    //// Defaults....
                    case !fObsticles.includes(this.grid[parseInt(newNs+enDirection.moves.newNs)][parseInt(newEw+enDirection.moves.newEw)]):
                        newEw = parseInt(newEw+enDirection.moves.newEw);
                        newNs = parseInt(newNs+enDirection.moves.newNs);                     
                        ///newNs--;
                        break;
                    default:
                        okMove = false;
                }
                
                console.log('enemy moves to', newNs, newEw, this.grid[newNs][newEw]);
                if(this.grid[newNs][newEw] === setup.chars.hole) {
                    enemy.isTrapped = true;
                    this.grid[newNs][newEw] = setup.chars.openGround;
                    console.log('enemy is trapped!', enemy);
                    this.message = enemy.type + ' fell into a hole!';
                }
                
                /// If Enemy runs into player.... enemy = nom, nom, nom....
                if(this.grid[newNs][newEw] === setup.chars.player1){
                    this.message = 'Eek! You ran into a '+ enemy.type + ' and they devoured you!';
                    ///this.endGame();
                    hasDied = true;
                }

                if(okMove) {
                    
                    if(this.grid[newNs][newEw] === setup.chars.gravestone && (enemy.type === 'bat' || enemy.type === 'vampire')) {
                        this.gravestones.push([newNs, newEw]);
                        console.log('this.gravestones',this.gravestones);
                    }

                    enemy.currentNorthSouth = newNs;
                    enemy.currentEastWest = newEw;

                }
                
                if(hasDied) {
                    this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.died;
                    this.player1.currentNorthSouth = 1;
                    this.player1.currentEastWest = 1;
                    this.grid[1][1] = setup.chars.player1;
                    this.player1.lives--;
                    this.playerHasMoved = false;
                }
                
                console.log('currr.en', enemy);
                return enemy;

            });

            console.log('newEnemyPositions', newEnemyPositions);
            
            newEnemyPositions.forEach((enemy, i) => {
                if(!enemy.isTrapped) {
                    this.grid[enemy.prevNorthSouth][enemy.prevEastWest] = setup.chars.openGround;
                    this.grid[enemy.currentNorthSouth][enemy.currentEastWest] = setup.chars[enemy.type];                    
                } else {
                    this.grid[enemy.prevNorthSouth][enemy.prevEastWest] = setup.chars.openGround;
                    this.grid[enemy.currentNorthSouth][enemy.currentEastWest] = setup.chars.deadEnemy;
                    delete newEnemyPositions[i];
                }
                
            });

            this.enemies = newEnemyPositions;
            this.directionMoved = '';
            console.log('newEnemyPositions', this.enemies);
            console.log('++++---- This Grid ----++++');
            console.log(this.grid);
            console.log('++++---- This Grid ----++++');
            
        },
        endGame(win = false){
            if(win) {
                let level = this.level;
                console.log('Object.keys(setup.levels).length', level, Object.keys(setup.levels).length);
                if(this.level < Object.keys(setup.levels).length) {
                    Object.assign(this.$data, this.initialState());
                    this.level = level+1;
                    this.message = `...Next Level ${this.level}`;
                    this.buildGrid();   
                } else {
                    this.message = 'You Escaped!!!';
                    this.isPlaying = false;
                }
            } else {
                this.isPlaying = false;
            }
            
        },
        resetGame(){       
            Object.assign(this.$data, this.initialState());
            this.buildGrid();
        }
        
    }
}
</script>
<style scoped>
    @keyframes skelebone {
        0% { text-shadow: 0 4px 5px rgba(255, 128, 0, 0.84); }
        30% { text-shadow: 2px 0 5px rgba(234, 255, 0, 0.779); }
        58% { text-shadow: 0 0 5px rgba(255, 0, 234, 0.779);  }
        100% { text-shadow: 3px 6px 5px rgba(40, 255, 0, 0.779);  }
    }
    .subtitle {
        min-height: 26px; 
        color: rgba(255, 128, 0, 1);
    }
    .grid { 
        margin: 0 auto;
    }
    .grid-row {
        display: table;
        padding: 0;
        margin: 0 auto;
        line-height: 1;
    }
    .grid-item {
        display: inline-block;
        width: 30px;
        height: 25px;
        font-size: 24px;
        line-height: 1;
    }

    .grid-item.skeleton {
        animation-name: skelebone;
        animation-duration: 5s;
        animation-delay: 0.35s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
    }

    @media screen and (max-width:614px) {
        .grid-item {
            width: 17px;
            height: auto;
            font-size: 14px;
        }
    }
</style>