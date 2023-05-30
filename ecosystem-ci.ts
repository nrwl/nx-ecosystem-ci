import fs from 'fs'
import path from 'path'
import process from 'process'
import { cac } from 'cac'

import { setupEnvironment } from './utils'
import { CommandOptions, RunOptions } from './types'

const cli = cac()
cli
	.command('[...suites]', 'build nx and run selected suites')
	.option('--verify', 'verify checkouts by running tests', { default: false })
	.action(async (suites, options: CommandOptions) => {
		const { root, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)

		const runOptions: RunOptions = {
			root,
			workspace,
			release: options.release,
			verify: options.verify,
			skipGit: false,
		}

		for (const suite of suitesToRun) {
			await run(suite, runOptions)
		}
	})

cli
	.command('run-suites [...suites]', 'run single suite with pre-built nx')
	.option(
		'--verify',
		'verify checkout by running tests before using local nx',
		{ default: false },
	)
	.action(async (suites, options: CommandOptions) => {
		const { root, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		const runOptions: RunOptions = {
			...options,
			root,
			workspace,
		}
		for (const suite of suitesToRun) {
			await run(suite, runOptions)
		}
	})

cli.help()
cli.parse()

async function run(suite: string, options: RunOptions) {
	const { test } = await import(`./tests/${suite}.ts`)
	await test({
		...options,
		workspace: path.resolve(options.workspace, suite),
	})
}

function getSuitesToRun(suites: string[], root: string) {
	let suitesToRun: string[] = suites
	const availableSuites: string[] = fs
		.readdirSync(path.join(root, 'tests'))
		.filter((f: string) => !f.startsWith('_') && f.endsWith('.ts'))
		.map((f: string) => f.slice(0, -3))
	availableSuites.sort()
	if (suitesToRun.length === 0) {
		suitesToRun = availableSuites
	} else {
		const invalidSuites = suitesToRun.filter(
			(x) => !x.startsWith('_') && !availableSuites.includes(x),
		)
		if (invalidSuites.length) {
			console.log(`invalid suite(s): ${invalidSuites.join(', ')}`)
			console.log(`available suites: ${availableSuites.join(', ')}`)
			process.exit(1)
		}
	}
	return suitesToRun
}
