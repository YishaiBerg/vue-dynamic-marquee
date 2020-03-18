<template>
  <div id="app">
    <div class="outer-wrapper">
      <dynamic-marquee direction="column" reverse>
        <ul v-if="!notZero">
          <li v-for="i in liNum" :key="i">Item {{i}}</li>
        </ul>
      </dynamic-marquee>
    </div>
    <div class="btns">
      <button @click="liNum++">+</button>
      <button @click="liNum--">-</button>
    <button @click="notZero = !notZero">0</button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import DynamicMarquee from './components/DynamicMarquee';

export default Vue.extend({
  name: 'app',
  components: {
    DynamicMarquee,
  },
  data() {
    return {
      liNum: 1,
      notZero: false
    };
  },
});
</script>
<style scoped>
.outer-wrapper {
  background-color: rebeccapurple;
  height: 30vh;
  width: 30vw;
  border: 2px solid red;
  position: absolute;
  top: 40vh;
  left: 0;
  right: 0;
  margin: 0 auto;
}
ul {
  margin-block-start: 0;
  margin-block-start: 0;
}
</style>