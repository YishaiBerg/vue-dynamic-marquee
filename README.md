# Vue Dynamic Marquee
## Installation

	yarn add vue-dynamic-marquee
	// or 
	npm i vue-dynamic-marquee

Alternatively the component can be delivered via CDN from [jsdelivr](https://www.jsdelivr.com/) or [unpkg](https://unpkg.com/). 	

## Usage
register globaly

    //in main.js
    import DynamicMarquee from 'vue-dynamic-marquee';
    Vue.component('dynamic-marquee', DynamicMarquee)
 or import locally
		

	<template>
      <div>
        <dynamic-marquee>
          //your content to be animated
        </dynamic-marquee>
      </div>
    </template>

	import DynamicMarquee from 'vue-dynamic-marquee';
## Props
| Prop  | Type  |  Default | Explanation 
|:--:|:--:|:--:|--|
| direction | 'row'\|'column'  | 'column'  | animation direction
| reverse | boolean | false| By default the slot will translate according to document flow - top to bottom for {direction: 'column'} and and for {direction: 'row'} in accordance to rtl-ltr direction style of the wrapper. This behaviour can be reversed with this prop.
| repeat | boolean | true | If true the slot will repeat itself so as not to leave whitespace as the slot is finishing to translate out of the wrapper. The component will compute the number of times to repeat the slot in accordance with the repeatMargin prop.
| repeatMargin | number | 10 | Pixels between repeated slots.
| speed | {**type**: 'pps'\|'duration',<br>**number**: number} | {**type**: 'pps',<br> **number**: 100} | There are two ways to define the translation speed. When choosing 'pps', 'number' is number of pixels per second. When choosing 'duration', 'number' is the number of milliseconds in which the slot will translate from the begining to the end of the wrapper element.   
| hoverPause | boolean | true | Should animation pause upon hovering over wrapper element.
| pause | boolean | false | Use to programmaticlly pause animation.   

## Responsiveness
The component should be able to accomodate for any changes in wrapper or slot content dimensions. This is accomplished thanks to the [ResizeObserver Api](https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API).  **Only** if the component detects the browser does not support ResizeObserver it will async load a [polyfill](https://github.com/juggle/resize-observer).

## Coming Soon

 - Demo and playground page.
 - React version.
 Feature requests and PR's are very much welcomed.