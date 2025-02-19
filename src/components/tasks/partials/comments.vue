<template>
	<div class="content details" v-if="enabled">
		<h3 v-if="canWrite || comments.length > 0" :class="{'d-print-none': comments.length === 0}">
			<span class="icon is-grey">
				<icon :icon="['far', 'comments']"/>
			</span>
			{{ $t('task.comment.title') }}
		</h3>
		<div class="comments">
			<span
				class="is-inline-flex is-align-items-center"
				v-if="taskCommentService.loading && saving === null && !creating"
			>
				<span class="loader is-inline-block mr-2"></span>
				{{ $t('task.comment.loading') }}
			</span>
			<div :key="c.id" class="media comment" v-for="c in comments">
				<figure class="media-left is-hidden-mobile">
					<img
						:src="getAvatarUrl(c.author, 48)"
						alt=""
						class="image is-avatar"
						height="48"
						width="48"
					/>
				</figure>
				<div class="media-content">
					<div class="comment-info">
						<img
							:src="getAvatarUrl(c.author, 20)"
							alt=""
							class="image is-avatar d-print-none"
							height="20"
							width="20"
						/>
						<strong>{{ getDisplayName(c.author) }}</strong>&nbsp;
						<span v-tooltip="formatDateLong(c.created)" class="has-text-grey">
							{{ formatDateSince(c.created) }}
						</span>
						<span
							v-if="+new Date(c.created) !== +new Date(c.updated)"
							v-tooltip="formatDateLong(c.updated)"
						>
							· {{ $t('task.comment.edited', {date: formatDateSince(c.updated)}) }}
						</span>
						<CustomTransition name="fade">
							<span
								class="is-inline-flex"
								v-if="
									taskCommentService.loading &&
									saving === c.id
								"
							>
								<span class="loader is-inline-block mr-2"></span>
								{{ $t('misc.saving') }}
							</span>
							<span
								class="has-text-success"
								v-else-if="
									!taskCommentService.loading &&
									saved === c.id
								"
							>
								{{ $t('misc.saved') }}
							</span>
						</CustomTransition>
					</div>
					<editor
						:hasPreview="true"
						:is-edit-enabled="canWrite && c.author.id === currentUserId"
						:upload-callback="attachmentUpload"
						:upload-enabled="true"
						v-model="c.comment"
						@update:model-value="
							() => {
								toggleEdit(c)
								editCommentWithDelay()
							}
						"
						@save="() => {
							toggleEdit(c)
							editComment()
						}"
						:bottom-actions="actions[c.id]"
						:show-save="true"
					/>
				</div>
			</div>
			<div class="media comment d-print-none" v-if="canWrite">
				<figure class="media-left is-hidden-mobile">
					<img
						:src="userAvatar"
						alt=""
						class="image is-avatar"
						height="48"
						width="48"
					/>
				</figure>
				<div class="media-content">
					<div class="form">
						<CustomTransition name="fade">
							<span
								v-if="taskCommentService.loading && creating"
								class="is-inline-flex"
							>
								<span class="loader is-inline-block mr-2"></span>
								{{ $t('task.comment.creating') }}
							</span>
						</CustomTransition>
						<div class="field">
							<editor
								:class="{
									'is-loading':
										taskCommentService.loading &&
										!isCommentEdit,
								}"
								:hasPreview="false"
								:upload-callback="attachmentUpload"
								:upload-enabled="true"
								:placeholder="$t('task.comment.placeholder')"
								v-if="editorActive"
								v-model="newComment.comment"
							/>
						</div>
						<div class="field">
							<x-button
								:loading="taskCommentService.loading && !isCommentEdit"
								:disabled="newComment.comment === ''"
								@click="addComment()"
							>
								{{ $t('task.comment.comment') }}
							</x-button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<modal
			:enabled="showDeleteModal"
			@close="showDeleteModal = false"
			@submit="() => deleteComment(commentToDelete)"
		>
			<template #header><span>{{ $t('task.comment.delete') }}</span></template>

			<template #text>
				<p>
					{{ $t('task.comment.deleteText1') }}<br/>
					<strong class="has-text-white">{{ $t('misc.cannotBeUndone') }}</strong>
				</p>
			</template>
		</modal>
	</div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, shallowReactive, watch, nextTick} from 'vue'
import {useI18n} from 'vue-i18n'

import CustomTransition from '@/components/misc/CustomTransition.vue'
import Editor from '@/components/input/AsyncEditor'

import TaskCommentService from '@/services/taskComment'
import TaskCommentModel from '@/models/taskComment'

import type {ITaskComment} from '@/modelTypes/ITaskComment'
import type {ITask} from '@/modelTypes/ITask'

import {uploadFile} from '@/helpers/attachments'
import {success} from '@/message'
import {formatDateLong, formatDateSince} from '@/helpers/time/formatDate'
import {getAvatarUrl, getDisplayName} from '@/models/user'
import {useConfigStore} from '@/stores/config'
import {useAuthStore} from '@/stores/auth'

const props = defineProps({
	taskId: {
		type: Number,
		required: true,
	},
	canWrite: {
		default: true,
	},
})

const {t} = useI18n({useScope: 'global'})
const configStore = useConfigStore()
const authStore = useAuthStore()

const comments = ref<ITaskComment[]>([])

const showDeleteModal = ref(false)
const commentToDelete = reactive(new TaskCommentModel())

const isCommentEdit = ref(false)
const commentEdit = reactive(new TaskCommentModel())

const newComment = reactive(new TaskCommentModel())

const saved = ref<ITask['id'] | null>(null)
const saving = ref<ITask['id'] | null>(null)

const userAvatar = computed(() => getAvatarUrl(authStore.info, 48))
const currentUserId = computed(() => authStore.info.id)
const enabled = computed(() => configStore.taskCommentsEnabled)
const actions = computed(() => {
	if (!props.canWrite) {
		return {}
	}
	return Object.fromEntries(comments.value.map((comment) => ([
		comment.id,
		comment.author.id === currentUserId.value
			? [{
				action: () => toggleDelete(comment.id),
				title: t('misc.delete'),
			}]
			: [],
	])))
})

function attachmentUpload(
	file: File,
	onSuccess: (url: string) => void,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onError: (error: string) => void,
) {
	return uploadFile(props.taskId, file, onSuccess)
}

const taskCommentService = shallowReactive(new TaskCommentService())

async function loadComments(taskId: ITask['id']) {
	if (!enabled.value) {
		return
	}

	newComment.taskId = taskId
	commentEdit.taskId = taskId
	commentToDelete.taskId = taskId
	comments.value = await taskCommentService.getAll({taskId})
}

watch(
	() => props.taskId,
	loadComments,
	{immediate: true},
)

const editorActive = ref(true)
const creating = ref(false)

async function addComment() {
	if (newComment.comment === '') {
		return
	}

	// This makes the editor trigger its mounted function again which makes it forget every input
	// it currently has in its textarea. This is a counter-hack to a hack inside of vue-easymde
	// which made it impossible to detect change from the outside. Therefore the component would
	// not update if new content from the outside was made available.
	// See https://github.com/NikulinIlya/vue-easymde/issues/3
	editorActive.value = false
	nextTick(() => (editorActive.value = true))
	creating.value = true

	try {
		const comment = await taskCommentService.create(newComment)
		comments.value.push(comment)
		newComment.comment = ''
		success({message: t('task.comment.addedSuccess')})
	} finally {
		creating.value = false
	}
}

function toggleEdit(comment: ITaskComment) {
	isCommentEdit.value = !isCommentEdit.value
	Object.assign(commentEdit, comment)
}

function toggleDelete(commentId: ITaskComment['id']) {
	showDeleteModal.value = !showDeleteModal.value
	commentToDelete.id = commentId
}

const changeTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

async function editCommentWithDelay() {
	if (changeTimeout.value !== null) {
		clearTimeout(changeTimeout.value)
	}

	changeTimeout.value = setTimeout(async () => {
		await editComment()
	}, 5000)
}

async function editComment() {
	if (commentEdit.comment === '') {
		return
	}
	
	if (changeTimeout.value !== null) {
		clearTimeout(changeTimeout.value)
	}

	saving.value = commentEdit.id

	commentEdit.taskId = props.taskId
	try {
		const comment = await taskCommentService.update(commentEdit)
		for (const c in comments.value) {
			if (comments.value[c].id === commentEdit.id) {
				comments.value[c] = comment
			}
		}
		saved.value = commentEdit.id
		setTimeout(() => {
			saved.value = null
		}, 2000)
	} finally {
		isCommentEdit.value = false
		saving.value = null
	}
}

async function deleteComment(commentToDelete: ITaskComment) {
	try {
		await taskCommentService.delete(commentToDelete)
		const index = comments.value.findIndex(({id}) => id === commentToDelete.id)
		comments.value.splice(index, 1)
		success({message: t('task.comment.deleteSuccess')})
	} finally {
		showDeleteModal.value = false
	}
}
</script>

<style lang="scss" scoped>
.media-left {
	margin: 0 1rem !important;
}

.comment-info {
	display: flex;
	align-items: center;
	gap: .5rem;

	img {
		@media screen and (max-width: $tablet) {
			display: block;
			width: 20px;
			height: 20px;
			padding-right: 0;
			margin-right: .5rem;
		}

		@media screen and (min-width: $tablet) {
			display: none;
		}
	}


	span {
		font-size: .75rem;
		line-height: 1;
	}
}

.image.is-avatar {
  border-radius: 100%;
}

.media-content {
	width: calc(100% - 48px - 2rem);
}
</style>