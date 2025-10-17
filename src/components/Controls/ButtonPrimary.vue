<template>
    <button
        :class="classes"
        :disabled="disabled"
        @click="$emit('click', $event)"
    >
        <span class="spectrum-Button-label">
            <slot>{{ label }}</slot>
        </span>
    </button>
</template>

<script>
export default {
    name: "ButtonPrimary",
    props: {
        label: { type: String, default: "" }, // текст кнопки
        type: { type: String, default: "accent" }, // accent | secondary | negative | quiet
        size: { type: String, default: "M" }, // S | M | L
        fill: { type: Boolean, default: true }, // заполненная или quiet
        disabled: { type: Boolean, default: false },
    },
    computed: {
        classes() {
            return [
                "spectrum-Button",
                this.fill ? "spectrum-Button--fill" : "",
                `spectrum-Button--${this.type}`,
                `spectrum-Button--size${this.size}`,
            ];
        },
    },
};
</script>
