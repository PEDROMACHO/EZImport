<template>
    <div class="sticky top-0 flex flex-col justify-between" style="max-width: 200px;">
        <div class="flex flex-col">
            <SearchField />
    
            <div class="flex flex-col space-y-2">
                <transition-group tag="ul" class="spectrum-AssetList" name="list">
                    <li
                        class="max-w-full spectrum-AssetList-item is-selectable"
                        :class="{'is-selected': currentCategory && category.name === currentCategory.name}"
                        :tabindex="index"
                        @click="setCurrentCategory(category)"
                        v-for="(category, index) in getFilteredCategories"
                        :key="category.name"
                    >
                        <svg
                            class="spectrum-Icon spectrum-Icon--sizeM"
                            focusable="false"
                            aria-hidden="true"
                            aria-label="Folder"
                        >
                            <use xlink:href="#spectrum-icon-24-Folder"></use>
                        </svg>
                        <span
                            class="spectrum-AssetList-itemLabel"
                            id="assetitemlabel-1"
                        >
                            {{ category.name }}
                        </span>
                        <svg
                            class="spectrum-Icon spectrum-UIIcon-ChevronRight100 spectrum-AssetList-itemChildIndicator"
                            focusable="false"
                            aria-hidden="true"
                        >
                            <use xlink:href="#spectrum-css-icon-Chevron100" />
                        </svg>
                    </li>
                </transition-group>
            </div>
        </div>

        <MadeBy />
    </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";

// Components
import SearchField from "@/components/SearchField.vue";
import MadeBy from "@/components/MadeBy.vue";

export default {
    name: "SidebarComponent",
    components: {
        MadeBy,
        SearchField,
    },
    computed: {
        ...mapGetters(["getFilteredCategories", "getCurrentCategory"]),
        currentCategory: {
            get(){
                return this.getCurrentCategory;
            },
            set(value){
                this.setCurrentCategory(value);
            },
        },
    },
    methods: {
        ...mapMutations(["setCurrentCategory"]),
    },
};
</script>
