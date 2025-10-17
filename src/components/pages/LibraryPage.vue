<template>
    <main class="flex flex-col justify-between h-full">
        <div class="flex h-full gap-4 overflow-hidden">
            <LibrarySidebar />
            <LibraryContent />
        </div>

        <!-- <MadeBy /> -->
    </main>
</template>

<script>
import { mapGetters } from "vuex";

// Components
import LibrarySidebar from "@/components/organisms/library/LibrarySidebar.vue";
import LibraryContent from "@/components/organisms/library/LibraryContent.vue";
// import MadeBy from "@/components/Helpers/MadeBy.vue";

export default {
    name: "LibraryPage",
    components: {
        LibrarySidebar,
        LibraryContent,
        // MadeBy,
    },
    computed: {
        ...mapGetters("categories", ["getCategories"]),
    },
    created() {
        // при открытии страницы подгружаем категории
        this.$store.dispatch("categories/fetchCategories");
    },
};
</script>