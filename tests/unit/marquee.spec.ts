///<reference path="../../declarations.d.ts" />
import {mount} from '@vue/test-utils';
import DynamicMarquee from '../../src/components/DynamicMarquee';
import ParentComponent from "./components/ParentComponent.vue";
import ChildComponent from "./components/ChildComponent.vue";
// import 'declarations';
import { replaceRaf } from 'raf-stub';
import Vue from 'vue';

replaceRaf();

describe('DynamicMarquee', () => {
    const wrapper = mount(DynamicMarquee, {
        // parentComponent: ParentComponent,
        slots: {
            default: ChildComponent
        }
    });
    it('should duplicate slots as necsarry', async () => {
        await Vue.nextTick();
        expect(wrapper.vm.$data.repeatNum).toBeGreaterThanOrEqual(1);
    })
});
