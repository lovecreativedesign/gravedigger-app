<template>
    <h3 class="subtitle" >{{message}}</h3>
    <div class="section p-1 columns" >
        <div class="grid column is-two-thirds justify-content-left" >
            <div v-for="(gridItemRow, gridItemIdx) in this.grid" :key="gridItemIdx" class="grid-row" >
                <span :className="'is-relative grid-item ' + getIconClass(gridItem)" v-for="(gridItem, itemIdx) in gridItemRow" :key="itemIdx">
                    <span class="p-1 has-text-danger is-block is-overlay has-background-white" v-if="debug && (gridItem === '🧱' || gridItem === '#') && itemIdx > 0 && itemIdx < gridItemRow.length-1"     >
                        {{itemIdx}}
                    </span>
                    <span class="p-1 has-text-danger is-block is-overlay has-background-white" v-if="debug && (gridItem === '🧱' || gridItem === '#') && gridItemIdx > 0 && gridItemIdx < grid.length-1" >
                        {{gridItemIdx}}
                    </span>
                    {{gridItem}}
                </span>
            </div>
            <div v-if="!playerHasMoved && isPlaying" class="has-text-left mt-4 mb-3" >                
                <div class="buttons has-addons is-justify-content-center">
                    <button class="button is-danger" @click="movePlayer('N')" >North</button>
                    <button class="button is-info" @click="movePlayer('S')" >South</button>
                    <button class="button is-primary has-text-dark" @click="movePlayer('E')" >East</button>
                    <button class="button is-warning" @click="movePlayer('W')" >West</button>
                </div>
            </div>
            <div v-if="playerHasMoved && currentHoles < totalHoles && isPlaying" class="has-text-center mt-4 mb-3" >
                <p class="py-2">Do you wish to dig a hole?</p>
                <div class="buttons has-addons is-justify-content-center">
                    <button class="button is-primary has-text-dark" @click="digHole('Y')" >Yes</button>
                    <button class="button is-warning" @click="digHole('N')" >No</button>
                </div>
            </div>
        </div>
        <div class="column is-one-third has-text-left" >  
            
            <div class="has-text-left" >
                <p>Move {{movesMade+1}}</p>
                <p class="has-text-4" >Level: {{level}}</p>
                <p class="has-text-4" >Lives: <span v-for="(life) in player1.lives" :key="life" >❤️</span></p>
                <p :className="(totalMoves -(movesMade+1) <= 10) ? 'is-size-3 has-text-danger' : 'is-size-4'" >{{totalMoves -(movesMade+1)}} minutes until midnight! 🕰️</p>
                <p class="has-text-4" >{{totalHoles - holeCount}} holes you can dig 🕳️</p>
            </div>

            <div class="content mt-6" >
                <h4>About</h4>
                <p>Version {{ version }}</p>
                <p>This was one of the firt programming books I read and learnt to code basic with... I have since re-adapted using Vue.js :-)</p>
                <p>&copy; Alan Ramsey, 1983, Author (Creepy Computer Games)</p>
                <p><a class="link is-primary" href="http://www.gamebase64.com/game.php?h=0&id=17555" target="_blank" >C64 ROM</a><br />
                <a class="link is-warning" href="http://bbcmicro.co.uk/game.php?id=3136" target="_blank" >Publication</a></p>
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
import enemyActions from '@/functions/enemyActions.js'
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
        setup.chars = this.debug ?  setup.debugChars : setup.chars;
        this.version = setup.version;
        this.buildGrid();
        addEventListener('keyup', this.keyUp);
    },
    methods: {
        getGridABC(idx) {
            return String.fromCharCode(idx + 64);
        },
        initialState(){
            return {
                version: "1.2.0",
                sGridC: 0, 
                debug: false,
                debugGravesOff: false,
                debugGrid: false,                
                message: '',
                grid: [],
                graveyard: [], /// For remembering where gravestones are...
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
            
            //this.gridSize[0] = (this.level > 1 && this.level < 4) ? this.gridSize[0]+setup.gridMultiplyer[0] : this.gridSize[0];
            //this.gridSize[1] = (this.level > 1 && this.level < 4) ? this.gridSize[1]+setup.gridMultiplyer[1] : this.gridSize[1];
            console.log('setup.gridSize', this.gridSize);
            this.sGridC = this.gridSize[1];

            let min = 0;
            let max = setup.chars.wall.length-1;
            let random_wall = 0;
            let random_walla = 0;

            /// Build Empty Grid
            for(let i=0; i<this.gridSize[0]; i++) {                
                
                random_walla = Math.floor(Math.random() * (max - min + 1) + min); Math.random(0, 1);
                this.grid[i] = [];

                for(let j = 0; j<this.gridSize[1]; j++) {
                    
                    this.grid[i][j] = setup.chars.openGround;
                    
                    let min = 0;
                    let max = setup.chars.wall.length-1;
                    random_wall = Math.floor(Math.random() * (max - min + 1) + min); Math.random(0, 1);

                    /// Build the Horizontal Wall Top
                    this.grid[0][j] = setup.chars.wall[random_wall];
                    if(i === this.gridSize[0]-1) {
                        console.log('i', i, setup.gridSize[0]-1)
                        /// Build the Horizontal Wall Below
                        this.grid[this.gridSize[0]-1][j] = setup.chars.wall[random_wall];
                    }
                    
                }            
                
                /// Build the Varticle Wall
                this.grid[i][0] = setup.chars.wall[random_walla];
                this.grid[i][this.gridSize[1]-1] = setup.chars.wall[random_walla];
                
            }

            /// TODO: Make Exit Random
            this.grid[this.gridSize[0]-2][this.gridSize[1]-1] = setup.chars.exit;

            if(!this.debugGravesOff) {
                /// Plant some gravestones...
                /// between 1x1 and 9x19 etc 
                for(let g=0;g<this.gridSize[1];g++){
                    let f = Math.floor(Math.random() * (this.gridSize[0]-3) + 2);
                    let g = Math.floor(Math.random() * (this.gridSize[1]-5) + 3);
                    this.grid[f][g] = setup.chars.gravestone;
                }
            }
            
            /// Add Some Skelebones, Bats etc...
            this.setupEnemies();

            this.grid[1][1] = setup.chars.player1;

            /// Remember where our gravestones are in case a bat flies over...
            //let graveyard = Object.assign({}, this.grid); 
            //this.graveyard = {...graveyard};
            this.graveyard = JSON.parse(JSON.stringify(this.grid));
            //// ---- Do an enemy test.... this.grid[2][2] = setup.chars.deadEnemy;
            console.log('level', this.level, 'grid', this.grid, this.graveyard);
            console.log('--------+++++++++---- SET UP COMPLETE ----++++++++++-------');

        },
        setupEnemies(){
            let lastPos = [];

            console.log(Object.keys(setup.levels[this.level-1]));

            Object.keys(setup.levels[this.level-1]).forEach((enemyType) => {

                console.log(enemyType, setup.levels[this.level-1][enemyType]);

                for(let s=0;s<setup.levels[this.level-1][enemyType];s++){                
                    let {...enemy} = setup.enemies[enemyType];
                    ///let {...enemy} = setup.enemies[enemyType].defaults;
                    ///let f = Math.floor(Math.random() * 7 + 2);
                    ///let g = Math.floor(Math.random() * 7 + 2);
                    let f = Math.floor(Math.random() * (this.gridSize[0]-3) + 2);
                    let g = Math.floor(Math.random() * (this.gridSize[1]-5) + 3);
                    console.log('try set enemy: ' + s, '@NS(f)', f, '@EW(g)', g);

                    if(lastPos.includes(f)) {
                        s--;
                    } else {
                        enemy.type = enemyType;
                        //enemy.allowedMoves = setup.enemies[enemyType].allowedMoves;
                        enemy.prevNorthSouth = 0;
                        enemy.prevEastWest = 0;                
                        enemy.currentNorthSouth = f;
                        enemy.currentEastWest = g;
                        enemy.char = setup.chars[enemyType] + (this.debug ? `(${s})` : '');
                        enemy.isBlocked = false;
                        enemy.isTrapped = false;
                        enemy.okMove = true;
                        enemy.respawned = false;
                        enemy.respawnedTo = [];
                        enemy.spawnHold = 0;
                        console.log('set enemy ok : ' + s, 'currentNorthSouth(f): ' + f, 'currentEastWest(g): ' + g, enemy);
                        this.enemies.push(enemy);
                        this.grid[f][g] = setup.chars[enemyType] + (this.debug ? `(${s})` : '');
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
                case setup.chars.wall.includes(this.grid[nS][eW]):
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
            let hasDied = false;

            console.log('makeMove called Player Move No: ' + this.movesMade, this.grid[nS][eW], this.enemies);

            let thingsThatKillMe = this.enemies.map(el => el.char).filter((value, index, self) => self.indexOf(value) === index);
            //let thingsThatKillMe = this.enemies.filter((value, index, self) => self.indexOf(value) === index);
            //let thingsThatKillMe = this.enemies;
            
            console.log('thingsThatKillMe', thingsThatKillMe, thingsThatKillMe.includes(this.grid[nS][eW]));
            console.log('touching....');
            console.log(this.grid[nS][eW], thingsThatKillMe.includes(this.grid[nS][eW]))
            console.log(this.grid[nS-1][eW], thingsThatKillMe.includes(this.grid[nS-1][eW]))
            console.log(this.grid[nS+1][eW], thingsThatKillMe.includes(this.grid[nS+1][eW]))
            console.log(this.grid[nS][eW-1], thingsThatKillMe.includes(this.grid[nS][eW-1]))
            console.log(this.grid[nS][eW+1], thingsThatKillMe.includes(this.grid[nS][eW+1]))
            
            switch(true) {
                case this.grid[nS][eW] === setup.chars.hole:
                    this.message = 'You Fell into a hole and died!';
                    this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.openGround;
                    this.grid[nS][eW] = setup.chars.died;
                    hasDied = true;                    
                    break;                       
                ///case this.grid[nS][eW] !== setup.chars.openGround && this.grid[nS][eW] !== setup.chars.deadEnemy:
                case thingsThatKillMe.includes(this.grid[nS][eW]):
                    console.log('Oh Dear! You ran into a '+this.grid[nS][eW]+' and they devoured you!');
                    this.message = 'Oh Dear! You ran into a '+this.grid[nS][eW]+' and they devoured you!';
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

            /// Check again have we run into any one...
            if(thingsThatKillMe.includes(this.grid[nS][eW])) {
                this.message = 'Oh Dear! You ran into a '+setup.chars[this.grid[nS][eW]]+' and they devoured you!';
                this.grid[this.player1.currentNorthSouth][this.player1.currentEastWest] = setup.chars.openGround;
                this.grid[nS][eW] = setup.chars.died;
                hasDied = true;
            }

            if(hasDied && this.player1.lives <= 0) {
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

            /// if move ok...
            this.makeMove();

        },
        moveEnemies() {

            console.clear();

            console.log('pre check enemies', this.enemies);
            
            //this.grid = enemyActions.move(this);
            this.grid = enemyActions.move(this);

            console.log('doublecheck enemies', this.enemies);

            /// if a bat flew over and there is an empty gap we need to restore the gravestones or we end up with an empty grid.
            this.grid.forEach((row, i) => {
                row.forEach((col, j) => {
                    
                    if(this.debugGrid)
                        console.log('grid,graveyard compare:',i,j,this.grid[i][j],this.graveyard[i][j]);
                    
                    if(this.grid[i][j] === setup.chars.openGround && this.graveyard[i][j] === setup.chars.gravestone) {
                        this.grid[i][j] = setup.chars.gravestone;
                    }
                });
            });    

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
            this.level = 1;
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
        margin-top: -12px;
        position: relative;
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
        display: inline-flex;
        align-items: center;
        justify-content: center;
        align-content: center;
        width: 40px;
        height: 30px;
        font-size: 20px;
        line-height: 1;
        background: #020a0a;
        border: 1px solid #081b00;
        vertical-align: middle;
        text-align: center;
    }

    .grid-item.exit {
        background: #020a0a00;
    }

    .grid-item.skeleton {
        animation-name: skelebone;
        animation-duration: 5s;
        animation-delay: 0.35s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
    }

    .grid-item.bat {
        animation-name: skelebone;
        animation-duration: 2.5s;
        animation-delay: 0.35s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in;
    }

    .grid-item.zombie {
        animation-name: skelebone;
        animation-duration: 7.5s;
        animation-delay: 0.35s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
    }
    
    @media screen and (max-width:768px) {
        .column .has-text-left,
        .column .has-text-right,
        .content {
            text-align: center !important;
        }
    }

    @media screen and (max-width:614px) {
        .grid-item {
            width: 24px;
            height: auto;
            font-size: 12px;
        }
        
    }

    
</style>