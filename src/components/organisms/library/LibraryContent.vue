<template>
    <div class="flex flex-col w-full gap-4 pr-3 mt-3">
        <!-- <H2>{{ $t("content.title") }}</H2> -->
        <div class="flex gap-2">
            <sp-action-menu size="s" disabled>
                <sp-icon-settings slot="icon"></sp-icon-settings>
                <sp-menu-item> Deselect </sp-menu-item>
                <sp-menu-item> Select inverse </sp-menu-item>
                <sp-menu-item> Feather... </sp-menu-item>
                <sp-menu-item> Select and mask... </sp-menu-item>
                <sp-menu-divider></sp-menu-divider>
                <sp-menu-item> Save selection </sp-menu-item>
                <sp-menu-item disabled> Make work path </sp-menu-item>
            </sp-action-menu>
            <sp-search disabled size="s" class="w-full"></sp-search>
        </div>

        <div
            class="w-full h-full max-w-full pr-2 overflow-x-hidden overflow-y-auto"
            v-if="getCurrentCategory"
            :key="
                getCurrentCategory
                    ? compositions.length
                        ? 'list'
                        : 'empty'
                    : 'no-cat'
            "
        >
            <div v-if="compositions.length" class="grid grid-cols-4 gap-2">
                <CardComposition
                    v-for="(comp, index) in compositions"
                    :key="comp.path || comp.name"
                    :composition="comp"
                    :index="index"
                />
            </div>

            <MessageEmpty
                v-else
                :title="$t('illustratedMessage.category_empty_title')"
                :description="
                    $t('illustratedMessage.category_empty_description')
                "
            />
        </div>
        <MessageEmpty v-else />
        <MadeBy />
    </div>
</template>

<script>
import { mapGetters } from "vuex";

// WebComponents
import "@spectrum-web-components/icons-workflow/icons/sp-icon-settings.js";

// Components
import MadeBy from "@/components/atoms/brand/MadeBy.vue";
import CardComposition from "@/components/molecules/cards/CardComposition.vue";
import MessageEmpty from "../../atoms/IllustratedMessage/MessageEmpty.vue";

export default {
    name: "ContentComponent",
    components: { CardComposition, MessageEmpty, MadeBy },
    data() {
        return {
            loadingItem: [],
        };
    },
    computed: {
        ...mapGetters("categories", ["getCurrentCategory"]),
        compositions() {
            return this.getCurrentCategory?.compositions || [];
        },
    },
    watch: {
        compositions: {
            immediate: true,
            handler(list) {
                this.loadingItem = Array((list || []).length).fill(false);
            },
        },
    },
};
</script>
