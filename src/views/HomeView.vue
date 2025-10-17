<template>
    <main class="flex flex-col justify-between h-full">
        <div class="flex h-full gap-4 overflow-hidden">
            <SidebarComponent />
            <ContentComponent />
        </div>

        <!-- <MadeBy /> -->
    </main>
</template>

<script>
import { mapGetters } from "vuex";

// Components
// import MadeBy from "@/components/Helpers/MadeBy.vue";
import SidebarComponent from "@/components/Layouts/SidebarComponent.vue";
import ContentComponent from "@/components/Layouts/ContentComponent.vue";

export default {
    name: "HomeView",
    components: {
        // MadeBy,
        SidebarComponent,
        ContentComponent,
    },
    computed: {
        ...mapGetters("categories", ["getCategories", "getError"]),
    },
    created() {
        // когда Home открыт, подгружаем категории
        this.$store.dispatch("categories/fetchCategories");
    },
};
</script>
