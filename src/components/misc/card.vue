<template>
	<div class="card" :class="{'has-no-shadow': !shadow}">
		<header class="card-header" v-if="title !== ''">
			<p class="card-header-title">
				{{ title }}
			</p>
			<BaseButton
				v-if="hasClose"
				class="card-header-icon"
				:aria-label="$t('misc.close')"
				@click="$emit('close')"
				v-tooltip="$t('misc.close')"
			>	
				<span class="icon">
					<icon :icon="closeIcon"/>
				</span>
			</BaseButton>
		</header>
		<div
			class="card-content loader-container"
			:class="{
				'p-0': !padding,
				'is-loading': loading
			}"
		>
			<div :class="{'content': hasContent}">
				<slot/>
			</div>
		</div>

		<footer v-if="$slots.footer" class="card-footer">
			<slot name="footer"/>
		</footer>
	</div>
</template>

<script setup lang="ts">
import type {PropType} from 'vue'
import type {IconProp} from '@fortawesome/fontawesome-svg-core'

import BaseButton from '@/components/base/BaseButton.vue'

defineProps({
	title: {
		type: String,
		default: '',
	},
	padding: {
		type: Boolean,
		default: true,
	},
	hasClose: {
		type: Boolean,
		default: false,
	},
	closeIcon: {
		type: String as PropType<IconProp>,
		default: 'times',
	},
	shadow: {
		type: Boolean,
		default: true,
	},
	hasContent: {
		type: Boolean,
		default: true,
	},
	loading: {
		type: Boolean,
		default: false,
	},
})

defineEmits(['close'])
</script>

<style lang="scss" scoped>
.card {
	background-color: var(--white);
	border-radius: $radius;
	margin-bottom: 1rem;
	border: 1px solid var(--card-border-color);
	box-shadow: var(--shadow-sm);

	@media print {
		box-shadow: none;
		border: none;
	}
}

.card-header {
	box-shadow: none;
	border-bottom: 1px solid var(--card-border-color);
	border-radius: $radius $radius 0 0;
}

.card-footer {
	background-color: var(--grey-50);
	border-top: 0;
	padding: var(--modal-card-head-padding);
	display: flex;
	justify-content: flex-end;
}
</style>