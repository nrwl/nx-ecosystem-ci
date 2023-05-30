import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nrwl/nx-examples',
		branch: 'master',
		build: ['affected:build'],
		test: ['affected:test'],
		e2e: ['affected:e2e'],
	})
}
