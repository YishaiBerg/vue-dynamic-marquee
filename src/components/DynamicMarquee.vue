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
  progress: number;
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
          number: 100
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
      repeatNum: 1,
      marqueeArr: <HTMLElement[]>[],
      animatedElements: <Required<elWithAnimationData>[]>[],
      unanimatedElements: <elWithAnimationData[]>[],
      pause: false,
      lastTime: NaN
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
        );
      this.repeatNum = timesInWrapper + 1;
    },
    async initialAnimationData() {
      this.lastTime = performance.now();
      this.animatedElements = [
        {
          element: this.marqueeArr[0],
          progress: 0
        }
      ];
      await this.$nextTick();
      for (let i = 1; i < this.repeatNum; i++) {
        this.unanimatedElements.push({
          element: this.marqueeArr[i],
          progress: 0
        });
      }
    },
    translateMarquee(index: number, currentTime: number) {
      const elapsed = currentTime - this.lastTime;
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
          if (-this.animatedElements[index].progress < this.wrapperHeight) {
            const newProgress = emptyWrapperSpace - this.repeatMargin;
            toAnimate.element.style.transform = `translateY(-${newProgress}px)`;
            toAnimate.progress = -newProgress;
          }
          this.animatedElements.push(toAnimate);
        }
      }
    },
    elementFinishedTranslate(index: number) {
      if (
        this.animatedElements[index].progress <=
        -(this.wrapperHeight + this.marqueeHeight)
      ) {
        this.animatedElements[index].element.style.transform = "none";
        this.animatedElements[index].progress = 0;
        if (this.repeat) {
          const [toUnanimate] = this.animatedElements.splice(index, 1);
          this.unanimatedElements.push(toUnanimate);
        }
      }
    },
    updateLastTime(currentTime: number) {
      this.lastTime = currentTime;
    },
    calcTranslation(currentTime: number) {
      for (let index = this.animatedElements.length - 1; index >= 0; index--) {
        this.translateMarquee(index, currentTime);
        if (this.repeat) {
          this.revealNextElement(index, currentTime);
        }
        this.elementFinishedTranslate(index);
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
    if (this.repeat) {
      this.calcRepeatNum();
    }
    this.initialAnimationData();
    const translateMarquee = (currentTime: number) => {
      const longPause = currentTime - this.lastTime > 100;
      if (!this.pause && !longPause) {
        this.calcTranslation(currentTime);
      }
      this.updateLastTime(currentTime);
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