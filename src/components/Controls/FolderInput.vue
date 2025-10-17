<template>
    <div class="w-full">
        <label :for="id" class="spectrum-FieldLabel spectrum-FieldLabel--sizeM">
            {{ label }}
        </label>
        <div class="w-full spectrum-Textfield">
            <input
                :id="id"
                :placeholder="placeholder"
                :value="value"
                class="spectrum-Textfield-input"
                @click="onClick"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: "FolderInput",
    props: {
        id: { type: String, default: "pathFolder" },
        label: { type: String, required: true },
        placeholder: { type: String, default: "" },
        value: { type: String, default: "" },
    },
    methods: {
        onClick() {
            this.$emit("choose"); // наружу событие
        },
    },
};
</script>
