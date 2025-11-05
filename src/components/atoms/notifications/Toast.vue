<template>
    <div class="z-50 notifications">
        <sp-toast
            v-for="(n, i) in notifications"
            :key="`${i}-${n.time}`"
            size="s"
            :open="true"
            timeout="3000"
            :variant="mapTypeToVariant(n.type)"
            :icon-label="n.type"
            @close="closeHandler(i)"
        >
            {{ n.text }}
        </sp-toast>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
    name: "Toast",

    computed: {
        ...mapGetters("notifications", ["all"]),
        notifications() {
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
                    return "";
                case "info":
                    return "info";
                default:
                    return "positive";
            }
        },
        closeHandler(index) {
            setTimeout(() => {
                this.remove(index);
            }, 300); // Delay to allow close animation
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