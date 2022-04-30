<template>
  <h1 class="is-1" >GraveDigger</h1>
  <GameBoard />
</template>

<script>

import GameBoard from './components/GameBoard.vue'

export default {
  name: 'App',
  components: {
    GameBoard
  }
}
</script>

<style>
@keyframes colorME {
  0% { color: #00d1b2 !important; text-shadow: 0 0 5px rgba(255, 128, 0, 0.84); }
  30% { color: #ffe08a !important; text-shadow: 0 0 5px rgba(234, 255, 0, 0.779); }
  58% { color: #3e8ed0 !important; text-shadow: 0 0 5px rgba(255, 0, 234, 0.779);  }
  100% { color: #f14668 !important; text-shadow: 0 0 5px rgba(40, 255, 0, 0.779);  }
}
#app {
  font-family: 'Creepster', cursive;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  padding: 40px;
  background: black;
  color: ghostwhite;
}
#app h1 {
  font-size: 3em;
  animation-name: colorME;
  animation-duration: 15s;
  animation-delay: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: step-start; 
}
@media screen and (max-width: 614px) {
  #app {
    padding: 10px;
  }
}
</style>
