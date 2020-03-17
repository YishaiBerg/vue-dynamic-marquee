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
            speed: {
                type: 'duration',
                number: 1000,
            },
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

        const furthestElement = wrapper.vm.animatedElements[0];
        rafStub.step();
        expect(spyRaf).toBeCalled();
    });

    it('should progress correctly on speed:{type: "duration"}', () => {
        rafStub.step();
        const furthestElement = wrapper.vm.animatedElements[0];
        const currentProgress = furthestElement.progress;
        console.log(currentProgress);
        rafStub.step(6);
        expect(spyRaf).toHaveBeenCalledTimes(9);
        const totalDistance = wrapper.vm.wrapperDimension + wrapper.vm.marqueeDimension;
        // * raf is called in raf-stub at 1000 / 60 ms TODO: assert that
        const expectedProgress = totalDistance / 60 * 6;

        expect(furthestElement.progress).toBeCloseTo(expectedProgress + currentProgress);
    });

    it('should progress correctly on speed:{type: "pps"}', () => {
        wrapper.setProps({
            speed: {
                type: 'pps',
                number: 1,
            },
        });
        rafStub.step();
        const firstElement = wrapper.vm.animatedElements[wrapper.vm.animatedElements.length - 1];
        const currentProgress = firstElement.progress;
        rafStub.step(60);
        expect(firstElement.progress).toBeCloseTo(currentProgress + 1);
    });

    it('should reanimate elements', () => {
        wrapper.setProps({
            speed: {
                type: 'duration',
                number: 1000,
            },
        });
        rafStub.step(100);
        expect(wrapper.vm.animatedElements.length).toBeGreaterThanOrEqual(4);
    });

    it('elements should not exceed wrapper completely', () => {
        const progressArr = wrapper.vm.animatedElements.map((el) => Math.floor(el.progress));
        const exceedsNum = wrapper.vm.wrapperDimension + wrapper.vm.wrapperDimension;
        const exceeds = progressArr.some((el) => el > exceedsNum);
        expect(exceeds).toBe(false);
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

    });

    it('should not pause on mouseenter when hoverPause = false', () => {
        wrapper.setProps({
            hoverPause: false,
        });
        const before = JSON.stringify(wrapper.vm.animatedElements);
        const rootDiv = wrapper.find('div');
        rootDiv.trigger('mouseenter');
        rafStub.step();
        const after = JSON.stringify(wrapper.vm.animatedElements);
        expect(before).not.toBe(after);


        wrapper.destroy();
    });


});
