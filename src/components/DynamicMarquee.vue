<template>
  <div
    class="wrapper"
    ref="wrapper"
    @mouseenter="togglePause(true)"
    @mouseleave="togglePause(false)"
  >
    <div class="marquee" :ref="`marquee`" v-for="i in repeatNum" :key="i">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

interface elWithAnimationData {
  element: HTMLElement;
  lastTime?: number;
  progress?: number;
}

export default Vue.extend({
  name: "dynamic-marquee",
  components: {},
  props: {
    speed: {
      type: Object,
      default() {
        return {
          type: "pps",
          number: 50
        };
      },
      validator(val) {
        return (
          val.type &&
          ["pps", "duration"].includes(val.type) &&
          val.number &&
          !isNaN(val.number)
        );
      }
    },
    pps: {
      type: Number,
      default: 20
    },
    repeat: {
      type: Boolean,
      default: true
    },
    repeatMargin: {
      type: Number,
      default: 5
    },
    hoverPause: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      wrapperHeight: 0,
      marqueeHeight: 0,
      repeatNum: 2,
      marqueeArr: <HTMLElement[]>[],
      animatedElements: <Required<elWithAnimationData>[]>[],
      unanimatedElements: <elWithAnimationData[]>[],
      pause: false
    };
  },
  computed: {},
  methods: {
    calcWrapperHeight() {
      const wrapper = this.$refs.wrapper as HTMLElement;
      this.wrapperHeight = wrapper.getBoundingClientRect().height;
    },
    calcMarqueeHeight() {
      this.marqueeArr = this.$refs.marquee as HTMLElement[];
      const marquee = this.marqueeArr[0];
      this.marqueeHeight = marquee.getBoundingClientRect().height;
    },
    calcHeights() {
      this.calcWrapperHeight();
      this.calcMarqueeHeight();
    },
    calcRepeatNum() {
      const timesInWrapper =
        Math.ceil(
          this.wrapperHeight / (this.marqueeHeight + this.repeatMargin)
        ) + 1;
      if (timesInWrapper > 2) {
        this.repeatNum = timesInWrapper;
      }
    },
    async initialAnimationData() {
      this.animatedElements = [
        {
          element: this.marqueeArr[0],
          lastTime: performance.now(),
          progress: 0
        }
      ];
      await this.$nextTick();
      for (let i = 1; i < this.repeatNum; i++) {
        this.unanimatedElements.push({ element: this.marqueeArr[i] });
      }
    },
    translateMarquee(index: number, currentTime: number) {
      const elapsed = currentTime - this.animatedElements[index].lastTime;
      const currentProgress = this.getCurrentProgress(elapsed); 
      this.animatedElements[index].progress -= currentProgress;
      this.animatedElements[
        index
      ].element.style.transform = `translateY(${this.animatedElements[index].progress}px)`;
    },
    ppsProgressFromElapsed(elapsed: number) {
      const ratio = 1000 / elapsed;
      return this.speed.number / ratio;
    },
    durationProgressFromElapsed(elapsed: number) {
      const ratio = this.speed.number / elapsed;
      return (this.wrapperHeight + this.marqueeHeight) / ratio;
    },
    getCurrentProgress(elapsed: number) {
      switch (this.speed.type) {
        case "pps":
          return this.ppsProgressFromElapsed(elapsed);
        case "duration":
          return this.durationProgressFromElapsed(elapsed);
        default:
          return 0;
      }
    },
    revealNextElement(index: number, currentTime: number) {
      const emptyWrapperSpace =
        -this.animatedElements[index].progress - this.marqueeHeight;
      if (
        this.animatedElements.length < this.repeatNum &&
        emptyWrapperSpace >= this.repeatMargin &&
        index === this.animatedElements.length - 1
      ) {
        const toAnimate = this.unanimatedElements.shift();
        if (toAnimate) {
          this.animatedElements.push({
            ...toAnimate,
            lastTime: currentTime,
            progress: 0
          });
        }
      }
    },
    elementFinishedTranslate(index: number) {
      if (
        this.animatedElements[index].progress <=
        -(this.wrapperHeight + this.marqueeHeight)
      ) {
        this.animatedElements[index].element.style.transform = "none";
        const [toUnanimate] = this.animatedElements.splice(index, 1);
        this.unanimatedElements.push(toUnanimate);
      }
    },
    updateLastTime(index: number, currentTime: number) {
      this.animatedElements[index].lastTime = currentTime;
    },
    calcTranslation(currentTime: number) {
      for (let index = this.animatedElements.length - 1; index >= 0; index--) {
        if (!this.pause) {
          this.translateMarquee(index, currentTime);
          this.revealNextElement(index, currentTime);
          this.elementFinishedTranslate(index);
        }
        this.updateLastTime(index, currentTime);
      }
    },
    togglePause(bool: boolean) {
      // TODO: try to attach events dynamically, and check if mouseover will be better
      if (this.hoverPause) {
        this.pause = bool;
      }
    }
  },
  async mounted() {
    await this.$nextTick();
    this.calcHeights();
    this.calcRepeatNum();
    this.initialAnimationData();
    const translateMarquee = (currentTime: number) => {
      this.calcTranslation(currentTime);
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

.marquee {
  top: 100%;
  position: absolute;
  box-sizing: border-box;
}
</style>