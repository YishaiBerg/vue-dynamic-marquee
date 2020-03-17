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
// beforeEach(() => {
//     rafStub = createStub();
//     spyRaf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(rafStub.add);
// });

// afterEach(() => {
//     jest.clearAllMocks();
// });

describe('DynamicMarquee', () => {
    rafStub = createStub();
    spyRaf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(rafStub.add);

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

    // TODO: test with repeat = false
    it('should duplicate slots as necessary', () => {
        console.log(wrapper.vm.repeatMargin);
        expect(wrapper.vm.$data.repeatNum).toBe(5);
    });

    // TODO: check all combinations
    it('should correctly set marquee initial position', () => {
        const marqueeElement = wrapper.find({ name: 'dynamic-marquee-element' });
        const elStyle = marqueeElement.attributes('style');
        expect(elStyle).toEqual(expect.stringContaining('right: 100%'));
    });
    
    
    it('should call raf', () => {
        rafStub.step(250);
        console.log(wrapper.html())
        expect(spyRaf).toBeCalled();
        expect(wrapper.vm.animatedElements.length).toBeGreaterThanOrEqual(4);
    });
    
    it('should reanimate elements', () => {
        wrapper.destroy();
        jest.clearAllMocks();
    })

});
