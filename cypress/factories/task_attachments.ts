import {Factory} from '../support/factory'
import {formatISO} from 'date-fns'

export class TaskAttachmentFactory extends Factory {
	static table = 'task_attachments'
	
	static factory() {
		const now = new Date()

		return {
			id: '{increment}',
			task_id: 1,
			file_id: 1,
			created: formatISO(now),
		}
	}
}