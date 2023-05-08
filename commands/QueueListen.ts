import { BaseCommand, flags } from '@adonisjs/core/build/standalone';

export default class QueueListen extends BaseCommand {
	/**
	 * 名称
	 */
	public static commandName = 'queue:listen';

	/**
	 * 描述
	 */
	public static description = '监听并运行队列';

	/**
	 * 队列名称
	 */
	@flags.array({ alias: 'q', description: '监听处理的单个或多个队列名称' })
	public queue: string[] = [];

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
		const { listen } = this.application.container.resolveBinding('Adonis/Addons/Queue');
		const Config = this.application.container.resolveBinding('Adonis/Core/Config');

		const queues = this.queue.length ? this.queue : [Config.get('queue.default')];

		await Promise.all(queues.map((name) => listen(name)));
	}
}
