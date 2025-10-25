<template>
    <div
        class="flex flex-col items-center justify-center max-w-lg gap-10 p-4 mx-auto"
    >
        <h2
            class="w-full m-0 text-2xl text-center"
        >
            {{ title }}
        </h2>

        <div class="flex flex-col w-full gap-4">
            <sp-textfield
                required
                ref="file"
                type="text"
                class="w-full"
                @click="openDialog"
                :value="selectedPath"
                :label="$t('settings.folder_select_label')"
                :placeholder="$t('settings.folder_select_placeholder')"
            >
                <sp-help-text v-if="statusMessage" slot="help-text">
                    {{ statusMessage }}
                </sp-help-text>
                <sp-help-text
                    v-if="statusMessage && libraryType === 'invalid'"
                    slot="negative-help-text"
                >
                    {{ statusMessage }}
                </sp-help-text>
            </sp-textfield>

            <sp-picker
                disabled
                class="w-full"
                :value="locale"
                @change="locale = $event.target.value"
            >
                <span slot="label">{{ $t("settings.select_language") }}</span>
                <sp-menu-item value="ru" default>Русский</sp-menu-item>
                <sp-menu-item value="en" disabled>English</sp-menu-item>
            </sp-picker>
        </div>

        <!-- Сохранить -->
        <sp-button :disabled="!selectedPath || isBad" @click="confirmPath">
            {{ $t("buttons.save") }}
        </sp-button>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";

export default {
    name: "SettingsPage",
    data() {
        return { selectedPath: null };
    },
    computed: {
        ...mapState("config", ["libraryType", "locale"]),
        ...mapState("categories", ["error"]),
        title() {
            return this.$route.query.first
                ? this.$t("settings.first_title")
                : this.$t("settings.title");
        },
        // текст по типу библиотеки
        libraryTypeMessage() {
            switch (this.libraryType) {
                case "our":
                    return this.$t("settings.folder_our");
                case "new":
                    return this.$t("settings.folder_new");
                case "invalid":
                    return this.$t("settings.folder_invalid");
                case "error":
                    return this.$t("settings.folder_error");
                default:
                    return null;
            }
        },
        // есть ли проблема
        isBad() {
            return (
                this.libraryType === "invalid" ||
                this.libraryType === "error" ||
                !!this.error
            );
        },
        // какой текст показывать
        statusMessage() {
            return this.error || this.libraryTypeMessage;
        },
        // какой цвет бейджа
        locale: {
            get() {
                return this.$store.state.config.locale;
            },
            set(v) {
                this.$store.commit("config/setLocale", v);
            },
        },
    },
    watch: {
        locale(n) {
            this.setLocale(n);
            this.$i18n.locale = n;
        },
    },
    methods: {
        ...mapActions("library", ["initLibrary", "detectLibraryType"]),
        ...mapMutations("config", ["setLibraryType", "setLocale"]),
        // при новом выборе: очищаем прошлую ошибку и определяем тип
        openDialog() {
            const res = window.cep.fs.showOpenDialog(
                false,
                true,
                this.$t("settings.folder_select")
            );
            if (res.err === 0 && res.data && res.data.length > 0) {
                this.selectedPath = res.data[0];
                this.detectLibraryType(this.selectedPath).then((t) =>
                    this.setLibraryType(t)
                );
            }
        },
        async confirmPath() {
            if (!this.selectedPath || this.isBad) return;
            const ok = await this.initLibrary(this.selectedPath);
            if (ok) this.$router.push({ name: "Library" });
        },
    },
};
</script>
