<template>
    <div class="flex flex-col items-center justify-center gap-10 p-4 mx-auto">
        <h2 class="w-full m-0 text-2xl text-center">
            {{ $t("settings.title") }}
        </h2>

        <!-- блок библиотек -->
        <div class="flex flex-col w-full gap-2">
            <div
                v-for="(lib, idx) in libraries"
                :key="lib.path"
                class="flex gap-2"
            >
                <sp-textfield
                    class="flex-1"
                    :value="lib.path"
                    :label="`Библиотека #${idx + 1}`"
                    @click="changeLibraryPath(idx)"
                >
                </sp-textfield>

                <sp-button
                    v-if="libraries.length > 1"
                    @click="removeLibrary(idx)"
                    icon-only
                    variant="negative"
                >
                    <sp-icon-unlink slot="icon" size="s"></sp-icon-unlink>
                </sp-button>
            </div>

            <div class="relative">
                <sp-button @click="addNewLibrary" size="s">
                    <sp-icon-link-check slot="icon"></sp-icon-link-check>
                    Привязать новую библиотеку
                </sp-button>
            </div>
        </div>

        <!-- блок настроек интерфейса -->
        <div class="flex flex-col w-full gap-4">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <sp-field-label for="select_theme_mode">
                        {{ $t("settings.select_theme_mode") }}
                    </sp-field-label>
                    <sp-picker
                        id="select_theme_mode"
                        class="w-full"
                        :value="settings.themeMode"
                        @change="updateThemeMode"
                        disabled
                    >
                        <span slot="label">
                            {{ $t("settings.select_theme_mode") }}
                        </span>
                        <sp-menu-item value="manual"
                            >Выбрать вручную</sp-menu-item
                        >
                        <sp-menu-item value="ae"
                            >Использовать тему AE</sp-menu-item
                        >
                    </sp-picker>
                </div>

                <div>
                    <sp-field-label for="select_theme">
                        {{ $t("settings.select_theme") }}
                    </sp-field-label>
                    <sp-picker
                        id="select_theme"
                        class="w-full"
                        :value="settings.theme"
                        @change="updateTheme"
                        :disabled="settings.themeMode !== 'manual'"
                    >
                        <span slot="label">{{
                            $t("settings.select_theme")
                        }}</span>
                        <sp-menu-item value="light">Светлая</sp-menu-item>
                        <sp-menu-item value="dark">Тёмная</sp-menu-item>
                        <sp-menu-item value="darkest"
                            >Самая тёмная</sp-menu-item
                        >
                    </sp-picker>
                </div>

                <div>
                    <sp-field-label for="select_system">
                        {{ $t("settings.select_system") }}
                    </sp-field-label>
                    <sp-picker
                        id="select_system"
                        class="w-full"
                        :value="settings.system"
                        @change="updateSystem"
                    >
                        <span slot="label">{{
                            $t("settings.select_system")
                        }}</span>
                        <sp-menu-item value="spectrum">Spectrum</sp-menu-item>
                        <sp-menu-item value="spectrum-two"
                            >Spectrum Two</sp-menu-item
                        >
                        <sp-menu-item value="express">Express</sp-menu-item>
                    </sp-picker>
                </div>

                <div>
                    <sp-field-label for="select_scale">
                        {{ $t("settings.select_scale") }}
                    </sp-field-label>
                    <sp-picker
                        id="select_scale"
                        class="w-full"
                        :value="settings.scale"
                        @change="updateScale"
                    >
                        <span slot="label">{{
                            $t("settings.select_scale")
                        }}</span>
                        <sp-menu-item value="medium">Medium</sp-menu-item>
                        <sp-menu-item value="large">Large</sp-menu-item>
                    </sp-picker>
                </div>

                <div>
                    <sp-field-label for="select_language">
                        {{ $t("settings.select_language") }}
                    </sp-field-label>
                    <sp-picker
                        id="select_language"
                        class="w-full"
                        :value="settings.locale"
                        @change="updateLocale"
                    >
                        <span slot="label">{{
                            $t("settings.select_language")
                        }}</span>
                        <sp-menu-item value="ru">Русский</sp-menu-item>
                        <sp-menu-item value="en">English</sp-menu-item>
                    </sp-picker>
                </div>

                <div>
                    <sp-field-label for="select_direction">
                        {{ $t("settings.select_direction") }}
                    </sp-field-label>
                    <sp-picker
                        id="select_direction"
                        class="w-full"
                        :value="settings.direction"
                        @change="updateDirection"
                    >
                        <span slot="label">{{
                            $t("settings.select_direction")
                        }}</span>
                        <sp-menu-item value="ltr">LTR</sp-menu-item>
                        <sp-menu-item value="rtl">RTL</sp-menu-item>
                    </sp-picker>
                </div>
            </div>
        </div>

        <!-- сохранить -->
        <sp-button @click="saveConfig">
            {{ $t("buttons.save") }}
        </sp-button>
    </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

// Web Components
import "@spectrum-web-components/icons-workflow/icons/sp-icon-unlink.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-link-check.js";

export default {
    name: "SettingsPage",
    computed: {
        ...mapState("config", ["libraries", "settings"]),
    },
    methods: {
        ...mapMutations("config", {
            mutationAddLibrary: "addLibrary",
            mutationUpdateLibraryPath: "updateLibraryPath",
            mutationRemoveLibrary: "removeLibrary",
            mutationSetSettings: "setSettings",
        }),

        changeLibraryPath(idx) {
            const res = window.cep.fs.showOpenDialog(
                false,
                true,
                this.$t("settings.folder_select")
            );
            if (res.err === 0 && res.data?.length > 0) {
                this.mutationUpdateLibraryPath({
                    index: idx,
                    path: res.data[0],
                });
            }
        },

        async addNewLibrary() {
            const res = window.cep.fs.showOpenDialog(
                false,
                true,
                this.$t("settings.folder_select")
            );
            if (res.err === 0 && res.data?.length > 0) {
                const dir = res.data[0];
                const type = await this.$store.dispatch(
                    "library/detectLibraryType",
                    dir
                );

                if (["duplicate", "error", "invalid"].includes(type)) {
                    this.$store.dispatch(
                        "notifications/error",
                        { text: "Папка не подходит", silent: false },
                        { root: true }
                    );
                }

                this.mutationAddLibrary({ path: dir, type });
            }
        },

        removeLibrary(idx) {
            this.mutationRemoveLibrary(idx);
        },

        updateThemeMode(e) {
            this.mutationSetSettings({ themeMode: e.target.value });
        },
        updateTheme(e) {
            this.mutationSetSettings({ theme: e.target.value });
        },
        updateSystem(e) {
            this.mutationSetSettings({ system: e.target.value });
        },
        updateScale(e) {
            this.mutationSetSettings({ scale: e.target.value });
        },
        updateDirection(e) {
            this.mutationSetSettings({ direction: e.target.value });
        },
        updateLocale(e) {
            const locale = e.target.value;
            this.mutationSetSettings({ locale });
            this.$i18n.locale = locale;
        },

        async saveConfig() {
            await this.$store.dispatch("config/persistConfig");
            this.$router.push({ name: "Library" });
        },
    },
};
</script>