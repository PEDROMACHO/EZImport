<template>
    <span v-html="highlighted"></span>
</template>

<script>
export default {
    name: "HighlightText",
    props: {
        text: { type: String, required: true },
        matches: { type: Array, default: () => [] },
    },
    computed: {
        highlighted() {
            if (!this.matches?.length) return this.text;

            let result = "";
            let lastIndex = 0;

            // Берём только совпадения по name
            const nameMatches = this.matches.find((m) => m.key === "name");
            if (!nameMatches) return this.text;

            for (const [start, end] of nameMatches.indices) {
                result += this.text.slice(lastIndex, start);
                result += `<mark class="bg-yellow-300">${this.text.slice(
                    start,
                    end + 1
                )}</mark>`;
                lastIndex = end + 1;
            }
            result += this.text.slice(lastIndex);

            return result;
        },
    },
};
</script>