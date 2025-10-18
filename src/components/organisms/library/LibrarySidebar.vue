<template>
    <div class="sticky top-0 z-50" style="max-width: 170px">
        <div class="flex flex-col justify-between h-full">
            <sp-sidenav class="w-full">
                <sp-sidenav-heading
                    :label="$t('sidebar.title')"
                    v-if="getFilteredCategories.length"
                >
                    <sp-sidenav-item
                        v-for="category in getFilteredCategories"
                        :key="category.name"
                        :value="category.name"
                        :label="category.name"
                        @click="setCurrentCategory(category)"
                    >
                        <sp-icon-folder slot="icon"></sp-icon-folder>
                    </sp-sidenav-item>
                </sp-sidenav-heading>
            </sp-sidenav>

            <sp-action-group size="s" vertical >
                <sp-action-button id="create-category">
                    {{ $t("buttons.new_category") }}
                </sp-action-button>
                <sp-action-button
                    id="create-composition"
                    :disabled="!canCreateComposition"
                    @click="onNewCompositionClick"
                >
                    {{ $t("buttons.new_composition") }}
                </sp-action-button>
            </sp-action-group>

            <!-- <sp-button-group vertical size="s">
                <sp-button id="create-category">
                    {{ $t("buttons.new_category") }}
                </sp-button>
                <sp-button
                    id="create-composition"
                    :disabled="!canCreateComposition"
                    @click="onNewCompositionClick"
                >
                    {{ $t("buttons.new_composition") }}
                </sp-button>
            </sp-button-group> -->
        </div>

        <DialogCategory />

        <DialogComposition />
    </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";

// Icons
import "@spectrum-web-components/icons-workflow/icons/sp-icon-folder.js";

// Components
import DialogCategory from "@/components/molecules/dialogs/DialogCategory.vue";
import DialogComposition from "@/components/molecules/dialogs/DialogComposition.vue";

export default {
    name: "SidebarComponent",
    components: {
        DialogCategory,
        DialogComposition,
    },
    data() {
        return {
            dialogComposition: false,
        };
    },
    computed: {
        ...mapGetters("categories", [
            "getFilteredCategories",
            "getCurrentCategory",
        ]),
        currentCategory: {
            get() {
                return this.getCurrentCategory;
            },
            set(value) {
                this.setCurrentCategory(value);
            },
        },
        // Кнопка доступна только при выбранной категории
        canCreateComposition() {
            return !!this.currentCategory;
        },
    },
    methods: {
        ...mapMutations("categories", ["setCurrentCategory"]),
        async onNewCompositionClick(e) {
            if (!this.currentCategory) return;

            e.target.dispatchEvent(
                new Event("open", { bubbles: true, composed: true })
            );
        },
    },
};
</script>
