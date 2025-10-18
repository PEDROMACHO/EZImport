<template>
    <div class="notifications">
        <sp-toast
            v-for="(n, i) in notifications"
            :key="n.time"
            size="s"
			timeout="3000"
            :open="open"
            :variant="mapTypeToVariant(n.type)"
            :icon-label="n.type"
        >
            {{ n.text }}
        </sp-toast>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
    name: "Toast",
    data: {
        open: false,
    },
    computed: {
        ...mapGetters("notifications", ["all"]),
        notifications() {
            this.open = true;
            return this.all;
        },
    },
    methods: {
        ...mapMutations("notifications", ["remove"]),
        mapTypeToVariant(type) {
            switch (type) {
                case "error":
                    return "negative";
                case "warn":
                    return "warning";
                case "info":
                    return "info";
                default:
                    return "info";
            }
        },
    },
};
</script>

<style scoped>
.notifications {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>