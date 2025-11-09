<template>
    <div
        class="flex flex-col items-center justify-center max-w-lg gap-10 p-4 mx-auto"
    >
        <h2 class="w-full m-0 text-2xl text-center">
            {{ $t("settings.inital_title") }}
        </h2>

        <div class="flex flex-col w-full gap-4">
            <!-- выбор папки -->
            <sp-textfield
                required
                ref="file"
                type="text"
                class="w-full"
                :invalid="currentLibrary?.type === 'invalid'"
                @click="openDialog"
                :value="selectedPath"
                :label="$t('settings.folder_select_label')"
                :placeholder="$t('settings.folder_select_placeholder')"
            >
                <sp-help-text
                    v-if="currentLibrary?.type"
                    :variant="currentLibrary?.type === 'invalid' ? 'negative' : 'default'"
                    :slot="currentLibrary?.type === 'invalid' ? 'negative-help-text' : 'help-text'"
                >
                    {{ statusMessage }}
                </sp-help-text>
            </sp-textfield>

            <div class="grid grid-cols-2 gap-2">
                <!-- режим темы -->
                <sp-picker
                    :value="settings.themeMode"
                    @change="updateThemeMode"
                    class="w-full"
                    placeholder="Выбор темы"
                    disabled
                >
                    <span slot="label">{{ $t("settings.select_theme_mode") }}</span>
                    <sp-menu-item value="manual">Выбрать вручную</sp-menu-item>
                    <sp-menu-item value="ae">Использовать тему AE</sp-menu-item>
                </sp-picker>

                <!-- выбор темы вручную -->
                <sp-picker
                    class="w-full"
                    :disabled="settings.themeMode !== 'manual'"
                    :value="settings.theme"
                    @change="updateTheme"
                >
                    <span slot="label">{{ $t("settings.select_theme") }}</span>
                    <sp-menu-item value="light">Светлая</sp-menu-item>
                    <sp-menu-item value="dark">Тёмная</sp-menu-item>
                    <sp-menu-item value="darkest">Самая тёмная</sp-menu-item>
                </sp-picker>
            </div>

            <!-- выбор system -->
            <sp-picker
                :value="settings.system"
                @change="updateSystem"
                class="w-full"
            >
                <span slot="label">{{ $t("settings.select_system") }}</span>
                <sp-menu-item value="spectrum">Spectrum</sp-menu-item>
                <sp-menu-item value="spectrum-two">Spectrum Two</sp-menu-item>
                <sp-menu-item value="express">Express</sp-menu-item>
            </sp-picker>

            <!-- выбор scale -->
            <sp-picker
                :value="settings.scale"
                @change="updateScale"
                class="w-full"
            >
                <span slot="label">{{ $t("settings.select_scale") }}</span>
                <sp-menu-item value="medium">Medium</sp-menu-item>
                <sp-menu-item value="large">Large</sp-menu-item>
            </sp-picker>

            <!-- выбор direction -->
            <sp-picker
                :value="settings.direction"
                @change="updateDirection"
                class="w-full"
            >
                <span slot="label">{{ $t("settings.select_scale") }}</span>
                <sp-menu-item value="ltr">LTR</sp-menu-item>
                <sp-menu-item value="rtl">RTL</sp-menu-item>
            </sp-picker>

            <!-- язык -->
            <sp-picker
                class="w-full"
                :value="settings.locale"
                @change="updateLocale"
            >
                <span slot="label">{{ $t("settings.select_language") }}</span>
                <sp-menu-item value="ru" default>Русский</sp-menu-item>
                <sp-menu-item value="en">English</sp-menu-item>
            </sp-picker>
        </div>

        <!-- сохранить -->
        <sp-button :disabled="!selectedPath || isBad" @click="confirmPath">
            {{ $t("buttons.save") }}
        </sp-button>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";

export default {
    name: "InitialPage",
    data() {
        return { selectedPath: null };
    },
    computed: {
        ...mapState("config", ["libraries", "settings"]),
        ...mapState("categories", ["error"]),

        currentLibrary() {
            return this.libraries.find((lib) => lib.path === this.selectedPath);
        },
        libraryTypeMessage() {
            const type = this.currentLibrary?.type;
            if (!type) return null;
            return this.$t(`settings.folder_${type}`);
        },
        isBad() {
            return (
                ["invalid", "error"].includes(this.currentLibrary?.type) ||
                !!this.error
            );
        },
        statusMessage() {
            return this.error || this.libraryTypeMessage;
        },
        locale: {
            get() {
                return this.settings.locale;
            },
            set(v) {
                this.$store.commit("config/setSettings", { locale: v });
                this.$i18n.locale = v;
            },
        },
    },
    methods: {
        ...mapActions("library", ["initLibrary", "detectLibraryType"]),
        ...mapMutations("config", ["addLibrary", "setSettings"]),

        openDialog() {
            const res = window.cep.fs.showOpenDialog(
                false,
                true,
                this.$t("settings.folder_select")
            );
            if (res.err === 0 && res.data?.length > 0) {
                this.selectedPath = res.data[0];
                this.detectLibraryType(this.selectedPath).then((t) => {
                    this.addLibrary({ path: this.selectedPath, type: t });
                });
            }
        },

        async confirmPath() {
            if (!this.selectedPath || this.isBad) return;
            const ok = await this.initLibrary(this.selectedPath);
            if (ok) this.$router.push({ name: "Library" });
        },

        updateThemeMode(e) {
            this.setSettings({ themeMode: e.target.value });
        },
        updateTheme(e) {
            this.setSettings({ theme: e.target.value });
        },
        updateSystem(e) {
            this.setSettings({ system: e.target.value });
        },
        updateScale(e) {
            this.setSettings({ scale: e.target.value });
        },
        updateDirection(e) {
            this.setSettings({ direction: e.target.value });
        },
        updateLocale(e) {
            const locale = e.target.value;
            this.setSettings({ locale });
            this.$i18n.locale = locale;
        },
    },
};
</script>