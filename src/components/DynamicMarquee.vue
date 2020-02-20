<template>
  <div
    class="wrapper"
    ref="wrapper"
    @mouseenter="togglePause(true)"
    @mouseleave="togglePause(false)"
  >
    <div class="marquee" :ref="`marquee`" :style="initialPosition" v-for="i in repeatNum" :key="i">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
/// <reference types="resize-observer-browser" />
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
    },
    direction: {
      type: String,
      default: "column",
      validator(val) {
        return ["column", "row"].includes(val);
      }
    },
    reverse: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      wrapperDimension: 0,
      marqueeDimension: 0,
      wrapperDirection: "",
      repeatNum: 1,
      marqueeArr: <HTMLElement[]>[],
      animatedElements: <Required<elWithAnimationData>[]>[],
      unanimatedElements: <elWithAnimationData[]>[],
      pause: false,
      lastTime: NaN
    };
  },
  computed: {
    dimension() {
      switch (this.direction) {
        case "row":
          return "width";
        case "column":
        default:
          return "height";
      }
    },
    axis() {
      switch (this.direction) {
        case "row":
          return "X";
        case "column":
        default:
          return "Y";
      }
    },
    sign() {
      if (this.direction === "row") {
        return this.reverse ? "-" : "+";
      } else {
        return this.reverse ? "+" : "-";
      }
    },
    initialPosition(): object {
      if (this.direction === "row") {
        if (
          (this.wrapperDirection === "ltr" && !this.reverse) ||
          (this.wrapperDirection === "rtl" && this.reverse)
        ) {
          return { right: "100%" };
        } else return { left: "100%" };
      } else {
        if (this.reverse) {
          return { bottom: "100%" };
        } else {
          return { top: "100%" };
        }
      }
    }
  },
  methods: {
    positivise(num: number) {
      return Math.sign(num) * num;
    },
    signNum(num: number) {
      return +(this.sign + 1) * num;
    },
    calcWrapperDimension() {
      const wrapper = this.$refs.wrapper as HTMLElement;
      this.wrapperDimension = wrapper.getBoundingClientRect()[this.dimension];
    },
    calcMarqueeDimension() {
      this.marqueeArr = this.$refs.marquee as HTMLElement[];
      const marquee = this.marqueeArr[0];
      this.marqueeDimension = marquee.getBoundingClientRect()[this.dimension];
    },
    calcDimensions() {
      this.calcWrapperDimension();
      this.calcMarqueeDimension();
    },
    calcRepeatNum() {
      const timesInWrapper = Math.ceil(
        this.wrapperDimension / (this.marqueeDimension + this.repeatMargin)
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
      const signedCurrentProgress = this.signNum(currentProgress);

      this.animatedElements[index].progress += signedCurrentProgress;

      this.animatedElements[
        index
      ].element.style.transform = `translate${this.axis}(${this.animatedElements[index].progress}px)`;
    },
    ppsProgressFromElapsed(elapsed: number) {
      const ratio = 1000 / elapsed;
      return this.speed.number / ratio;
    },
    durationProgressFromElapsed(elapsed: number) {
      const ratio = this.speed.number / elapsed;
      return (this.wrapperDimension + this.marqueeDimension) / ratio;
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
        this.positivise(this.animatedElements[index].progress) -
        this.marqueeDimension;
      if (
        this.animatedElements.length < this.repeatNum &&
        emptyWrapperSpace >= this.repeatMargin &&
        index === this.animatedElements.length - 1
      ) {
        const toAnimate = this.unanimatedElements.shift();
        if (toAnimate) {
          if (
            this.positivise(this.animatedElements[index].progress) <
            this.wrapperDimension
          ) {
            const newProgress = this.signNum(
              emptyWrapperSpace - this.repeatMargin
            );
            toAnimate.element.style.transform = `translateY(${newProgress}px)`;
            toAnimate.progress = +newProgress;
          }
          this.animatedElements.push(toAnimate);
        }
      }
    },
    elementFinishedTranslate(index: number) {
      if (
        this.positivise(this.animatedElements[index].progress) >=
        this.wrapperDimension + this.marqueeDimension
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
    },
    setWrapperDirection() {
      const wrapper = this.$refs.wrapper as HTMLElement;
      this.wrapperDirection = getComputedStyle(wrapper).getPropertyValue(
        "direction"
      );
    },
    setResizeObserver() {
      const resizeObserver = new ResizeObserver(this.onResize);
      resizeObserver.observe(this.$refs.wrapper as HTMLElement);
      const marqueeArr = this.$refs.marquee as HTMLElement[];
      resizeObserver.observe(marqueeArr[0]);
    },
    onResize(entries: ReadonlyArray<ResizeObserverEntry>) {
      console.log(entries);
      // if (entries[0].target.isEqualNode(this.$refs.wrapper)) {
      //   console.log("wrapper");
      // } else if (entries[0].target.isEqualNode(this.$refs.marquee[0])) {
      //   this.calcDimensions();
      //   if (this.repeat) {
      //     this.calcRepeatNum();
      //   }
      //   this.initialAnimationData()
      // }
    }
  },
  async mounted() {
    await this.$nextTick();
    this.calcDimensions();
    this.setWrapperDirection();
    if (this.repeat) {
      this.calcRepeatNum();
    }
    this.initialAnimationData();
    this.setResizeObserver();
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
  position: absolute;
  box-sizing: border-box;
}
</style>