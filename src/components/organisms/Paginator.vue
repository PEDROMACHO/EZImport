<template>
    <div class="grid grid-cols-12 gap-2" :class="$attrs.class">
        <!-- слот для вывода элементов -->
        <slot :items="pagedItems"></slot>

        <!-- навигация -->
        <div class="col-span-full">
            <div class="flex justify-center gap-2 mt-4" v-if="totalPages > 1">
                <sp-action-group compact>
                    <sp-action-button @click="prevPage" :disabled="page === 1">
                        Назад
                    </sp-action-button>
                    <sp-action-button
                        v-for="n in totalPages"
                        :key="n"
                        :variant="n === page ? 'primary' : 'secondary'"
                        @click="goToPage(n)"
                        :inline="
                            n == totalPages ? 'end' : n == 1 ? 'start' : ''
                        "
                        :disabled="n === page"
                    >
                        {{ n }}
                    </sp-action-button>
                    <sp-action-button
                        @click="nextPage"
                        :disabled="page === totalPages"
                    >
                        Вперёд
                    </sp-action-button>
                </sp-action-group>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Paginator",
    props: {
        items: { type: Array, required: true },
        pageSize: { type: Number, default: 12 },
    },
    data() {
        return { page: 1 };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.items.length / this.pageSize) || 1;
        },
        pagedItems() {
            const start = (this.page - 1) * this.pageSize;
            return this.items.slice(start, start + this.pageSize);
        },
    },
    watch: {
        // если список изменился (например, новый поиск) — сбрасываем на первую страницу
        items() {
            this.page = 1;
        },
    },
    methods: {
        nextPage() {
            if (this.page < this.totalPages) this.page++;
        },
        prevPage() {
            if (this.page > 1) this.page--;
        },
        goToPage(n) {
            this.page = n;
        },
    },
};
</script>
