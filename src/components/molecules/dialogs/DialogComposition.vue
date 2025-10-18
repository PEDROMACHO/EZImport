<template>
    <sp-overlay trigger="create-composition@click">
        <sp-dialog-base dismissable underlay class="h-full">
            <sp-dialog size="s">
                <h2 slot="heading" class="text-lg font-bold">
                    {{ $t("buttons.new_composition") }}
                </h2>

                <sp-field-label for="with-field-label">{{ $t("compositions.generate_formats") }}</sp-field-label>
                <sp-field-group horizontal id="formats">
                    <sp-checkbox
                        v-for="opt in options"
                        :key="opt.value"
                        :checked="opt.checked"
                        @change="opt.checked = $event.target.checked"
                        :disabled="opt.disabled || loading"
                    >
                        {{ opt.label }}
                    </sp-checkbox>
                </sp-field-group>

                <sp-textfield
                    class="w-full mt-3"
                    ref="input"
                    :id="id"
                    type="text"
                    :value="name"
                    @input="name = $event.target.value"
                    :placeholder="$t('compositions.name')"
                    :disabled="loading"
                    :invalid="localError ? true : false"
                    pattern=".*\S.*"
                    required
                    @keyup.enter="trySave"
                >
                    <sp-help-text v-if="localError" slot="negative-help-text">
                        {{ localError }}
                    </sp-help-text>
                </sp-textfield>

                <sp-button-group size="s" slot="button">
                    <sp-button
                        onclick="this.dispatchEvent(new Event('close', { bubbles: true, composed: true }));"
                    >
                        {{ $t("buttons.cancel") }}
                    </sp-button>
                    <sp-button
                        @click="trySave"
                        :disabled="!name"
                        :pending="loading"
                    >
                        {{
                            loading ? $t("buttons.saving") : $t("buttons.save")
                        }}
                    </sp-button>
                </sp-button-group>
            </sp-dialog>
        </sp-dialog-base>
    </sp-overlay>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { evalScript } from "cluecumber";

export default {
    name: "DialogComposition",
    props: {
        id: {
            type: String,
            default: () => `comp-input-${Math.random().toString(36).slice(2)}`,
        },
    },
    data() {
        return {
            name: "",
            localError: "",
            options: [
                { label: "AEP", value: "aep", checked: true, disabled: true },
                { label: "MOV", value: "mov", checked: false, disabled: true },
                {
                    label: "GIF (preview)",
                    value: "gif",
                    checked: false,
                    disabled: true,
                },
            ],
        };
    },
    computed: {
        ...mapGetters("categories", ["getCurrentCategory"]),

        loading() {
            return this.$store.getters["loading/isLoadingByKey"](
                "compositions:create"
            );
        },
    },
    watch: {
        "options.gif.checked"(v) {
            if (v && !this.options.mov.checked) this.options.mov.checked = true;
        },
        "options.mov.checked"(v) {
            if (!v && this.options.gif.checked)
                this.options.gif.checked = false;
        },
    },
    methods: {
        ...mapActions("compositions", ["saveComposition"]),
        async trySave(e) {
            this.localError = "";
            const compTitle = (this.name || "").trim();

            const input = this.$refs.input?.focusElement || this.$refs.input;
            if (!input.checkValidity()) {
                this.localError = input.validationMessage;
                return;
            }

            if (!this.getCurrentCategory) {
                this.localError =
                    this.$t("errors.category_not_selected") ||
                    "Категория не выбрана";
                return;
            }

            this.$store.dispatch("loading/start", "compositions:create");

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
                    e.target.dispatchEvent(
                        new Event("close", {
                            bubbles: true,
                            composed: true,
                        })
                    );
                }
            } catch (e) {
                this.localError = String(
                    e?.message || this.$t("errors.unknown")
                );
            } finally {
                this.$store.dispatch("loading/stop", "compositions:create");
            }
        },
    },
};
</script>
