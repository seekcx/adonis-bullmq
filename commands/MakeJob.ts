import { join } from 'node:path';
import { BaseCommand, args } from '@adonisjs/core/build/standalone';

export default class MakeJob extends BaseCommand {
	/**
	 * 名称
	 */
	public static commandName = 'make:job';

	/**
	 * 描述
	 */
	public static description = 'Make a new dispatch-able job';

	/**
	 * 任务名称
	 */
	@args.string({ description: 'Name of the job class' })
	public name!: string;

	/**
	 * 配置
	 */
	public static settings = {
		loadApp: true,
		stayAlive: false,
	};

	/**
	 * 运行脚本
	 */
	public async run() {
		const stub = join(__dirname, '..', '/templates/make_job.txt');
		const path = this.application.resolveNamespaceDirectory('jobs');

		this.generator
			.addFile(this.name, { pattern: 'pascalcase', form: 'singular' })
			.stub(stub)
			.destinationDir(path || 'app/Jobs')
			.useMustache()
			.appRoot(this.application.cliCwd || this.application.appRoot)
			.apply({ name: this.name });

		await this.generator.run();
	}
}
