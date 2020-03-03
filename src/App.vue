<template>
  <div id="app">
    <div class="outer-wrapper">
    <dynamic-marquee direction="column" reverse>
      <ul>
        <li v-for="i in liNum" :key="i">
          Item {{i}}
        </li>
      </ul>
    </dynamic-marquee>
    </div>
    <button @click="liNum++">+</button>
    <button @click="liNum--">-</button>
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
    };
  },
  });
</script>
<style scoped>
.outer-wrapper {
  background-color: rebeccapurple;
  height: 30vh;
  width:  30vw;
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