<template>
	<n-config-provider :theme-overrides="themeOverrides">
		<n-message-provider>
			<div>
				<router-view></router-view>
			</div>
		</n-message-provider>
	</n-config-provider>
</template>

<script setup>
const themeOverrides = {
	common: {
		primaryColor: '#4098FCFF',
	},
	Input: {
		caretColor: '#4098FCFF',
		loadingColor: '#4098FCFF',
		borderFocus: '1px solid #4098FCFF',
		borderHover: '1px solid #4098FCFF',
	},
}
</script>

<style scoped></style>
