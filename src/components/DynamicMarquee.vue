<template>
  <div class="wrapper" :style="cssVars">
    <div class="marquee" ref="marquee">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "dynamic-marquee",
  components: {},
  props: {
    pps: {
      type: Number,
      default: 20
    },
  },
  data() {
    return {
      marqueeHeight: 0
    };
  },
  computed: {
    cssVars(): object {
      return {
        "--marquee-height": this.marqueeHeight + "px",
        "--minus-marquee-height": -this.marqueeHeight + "px",
        "--marquee-speed": this.marqueeHeight / this.pps + "s"
      };
    }
  },
  mounted() {
    this.$nextTick(() => {
      const marquee = this.$refs.marquee as HTMLElement;
      this.marqueeHeight = marquee.offsetHeight;
    });
  }
});
</script>

<style scoped>
.wrapper {
  overflow: hidden;
  height: 100%;
  width: 100%;
  position: relative;
}

@keyframes marquee {
  0% {
    top: var(--marquee-height);
  }
  100% {
    top: var(--minus-marquee-height);
  }
}

.marquee {
  top: var(--marquee-height);
  position: relative;
  box-sizing: border-box;
  animation: marquee var(--marquee-speed) linear infinite;
}

.marquee:hover {
  animation-play-state: paused;
}
</style>