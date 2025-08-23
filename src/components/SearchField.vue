<template>
    <form class="mb-2 spectrum-Search spectrum-Search--sizeS" @submit.prevent>
        <div
            class="spectrum-Textfield spectrum-Textfield--sizeS spectrum-Search-textfield"
        >
            <svg
                class="spectrum-Icon spectrum-Icon--sizeS spectrum-Textfield-icon spectrum-Search-icon"
                focusable="false"
                aria-hidden="true"
            >
                <use xlink:href="#spectrum-icon-18-Magnify" />
            </svg>
            <input
                type="search"
                placeholder="Search"
                name="search"
                v-model="getField"
                class="spectrum-Textfield-input spectrum-Search-input"
                autocomplete="off"
                style="padding-bottom: 6px"
            />
        </div>
        <button
            @click.prevent="clearSearchField"
            class="transform -translate-y-1/2 top-1/2 spectrum-ClearButton spectrum-ClearButton--sizeS spectrum-Search-clearButton"
        >
            <div class="spectrum-ClearButton-fill">
                <svg
                    class="spectrum-Icon spectrum-ClearButton-icon spectrum-UIIcon-Cross100"
                    focusable="false"
                    aria-hidden="true"
                >
                    <use xlink:href="#spectrum-css-icon-Cross100"></use>
                </svg>
            </div>
        </button>
    </form>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";

export default {
    name: "SearchField",
    computed: {
        ...mapGetters(["getSearchField"]),
        // Create a computed setter to automatically mutate the store
        getField: {
            get() {
                return this.getSearchField;
            },
            set(value) {
                this.setSearchField(value);
            },
        },
    },
    methods: {
        ...mapMutations(["setSearchField"]),
        clearSearchField() {
            this.setSearchField("");
        },
    },
};
</script>