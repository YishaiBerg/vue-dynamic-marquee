// <template>
//     <div class="wrapper">
//         <DynamicMarquee>
//             <ChildComponent/>
//         </DynamicMarquee>
//     </div>
// </template>

import Vue from 'vue';
import DynamicMarquee from '../../../src/components/DynamicMarquee';
import { VNode } from 'vue/types/umd';
export default Vue.extend({
    name: 'parent-component',
    // components: { DynamicMarquee, ChildComponent },
    render(h): VNode {
        return h(
            'div',
            {
                style: {
                    width: '120px',
                    height: '120px',
                },
            },
            [h(
                DynamicMarquee,
                {},
                [h(
                    'div',
                    {
                        style: {
                            width: '20px',
                            height: '20px',
                        },
                        slot: 'default'
                    }
                )]
            )]
        );
    },
});

