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

            <sp-button-group vertical size="s">
                <sp-button id="create-category">
                    {{ $t("buttons.new_category") }}
                </sp-button>
                <sp-button
                    :disabled="!canCreateComposition"
                    @click="onNewCompositionClick"
                >
                    {{ $t("buttons.new_composition") }}
                </sp-button>
            </sp-button-group>
        </div>

        <DialogCategory />

        <DialogComposition
            :visible="dialogComposition"
            @cancel="dialogComposition = false"
        />
    </div>
</template>

<script>
import { evalScript } from "cluecumber";
import { mapMutations, mapGetters } from "vuex";

// WebComponents
import "@spectrum-web-components/button/sp-button.js";
import "@spectrum-web-components/button-group/sp-button-group.js";

import "@spectrum-web-components/sidenav/sp-sidenav.js";
import "@spectrum-web-components/sidenav/sp-sidenav-heading.js";
import "@spectrum-web-components/sidenav/sp-sidenav-item.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-folder.js";

// Components
import DialogCategory from "@/components/molecules/dialogs/DialogCategory.vue";
import DialogComposition from "@/components/Modals/DialogComposition.vue";

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
        async onNewCompositionClick() {
            if (!this.currentCategory) return;

            // const AE_HasActiveComp = await evalScript("AE_HasActiveComp()");
            // const ok = String(AE_HasActiveComp) === "1";
            // if (!ok) {
            //     // показывай ошибку, что нет активной композиции
            //     return;
            // }

            this.dialogComposition = true;
        },
    },
};
</script>
