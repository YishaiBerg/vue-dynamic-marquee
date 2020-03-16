// TODO: take care of this
///<reference path="../../declarations.d.ts" />
import { mount } from '@vue/test-utils';
import DynamicMarquee from '../../src/components/DynamicMarquee';
// import '../../declarations.d.ts';
import { replaceRaf } from 'raf-stub';
import Vue from 'vue';

replaceRaf();

describe('DynamicMarquee', () => {
    const wrapper = mount(DynamicMarquee, {
        propsData: {
            repeatMargin: 10,
            direction: 'row',
        },
        data() {
            return {
                testData: {
                    inTest: true,
                    warpperDimension: 120,
                    marqueeDimension: 20,
                    wrapperDirection: 'ltr',
                },
            };
        },
    });

    it('should duplicate slots as necessary', () => {
        expect(wrapper.vm.$data.repeatNum).toBe(5);
    });

    it('should correctly set marquee initial position', () => {
        const marqueeElement = wrapper.find({ name: 'dynamic-marquee-element' });
        const elStyle = marqueeElement.attributes('style');
        expect(elStyle).toEqual(expect.stringContaining('right: 100%'));
        wrapper.destroy();
    });
});
