<template>
    <div
        class="spectrum-ProgressCircle spectrum-ProgressCircle--indeterminate spectrum-ProgressCircle--medium spectrum-ProgressCircle--staticWhite"
    >
        <div class="spectrum-ProgressCircle-track"></div>
        <div class="spectrum-ProgressCircle-fills">
            <div class="spectrum-ProgressCircle-fillMask1">
                <div class="spectrum-ProgressCircle-fillSubMask1">
                    <div class="spectrum-ProgressCircle-fill"></div>
                </div>
            </div>
            <div class="spectrum-ProgressCircle-fillMask2">
                <div class="spectrum-ProgressCircle-fillSubMask2">
                    <div class="spectrum-ProgressCircle-fill"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ProgressCircle",
};
</script>

<style>
</style>