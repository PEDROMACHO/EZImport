<template>
    <div
        class="card-composition"
        :data-index="index"
        role="group"
        :aria-label="composition.name"
    >
        <div
            class="relative text-gray-400 bg-center bg-no-repeat bg-cover size-16/9"
            :style="bgStyle"
            @click="$emit('preview', composition)"
        >
            <svg
                v-if="!composition.previewPath"
                xmlns="http://www.w3.org/2000/svg"
                width="35"
                height="35"
                viewBox="0 0 18 18"
                class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            >
                <rect fill="#currentColor" opacity="0" width="18" height="18" />
                <polygon fill="currentColor" points="10 1 10 6 15 6 10 1" />
                <path
                    fill="currentColor"
                    d="M9.5,7A.5.5,0,0,1,9,6.5V1H3.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5V7ZM7,14.5a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1-.5-.5v-2a.5.5,0,0,1,.5-.5h2a.5.5,0,0,1,.5.5Zm0-4a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1-.5-.5v-2A.5.5,0,0,1,4.5,8h2a.5.5,0,0,1,.5.5Zm0-4a.5.5,0,0,1-.5.5h-2A.5.5,0,0,1,4,6.5v-2A.5.5,0,0,1,4.5,4h2a.5.5,0,0,1,.5.5Z"
                />
            </svg>

            <div class="card-composition__actions">
                <div
                    class="content-item_actions-buttons spectrum-ActionGroup spectrum-ActionGroup--sizeS"
                >
                    <button
                        v-for="(format, i) in composition.formats"
                        :key="format"
                        class="spectrum-Button spectrum-Button--sizeS spectrum-Button--primary"
                        :disabled="loading"
                        :aria-label="`${composition.name} • ${format}`"
                        @click="load(format, composition.filesPaths[i])"
                    >
                        <span class="spectrum-Button-label">{{ format }}</span>
                    </button>
                </div>
            </div>
        </div>

        <div
            class="mt-2 spectrum-HelpText spectrum-HelpText--sizeM spectrum-HelpText--neutral"
            style=""
            id="helptext-pna7q"
        >
            <div class="spectrum-HelpText-text">
                {{ composition.name }}
            </div>
        </div>

        <div
            v-if="loading"
            class="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-25 backdrop-filter backdrop-blur-xl"
        >
            <ProgressCircle />
        </div>
    </div>
</template>

<script>
import { toBlobUrl, revokePath } from "@/utils/fs/toBlobUrl";
import { evalScript } from "cluecumber";

// Components
import ProgressCircle from "@/components/Helpers/ProgressCircle.vue";

export default {
    name: "CardComposition",
    components: { ProgressCircle },
    props: {
        composition: { type: Object, required: true },
        index: { type: Number, required: true },
    },
    data() {
        return { url: "", isVisible: false, loading: false };
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
        bgStyle() {
            return this.url ? { backgroundImage: `url('${this.url}')` } : {};
        },
    },
    methods: {
        observe() {
            const io = new IntersectionObserver(
                async (entries) => {
                    for (const e of entries) {
                        if (e.isIntersecting) {
                            this.isVisible = true;
                            if (!this.url && this.composition.previewPath) {
                                this.url = await toBlobUrl(
                                    this.composition.previewPath
                                );
                            }
                        } else {
                            this.isVisible = false;
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

        async load(format, filePath) {
            if (!filePath) return;
            this.loading = true;
            try {
                const safePath = filePath.replace(/\\/g, "/");
                await evalScript(`AE_ImportFile("${safePath}", "${format}")`);
                this.$emit("loaded", {
                    index: this.index,
                    format,
                    path: filePath,
                });
            } catch (e) {
                const msg = String(e)
                    .replace(/["\\]/g, "\\$&")
                    .replace(/\n/g, "\\n");
                await evalScript(`alert("${msg}")`);
                this.$emit("error", { index: this.index, error: e });
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.size-16\/9 {
    padding: 56.25% 0 0 0;
}
.card-composition{
    position: relative;
    z-index: 0;
}
.card-composition:hover .card-composition__actions {
    opacity: 1;
    backdrop-filter: blur(6px);
}
.card-composition__actions {
    gap: 4px;
    inset: 0;
    opacity: 0;
    display: flex;
    position: absolute;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    transition: 0.3s ease-in-out;
}
</style>
