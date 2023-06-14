import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nxext/nx-extensions',
		branch: 'main',
		build: ['build ionic-angular'],
		test: ['test ionic-angular'],
	})
}
