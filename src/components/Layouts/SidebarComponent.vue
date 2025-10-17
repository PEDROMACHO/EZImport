<template>
    <div class="sticky top-0 z-50" style="max-width: 200px">
        <div class="flex flex-col justify-between h-full">
            <div class="flex flex-col justify-start max-w-full gap-4">
                <H2>{{ $t("sidebar.title") }}</H2>

                <div class="flex flex-col">
                    <div
                        class="flex flex-col mt-2 space-y-2"
                        v-if="getFilteredCategories.length"
                    >
                        <transition-group
                            tag="ul"
                            class="spectrum-AssetList"
                            name="list"
                        >
                            <li
                                v-for="(
                                    category, index
                                ) in getFilteredCategories"
                                :key="category.name"
                                class="max-w-full spectrum-AssetList-item is-selectable"
                                :class="{
                                    'is-selected':
                                        currentCategory &&
                                        category.name === currentCategory.name,
                                }"
                                :tabindex="index"
                                @click="setCurrentCategory(category)"
                            >
                                <svg
                                    class="spectrum-Icon spectrum-Icon--sizeS"
                                    focusable="false"
                                    aria-hidden="true"
                                    aria-label="Folder"
                                >
                                    <use
                                        xlink:href="#spectrum-icon-24-Folder"
                                    ></use>
                                </svg>
                                <span class="spectrum-AssetList-itemLabel">
                                    {{ category.name }}
                                </span>
                                <svg
                                    class="spectrum-Icon spectrum-UIIcon-ChevronRight100 spectrum-AssetList-itemChildIndicator"
                                    focusable="false"
                                    aria-hidden="true"
                                >
                                    <use
                                        xlink:href="#spectrum-css-icon-Chevron100"
                                    />
                                </svg>
                            </li>
                        </transition-group>
                    </div>
                    <div v-else class="spectrum-HelpText-text">
                        Пока что пусто.
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-2">
                <ButtonPrimary
                    @click="dialogCategory = true"
                    :label="$t('buttons.new_category')"
                />
                <ButtonPrimary
                    :label="$t('buttons.new_composition')"
                    :disabled="!canCreateComposition"
                    @click="onNewCompositionClick"
                />
            </div>
        </div>

        <DialogCategory
            :visible="dialogCategory"
            @cancel="dialogCategory = false"
        />

        <DialogComposition
            :visible="dialogComposition"
            @cancel="dialogComposition = false"
        />
    </div>
</template>

<script>
import { evalScript } from "cluecumber";
import { mapMutations, mapGetters } from "vuex";

// Components
import H2 from "@/components/Typography/H2.vue";
import ButtonPrimary from "../Controls/ButtonPrimary.vue";
import DialogCategory from "@/components/Modals/DialogCategory.vue";
import DialogComposition from "@/components/Modals/DialogComposition.vue";

export default {
    name: "SidebarComponent",
    components: {
        H2,
        ButtonPrimary,
        DialogCategory,
        DialogComposition,
    },
    data() {
        return {
            dialogCategory: false,
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
