import Vue, { VNode } from 'vue';

export default Vue.extend({
  name: 'dynamic-marquee-element',
  props: {
    id: Number,
    progress: Number,
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
    wrapperDirection: {
      type: String,
      default: 'ltr',
      validator(val) {
        return ['ltr', 'rtl', ''].includes(val);
      },
    },
  },
  computed: {

    axis(): string {
      switch (this.direction) {
        case 'row':
          return 'X';
        case 'column':
        default:
          return 'Y';
      }
    },
    initialPosition(): object {
      if (this.direction === 'row') {
        if (
          (this.wrapperDirection === 'ltr' && !this.reverse) ||
          (this.wrapperDirection === 'rtl' && this.reverse)
        ) {
          return { right: '100%' };
        } else { return { left: '100%' }; }
      } else {
        if (this.reverse) {
          return { top: '100%' };
        } else {
          return { bottom: '100%' };
        }
      }
    },
    transform(): object {
      return {
        transform: `translate${this.axis}(${this.progress}px)`,
      };
    },
  },
  render(h): VNode {
    return h(
      'div',
      {
        ref: 'marqueeElement',
        style: {
          position: 'absolute',
          ...this.initialPosition,
          ...this.transform,
        },
      },
      this.$slots.default,
    );

  },
});
