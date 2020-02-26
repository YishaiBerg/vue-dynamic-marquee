<template>
  <div
    class="wrapper"
    ref="wrapper"
    @mouseenter="togglePause(true)"
    @mouseleave="togglePause(false)"
  >
    <dynamic-marquee-element
      v-for="el in allElements"
      :key="el.id"
      ref="marqueeComponents"
      :progress="el.progress"
      :direction="direction"
      :reverse="reverse"
      :wrapperDirection="wrapperDirection"
    >
      <slot></slot>
    </dynamic-marquee-element>
  </div>
</template>

<script lang="ts">
/// <reference types="resize-observer-browser" />
import Vue from "vue";
import DynamicMarqueeElement from "./DynamicMarqueeElement.vue";

interface ProgressElement {
  progress: number;
  id: number;
}

export default Vue.extend({
  name: "dynamic-marquee",
  components: {
    DynamicMarqueeElement
  },
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
      marqueeElement: <HTMLElement | null>null,
      animatedElements: <ProgressElement[]>[
        {
          progress: 0,
          id: 0
        }
      ],
      unanimatedElements: <ProgressElement[]>[],
      pause: false,
      lastTime: NaN
    };
  },
  computed: {
    allElements(): ProgressElement[] {
      return [...this.animatedElements, ...this.unanimatedElements];
    },
    dimension() {
      switch (this.direction) {
        case "row":
          return "width";
        case "column":
        default:
          return "height";
      }
    },
    sign() {
      if (this.direction === "row") {
        return this.reverse ? "-" : "+";
      } else {
        return this.reverse ? "+" : "-";
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
      const marqueeComponentArr = this.$refs.marqueeComponents as Vue[];
      this.marqueeElement = marqueeComponentArr[0].$refs
        .marqueeElement as HTMLElement;
      this.marqueeDimension = this.marqueeElement.getBoundingClientRect()[
        this.dimension
      ];
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
      await this.$nextTick();
      for (let i = 1; i < this.repeatNum; i++) {
        this.unanimatedElements.push({
          progress: 0,
          id: i
        });
      }
    },
    translateMarquee(index: number, currentTime: number) {
      const elapsed = currentTime - this.lastTime;
      const currentProgress = this.getCurrentProgress(elapsed);
      const signedCurrentProgress = this.signNum(currentProgress);

      this.animatedElements[index].progress += signedCurrentProgress;
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
      if (this.marqueeElement) {
        resizeObserver.observe(this.marqueeElement);
      }
    },
    onResize(entries: ReadonlyArray<ResizeObserverEntry>) {
      entries.forEach(entry => {
        if (entry.target.isEqualNode(this.$refs.wrapper as Node)) {
          console.log("wrapper");
        } else if (entry.target.isEqualNode(this.marqueeElement)) {
          const newDimension = entry.contentRect[this.dimension];
          const difference = this.marqueeDimension - newDimension;
          this.pause = true;
          for (let i = this.animatedElements.length - 1; i > 0; i--) {
            // console.log(this.animatedElements[i].progress);
            this.animatedElements[i].progress += this.signNum(difference) * i;
            // console.log(this.animatedElements[i].progress);
            // TODO: still has bugs
            if (this.animatedElements[i].progress <= 0) {
              const [toUnanimate] = this.animatedElements.splice(i, 1);
              console.log(i);
              if (!this.unanimatedElements.length) {
                console.log("push");
                console.log(this.animatedElements, this.unanimatedElements);
                this.unanimatedElements.push(toUnanimate);
              }
            }
          }
          this.pause = false;
          this.marqueeDimension = newDimension;
        }
      });
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
}
</style>