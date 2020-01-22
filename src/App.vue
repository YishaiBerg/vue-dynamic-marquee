<template>
  <div id="app">
    <div class="outer-wrapper">
    <dynamic-marquee>
     <div>
       Hello world
     </div>
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
  }
  });
</script>
<style scoped>
.outer-wrapper {
  background-color: rebeccapurple;
  height: 200px;
  width:  200px;
  border: 2px solid red;
}
</style>