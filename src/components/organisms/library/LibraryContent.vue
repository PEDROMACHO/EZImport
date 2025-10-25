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
            <sp-search
                size="s"
                class="w-full"
                :value="query"
                @input="onSearch"
            ></sp-search>
        </div>

        <div
            v-if="query || getCurrentCategory"
            class="w-full h-full max-w-full pr-2 overflow-x-hidden overflow-y-auto"
        >

            <div v-if="(query && results.length !== 0)" class="grid grid-cols-12 gap-2">
                <CardComposition
                    v-for="(comp, index) in results"
                    :key="comp.path"
                    :composition="comp"
                    :index="index"
                />
            </div>

            <div v-else-if="!query && compositions.length !== 0" class="grid grid-cols-12 gap-2">
                <CardComposition
                    v-for="(comp, index) in compositions"
                    :key="comp.path || comp.name"
                    :composition="comp"
                    :index="index"
                />
            </div>

            <MessageEmpty v-if="query && results.length === 0" :title="`${query}`" description="По запросу ничего не найдено" />
            <MessageEmpty
                v-else-if="!query && compositions.length === 0"
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
        ...mapGetters("search", ["results", "query"]),
        compositions() {
            return this.getCurrentCategory?.compositions || [];
        },
    },
    mounted() {
        this.$store.dispatch("search/init");
    },
    watch: {
        compositions: {
            immediate: true,
            handler(list) {
                this.loadingItem = Array((list || []).length).fill(false);
            },
        },
    },
    methods: {
        onSearch(e) {
            this.$store.dispatch("search/run", e.target.value);
        },
    },
};
</script>
