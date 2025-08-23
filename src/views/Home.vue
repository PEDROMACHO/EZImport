<template>
    <main class="flex flex-col justify-between h-full">
        <div v-if="!categoriesLoaded" class="text-white">Loading...</div>
        <div class="flex h-full gap-2 overflow-x-hidden overflow-y-auto" v-else>
            <SidebarComponent />
            <ContentComponent />
        </div>
        <SvgIcons />
    </main>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

// Components
import SvgIcons from "@/components/SvgIcons.vue";
import SidebarComponent from "@/components/SidebarComponent.vue";
import ContentComponent from "@/components/ContentComponent.vue";

export default {
    name: "Home",
    components: {
        SvgIcons,
        SidebarComponent,
        ContentComponent,
    },
    computed: {
        // Используем геттеры Vuex для получения данных из файла store
        ...mapGetters({
            categories: "getCategories",
            error: "getError",
        }),
        categoriesLoaded() {
            return this.categories.length > 0;
        },
    },
    mounted() {
        this.fetchCategories();
    },
    methods: {
        // Используем действия Vuex для изменения данных
        ...mapActions(["fetchCategories"]),
    },
};
</script>
