import {mount} from '@vue/test-utils';
import DynamicMarquee from 'src/components/DynamicMarquee';
import App from 'src/App.vue';

describe('duplicates slot as neccasary', () => {
    test()
    const wrapper = mount(DynamicMarquee, {
        parentComponent: App,
    });
});
