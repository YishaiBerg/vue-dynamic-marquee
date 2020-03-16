///<reference path="../../declarations.d.ts" />
import {mount} from '@vue/test-utils';
import DynamicMarquee from '../../src/components/DynamicMarquee';
import ParentComponent from './components/ParentComponent';
import '../../declarations.d.ts';
import { replaceRaf } from 'raf-stub';
import Vue from 'vue';

replaceRaf();

describe('DynamicMarquee', () => {
    const wrapper = mount(ParentComponent, {
    });
    it('should duplicate slots as necessary', async () => {
        await Vue.nextTick();
        console.log(wrapper.vm.$children[0].$children.length)
        // console.log(wrapper.vm.$children[0])
        expect(wrapper.vm.$children[0].$data.repeatNum).toBeGreaterThan(1);
    });
});
