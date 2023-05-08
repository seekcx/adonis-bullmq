declare module '@ioc:Adonis/Addons/Queue' {
	import type { WorkerOptions, QueueOptions, JobsOptions } from 'bullmq';

	/**
	 * Shape of the data for a given job
	 */
	export type DataForJob<K extends string> = K extends keyof JobsList
		? JobsList[K]
		: Record<string, unknown>;

	/**
	 * Configuration for the queue
	 */
	export type QueueConfig = {
		/**
		 * Default Queue Name
		 */
		default: string;

		/**
		 * All Queue Configurations
		 */
		queues: Record<string, QueueOptions & WorkerOptions>;
	};

	/**
	 * Shape of the job instance
	 */
	export interface JobContract {
		/**
		 * Handle the job
		 *
		 * @param payload Job Payload
		 */
		handle(payload: any): Promise<void>;

		/**
		 * Handle the job failure
		 */
		failed(payload: any): Promise<void>;
	}

	/**
	 * An interface to define typed queues/jobs
	 */
	export interface JobsList {}

	/**
	 * Dispatch a job to the queue
	 *
	 * @param name Job Name
	 * @param payload Job Payload
	 * @param options Job Options
	 */
	export function dispatch<K extends keyof JobsList>(
		name: K,
		payload: DataForJob<K>,
		options?: JobsOptions
	): Promise<string>;

	/**
	 * Process the queue
	 *
	 * @param queueName Queue Name
	 */
	export function listen(queueName: string): Promise<void>;
}
