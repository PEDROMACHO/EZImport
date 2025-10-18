<template>
    <!--  :class="`spectrum spectrum--medium spectrum--${appTheme}`" -->
    <sp-theme
        id="app"
        :color="appTheme"
        system="spectrum"
        scale="medium"
        dir="ltr"
    >
        <Panel>
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
import { getCSS, setCSS } from "@/utils/css";
import { Menus, Panel } from "lokney";
// import spy from "cep-spy";
// import { evalScript } from "cluecumber";

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
        // пример вызова jsx
        // const result = await evalScript(`alert("Hello from JSX")`);
        // console.log("JSXEvent result:", result);

        // пример использования cep-spy
        // console.log("CEP info:", spy);

        this.$store.dispatch("config/initConfig");

        if (this.$store.state.pathDirectory) {
            this.$store.dispatch("fetchCategories");
        }
    },
    methods: {
        getCSS,
        setCSS,
    },
    watch: {
        appTheme(newValue) {
            this.setCSS("--app-theme", newValue);
        },
    },
    computed: {
        appTheme() {
            return getAppTheme();
        },
        appThemeVersion: {
            get() {
                return this.$store.state.config.appThemeVersion;
            },
            set(value) {
                this.$store.commit("config/setAppThemeVersion", value);
            },
        },
    },
};
</script>