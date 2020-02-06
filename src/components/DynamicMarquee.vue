<template>
  <div class="wrapper" :style="cssVars" ref="wrapper">
    <div class="marquee" :ref="`marquee`" v-for="i in repeatNum" :key="i">
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
    repeatMargin: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      wrapperHeight: 0,
      marqueeHeight: 0,
      repeatNum: 2
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
  async mounted() {
    await this.$nextTick();
    const wrapper = this.$refs.wrapper as HTMLElement;
    this.wrapperHeight = wrapper.getBoundingClientRect().height;
    const marqueeArr = this.$refs.marquee as HTMLElement[];
    const marquee = marqueeArr[0];
    this.marqueeHeight = marquee.getBoundingClientRect().height;
    const timesInWrapper = Math.ceil(
      this.wrapperHeight / (this.marqueeHeight + this.repeatMargin)
    ) + 1;
    if (timesInWrapper > 2) {
      this.repeatNum = timesInWrapper;
    }
    const animatedElements = [
      {
        element: marquee,
        lastTime: performance.now(),
        progress: 0
      }
    ];
    const unanimatedElements: any = [];
    await this.$nextTick();
    for (let i = 1; i < this.repeatNum; i++) {
      unanimatedElements.push({ element: marqueeArr[i] });
    }

    const calcTranslation = (currentTime: number): void => {
      for (let index = animatedElements.length - 1; index >= 0; index--) {
        const elapsed = currentTime - animatedElements[index].lastTime;
        const ratio = 1000 / elapsed;
        const currentProgress = this.pps / ratio;
        animatedElements[index].progress -= currentProgress;
        console.log(animatedElements[index].progress)
        animatedElements[
          index
        ].element.style.transform = `translateY(${animatedElements[index].progress}px)`;
        animatedElements[index].lastTime = currentTime;
        const emptyWrapperSpace =
          -animatedElements[index].progress - this.marqueeHeight;
        if (
          animatedElements[index].progress <=
          -(this.wrapperHeight + this.marqueeHeight)
        ) {
          animatedElements[index].element.style.transform = "none";
          const [toUnanimate] = animatedElements.splice(index, 1);
          unanimatedElements.push(toUnanimate);
          // console.log(unanimatedElements);
        } else if (
          animatedElements.length < this.repeatNum &&
          emptyWrapperSpace >= this.repeatMargin &&
          index === animatedElements.length - 1
        ) {
          const toAnimate = unanimatedElements.shift();
          console.log(toAnimate);
          if (toAnimate) {
            animatedElements.push({
              ...toAnimate,
              lastTime: currentTime,
              progress: 0
            });
          }
        }
      }

      // console.log(emptyWrapperSpace);
    };

    const translateMarquee = (currentTime: number) => {
      calcTranslation(currentTime);
      requestAnimationFrame(translateMarquee);
    };
    requestAnimationFrame(translateMarquee);
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
  position: absolute;
  box-sizing: border-box;
  /* animation: marquee var(--marquee-speed) linear infinite; */
}

.marquee2 {
  top: var(--wrapper-height);
  position: absolute;
  box-sizing: border-box;
  animation: marquee 5s linear infinite;
}
.marquee:hover {
  animation-play-state: paused;
}
</style>