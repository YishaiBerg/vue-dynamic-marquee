<template>
    <div class="wrapper">
        <DynamicMarquee>
            <ChildComponent/>
        </DynamicMarquee>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import DynamicMarquee from 'src/components/DynamicMarquee';
    import ChildComponent from './ChildComponent.vue';
    export default Vue.extend({
        name: "parent-component",
        components: {DynamicMarquee, ChildComponent}
    })
</script>

<style scoped>
    .wrapper {
        width: 120px;
        height: 120px;
    }
</style>