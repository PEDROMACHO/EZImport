<template>
    <sp-overlay trigger="create-category@click">
        <sp-dialog-base dismissable underlay class="h-full">
            <sp-dialog size="s">
                <h2 slot="heading" class="text-lg font-bold">
                    {{ $t("buttons.new_category") }}
                </h2>

                <sp-textfield
                    class="w-full"
                    ref="input"
                    :id="id"
                    type="text"
                    :value="name"
                    @input="name = $event.target.value"
                    :placeholder="$t('categories.name')"
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
                    <sp-button @click="trySave" :disabled="!name" :pending="loading">
                        {{ loading ? $t("buttons.saving") : $t("buttons.save") }}
                    </sp-button>
                </sp-button-group>
            </sp-dialog>
        </sp-dialog-base>
    </sp-overlay>
</template>

<script>
import { mapActions } from "vuex";

export default {
    name: "DialogCategory",
    props: {
        id: {
            type: String,
            default: () => `cat-input-${Math.random().toString(36).slice(2)}`,
        },
    },
    data() {
        return {
            name: "",
            localError: "",
        };
    },
    computed: {
        loading() {
            return this.$store.getters["loading/isLoadingByKey"]('categories:create');
        },
    },
    methods: {
        ...mapActions("categories", ["createCategory"]),

        async trySave(e) {
            this.localError = "";

            const input = this.$refs.input?.focusElement || this.$refs.input;
            if (!input.checkValidity()) {
                this.localError = input.validationMessage;
                return;
            }

            this.$store.dispatch("loading/start", 'categories:create');
            try {
                const trimmed = this.name.trim();
                await this.createCategory(trimmed);

                this.name = "";
                this.localError = "";

                e.target.dispatchEvent(
                    new Event("close", { bubbles: true, composed: true })
                );
            } catch (e) {

                this.localError = String(
                    e?.message || this.$t("errors.unknown")
                );
            } finally {
                this.$store.dispatch("loading/stop", 'categories:create');
            }
        },
    },
};
</script>