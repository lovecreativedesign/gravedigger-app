import setup from '@/config/setup';
import Skeleton from './enemies/Skeleton';
import Bat from './enemies/Bat';
import Zombie from './enemies/Zombie';
import Werewolf from './enemies/Werewolf';
import Vampire from './enemies/Vampire';
export default {
	move(that){

		console.log('subfunction  enemyActions called ...', that.enemies);  

		let hasDied = false;
		
		that.enemies.forEach((enemy, i) => {

			/// the new positions are set to the current position
			let newNs = null;
			let newEw = null;

			if(enemy?.respawned) {
				that.grid[enemy.respawnedTo[0]][enemy.respawnedTo[1]] = setup.chars[enemy.type];
				that.enemies[i].currentNorthSouth = enemy.respawnedTo[0];
				that.enemies[i].currentEastWest = enemy.respawnedTo[1];
				that.grid[enemy.prevNorthSouth][enemy.prevEastWest] = setup.chars.openGround;
			}


			enemy.prevNorthSouth = enemy.currentNorthSouth;
			enemy.prevEastWest = enemy.currentEastWest;
			
			console.log(` `);
			console.log(`XXXXXX ++++++++++++++----- XXXXXX ----+++++++++++++ XXXXXX`);
			console.log(`++++++++++++++----- enemy ${i} ${enemy.type} ----+++++++++++++`);
			console.log('that.directionMoved', that.directionMoved);
			console.log('curr enemy', Object.entries(enemy));
			console.log('CurrEw: ' + enemy.prevEastWest, 'CurrNs: ' + enemy.prevNorthSouth);        
			console.log('checking...',
			'Curr Enemy', that.grid[enemy.prevNorthSouth][enemy.prevEastWest], 
			'N', that.grid[enemy.prevNorthSouth-1][enemy.prevEastWest], 
			'S', that.grid[enemy.prevNorthSouth+1][enemy.prevEastWest], 
			'E', that.grid[enemy.prevNorthSouth][enemy.prevEastWest+1], 
			'W', that.grid[enemy.prevNorthSouth][enemy.prevEastWest-1]);			

			let profile = {
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
				currentEastWest: enemy.currentEastWest
			};

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
				default:
				class_enemy = new Skeleton;
			}

			

			
			if(class_enemy) {
				class_enemy.init(profile);
				let enemy_move = (class_enemy.move(enemy, i, enemy.currentNorthSouth, enemy.currentEastWest));
				newEw = enemy_move.newEw;
				newNs = enemy_move.newNs;
				enemy.isBlocked = enemy_move.isBlocked;
				enemy.isTrapped = enemy_move.isTrapped;
				enemy.okMove = enemy_move.okMove;
				enemy.respawned = enemy_move?.respawned;
				enemy.respawnedTo = enemy_move?.respawnedTo;
				console.log('++++ ENEMY IS +++++ --->', enemy);
			}
			
			console.log('enemy moves to', newEw, newNs, that.grid[newNs][newEw]);
			
			if(that.grid[newNs][newEw] === setup.chars.hole) {
				enemy.isTrapped = true;
				that.grid[newNs][newEw] = setup.chars.openGround;
				console.log('enemy is trapped!', enemy);
				that.message = enemy.type + ' fell into a hole!';
			}

			/// If Enemy runs into player.... enemy = nom, nom, nom....
			if(that.grid[newNs][newEw] === setup.chars.player1){
				that.message = 'Eek! You ran into a '+ enemy.type + ' and they devoured you!';
				hasDied = true;
			}

			if(enemy.okMove) {

				enemy.currentNorthSouth = newNs;
				enemy.currentEastWest = newEw;

			}
			
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
				that.grid[enemy.currentNorthSouth][enemy.currentEastWest] = setup.chars[enemy.type] + (that.debug ? `(${i})` : ''); 
				console.log('is er moving ,...', enemy, that.enemies[i])
			}

			enemy.isBlocked = false;
			///that.enemies[i] = enemy;
			
			console.log('Enemy now? ', enemy);

		});

		return that.grid;

	}
}