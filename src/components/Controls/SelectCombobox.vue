<!-- src/components/Controls/SelectCombobox.vue -->
<template>
    <div class="relative z-10 w-full" ref="root">
        <div class="">
            <label :for="id" class="spectrum-FieldLabel spectrum-FieldLabel--sizeM">
                {{ label }}
            </label>
    
            <div
                class="w-full spectrum-Combobox spectrum-Combobox--sizeM"
                :class="{ 'is-open': open }"
            >
                <!-- текстовое поле -->
                <div
                    class="w-full spectrum-Textfield spectrum-Textfield--sizeM spectrum-Combobox-textfield"
                >
                    <input
                        :id="id"
                        type="text"
                        class="spectrum-Textfield-input spectrum-Combobox-input"
                        :placeholder="placeholder"
                        :value="displayValue"
                        @focus="open = true"
                        @input="onInput"
                        @keydown.down.prevent="move(1)"
                        @keydown.up.prevent="move(-1)"
                        @keydown.enter.prevent="commitHighlighted"
                        @keydown.esc.prevent="close"
                    />
                </div>
    
                <!-- кнопка раскрытия -->
                <button
                    type="button"
                    aria-haspopup="listbox"
                    class="spectrum-PickerButton spectrum-PickerButton--uiicononly spectrum-PickerButton--right spectrum-PickerButton--sizeM spectrum-Combobox-button"
                    @click="toggle"
                    tabindex="-1"
                >
                    <div class="spectrum-PickerButton-fill">
                        <svg
                            class="spectrum-Icon spectrum-UIIcon-ChevronDown100 spectrum-Icon--medium spectrum-PickerButton-icon"
                            focusable="false"
                            aria-hidden="true"
                        >
                            <use xlink:href="#spectrum-css-icon-Chevron100" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>

        <!-- поповер со списком -->
        <div
            v-if="open"
            role="presentation"
            class="w-full spectrum-Popover spectrum-Popover--sizeM spectrum-Popover--bottom"
            :class="{ 'is-open': open }"
        >
            <ul
                class="spectrum-Menu spectrum-Menu--sizeM is-selectable"
                role="listbox"
            >
                <li
                    v-for="(opt, i) in filtered"
                    :key="opt.value"
                    class="spectrum-Menu-item"
                    :class="{
                        'is-selected': opt.value === value,
                        'is-disabled': opt.disabled,
                        'is-highlighted': i === hi,
                    }"
                    role="option"
                    :aria-selected="opt.value === value"
                    :aria-disabled="!!opt.disabled"
                    @mouseenter="hi = i"
                    @click="!opt.disabled && select(opt)"
                    tabindex="0"
                >
                    <svg
                        v-if="opt.value === value"
                        class="spectrum-Icon spectrum-UIIcon-Checkmark300 spectrum-Icon--medium spectrum-Menu-itemIcon spectrum-Menu-checkmark"
                        focusable="false"
                        aria-hidden="true"
                        viewBox="0 0 14 14"
                    >
                        <path
                            d="M5.102 12.514a1.09 1.09 0 0 1-.834-.39L.988 8.19A1.085 1.085 0 0 1 2.656 6.8l2.421 2.906 6.243-7.947a1.085 1.085 0 0 1 1.707 1.34L5.955 12.1a1.09 1.09 0 0 1-.838.415z"
                        />
                    </svg>
                    <span class="spectrum-Menu-itemLabel">{{ opt.label }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: "SelectCombobox",
    props: {
        id: { type: String, default: "combobox" },
        label: { type: String, required: true },
        placeholder: { type: String, default: "Select…" },
        options: { type: Array, default: () => [] }, // [{label, value, disabled?}]
        value: { type: [String, Number, null], default: null },
        searchable: { type: Boolean, default: false },
    },
    data() {
        return { open: false, query: "", hi: -1 };
    },
    computed: {
        selected() {
            return this.options.find((o) => o.value === this.value) || null;
        },
        displayValue() {
            return this.searchable ? this.query : this.selected?.label || "";
        },
        filtered() {
            if (!this.searchable || !this.query.trim()) return this.options;
            const q = this.query.toLowerCase();
            return this.options.filter((o) =>
                String(o.label).toLowerCase().includes(q)
            );
        },
    },
    watch: {
        open(v) {
            if (v) {
                this.syncHighlight();
                this.bindOutside(true);
            } else this.bindOutside(false);
        },
        value() {
            this.syncHighlight();
            if (!this.searchable) this.query = "";
        },
    },
    methods: {
        toggle() {
            this.open = !this.open;
        },
        close() {
            this.open = false;
            this.query = "";
        },
        onInput(e) {
            this.query = e.target.value;
            this.open = true;
            this.syncHighlight();
        },
        select(opt) {
            this.$emit("input", opt.value);
            this.$emit("change", opt.value);
            this.close();
        },
        move(step) {
            if (!this.open) {
                this.open = true;
                this.syncHighlight();
                return;
            }
            const len = this.filtered.length;
            if (!len) return;
            let i = this.hi;
            do {
                i = (i + step + len) % len;
            } while (
                this.filtered[i]?.disabled &&
                this.filtered.some((o) => !o.disabled)
            );
            this.hi = i;
        },
        commitHighlighted() {
            if (
                this.hi >= 0 &&
                this.filtered[this.hi] &&
                !this.filtered[this.hi].disabled
            )
                this.select(this.filtered[this.hi]);
        },
        syncHighlight() {
            const idx = this.filtered.findIndex((o) => o.value === this.value);
            this.hi = idx >= 0 ? idx : this.filtered.length ? 0 : -1;
        },
        bindOutside(on) {
            const h =
                this.onDocClick ||
                (this.onDocClick = (e) => {
                    if (!this.$refs.root.contains(e.target)) this.close();
                });
            on
                ? document.addEventListener("mousedown", h)
                : document.removeEventListener("mousedown", h);
        },
    },
    beforeDestroy() {
        this.bindOutside(false);
    },
};
</script>
