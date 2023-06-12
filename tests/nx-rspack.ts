import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nrwl/nx-labs',
		branch: 'main',
		build: ['build-ci rspack'],
		test: ['test-ci rspack'],
		e2e: ['e2e-ci rspack-e2e'],
	})
}
