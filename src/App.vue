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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import DynamicMarquee from "./components/DynamicMarquee.vue";

export default Vue.extend({
  name: 'app',
  components: {
    DynamicMarquee,
  },
  data() {
    return {
      liNum: 5
    }
  },
  created () {
    // setInterval(() => this.liNum++, 2000);
  },
  });
</script>
<style scoped>
.outer-wrapper {
  background-color: rebeccapurple;
  height: 200px;
  width:  200px;
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