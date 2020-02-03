<template>
  <div class="wrapper" :style="cssVars" ref="wrapper">
    <div class="marquee" ref="marquee">
      <slot></slot>
    </div>
    <!-- <div class="marquee2" ref="marquee2">
      <li v-for="i in 5" :key="i">
          Item {{i}}
        </li>
    </div> -->
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
    }
  },
  data() {
    return {
      wrapperHeight: 0,
      marqueeHeight: 0
    };
  },
  computed: {
    cssVars(): object {
      return {
        "--wrapper-height": this.wrapperHeight + "px",
        "--marquee-height": this.marqueeHeight + "px",
        "--minus-marquee-height": -this.marqueeHeight + "px",
        "--marquee-speed": this.marqueeHeight / this.pps + "s"
      };
    },
    height() {
      const a = this.$refs.marquee as Element;
      return a.getBoundingClientRect().height;
    }
  },
  mounted() {
    this.$nextTick(() => {
      const wrapper = this.$refs.wrapper as HTMLElement;
      this.wrapperHeight = wrapper.getBoundingClientRect().height;
      const marquee = this.$refs.marquee as HTMLElement;
      this.marqueeHeight = marquee.getBoundingClientRect().height;
      // if(ResizeObserver) {
      //   const resizeObserver = new ResizeObserver((enteries: any) => {
      //     console.log(enteries)
      //   })
      // }

      let lastTime = NaN;
      let currentPosition = this.wrapperHeight;
      let progress = 0;
      const translateMarquee = (currentTime: number): void => {
       if (lastTime) {
         const elapsed = currentTime - lastTime;
         const ratio = 1000 / elapsed;
         const currentProgress = this.pps / ratio;
         progress -= currentProgress;
         marquee.style.transform = `translateY(${progress}px)`
         console.log(currentProgress)
       }
        lastTime = currentTime;
        if(progress > -(this.wrapperHeight + this.marqueeHeight)) {
          requestAnimationFrame(translateMarquee)
        }
      };
      requestAnimationFrame(translateMarquee);
      //* pseudo code: if (marquee not higher than wrapper) {
              // * translate 
      //* }
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

/* @keyframes marquee {
  0% {
    top: var(--wrapper-height);
  }
  100% {
    top: var(--minus-marquee-height);
  }
}

@keyframes marquee2 {
  0% {
    top: calc(var(--wrapper-height) * 2 + 10px);
  }
  100% {
    top: var(--minus-marquee-height);
  }
} */

.marquee {
  top: var(--wrapper-height);
  position: relative;
  box-sizing: border-box;
  animation: marquee var(--marquee-speed) linear infinite;
}

.marquee {
  top: var(--wrapper-height);
  position: relative;
  box-sizing: border-box;
  animation: marquee var(--marquee-speed) linear infinite;
}

.marquee2 {
  top: calc(var(--wrapper-height) * 2 + 10px);
  position: relative;
  box-sizing: border-box;
  animation: marquee 5s linear infinite;
}
.marquee:hover {
  animation-play-state: paused;
}
</style>