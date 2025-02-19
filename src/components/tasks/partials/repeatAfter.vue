<template>
	<div class="control repeat-after-input">
		<div class="buttons has-addons is-centered mt-2">
			<x-button variant="secondary" class="is-small" @click="() => setRepeatAfter(1, 'days')">
				{{ $t('task.repeat.everyDay') }}
			</x-button>
			<x-button variant="secondary" class="is-small" @click="() => setRepeatAfter(1, 'weeks')">
				{{ $t('task.repeat.everyWeek') }}
			</x-button>
			<x-button variant="secondary" class="is-small" @click="() => setRepeatAfter(1, 'months')">
				{{ $t('task.repeat.everyMonth') }}
			</x-button>
		</div>
		<div class="is-flex is-align-items-center mb-2">
			<label for="repeatMode" class="is-fullwidth">
				{{ $t('task.repeat.mode') }}:
			</label>
			<div class="control">
				<div class="select">
					<select @change="updateData" v-model="task.repeatMode" id="repeatMode">
						<option :value="TASK_REPEAT_MODES.REPEAT_MODE_DEFAULT">{{ $t('misc.default') }}</option>
						<option :value="TASK_REPEAT_MODES.REPEAT_MODE_MONTH">{{ $t('task.repeat.monthly') }}</option>
						<option :value="TASK_REPEAT_MODES.REPEAT_MODE_FROM_CURRENT_DATE">{{ $t('task.repeat.fromCurrentDate') }}</option>
					</select>
				</div>
			</div>
		</div>
		<div class="is-flex" v-if="task.repeatMode !== TASK_REPEAT_MODES.REPEAT_MODE_MONTH">
			<p class="pr-4">
				{{ $t('task.repeat.each') }}
			</p>
			<div class="field has-addons is-fullwidth">
				<div class="control">
					<input
						:disabled="disabled || undefined"
						@change="updateData"
						class="input"
						:placeholder="$t('task.repeat.specifyAmount')"
						v-model="repeatAfter.amount"
						type="number"
						min="0"
					/>
				</div>
				<div class="control">
					<div class="select">
						<select
							v-model="repeatAfter.type"
							@change="updateData"
							:disabled="disabled || undefined"
						>
							<option value="hours">{{ $t('task.repeat.hours') }}</option>
							<option value="days">{{ $t('task.repeat.days') }}</option>
							<option value="weeks">{{ $t('task.repeat.weeks') }}</option>
							<option value="months">{{ $t('task.repeat.months') }}</option>
							<option value="years">{{ $t('task.repeat.years') }}</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref, reactive, watch, type PropType} from 'vue'
import {useI18n} from 'vue-i18n'

import {error} from '@/message'

import {TASK_REPEAT_MODES} from '@/types/IRepeatMode'
import type {IRepeatAfter} from '@/types/IRepeatAfter'
import type {ITask} from '@/modelTypes/ITask'
import TaskModel from '@/models/task'

const props = defineProps({
	modelValue: {
		type: Object as PropType<ITask>,
		default: () => ({}),
		required: true,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
})

const {t} = useI18n({useScope: 'global'})

const emit = defineEmits(['update:modelValue'])

const task = ref<ITask>(new TaskModel())
const repeatAfter = reactive({
	amount: 0,
	type: '',
})

watch(
	() => props.modelValue,
	(value: ITask) => {
		task.value = value
		if (typeof value.repeatAfter !== 'undefined') {
			Object.assign(repeatAfter, value.repeatAfter)
		}
	},
	{immediate: true},
)

function updateData() {
	if (!task.value || 
		(task.value.repeatMode === TASK_REPEAT_MODES.REPEAT_MODE_DEFAULT && repeatAfter.amount === 0) ||
		(task.value.repeatMode === TASK_REPEAT_MODES.REPEAT_MODE_FROM_CURRENT_DATE && repeatAfter.amount === 0)
	) {
		return
	}

	if (task.value.repeatMode === TASK_REPEAT_MODES.REPEAT_MODE_DEFAULT && repeatAfter.amount < 0) {
		error({message: t('task.repeat.invalidAmount')})
		return
	}

	Object.assign(task.value.repeatAfter, repeatAfter)
	emit('update:modelValue', task.value)
}

function setRepeatAfter(amount: number, type: IRepeatAfter['type']) {
	Object.assign(repeatAfter, { amount, type})
	updateData()
}
</script>

<style lang="scss" scoped>
p {
	padding-top: 6px;
}

.input {
	min-width: 2rem;
}
</style>