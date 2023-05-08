import { BaseCommand, flags } from '@adonisjs/core/build/standalone';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import express from 'express';

export default class QueueDashboard extends BaseCommand {
	/**
	 * 名称
	 */
	public static commandName = 'queue:dashboard';

	/**
	 * 描述
	 */
	public static description = '队列控制台';

	/**
	 * 配置
	 */
	public static settings = {
		loadApp: true,
		stayAlive: true,
	};

	/**
	 * 运行脚本
	 */
	public async run() {
		const config = this.application.container.use('Adonis/Core/Config');
		const app = express();

		const serverAdapter = new ExpressAdapter();
		serverAdapter.setBasePath('/');

		const queues: BullMQAdapter[] = [];
		for (const name in config.get('queue.queues')) {
			const queue = new Queue(name, config.get(`queue.queues.${name}`));
			queues.push(new BullMQAdapter(queue));
		}

		createBullBoard({ queues, serverAdapter });
		app.use('/', serverAdapter.getRouter());

		const port = config.get('queue.dashboard.port', 3008);
		app.listen(port, () => {
			this.logger.info(
				`${this.colors.cyan('BullMQ Dashboard')} Running on http://localhost:${port}`
			);
		});
	}
}
