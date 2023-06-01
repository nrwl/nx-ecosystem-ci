import { intro, outro, select, isCancel, cancel, note } from '@clack/prompts'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import color from 'picocolors'

async function main() {
	intro(color.inverse(' run your test suite '))

	const testFolder = './tests/'
	const arrayOfTestFiles = fs.readdirSync(testFolder)

	const options = arrayOfTestFiles.map((file) => {
		return {
			value: file.replace('.ts', ''),
			label: `Test ${color.bold(color.magenta(file.replace('.ts', '')))}`,
		}
	})

	options.push({
		value: 'all',
		label: `Run ${color.bold(color.magenta('all'))} suites`,
	})

	let projectType = undefined
	const userInputNameOfSuite = process.argv[2]

	if (
		userInputNameOfSuite === 'all' ||
		arrayOfTestFiles.includes(`${userInputNameOfSuite}.ts`)
	) {
		projectType = userInputNameOfSuite
		note(`Selected ${color.bold(color.magenta(projectType))}`)
	} else {
		projectType = await select({
			message: 'Pick which test suite you want to run',
			options: options,
		})

		if (isCancel(projectType)) {
			cancel('Operation cancelled')
			return process.exit(0)
		}
	}

	projectType = projectType === 'all' ? '' : projectType

	outro(
		`Running ${color.bold(color.magenta('pnpm run test-ci ' + projectType))}`,
	)

	execSync(`pnpm run test-ci ${projectType}`, {
		stdio: 'inherit',
	})
}

main().catch(console.error)
