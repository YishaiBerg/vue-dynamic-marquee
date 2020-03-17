// TODO: take care of this
///<reference path="../../declarations.d.ts" />
import { mount } from '@vue/test-utils';
import DynamicMarquee from '../../src/components/DynamicMarquee';
// import '../../declarations.d.ts';
import createStub from 'raf-stub';
import Vue from 'vue';

// replaceRaf();
let rafStub: any;
let spyRaf: any;
beforeAll(() => {
    rafStub = createStub();
    spyRaf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(rafStub.add);
});

afterAll(() => {
    jest.clearAllMocks();
});

describe('DynamicMarquee', () => {

    const wrapper = mount(DynamicMarquee, {
        propsData: {
            repeatMargin: 1,
            direction: 'row',
        },
        data() {
            return {
                testData: {
                    inTest: true,
                    wrapperDimension: 12,
                    marqueeDimension: 2,
                    wrapperDirection: 'ltr',
                },
            };
        },
    });

    // TODO: test with repeat = false
    it('should duplicate slots as necessary', () => {
        expect(wrapper.vm.$data.repeatNum).toBe(5);
    });

    // TODO: check all combinations
    it('should correctly set marquee initial position', () => {
        const marqueeElement = wrapper.find({ name: 'dynamic-marquee-element' });
        const elStyle = marqueeElement.attributes('style');
        expect(elStyle).toEqual(expect.stringContaining('right: 100%'));
    });


    it('should call raf', () => {
        rafStub.step(100);
        expect(spyRaf).toBeCalled();
    });

    it('should reanimate elements', () => {
        expect(wrapper.vm.animatedElements.length).toBeGreaterThanOrEqual(4);
    });

    it('should keep repeatMargin distance between animated elements', () => {
        const progressArr = wrapper.vm.animatedElements.map((el) => Math.floor(el.progress));
        let lastVal = progressArr[0];
        let wrongMargin = false;
        const difference = wrapper.vm.repeatMargin + wrapper.vm.marqueeDimension;
        for (let i = 1; i < progressArr.length; i++) {
            if ((lastVal - difference) !== progressArr[i]) {
                wrongMargin = true;
            }
            lastVal = progressArr[i];
        }
        expect(wrongMargin).toBe(false);
    });

    it('should pause when paused programmaticly', () => {
        const before = JSON.stringify(wrapper.vm.animatedElements);
        wrapper.setProps({ pause: true });
        rafStub.step();
        const after = JSON.stringify(wrapper.vm.animatedElements);
        expect(before).toBe(after);

        wrapper.setProps({ pause: false });
        rafStub.step();
        const afterNoPause = JSON.stringify(wrapper.vm.animatedElements);
        expect(after).not.toBe(afterNoPause);

    });

    it('should pause on mouseenter and unpause on mouseleave', () => {
        const before = JSON.stringify(wrapper.vm.animatedElements);
        const rootDiv = wrapper.find('div');
        rootDiv.trigger('mouseenter');
        rafStub.step();
        const after = JSON.stringify(wrapper.vm.animatedElements);
        expect(before).toBe(after);

        rootDiv.trigger('mouseleave');
        rafStub.step();
        const afterNoPause = JSON.stringify(wrapper.vm.animatedElements);
        expect(after).not.toBe(afterNoPause);

        wrapper.destroy();
    });


});
