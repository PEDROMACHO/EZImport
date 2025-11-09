<template>
    <!--  :class="`spectrum spectrum--medium spectrum--${appTheme}`" -->
    <sp-theme
        id="app"
        :color="appTheme"
        :system="$store.state.config.settings.system"
        :scale="$store.state.config.settings.scale"
        :dir="$store.state.config.settings.direction"
    >
        <Panel script-path="./dist/host/AEFT/host.jsx">
            <transition name="fade" mode="out-in">
                <router-view />
            </transition>
            <Menus refresh debug />
            <Toast />
        </Panel>
    </sp-theme>
</template>

<script>
import getAppTheme from "@/utils/main/getAppTheme";
import { Menus, Panel } from "lokney";
import { getCSS, setCSS } from "@/utils/css.js";

// Components
import Toast from "./components/atoms/notifications/Toast.vue";

export default {
    name: "App",
    components: {
        Menus,
        Panel,
        Toast,
    },
    async mounted() {
        await this.$store.dispatch("config/initConfig");
    },
    methods: {
        getCSS,
        setCSS,
    },
    computed: {
        appTheme() {
            return this.$store.state.config.settings.themeMode === "ae"
                ? getAppTheme()
                : this.$store.state.config.settings.theme;
        },
    },
};
</script>