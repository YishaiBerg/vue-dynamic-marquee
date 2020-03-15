<template>
    <div class="wrapper">
        <DynamicMarquee></DynamicMarquee>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import DynamicMarquee from 'src/components/DynamicMarquee';
    export default Vue.extend({
        name: "parent-component",
        components: {DynamicMarquee}
    })
</script>

<style scoped>
    .wrapper {
        width: 120px;
        height: 120px;
    }
</style>