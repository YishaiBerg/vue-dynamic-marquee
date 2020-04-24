
import Vue, { VNode } from 'vue';
import DynamicMarqueeElement from './DynamicMarqueeElement';

interface ProgressElement {
  progress: number;
  id: number;
}

export default Vue.extend({
  name: 'dynamic-marquee',
  components: {
    DynamicMarqueeElement,
  },
  props: {
    speed: {
      type: Object,
      default() {
        return {
          type: 'pps',
          number: 100,
        };
      },
      validator(val) {
        return (
          val.type &&
          ['pps', 'duration'].includes(val.type) &&
          val.number &&
          !isNaN(val.number)
        );
      },
    },
    repeat: {
      type: Boolean,
      default: true,
    },
    repeatMargin: {
      type: Number,
      default: 10,
    },
    hoverPause: {
      type: Boolean,
      default: true,
    },
    pause: {
      type: Boolean,
      default: false,
    },
    direction: {
      type: String,
      default: 'column',
      validator(val) {
        return ['column', 'row'].includes(val);
      },
    },
    reverse: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      wrapperDimension: 0,
      marqueeDimension: 0,
      wrapperDirection: '',
      repeatNum: 1,
      lastId: 0,
      marqueeElement: null as HTMLElement | null,
      animatedElements: [
        {
          progress: 0,
          id: 0,
        },
      ] as ProgressElement[],
      unanimatedElements: [] as ProgressElement[],
      pauseInner: false,
      lastTime: 0,
      resizeElementId: 0,
      resizeObserver: null as ResizeObserver | null,
      deletedElements: [] as number[],
      marqueeNoDimension: false,
      testData: {
        inTest: false,
        wrapperDimension: 120,
        marqueeDimension: 20,
        wrapperDirection: 'ltr',
      },
    };
  },
  computed: {
    allElements(): ProgressElement[] {
      return [...this.animatedElements, ...this.unanimatedElements];
    },
    dimension() {
      switch (this.direction) {
        case 'row':
          return 'width';
        case 'column':
        default:
          return 'height';
      }
    },
    sign() {
      return this.reverse ? '-' : '+';
    },
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
      if (this.testData.inTest) {
        this.wrapperDimension = this.testData.wrapperDimension;
      } else {
        this.wrapperDimension = wrapper.getBoundingClientRect()[this.dimension];
      }
    },
    calcMarqueeDimension() {
      const marqueeComponentArr = this.$refs.marqueeComponents as Vue[];
      this.marqueeElement = marqueeComponentArr[0].$refs
        .marqueeElement as HTMLElement;
      if (this.testData.inTest) {
        this.marqueeDimension = this.testData.marqueeDimension;
      } else {
        this.marqueeDimension = this.marqueeElement.getBoundingClientRect()[
          this.dimension
        ];
      }
    },
    calcDimensions() {
      this.calcWrapperDimension();
      this.calcMarqueeDimension();
    },
    calcRepeatNum() {
      const timesInWrapper = Math.ceil(
        this.wrapperDimension / (this.marqueeDimension + this.repeatMargin),
      );
      return timesInWrapper + 1;
    },
    async initialAnimationData() {
      await this.$nextTick();
      for (let i = 1; i < this.repeatNum; i++) {
        this.unanimatedElements.push({
          progress: 0,
          id: i,
        });
      }
      this.lastId = this.repeatNum - 1;
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
        case 'pps':
          return this.ppsProgressFromElapsed(elapsed);
        case 'duration':
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
              emptyWrapperSpace - this.repeatMargin,
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
        if (this.repeat && this.wrapperDimension > this.repeatMargin) {
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
    togglePause(event: Event) {
      if (this.hoverPause) {
        switch (event.type) {
          case 'mouseenter':
            this.pauseInner = true;
            break;
          case 'mouseleave':
            this.pauseInner = false;
        }
      }
    },
    setWrapperDirection() {
      if (this.testData.inTest) {
        this.wrapperDirection = this.testData.wrapperDirection;
      } else {
        const wrapper = this.$refs.wrapper as HTMLElement;
        this.wrapperDirection = getComputedStyle(wrapper).getPropertyValue(
          'direction',
        );
      }
    },
    async setResizeObserver() {
      if ('ResizeObserver' in window === false) {
        // Loads polyfill asynchronously, only if required.
        const module = await import('@juggle/resize-observer');
        // @ts-ignore
        window.ResizeObserver = module.ResizeObserver;
      }
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.$refs.wrapper as HTMLElement);
      if (this.marqueeElement) {
        this.resizeObserver.observe(this.marqueeElement);
      }
    },
    onResize(entries: ReadonlyArray<ResizeObserverEntry>) {
      this.pauseInner = true;
      entries.forEach((entry) => {
        if (entry.target.isEqualNode(this.$refs.wrapper as Node)) {
          this.onWrapperResize(entry.contentRect[this.dimension]);
        } else if (entry.target.isEqualNode(this.marqueeElement)) {
          this.onMarqueeElementResize(entry.contentRect[this.dimension]);
        }
        this.pauseInner = false;
      });
    },
    onWrapperResize(newDimension: number) {
      this.wrapperDimension = newDimension;
      this.addOrRemoveElements();
    },
    onMarqueeElementResize(newDimension: number) {
      if (!newDimension) {
        this.marqueeNoDimension = true;
      } else if (this.marqueeNoDimension) {
        this.resetAnimation();
        this.marqueeNoDimension = false;
      } else {
        const difference = this.marqueeDimension - newDimension;
        for (let i = this.animatedElements.length - 1; i > 0; i--) {
          this.animatedElements[i].progress += this.signNum(difference) * i;
          this.moveMinusToUnanimated(i);
        }
        this.marqueeDimension = newDimension;
        this.addOrRemoveElements();
      }
    },
    moveMinusToUnanimated(index: number) {
      const beyondWrapper =
        Math.sign(this.animatedElements[index].progress) !== +(this.sign + 1);
      if (beyondWrapper) {
        this.animatedElements[index].progress = 0;
        const [toUnanimate] = this.animatedElements.splice(index, 1);
        this.unanimatedElements.push(toUnanimate);
      }
    },
    async addOrRemoveElements() {
      if (this.repeat) {
        const newRepeatNum = this.calcRepeatNum();
        const difference = newRepeatNum - this.repeatNum;
        if (difference > 0) {
          for (let i = 0; i < difference; i++) {
            // TODO: verify this is necessary
            const arr = this.animatedElements.length
              ? 'unanimatedElements'
              : 'animatedElements';
            this[arr].push({
              progress: 0,
              id: ++this.lastId,
            });
          }
        } else if (difference < 0) {
          for (let i = 0; i > difference; i--) {
            if (this.unanimatedElements.length) {
              if (!this.testData.inTest) {
                this.updateObservedElement(this.unanimatedElements.length - 1);
              }
              const el = this.unanimatedElements.pop();
              if (el) {
                this.deletedElements.push(el.id);
              }
            }
            if (!this.testData.inTest) {
              await this.$nextTick();
            }
          }
        }
        this.repeatNum = newRepeatNum;
      }
    },
    updateObservedElement(index: number) {
      if (
        this.unanimatedElements[index] &&
        this.unanimatedElements[index].id === this.resizeElementId
      ) {
        this.resizeObserver!.unobserve(this.marqueeElement!);
        this.updateResizeId();
        this.observeNewElement();
      }
    },
    updateResizeId() {
      let newId = this.resizeElementId;
      do {
        newId++;
      } while (this.deletedElements.includes(newId));
      this.deletedElements.push(this.resizeElementId);
      this.resizeElementId = newId;
    },
    observeNewElement() {
      const marqueeComponentArr = this.$refs.marqueeComponents as Vue[];
      this.marqueeElement = marqueeComponentArr[1].$refs
        .marqueeElement as HTMLElement;
      this.resizeObserver!.observe(this.marqueeElement!);
    },
    resetAnimation() {
      this.pauseInner = true;
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      this.animatedElements = [{ progress: 0, id: 0 }];
      this.unanimatedElements = [];
      this.initialSetup();
      this.pauseInner = false;
    },
    initialSetup() {
      this.calcDimensions();
      this.setWrapperDirection();
      if (this.repeat) {
        this.repeatNum = this.calcRepeatNum();
      }
      this.initialAnimationData();
      if (!this.testData.inTest) {
        this.setResizeObserver();
      }
    },
    fireAnimation(currentTime: number) {
      const longPause = currentTime - this.lastTime > 100;
      if (!this.pause && !this.pauseInner && !longPause && !this.marqueeNoDimension) {
        this.calcTranslation(currentTime);
      }
      this.updateLastTime(currentTime);
      requestAnimationFrame(this.fireAnimation);
    },
  },
  watch: {
    repeat: 'resetAnimation',
    repeatMargin: 'resetAnimation',
    direction: 'resetAnimation',
    reverse: 'resetAnimation',
    'testData.wrapperDimension'(newValue) {
      this.onWrapperResize(newValue);
    },
    'testData.marqueeDimension'(newValue) {
      this.onMarqueeElementResize(newValue);
    },
  },
  async mounted() {
    await this.$nextTick();
    this.initialSetup();
    await this.$nextTick();
    requestAnimationFrame(this.fireAnimation);
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  render(h): VNode {
    return h(
      'div',
      {
        ref: 'wrapper',
        style: {
          overflow: 'hidden',
          height: '100%',
          width: '100%',
          position: 'relative',
        },
        on: {
          mouseenter: this.togglePause,
          mouseleave: this.togglePause,
        },
      },
      this.allElements.map((el) => {
        return h(
          DynamicMarqueeElement,
          {
            ref: 'marqueeComponents',
            refInFor: true,
            key: el.id,
            props: {
              progress: el.progress,
              direction: this.direction,
              reverse: this.reverse,
              wrapperDirection: this.wrapperDirection,
            },
          },
          this.$slots.default,
        );
      }),
    );
  },
});
