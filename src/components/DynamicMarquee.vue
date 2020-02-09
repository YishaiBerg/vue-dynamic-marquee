<template>
  <div class="wrapper" ref="wrapper">
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
    }
  },
  data() {
    return {
      wrapperHeight: 0,
      marqueeHeight: 0,
      repeatNum: 2,
      marqueeArr: <HTMLElement[]>[],
      animatedElements: <Required<elWithAnimationData>[]>[],
      unanimatedElements: <elWithAnimationData[]>[]
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
      const ratio = 1000 / elapsed;
      const currentProgress = this.pps / ratio;
      this.animatedElements[index].progress -= currentProgress;
      this.animatedElements[
        index
      ].element.style.transform = `translateY(${this.animatedElements[index].progress}px)`;
      this.animatedElements[index].lastTime = currentTime;
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
    calcTranslation(currentTime: number){
      for (let index = this.animatedElements.length - 1; index >= 0; index--) {
        this.translateMarquee(index, currentTime);
        this.revealNextElement(index, currentTime);
        this.elementFinishedTranslate(index);
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