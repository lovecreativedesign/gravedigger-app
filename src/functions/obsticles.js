import setup from '@/config/setup';
const obsticles = [
    ///setup.chars.wall[0],setup.chars.wall[1],setup.chars.wall[2], 
    setup.chars.gravestone, 
    setup.chars.skeleton, 
    setup.chars.bat, 
    setup.chars.zombie,
    setup.chars.werewolf,
    setup.chars.vampire,
    setup.chars.ghost,
    setup.chars.goblin,
    setup.chars.ogre,
    setup.chars.exit,
    setup.chars.spawned,
    setup.chars.unSpawned,
    setup.chars.exit,
    /// For debugging
    's(0)',
    's(1)',
    's(2)',
    1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20
];
setup.chars.wall.forEach(el => obsticles.push(el));
export default obsticles;