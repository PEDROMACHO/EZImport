<template>
	<div class="flex items-center justify-center">
		<div class="spectrum-IllustratedMessage">
			<svg
				class="spectrum-IllustratedMessage-illustration"
				width="199"
				height="98"
				viewBox="0 0 199 97.7"
			>
				<use xlink:href="#spectrum-icon-24-Upload"></use>
			</svg>
			<h2
				class="spectrum-Heading spectrum-Heading--sizeM spectrum-Heading--regular spectrum-IllustratedMessage-heading"
			>
				{{title}}
			</h2>
			<p
				class="spectrum-Body spectrum-Body--sizeS spectrum-IllustratedMessage-description"
			>
				{{description}}
			</p>
		</div>
	</div>
</template>

<script>
export default {
    name: "IllustratedMessage",
	props: {
		title: {
			type: String,
			default() {
				return this.$t('illustratedMessage.category_not_selected_title');
			},
		},
		description: {
			type: String,
			default() {
				return this.$t('illustratedMessage.category_not_selected_description');
			},
		}
	}
};
</script>

<style>
</style>