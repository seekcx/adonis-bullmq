import { BullManager } from '../src/Queue';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default class QueueProvider {
	constructor(protected app: ApplicationContract) {}

	public boot() {
		const config = this.app.container.resolveBinding('Adonis/Core/Config').get('queue').config;
		const logger = this.app.container.resolveBinding('Adonis/Core/Logger');
		const application = this.app.container.resolveBinding('Adonis/Core/Application');

		this.app.container.singleton('Adonis/Addons/Queue', () => {
			const manager = new BullManager(config, logger, application);

			return {
				dispatch: manager.dispatch.bind(manager),
				listen: manager.listen.bind(manager),
			};
		});
	}
}
