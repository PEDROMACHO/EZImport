<template>
    <transition name="fade">
        <div v-if="visible" class="z-50">
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
                                        'is-invalid': errorToShow,
                                    }"
                                >
                                    <svg
                                        v-if="errorToShow"
                                        focusable="false"
                                        aria-hidden="true"
                                        role="img"
                                        class="spectrum-Icon spectrum-Icon--sizeM spectrum-Textfield-validationIcon"
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
                                    v-if="errorToShow"
                                    class="spectrum-HelpText spectrum-HelpText--negative spectrum-HelpText--sizeS"
                                    role="alert"
                                >
                                    <div class="spectrum-HelpText-text">
                                        {{ errorToShow }}
                                    </div>
                                </div>

                                <div
                                    class="mt-3 spectrum-FieldGroup spectrum-FieldGroup--toplabel spectrum-FieldGroup--horizontal"
                                    role="group"
                                >
                                    <div class="spectrum-FieldGroupInputLayout">
                                        <label
                                            v-for="opt in options"
                                            :key="opt.value"
                                            class="spectrum-Checkbox spectrum-Checkbox--sizeM spectrum-FieldGroup-item"
                                        >
                                            <input
                                                type="checkbox"
                                                class="spectrum-Checkbox-input"
                                                v-model="opt.checked"
                                                :disabled="
                                                    opt.disabled || loading
                                                "
                                            />
                                            <span class="spectrum-Checkbox-box">
                                                <svg
                                                    focusable="false"
                                                    aria-hidden="true"
                                                    role="img"
                                                    class="spectrum-Icon spectrum-UIIcon-Checkmark75 spectrum-Icon--medium spectrum-Checkbox-checkmark"
                                                >
                                                    <use
                                                        xlink:href="#spectrum-css-icon-Checkmark75"
                                                        href="#spectrum-css-icon-Checkmark75"
                                                    ></use>
                                                </svg>
                                                <svg
                                                    focusable="false"
                                                    aria-hidden="true"
                                                    role="img"
                                                    class="spectrum-Icon spectrum-UIIcon-Dash75 spectrum-Icon--medium spectrum-Checkbox-partialCheckmark"
                                                >
                                                    <use
                                                        xlink:href="#spectrum-css-icon-Dash75"
                                                        href="#spectrum-css-icon-Dash75"
                                                    ></use>
                                                </svg>
                                            </span>
                                            <span
                                                class="spectrum-Checkbox-label"
                                                >{{ opt.label }}</span
                                            >
                                        </label>
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
import { mapActions, mapState, mapGetters } from "vuex";
import { evalScript } from "cluecumber";

export default {
    name: "DialogComposition",
    props: {
        visible: { type: Boolean, default: false },
        placeholder: {
            type: String,
            default() {
                return this.$t("compositions.name");
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
            default: () => `comp-input-${Math.random().toString(36).slice(2)}`,
        },
    },
    data() {
        return {
            name: "",
            localError: "",
            loading: false,
            options: {
                aep: {
                    label: "AEP",
                    value: "aep",
                    checked: true,
                    disabled: true,
                },
                mov: {
                    label: "MOV",
                    value: "mov",
                    checked: false,
                    disabled: false,
                },
                gif: {
                    label: "GIF (preview)",
                    value: "gif",
                    checked: false,
                    disabled: false,
                },
            },
        };
    },
    computed: {
        ...mapState("compositions", ["error"]),
        ...mapGetters("categories", ["getCurrentCategory"]),
        storeError() {
            return this.error || "";
        },
        errorToShow() {
            return this.visible ? this.localError || this.storeError : "";
        },
    },
    watch: {
        visible(v) {
            if (v) {
                this.name = "";
                this.localError = "";
                this.clearError(); // сброс ошибки стора
                this.$nextTick(
                    () => this.$refs.input && this.$refs.input.focus()
                );
            }
        },
        "options.gif.checked"(v) {
            if (v && !this.options.mov.checked) this.options.mov.checked = true;
        },
        "options.mov.checked"(v) {
            if (!v && this.options.gif.checked)
                this.options.gif.checked = false;
        },
    },
    methods: {
        ...mapActions("compositions", ["saveComposition", "clearError"]),
        async trySave() {
            const compTitle = (this.name || "").trim();
            this.localError = "";

            if (!compTitle) {
                this.localError = this.$t("compositions.error_empty");
                return;
            }
            if (!this.getCurrentCategory) {
                this.localError =
                    this.$t("errors.category_not_selected") ||
                    "Категория не выбрана";
                return;
            }

            this.loading = true;
            try {
                // получаем имя активной композиции из AE
                const activeName = await evalScript("AE_GetActiveCompName()");

                if (!activeName) {
                    this.localError =
                        this.$t("compositions.error_no_compositions") ||
                        "В After Effects нет активной композиции";
                    return;
                }

                const ok = await this.saveComposition({
                    compName: activeName,
                    compTitle,
                    category: this.getCurrentCategory,
                    options: {
                        mov: this.options.mov.checked,
                        gif: this.options.gif.checked,
                    },
                });

                if (ok) {
                    this.$emit("saved", compTitle);
                    if (this.autoCloseOnSuccess) this.$emit("cancel");
                }
            } catch (e) {
                this.localError = String(
                    e?.message || this.$t("errors.unknown")
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
