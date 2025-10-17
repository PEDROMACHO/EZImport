<template>
    <transition name="fade">
        <div v-if="visible">
            <div
                class="spectrum-Underlay is-open"
                @click.self="backdropClosable && onCancel()"
            ></div>

            <div class="spectrum-Modal-wrapper" @keydown.esc="onCancel">
                <div class="spectrum-Modal spectrum-Modal--default is-open">
                    <div
                        role="dialog"
                        aria-modal="true"
                        class="spectrum-Dialog spectrum-Dialog--default spectrum-Dialog--sizeS"
                        :aria-labelledby="`${id}-title`"
                    >
                        <div class="spectrum-Dialog-grid">
                            <section class="spectrum-Dialog-content">
                                <div
                                    class="w-full spectrum-Textfield spectrum-Textfield--quiet"
                                    :class="{
                                        'is-disabled': loading,
                                        'is-invalid': localError || storeError,
                                    }"
                                >
                                    <svg
                                        v-if="localError || storeError"
                                        focusable="false"
                                        aria-hidden="true"
                                        role="img"
                                        class="spectrum-Icon spectrum-Icon--sizeM spectrum-Textfield-validationIcon"
                                        id="icon-el5zi"
                                        aria-labelledby="Alert"
                                    >
                                        <title id="Alert">Alert</title>
                                        <use
                                            xlink:href="#spectrum-icon-18-Alert"
                                            href="#spectrum-icon-18-Alert"
                                        ></use>
                                    </svg>
                                    <input
                                        :id="id"
                                        ref="input"
                                        v-model.trim="name"
                                        :placeholder="placeholder"
                                        class="spectrum-Textfield-input"
                                        :disabled="loading"
                                        @keyup.enter="trySave"
                                    />
                                </div>

                                <div
                                    v-if="localError || storeError"
                                    class="spectrum-HelpText spectrum-HelpText--negative spectrum-HelpText--sizeS"
                                    role="alert"
                                >
                                    <div class="spectrum-HelpText-text">
                                        {{ localError || storeError }}
                                    </div>
                                </div>
                            </section>

                            <footer
                                class="spectrum-Dialog-footer"
                                style="justify-content: flex-end"
                            >
                                <div
                                    class="spectrum-ButtonGroup spectrum-ButtonGroup--sizeM"
                                >
                                    <button
                                        class="spectrum-Button spectrum-Button--outline spectrum-Button--secondary spectrum-Button--sizeM spectrum-ButtonGroup-item"
                                        @click="onCancel"
                                        :disabled="loading"
                                    >
                                        <span class="spectrum-Button-label">{{
                                            cancelText
                                        }}</span>
                                    </button>

                                    <button
                                        class="spectrum-Button spectrum-Button--fill spectrum-Button--accent spectrum-Button--sizeM spectrum-ButtonGroup-item"
                                        :disabled="!name || loading"
                                        @click="trySave"
                                    >
                                        <span class="spectrum-Button-label">
                                            {{
                                                loading
                                                    ? $t("buttons.saving")
                                                    : saveText
                                            }}
                                        </span>
                                    </button>
                                </div>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
    name: "DialogCategory",
    props: {
        visible: { type: Boolean, default: false },
        placeholder: {
            type: String,
            default() {
                return this.$t("categories.name");
            },
        },
        cancelText: {
            type: String,
            default() {
                return this.$t("buttons.cancel");
            },
        },
        saveText: {
            type: String,
            default() {
                return this.$t("buttons.save");
            },
        },
        backdropClosable: { type: Boolean, default: true },
        autoCloseOnSuccess: { type: Boolean, default: true },
        id: {
            type: String,
            default: () => `cat-input-${Math.random().toString(36).slice(2)}`,
        },
    },
    data() {
        return {
            name: "",
            localError: "",
            loading: false,
        };
    },
    computed: {
        ...mapState("categories", ["error"]),
        storeError() {
            return this.error || "";
        },
    },
    watch: {
        visible(v) {
            if (v) {
                this.name = "";
                this.localError = "";
                this.$nextTick(
                    () => this.$refs.input && this.$refs.input.focus()
                );
            }
        },
    },
    methods: {
        ...mapActions("categories", ["createCategory", "fetchCategories"]),
        async trySave() {
            const n = (this.name || "").trim();
            this.localError = "";
            if (!n) {
                this.localError = this.$t("categories.error_empty");
                return;
            }

            this.loading = true;
            try {
                await this.createCategory(n);
                // если стор не выставил ошибку — считаем успехом
                if (!this.storeError) {
                    await this.fetchCategories();
                    this.$emit("saved", n);
                    if (this.autoCloseOnSuccess) this.$emit("cancel");
                } else {
                    // ошибка пришла из стора, оставляем диалог открытым
                }
            } catch (e) {
                this.localError = String(
                    e?.message || e || this.$t("errors.unknown")
                );
            } finally {
                this.loading = false;
            }
        },
        onCancel() {
            this.$emit("cancel");
        },
    },
};
</script>
