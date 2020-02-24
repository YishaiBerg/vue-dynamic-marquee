<template>
  <div
    ref="marqueeElement"
    style="position: absolute;"
    :style="{...initialPosition, ...transform}"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "dynamic-marquee-element",
  props: {
    progress: Number,
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
    },
    wrapperDirection: {
      type: String,
      default: "ltr",
      validator(val) {
        return ["ltr", "rtl", ""].includes(val);
      }
    }
  },
  computed: {
    
    axis(): string {
      switch (this.direction) {
        case "row":
          return "X";
        case "column":
        default:
          return "Y";
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
    },
    transform(): object {
      return {
        transform: `translate${this.axis}(${this.progress}px)`
      };
    }
  }
});
</script>