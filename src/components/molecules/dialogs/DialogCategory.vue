<template>
    <sp-overlay trigger="create-category@click">
        <sp-dialog-base dismissable underlay class="h-full">
            <sp-dialog size="s">
                <h2 slot="heading" class="text-lg font-bold">
                    {{ $t("buttons.new_category") }}
                </h2>
                <sp-textfield
                    id="test"
                    :placeholder="placeholder"
                    :invalid="localError"
                    :disabled="loading"
                    @input="onInput"
                >
                    <sp-help-text slot="negative-help-text">
                        {{ localError }}
                    </sp-help-text>
                </sp-textfield>
                <sp-textfield
                    class="w-full"
                    ref="input"
                    :id="id"
                    type="text"
                    :value="name"
                    @input="name = $event.target.value"
                    :placeholder="placeholder"
                    :disabled="loading"
                    :invalid="localError ? true : false"
                    @keyup.enter="trySave"
                >
                    <sp-help-text slot="negative-help-text">
                        {{ localError }}
                    </sp-help-text>
                </sp-textfield>

                <sp-button-group size="s" slot="button">
                    <sp-button
                        onclick="this.dispatchEvent(new Event('close', { bubbles: true, composed: true }));"
                    >
                        {{ cancelText }}
                    </sp-button>
                    <sp-button @click="trySave" :disabled="!name || loading">
                        {{ loading ? $t("buttons.saving") : saveText }}
                    </sp-button>
                </sp-button-group>
            </sp-dialog>
        </sp-dialog-base>
    </sp-overlay>
</template>

<script>
import { mapActions } from "vuex";

// WebComponents
import "@spectrum-web-components/help-text/sp-help-text.js";
import "@spectrum-web-components/button/sp-button.js";
import "@spectrum-web-components/button-group/sp-button-group.js";

import "@spectrum-web-components/textfield/sp-textfield.js";
import "@spectrum-web-components/field-label/sp-field-label.js";

import "@spectrum-web-components/dialog/sp-dialog.js";
import "@spectrum-web-components/dialog/sp-dialog-base.js";

import "@spectrum-web-components/overlay/sp-overlay.js";
import "@spectrum-web-components/overlay/overlay-trigger.js";

export default {
    name: "DialogCategory",
    props: {
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
                await this.fetchCategories();
                this.$emit("saved", n);
                this.closeDialog();
            } catch (e) {
                this.localError = String(
                    e?.message || this.$t("errors.unknown")
                );
            } finally {
                this.loading = false;
            }
        },

        onInput(e) {
            const val = e?.target?.value || e?.detail?.value || "";
            this.name = val;
            // НЕ обновляй :value — дай компоненту самоуправляться
        },
    },
};
</script>