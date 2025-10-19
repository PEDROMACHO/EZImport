<template>
    <div style="max-width: calc(100% / 3); min-width: 150px">
        <sp-card :heading="composition.name" variant="gallery">
            <img alt="" slot="preview" :src="url" />
            <div slot="actions">
                <sp-action-group size="s" compact>
                    <sp-action-button
                        v-for="(format, i) in composition.formats"
                        :key="format"
                        :aria-label="`${composition.name} • ${format}`"
                        @click="importFormat(format, composition.filesPaths[i])"
                        :disabled="loading"
                    >
                        <span>{{ format }}</span>
                        <sp-progress-circle
                            slot="icon"
                            v-if="instanceLoading[format]"
                            size="s"
                            indeterminate
                        />
                    </sp-action-button>
                    <sp-action-button
                        label="Edit"
                        hold-affordance
                        :disabled="loading"
                        @click="openFolder(composition.previewPath)"
                    >
                        <sp-icon-folder-open-outline
                            slot="icon"
                        ></sp-icon-folder-open-outline>
                    </sp-action-button>
                </sp-action-group>
            </div>
        </sp-card>
    </div>
</template>

<script>
import { evalScript } from "cluecumber";
import { toBlobUrl, revokePath } from "@/utils/fs/toBlobUrl";

// WebComponents
import "@spectrum-web-components/icons-workflow/icons/sp-icon-folder-open-outline.js";

export default {
    name: "CardComposition",
    props: {
        index: { type: Number, required: true },
        composition: { type: Object, required: true },
    },
    data() {
        return {
            url: "",
            instanceLoading: {},
        };
    },
    mounted() {
        this.observe();
    },
    beforeDestroy() {
        if (this.url) {
            revokePath(this.composition.previewPath);
            this.url = "";
        }
    },
    computed: {
        loading() {
            return this.$store.getters["loading/isLoadingByKey"](
                "composition:format:import"
            );
        },
    },
    methods: {
        observe() {
            const io = new IntersectionObserver(
                async (entries) => {
                    let isVisible = false;

                    for (const e of entries) {
                        if (e.isIntersecting) {
                            isVisible = true;
                            if (!this.url && this.composition.previewPath) {
                                this.url = await toBlobUrl(
                                    this.composition.previewPath
                                );
                            }
                        } else {
                            isVisible = false;
                            if (this.url) {
                                revokePath(this.composition.previewPath);
                                this.url = "";
                            }
                        }
                    }
                },
                { root: null, threshold: 0.1 }
            );
            io.observe(this.$el);
            this._io = io;
        },

        delay(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },

        async importFormat(format, filePath) {
            if (!filePath) return;

            this.instanceLoading = {
                ...this.instanceLoading,
                [format]: true,
            };
            this.$store.dispatch("loading/start", "composition:format:import");
            try {
                const safePath = filePath.replace(/\\/g, "/");
                await evalScript(`AE_ImportFile("${safePath}")`);
            } catch (e) {
                const msg = String(e)
                    .replace(/["\\]/g, "\\$&")
                    .replace(/\n/g, "\\n");
                await evalScript(`alert("${msg}")`);
            } finally {
                this.instanceLoading = {
                    ...this.instanceLoading,
                    [format]: false,
                };
                this.$store.dispatch(
                    "loading/stop",
                    "composition:format:import"
                );
            }
        },

        async openFolder(filePath) {
            if (!filePath) return;
            try {
                const safePath = filePath.replace(/\\/g, "/");
                const result = await evalScript(`AE_OpenFolder("${safePath}")`);
                if (result !== "ok") {
                    this.$store.dispatch(
                        "notifications/error",
                        {
                            text:
                                this.$t("errors.cannot_open_folder") ||
                                "Не удалось открыть папку",
                        },
                        { root: true }
                    );
                }
            } catch (e) {
                this.$store.dispatch(
                        "notifications/error",
                        {
                            text:
                                this.$t("errors.cannot_open_folder") ||
                                "Ошибка при открытии папки " + e.message,
                        },
                        { root: true }
                    );
            }
        },
    },
};
</script>
