<template>
    <div
        class="flex flex-col items-center justify-center h-full max-w-lg gap-10 p-4 mx-auto"
    >
        <h2
            class="w-full m-0 text-center spectrum-Heading spectrum-Heading--sizeL"
        >
            {{ title }}
        </h2>

        <div class="flex flex-col w-full gap-4">
            <!-- Папка -->
            <FolderInput
                :label="$t('settings.folder_select_label')"
                :placeholder="$t('settings.folder_select_placeholder')"
                :value="selectedPath"
                @choose="openDialog"
            />

            <!-- Статус -->
            <div
                v-if="statusMessage"
                class="flex items-center justify-center spectrum-Badge spectrum-Badge--sizeS"
                :class="badgeVariant"
            >
                <div class="spectrum-Badge-label">{{ statusMessage }}</div>
            </div>

            <!-- Язык -->
            <SelectCombobox
                :label="$t('settings.select_language')"
                :searchable="false"
                :options="[
                    { label: 'Русский', value: 'ru' },
                    { label: 'English', value: 'en' },
                ]"
                v-model="locale"
            />
        </div>

        <!-- Сохранить -->
        <button
            class="spectrum-Button spectrum-Button--accent spectrum-Button--sizeM spectrum-Button--fill"
            :disabled="!selectedPath || isBad"
            @click="confirmPath"
        >
            <span class="spectrum-Button-label">{{ $t("buttons.save") }}</span>
        </button>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import FolderInput from "@/components/Controls/FolderInput.vue";
import SelectCombobox from "@/components/Controls/SelectCombobox.vue";

export default {
    name: "SettingsView",
    components: { FolderInput, SelectCombobox },
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
        badgeVariant() {
            return this.isBad
                ? "spectrum-Badge--negative"
                : "spectrum-Badge--positive";
        },
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
                // очистить прошлую ошибку (если у модуля categories есть такая мутация)
                this.$store.commit("categories/setError", null, { root: true });
                this.detectLibraryType(this.selectedPath).then((t) =>
                    this.setLibraryType(t)
                );
            }
        },
        async confirmPath() {
            if (!this.selectedPath || this.isBad) return;
            const ok = await this.initLibrary(this.selectedPath);
            if (ok) this.$router.push({ name: "Home" });
        },
    },
};
</script>
