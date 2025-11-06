<template>
    <main id="library" class="flex flex-col justify-between h-full">
        <div class="flex h-full gap-4 overflow-hidden">
            <LibrarySidebar />
            <LibraryContent />
        </div>
    </main>
</template>

<script>
// Components
import LibrarySidebar from "@/components/organisms/library/LibrarySidebar.vue";
import LibraryContent from "@/components/organisms/library/LibraryContent.vue";

export default {
    name: "LibraryPage",
    components: {
        LibrarySidebar,
        LibraryContent,
        // MadeBy,
    },
    // created() {
    //     // при открытии страницы подгружаем категории
    //     this.$store.dispatch("categories/fetchCategories");
    // },
};
</script>