<template>
    <div
        class="flex items-center justify-between "
        style="color: var(--spectrum-accent-visual-color)"
    >
        <span>made by: {{ author }}</span>
        <span class="cursor-pointer" @click="startTour()">how it works</span>
        <span>version: {{ version }} </span>
    </div>
</template>

<script>
import { startTour } from "@/utils/tourService";

export default {
    name: "MadeBy",
    data() {
        return {
            startTour,
            author: process.env.VUE_APP_AUTHOR,
            version: process.env.VUE_APP_VERSION,
        }
    }
};
</script>

<style>
</style>