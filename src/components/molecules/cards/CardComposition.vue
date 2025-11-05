<template>
    <div class="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3">
        <sp-card variant="gallery" class="w-full">
            <div slot="heading">
                <HighlightText
                    :text="composition.name"
                    :matches="composition.matches"
                />
            </div>
            <div slot="preview">
                <div class="flex">
                    <img
                        class="w-full max-w-full card-preview"
                        alt=""
                        slot="preview"
                        :src="url"
                        v-if="url"
                    />
                    <sp-asset variant="file" v-else></sp-asset>
                </div>
            </div>
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
                        @click="openFolder(`${composition.path}`)"
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

// Components
import HighlightText from "@/components/atoms/typhography/HighlightText.vue";

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
    components: { HighlightText },
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
                        { text: this.$t("errors.cannot_open_folder") },
                        { root: true }
                    );
                }
            } catch (e) {
                this.$store.dispatch(
                    "notifications/error",
                    { text: this.$t("errors.error_open_folder") + e.message },
                    { root: true }
                );
            }
        },
    },
};
</script>

<style>
.card-preview {
    object-fit: cover;
    aspect-ratio: 16 / 9;
}
</style>
