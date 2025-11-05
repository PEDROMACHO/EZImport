<template>
    <sp-card variant="gallery" class="w-full" :class="$attrs.class">
        <div slot="heading">
            <HighlightText
                :text="composition.name"
                :matches="composition.matches"
            />
        </div>

        <div slot="preview">
            <div class="flex">
                <img
                    v-if="url"
                    class="w-full max-w-full card-preview"
                    alt=""
                    @error="reloadBlob"
                    slot="preview"
                    :src="url"
                    loading="lazy"
                />
                <sp-asset v-else variant="file"></sp-asset>
            </div>
        </div>

        <div slot="actions">
            <sp-action-group size="s" compact>
                <sp-action-button
                    v-for="(format, i) in composition.formats"
                    :key="`${composition.path}:${format}`"
                    :aria-label="`${composition.name} • ${format}`"
                    @click="importFormat(format, composition.filesPaths[i])"
                    :disabled="loading"
                >
                    <span>{{ format }}</span>
                    <sp-progress-circle
                        v-if="instanceLoading[format]"
                        slot="icon"
                        size="s"
                        indeterminate
                    />
                </sp-action-button>

                <sp-action-button
                    label="Edit"
                    hold-affordance
                    :disabled="loading"
                    @click="openFolder(composition.path)"
                >
                    <sp-icon-folder-open-outline slot="icon" />
                </sp-action-button>
            </sp-action-group>
        </div>
    </sp-card>
</template>

<script>
import { evalScript } from "cluecumber";
import { toBlobUrl } from "@/utils/fs/toBlobUrl";

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
    async mounted() {
        if (this.composition.previewPath) {
            // this.url = await toBlobUrl(this.composition.previewPath);

            this.url = await this.$store.dispatch("cache/ensureBlob", {
                path: this.composition.previewPath,
                toBlobUrl,
            });
        }
    },
    beforeDestroy() {
        if (this.composition.previewPath) {
            this.$store.dispatch(
                "cache/releaseBlob",
                this.composition.previewPath
            );
            this.url = "";
        }
    },
    watch: {
        "composition.previewPath"(next, prev) {
            if (prev && prev !== next) {
                this.$store.dispatch("cache/releaseBlob", prev);
                this.url = "";
            }
            if (next && next !== prev) {
                this.$store
                    .dispatch("cache/ensureBlob", { path: next, toBlobUrl })
                    .then((url) => (this.url = url));
            }
        },
    },
    computed: {
        loading() {
            return this.$store.getters["loading/isLoadingByKey"](
                "composition:format:import"
            );
        },
    },
    methods: {
        async reloadBlob() {
            this.url = "";
            if (!this.composition.previewPath) return;
            this.url = await this.$store.dispatch("cache/ensureBlob", {
                path: this.composition.previewPath,
                toBlobUrl,
            });
        },

        async importFormat(format, filePath) {
            if (!filePath) return;
            this.$set(this.instanceLoading, format, true);
            this.$store.dispatch("loading/start", "composition:format:import");
            try {
                const safePath = filePath
                    .replace(/\\/g, "/")
                    .replace(/["\\]/g, "\\$&");
                await evalScript(`AE_ImportFile("${safePath}")`);
            } catch (e) {
                const msg = String(e)
                    .replace(/["\\]/g, "\\$&")
                    .replace(/\n/g, "\\n");
                await evalScript(`alert("${msg}")`);
            } finally {
                this.$set(this.instanceLoading, format, false);
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

<style scoped>
.card-preview {
    object-fit: cover;
    aspect-ratio: 16 / 9;
    will-change: transform;
}
</style>