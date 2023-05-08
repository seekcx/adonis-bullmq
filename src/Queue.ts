import { Queue, Worker } from 'bullmq';
import type { JobsOptions } from 'bullmq';
import type { LoggerContract } from '@ioc:Adonis/Core/Logger';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';
import type { DataForJob, JobsList, QueueConfig, JobContract } from '@ioc:Adonis/Addons/Queue';

export class QueueManager {
	/**
	 * Queue instances
	 */
	private queues: Record<string, Queue> = {};

	constructor(
		private config: QueueConfig,
		private logger: LoggerContract,
		private app: ApplicationContract
	) {
		for (const name in config.queues) {
			this.queues[name] = new Queue(name, config.queues[name]);
		}
	}

	/**
	 * 分发任务
	 *
	 * @param job 名称
	 * @param payload 数据
	 * @param options 选项
	 *
	 * @returns 任务实例
	 */
	public dispatch<K extends keyof JobsList | string>(
		job: K,
		payload: DataForJob<K>,
		options: JobsOptions & { queueName?: string } = {}
	) {
		const queueName = options.queueName || this.config.default;
		const queue = this.queues[queueName];

		if (!queue) {
			throw new Error(`Queue [${queueName}] not found`);
		}

		return queue.add(job, payload, options);
	}

	/**
	 * Listen for jobs
	 *
	 * @param queueName Queue Name
	 */
	public listen(queueName: string) {
		this.logger.info(`Queue [${queueName}] processing started...`);
		const config = this.config.queues[queueName];

		const worker = new Worker(
			queueName,
			async (job) => {
				let jobInstance: JobContract;

				try {
					jobInstance = this.app.container.make(job.name);
				} catch (e) {
					this.logger.error(e, `Job handler for ${job.name} not found`);
					return;
				}

				this.logger.info(`Job ${job.name} started`);

				try {
					await jobInstance.handle(job.data);
					this.logger.info(`Job ${job.name} finished`);
				} catch (e) {
					this.logger.error(e, `Job ${job.name} failed`);
					throw e;
				}
			},
			config
		);

		worker.on('failed', async (job, error) => {
			this.logger.error(error.message, []);

			// If removeOnFail is set to true in the job options, job instance may be undefined.
			// This can occur if worker maxStalledCount has been reached and the removeOnFail is set to true.
			if (job && (job.attemptsMade === job.opts.attempts || job.finishedOn)) {
				// Call the failed method of the handler class if there is one
				const jobInstance = this.app.container.make(job.name);
				if (typeof jobInstance.failed === 'function') await jobInstance.failed(job.data);
			}
		});
	}
}
