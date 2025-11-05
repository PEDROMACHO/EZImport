<template>
    <div class="flex flex-col w-full gap-4 pr-3 mt-3">
        <div class="flex gap-2">
            <sp-action-menu size="s" disabled>
                <sp-icon-settings slot="icon"></sp-icon-settings>
                <sp-menu-item>Deselect</sp-menu-item>
                <sp-menu-item>Select inverse</sp-menu-item>
                <sp-menu-item>Feather...</sp-menu-item>
                <sp-menu-item>Select and mask...</sp-menu-item>
                <sp-menu-divider></sp-menu-divider>
                <sp-menu-item>Save selection</sp-menu-item>
                <sp-menu-item disabled>Make work path</sp-menu-item>
            </sp-action-menu>

            <sp-search
                size="s"
                class="w-full"
                :value="query"
                @input="onSearch"
                placeholder="Global Search compositions..."
            ></sp-search>
        </div>

        <transition
            name="fade"
            mode="out-in"
            v-if="query || getCurrentCategory"
            duration="150"
        >
            <div
                class="w-full h-full max-w-full pr-2 overflow-x-hidden overflow-y-auto"
                :key="itemsKey"
            >
                <div v-if="displayedItems.length">
                    <Paginator
                        :items="displayedItems"
                        :page-size="12"
                        v-slot="{ items }"
                        class="grid grid-cols-12 gap-2"
                    >
                        <CardComposition
                            :index="index"
                            :composition="comp"
                            :key="comp.path || comp.name"
                            v-for="(comp, index) in items"
                            class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3"
                        />
                    </Paginator>
                </div>

                <MessageEmpty
                    v-else-if="query"
                    :title="`${query}`"
                    description="По запросу ничего не найдено"
                />
                <MessageEmpty
                    v-else
                    :title="$t('illustratedMessage.category_empty_title')"
                    :description="
                        $t('illustratedMessage.category_empty_description')
                    "
                />
            </div>
        </transition>

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
import Paginator from "@/components/organisms/Paginator.vue";
import CardComposition from "@/components/molecules/cards/CardComposition.vue";
import MessageEmpty from "../../atoms/IllustratedMessage/MessageEmpty.vue";

export default {
    name: "LibraryContent",
    components: {
        MadeBy,
        Paginator,
        MessageEmpty,
        CardComposition,
    },
    computed: {
        ...mapGetters("categories", ["getCurrentCategory"]),
        ...mapGetters("search", ["results", "query"]),
        compositions() {
            return this.getCurrentCategory?.compositions || [];
        },
        displayedItems() {
            return this.query ? this.results : this.compositions;
        },
        itemsKey() {
            const cat = this.getCurrentCategory?.id || "no-cat";
            const q = this.query || "";
            // Берём длину и идентификаторы крайних элементов текущей страницы,
            // чтобы ключ реально менялся при листании.
            const head =
                this.displayedItems[0]?.path ||
                this.displayedItems[0]?.name ||
                "h";
            const tail =
                this.displayedItems[this.displayedItems.length - 1]?.path ||
                this.displayedItems[this.displayedItems.length - 1]?.name ||
                "t";
            const len = this.displayedItems.length;
            return `${cat}|${q}|${head}|${tail}|${len}`;
        },
    },
    mounted() {
        this.$store.dispatch("search/init");
    },
    methods: {
        onSearch(e) {
            this.$store.dispatch("search/run", e.target.value);
        },
    },
};
</script>