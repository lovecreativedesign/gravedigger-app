import setup from '@/config/setup';
import Skeleton from './enemies/Skeleton';
import Bat from './enemies/Bat';
import Zombie from './enemies/Zombie';
import Werewolf from './enemies/Werewolf';
import Vampire from './enemies/Vampire';
import Ghost from './enemies/Ghost';
export default {
	move(that){

		console.log('subfunction  enemyActions called ...', that.enemies);  

		let hasDied = false;
		let special_char = null;
		
		that.enemies.forEach((enemy, i) => {
			
			let deepClone = {...enemy};

			let class_enemy = null;

			switch(true) {
				case enemy.type === 'bat':
					class_enemy = new Bat;
					break;
				case enemy.type === 'zombie':
					class_enemy = new Zombie;
					break;
				case enemy.type === 'werewolf':
					class_enemy = new Werewolf;
					break;
				case enemy.type === 'vampire':
					class_enemy = new Vampire;
					break;
				case enemy.type === 'ghost':
					class_enemy = new Ghost;
					break;
				default:
				class_enemy = new Skeleton;
			}

			if(enemy?.respawned) {

				console.log('ReeeeSpaaawned.....', deepClone, that.enemies[i], enemy);	

				if(class_enemy && class_enemy?.respawnRule !== undefined) {
					console.log('%cCallingRESPAWNRULE<>>>>',"color:white;background:red");
					let rR = class_enemy.respawnRule(enemy, that.grid);
					enemy = rR.enemy;
					that.grid = rR.grid;
				}
				
			}

			/// the old positions are set to the current position
			enemy.prevNorthSouth = enemy.currentNorthSouth;
			enemy.prevEastWest = enemy.currentEastWest;
			
			
			console.log(` `);
			console.log(`%cXXXXXX ++++++++++++++----- XXXXXX ----+++++++++++++ XXXXXX`, "color:red");
			console.log(`++++++++++++++----- enemy ${i} ${enemy.type} ----+++++++++++++`);
			console.log('that.directionMoved', that.directionMoved);
			console.log('curr enemy as clone', deepClone);
			console.log('curr enemy', enemy);
			console.log('CurrEw: ' + enemy.prevEastWest, 'CurrNs: ' + enemy.prevNorthSouth);        
			console.log('checking...',
			'Curr Enemy', that.grid[enemy.prevNorthSouth][enemy.prevEastWest], 
			'N', that.grid[enemy.prevNorthSouth-1][enemy.prevEastWest], 
			'S', that.grid[enemy.prevNorthSouth+1][enemy.prevEastWest], 
			'E', that.grid[enemy.prevNorthSouth][enemy.prevEastWest+1], 
			'W', that.grid[enemy.prevNorthSouth][enemy.prevEastWest-1]);			

			let profile = {
				char: enemy.char,
				currentEnemy: enemy,
				currentEnemyIdx: i,
				level: that.level,
				grid: that.grid,
				gridSize: that.gridSize,
				enemies: that.enemies,
				directionMoved: that.directionMoved,
				movesMade: that.movesMade,
				message: that.message,
				player1: that.player1,
				player2: that.player2,
				prevNorthSouth: enemy.prevNorthSouth,
				prevEastWest: enemy.prevEastWest,
				currentNorthSouth: enemy.currentNorthSouth,
				currentEastWest: enemy.currentEastWest,
				isBlocked: enemy.isBlocked,
				isTrapped: enemy.isTrapped,
				respawned: enemy.respawned,
				respawnedTo: enemy.respawnedTo,
				spawnHold: enemy.spawnHold
			};
			
			if(class_enemy) {
				class_enemy.init(profile);
				let enemy_move = (class_enemy.move());
				special_char = enemy_move?.special_char ?? special_char;
				enemy.currentNorthSouth = enemy_move.currentNorthSouth;
				enemy.currentEastWest = enemy_move.currentEastWest;			
				enemy.isBlocked = enemy_move.isBlocked;
				enemy.isTrapped = enemy_move.isTrapped;
				enemy.okMove = enemy_move.okMove;
				enemy.respawned = enemy_move?.respawned;
				enemy.respawnedTo = enemy_move?.respawnedTo;
				enemy.spawnHold = enemy_move?.spawnHold ?? enemy.spawnHold;
				console.log('++++ ENEMY IS NOW +++++ --->', enemy);
			}
						
			if(that.grid[enemy.currentNorthSouth][enemy.currentEastWest] === setup.chars.hole) {
				enemy.isTrapped = true;
				that.grid[enemy.currentNorthSouth][enemy.currentEastWest] = setup.chars.openGround;
				that.message = enemy.type + ' fell into a hole!';
			}

			/// If Enemy runs into player.... enemy = nom, nom, nom....
			if(that.grid[enemy.currentNorthSouth][enemy.currentEastWestEw] === setup.chars.player1){
				that.message = 'Eek! You ran into a '+ enemy.type + ' and they devoured you!';
				hasDied = true;
			}

			/*if(!enemy.okMove) {

				enemy.currentNorthSouth = enemy.previousNorthSouth;
				enemy.currentEastWest = enemy.previousEastWest;

			}*/
			
			if(hasDied) {
				that.grid[that.player1.currentNorthSouth][that.player1.currentEastWest] = setup.chars.died;
				that.player1.currentNorthSouth = 1;
				that.player1.currentEastWest = 1;
				that.grid[1][1] = setup.chars.player1;
				that.player1.lives--;
				that.playerHasMoved = false;
			}

			if(enemy.isBlocked) {
				console.log('enemy is blocked...', enemy, that.enemies[i])
				enemy.currentNorthSouth = enemy.prevNorthSouth;
				enemy.currentEastWest = enemy.prevEastWest;
				that.enemies[i] = enemy;
			} else if(enemy.isTrapped) {
				that.grid[enemy.prevNorthSouth][enemy.prevEastWest] = setup.chars.openGround;
				that.grid[enemy.currentNorthSouth][enemy.currentEastWest] = setup.chars.deadEnemy;
				delete that.enemies[i];
			} else {
				that.grid[enemy.prevNorthSouth][enemy.prevEastWest] = setup.chars.openGround;
				that.grid[enemy.currentNorthSouth][enemy.currentEastWest] = special_char ?? setup.chars[enemy.type] + (that.debug ? `(${i})` : ''); 
				console.log('enemy moving ,...', enemy, that.enemies[i]);
			}

			enemy.isBlocked = false;
			///that.enemies[i] = enemy;

			/// If multiplied push another enemey to the screen
			if(enemy.multiply) {
				let nEnemy = {...enemy};
				nEnemy.currentNorthSouth = enemy.prevNorthSouth;
				nEnemy.currentEastWest = enemy.currentEastWest;
				nEnemy.multiply = false;
				nEnemy.isBlocked = true;
				console.log('%cpushing enemies', 'color:red;background:white');
				that.enemies.push(nEnemy);
				that.grid[nEnemy.currentNorthSouth][nEnemy.currentEastWest] = nEnemy.char;
				enemy.multiply = false;
				console.log('pushing enemies', that.enemies, nEnemy);
			}
			
			console.log('Enemy now? ', enemy);

		});

		return that.grid;

	}
}