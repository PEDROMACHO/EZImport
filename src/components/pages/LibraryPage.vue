<template>
    <main id="library" class="flex flex-col justify-between h-full">
        <sp-action-group size="s" compact>
            <sp-action-button
                id="library-settings"
                size="s"
                @click="$router.push({ path: '/settings' })"
            >
                <sp-icon-settings slot="icon"></sp-icon-settings>
            </sp-action-button>
            <sp-action-button
                v-for="(library, index) in getLibrariesList"
                :key="library.path"
                @click="setActiveIndex(index)"
            >
                {{ library.path }}
            </sp-action-button>
        </sp-action-group>

        <div class="flex h-full gap-4 overflow-hidden">
            <LibrarySidebar />
            <LibraryContent />
        </div>
    </main>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";

// Web Components
import "@spectrum-web-components/icons-workflow/icons/sp-icon-new-item.js";

// Components
import LibrarySidebar from "@/components/organisms/library/LibrarySidebar.vue";
import LibraryContent from "@/components/organisms/library/LibraryContent.vue";

export default {
    name: "LibraryPage",
    components: {
        LibrarySidebar,
        LibraryContent,
    },
    computed: {
        ...mapGetters("config", ["getLibrariesList"]),
        ...mapGetters("library", ["activeIndex"]),
    },
    methods: {
        ...mapMutations("library", {
            mutationSetActiveIndex: "setActiveIndex",
        }),

        ...mapActions("search", {
            searchInit: "init",
        }),
        ...mapActions("categories", ["fetchCategories"]),

        async setActiveIndex(index) {
            await this.mutationSetActiveIndex(index);
            await this.fetchCategories();
            await this.searchInit();
        },
    },
};
</script>