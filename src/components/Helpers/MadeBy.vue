<template>
    <div
        class="flex items-center justify-between "
        style="color: var(--spectrum-accent-visual-color)"
    >
        <span>made by: {{ author }}</span>
        <span>version: {{ version }} </span>
    </div>
</template>

<script>
export default {
    name: "MadeBy",
    data() {
        return {
            author: process.env.VUE_APP_AUTHOR,
            version: process.env.VUE_APP_VERSION,
        }
    }
};
</script>

<style>
</style>