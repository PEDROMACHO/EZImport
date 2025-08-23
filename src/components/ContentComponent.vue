<template>
    <div class="w-full">
        <transition name="slide-fade" mode="out-in">
            <div
                class="flex flex-col gap-2"
                v-if="
                    getCurrentCategory && getCurrentCategory.variants.length > 0
                "
                key="content"
            >
                <h4 class="spectrum-Heading spectrum-Heading--sizeM">
                    {{ getCurrentCategory.name }}
                </h4>

                <transition appear :css="false" name="list">
                    <div class="content">
                        <div
                            v-for="(variant, index) in variants"
                            :key="variant.name"
                            class="content-item"
                            :data-index="index"
                        >
                            <div class="w-auto">
                                <div
                                    class="relative text-gray-400 bg-center bg-no-repeat bg-contain size-16/9"
                                    :style="
                                        variant.image &&
                                        `background-image: url(${variant.image});`
                                    "
                                >
                                    <svg
                                        v-if="!variant.image"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="35"
                                        height="35"
                                        viewBox="0 0 18 18"
                                        class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                                    >
                                        <rect
                                            id="Canvas"
                                            fill="#currentColor"
                                            opacity="0"
                                            width="18"
                                            height="18"
                                        />
                                        <polygon
                                            fill="currentColor"
                                            points="10 1 10 6 15 6 10 1"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M9.5,7A.5.5,0,0,1,9,6.5V1H3.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5V7ZM7,14.5a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1-.5-.5v-2a.5.5,0,0,1,.5-.5h2a.5.5,0,0,1,.5.5Zm0-4a.5.5,0,0,1-.5.5h-2a.5.5,0,0,1-.5-.5v-2A.5.5,0,0,1,4.5,8h2a.5.5,0,0,1,.5.5Zm0-4a.5.5,0,0,1-.5.5h-2A.5.5,0,0,1,4,6.5v-2A.5.5,0,0,1,4.5,4h2a.5.5,0,0,1,.5.5Z"
                                        />
                                    </svg>
                                </div>

                                <div class="content-item_actions">
                                    <div
                                        class="content-item_actions-buttons spectrum-ActionGroup spectrum-ActionGroup--sizeM"
                                    >
                                        <button
                                            v-for="(
                                                format, i
                                            ) in variant.formats"
                                            :key="format"
                                            @click="loadAEP(index, variant.filesPaths[i], format )"
                                            class="spectrum-ActionButton is-selected spectrum-ActionButton--sizeS spectrum-ActionGroup-item"
                                        >
                                            <span
                                                class="uppercase spectrum-ActionButton-label"
                                            >
                                                {{ format }}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="flex items-center justify-between gap-2 mt-2"
                            >
                                <h4
                                    class="spectrum-Heading spectrum-Heading--sizeXXS"
                                >
                                    {{ variant.name }}
                                </h4>

                                <!-- <button
                                    class="spectrum-ActionButton spectrum-ActionButton--sizeS spectrum-ActionButton--quiet"
                                >
                                    <span class="spectrum-ActionButton-label">
                                        {{
                                            variant.formats[
                                                loadingFormat[index]
                                            ]
                                        }}
                                    </span>
                                    <svg
                                        v-if="variant.formats.length > 1"
                                        class="spectrum-Icon spectrum-Icon--sizeS spectrum-ActionButton-icon"
                                        focusable="false"
                                        aria-hidden="true"
                                    >
                                        <use
                                            xlink:href="#spectrum-icon-18-More"
                                        />
                                    </svg>
                                </button> -->
                            </div>

                            <div
                                v-if="loadingItem[index]"
                                class="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-25 backdrop-filter backdrop-blur-xl"
                            >
                                <ProgressCircle />
                            </div>
                        </div>
                    </div>
                </transition>
            </div>

            <IllustratedMessage v-else key="illustratedMessage" />
        </transition>
    </div>
</template>

<script>
// TODO: Анимация aep элементов
import { mapGetters } from "vuex";
import { evalScript } from "cluecumber";

// Components
import ProgressCircle from "@/components/ProgressCircle.vue";
import IllustratedMessage from "@/components/IllustratedMessage.vue";

export default {
    name: "ContentComponent",
    components: {
        ProgressCircle,
        IllustratedMessage,
    },
    data() {
        return {
            loadingItem: [],
            loadingFormat: [],
        };
    },
    watch: {
        variants: {
            deep: true,
            handler(newVal) {
                if (newVal) {
                    this.loadingFormat = newVal.map((variant) =>
                        Array(variant.formats).fill(0)
                    );
                    this.loadingItem = Array(newVal.length).fill(false);
                }
            },
        },
    },
    computed: {
        ...mapGetters(["getCategories", "getError", "getCurrentCategory"]),
        variants() {
            return this.getCurrentCategory
                ? this.getCurrentCategory.variants
                : [];
        },
    },
    methods: {
        async loadAEP(index, path, format) {
            this.$set(this.loadingItem, index, true);

            try {
                await evalScript(`importFile("${path.replace(/\\/g,"/")}", "${format}");`);
            } catch (error) {
                console.log(error);
                await evalScript(`alert("${error}");`);
            } finally {
                this.$set(this.loadingItem, index, false);
            }
        },
    },
};
</script>

<style>
.size-16\/9 {
    padding: 56.25% 0 0 0;
}

.content {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 8px;
}
.content-item {
    position: relative;
    padding: 8px;
    overflow: hidden;
    transition: 0.3s ease-in-out;
    border: 2px solid transparent;
    border-radius: 8px;
    min-width: min-content;
    max-width: 200px;
    width: 100%;
}
.content-item:hover {
    border: 2px solid var(--spectrum-gray-400);
}
.content-item:hover .content-item_actions {
    opacity: 1;
}
.content-item_actions {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: 0.3s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    width: 100%;
    height: 100%;
}
</style>
