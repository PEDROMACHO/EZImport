<template>
    <h2 :class="`m-0 spectrum-Heading spectrum-Heading--size${size}`" :id="id">
        <slot></slot>
    </h2>
</template>

<script>
export default {
    props: {
		size: {
			type: String,
			default: "S",
		},
        id: {
            type: String,
            default: "",
        },
    },
};
</script>

<style>
</style>
