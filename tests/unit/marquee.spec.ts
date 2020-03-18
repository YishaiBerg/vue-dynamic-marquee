import { mount } from '@vue/test-utils';
import DynamicMarquee from '../../src/components/DynamicMarquee';
import '../../declarations.d';
import createStub from 'raf-stub';
import Vue from 'vue';

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
            repeat: false,
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

    describe('Duplicate Slots', () => {

        it('not duplicate slots if {repeat: false}', () => {
            expect(wrapper.vm.$data.repeatNum).toBe(1);
            expect(wrapper.vm.animatedElements.length).toBe(1);
            expect(wrapper.vm.unanimatedElements.length).toBe(0);
        });

        it('duplicate slots as necessary if {repeat: true}', async () => {
            wrapper.setProps({ repeat: true });
            await Vue.nextTick();
            expect(wrapper.vm.$data.repeatNum).toBe(5);
            expect(wrapper.vm.animatedElements.length).toBe(1);
            expect(wrapper.vm.unanimatedElements.length).toBe(4);
        });
    });

    describe('Initial Position', () => {

        const marqueeElement = wrapper.find({ name: 'dynamic-marquee-element' });

        it('correctly set marquee initial position for {direction: column, reverse: false}', () => {
            wrapper.setProps({ direction: 'column', reverse: false });
            const elStyle = marqueeElement.attributes('style');
            expect(elStyle).toEqual(expect.stringContaining('bottom: 100%'));
        });

        it('correctly set marquee initial position for {direction: column, reverse: true}', () => {
            wrapper.setProps({ direction: 'column', reverse: true });
            const elStyle = marqueeElement.attributes('style');
            expect(elStyle).toEqual(expect.stringContaining('top: 100%'));
        });

        it('correctly set marquee initial position for {direction: row, reverse: true} rtl', () => {
            wrapper.setProps({ direction: 'row', reverse: true });
            wrapper.setData({ wrapperDirection: 'rtl' });
            const elStyle = marqueeElement.attributes('style');
            expect(elStyle).toEqual(expect.stringContaining('right: 100%'));
        });


        it('correctly set marquee initial position for {direction: row, reverse: false} rtl', () => {
            wrapper.setProps({ direction: 'row', reverse: false });
            wrapper.setData({ wrapperDirection: 'rtl' });
            const elStyle = marqueeElement.attributes('style');
            expect(elStyle).toEqual(expect.stringContaining('left: 100%'));
        });

        it('correctly set marquee initial position for {direction: row, reverse: true} ltr', () => {
            wrapper.setData({ wrapperDirection: 'ltr' });
            wrapper.setProps({ direction: 'row', reverse: true });
            const elStyle = marqueeElement.attributes('style');
            expect(elStyle).toEqual(expect.stringContaining('left: 100%'));
        });


        it('correctly set marquee initial position for {direction: row, reverse: false} ltr', () => {
            wrapper.setData({ wrapperDirection: 'ltr' });
            wrapper.setProps({ direction: 'row', reverse: false });
            const elStyle = marqueeElement.attributes('style');
            expect(elStyle).toEqual(expect.stringContaining('right: 100%'));
        });
    });

    describe('Progress', () => {

        it('call raf', () => {
            rafStub.step();
            expect(spyRaf).toBeCalled();
        });

        it('progress correctly on speed:{type: "duration"}', () => {
            rafStub.step();
            const furthestElement = wrapper.vm.animatedElements[0];
            const currentProgress = furthestElement.progress;
            rafStub.step(6);
            expect(spyRaf).toHaveBeenCalledTimes(9);
            const totalDistance = wrapper.vm.wrapperDimension + wrapper.vm.marqueeDimension;
            // * raf is called in raf-stub at 1000 / 60 ms TODO: assert that
            const expectedProgress = totalDistance / 60 * 6;

            expect(furthestElement.progress).toBeCloseTo(expectedProgress + currentProgress);
        });

        it('progress correctly on speed:{type: "pps"}', () => {
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

        it('progress correct direction on {reverse: false}', () => {
            const progressArr = wrapper.vm.animatedElements.map((el) => Math.floor(el.progress));
            const correctDirection = progressArr.every((el) => el >= 0);
            expect(correctDirection).toBe(true);
        });

        it('progress correct direction on {reverse: true}', async () => {
            wrapper.setProps({ reverse: true });
            await Vue.nextTick();
            const progressArr = wrapper.vm.animatedElements.map((el) => Math.floor(el.progress));
            const correctDirection = progressArr.every((el) => el <= 0);
            expect(correctDirection).toBe(true);
        });

        it('reanimate elements', async () => {
            wrapper.setProps({
                speed: {
                    type: 'duration',
                    number: 1000,
                },
                reverse: false,
            });
            await Vue.nextTick();

            rafStub.step(100);
            expect(wrapper.vm.animatedElements.length).toBeGreaterThanOrEqual(4);
        });

        it('elements not exceed wrapper completely', () => {
            const progressArr = wrapper.vm.animatedElements.map((el) => Math.floor(el.progress));
            const exceedsNum = wrapper.vm.wrapperDimension + wrapper.vm.wrapperDimension;
            const exceeds = progressArr.some((el) => el > exceedsNum);
            expect(exceeds).toBe(false);
        });

        it('keep repeatMargin distance between animated elements', () => {
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
    });

    describe('Pause', () => {

        it('pause when paused programmaticly', () => {
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

        it('pause on mouseenter and unpause on mouseleave', () => {
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

        it('not pause on mouseenter when {hoverPause: false}', () => {
            wrapper.setProps({
                hoverPause: false,
            });
            const before = JSON.stringify(wrapper.vm.animatedElements);
            const rootDiv = wrapper.find('div');
            rootDiv.trigger('mouseenter');
            rafStub.step();
            const after = JSON.stringify(wrapper.vm.animatedElements);
            expect(before).not.toBe(after);


        });
    });

    describe('Resize', () => {

        it('reduplicates elements correctly on wrapper grow resize', async () => {
            wrapper.setData({
                testData: {
                    inTest: true,
                    wrapperDimension: 30,
                    marqueeDimension: 2,
                    wrapperDirection: 'ltr',
                },
            });
            await Vue.nextTick();
            const correctAnimatedNum = [4, 5].includes(wrapper.vm.animatedElements.length);
            const correctUnanimatedNum = [6, 7].includes(wrapper.vm.unanimatedElements.length);
            expect(wrapper.vm.repeatNum).toBe(11);
            expect(correctAnimatedNum).toBe(true);
            expect(correctUnanimatedNum).toBe(true);
        });

        it('reduplicates elements correctly on wrapper shrink resize', async () => {
            wrapper.setData({
                testData: {
                    inTest: true,
                    wrapperDimension: 15,
                    marqueeDimension: 2,
                    wrapperDirection: 'ltr',
                },
            });
            await Vue.nextTick();
            const correctAnimatedNum = [4, 5].includes(wrapper.vm.animatedElements.length);
            const correctUnanimatedNum = [1, 2].includes(wrapper.vm.unanimatedElements.length);
            expect(wrapper.vm.repeatNum).toBe(6);
            expect(correctAnimatedNum).toBe(true);
            expect(correctUnanimatedNum).toBe(true);
        });

        it('reduplicates elements correctly on marqueeElement grow resize', async () => {
            wrapper.setData({
                testData: {
                    inTest: true,
                    wrapperDimension: 15,
                    marqueeDimension: 4,
                    wrapperDirection: 'ltr',
                },
            });
            await Vue.nextTick();
            const correctAnimatedNum = [4, 3].includes(wrapper.vm.animatedElements.length);
            const correctUnanimatedNum = [0, 1].includes(wrapper.vm.unanimatedElements.length);
            expect(wrapper.vm.repeatNum).toBe(4);
            expect(correctAnimatedNum).toBe(true);
            expect(correctUnanimatedNum).toBe(true);
        });

        it('reduplicates elements correctly on marqueeElement shrink resize', async () => {
            wrapper.setData({
                testData: {
                    inTest: true,
                    wrapperDimension: 15,
                    marqueeDimension: 1,
                    wrapperDirection: 'ltr',
                },
            });
            await Vue.nextTick();
            expect(wrapper.vm.repeatNum).toBe(9);
        });

        it('updates deletedItems array correctly', () => {
            // * lastId is zero based
            expect(wrapper.vm.lastId + 1 - wrapper.vm.allElements.length)
                .toBe(wrapper.vm.deletedElements.length);
        });

        it('it stops animation if marqueeElement dimension = 0', async () => {
            const before = JSON.stringify(wrapper.vm.animatedElements);

            wrapper.setData({
                testData: {
                    inTest: true,
                    wrapperDimension: 15,
                    marqueeDimension: 0,
                    wrapperDirection: 'ltr',
                },
            });
            await Vue.nextTick();

            rafStub.step(3);

            const after = JSON.stringify(wrapper.vm.animatedElements);

            expect(before).toBe(after);
        });

        it('it restarts animation after marqueeElement dimension > 0', async () => {

            wrapper.setData({
                testData: {
                    inTest: true,
                    wrapperDimension: 15,
                    marqueeDimension: 5,
                    wrapperDirection: 'ltr',
                },
            });
            await Vue.nextTick();
            expect(wrapper.vm.animatedElements.length).toBe(1);
            expect(wrapper.vm.animatedElements[0].progress).toBe(0);
            expect(wrapper.vm.animatedElements[0].id).toBe(0);

            const before = JSON.stringify(wrapper.vm.animatedElements);
            rafStub.step(3);
            const after = JSON.stringify(wrapper.vm.animatedElements);

            expect(before).not.toBe(after);
            wrapper.destroy();
        });
    });


});
