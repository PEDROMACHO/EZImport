<template>
    <div id="app" :class="`spectrum spectrum--medium spectrum--${appTheme}`">
        <Panel>
            <transition name="fade" mode="out-in">
                <router-view />
            </transition>
            <Menus refresh debug />
            <SvgIcons />
        </Panel>
    </div>
</template>

<script>
import getAppTheme from "@/utils/main/getAppTheme";
import { getCSS, setCSS } from "@/utils/css";
import { Menus, Panel } from "lokney";
// import spy from "cep-spy";
// import { evalScript } from "cluecumber";

import SvgIcons from "@/components/Helpers/SvgIcons.vue";

export default {
    name: "App",
    components: {
        Menus,
        Panel,
        SvgIcons,
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
    computed: {
        appTheme() {
            return getAppTheme();
        },
    },
};
</script>

<style>
.panel {
    padding: 15px;
}
</style>