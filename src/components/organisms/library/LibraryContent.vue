<template>
    <div class="flex flex-col w-full gap-4">
        <!-- <H2>{{ $t("content.title") }}</H2> -->

        <div
            class="w-full h-full"
            v-if="getCurrentCategory"
            :key="
                getCurrentCategory
                    ? compositions.length
                        ? 'list'
                        : 'empty'
                    : 'no-cat'
            "
        >
            <div v-if="compositions.length" class="flex flex-wrap gap-4">
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
        <!-- <transition name="slide-fade" mode="out-in">
            <div
                class="h-full"
                :key="
                    getCurrentCategory
                        ? compositions.length
                            ? 'list'
                            : 'empty'
                        : 'no-cat'
                "
            >
                <div v-if="getCurrentCategory" class="h-full">
                    <template v-if="compositions.length">
                        <transition-group
                            name="list"
                            tag="div"
                            class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
                        >
                            <CardComposition
                                v-for="(comp, index) in compositions"
                                :key="comp.path || comp.name"
                                :composition="comp"
                                :index="index"
                                @loaded="onLoaded"
                                @error="onLoadError"
                            />
                        </transition-group>
                    </template>

                    <div v-else class="flex items-center justify-center h-full">
                        <IllustratedMessage
                            :title="
                                $t('illustratedMessage.category_empty_title')
                            "
                            :description="
                                $t(
                                    'illustratedMessage.category_empty_description'
                                )
                            "
                        />
                    </div>
                </div>
                <div v-else class="flex items-center justify-center h-full">
                    <IllustratedMessage />
                </div>
            </div>
        </transition> -->
    </div>
</template>

<script>
import { mapGetters } from "vuex";

// WebComponents
import "@spectrum-web-components/grid/sp-grid.js";

// Components
import CardComposition from "@/components/molecules/cards/CardComposition.vue";
import MessageEmpty from "../../atoms/IllustratedMessage/MessageEmpty.vue";

export default {
    name: "ContentComponent",
    components: { CardComposition, MessageEmpty },
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
