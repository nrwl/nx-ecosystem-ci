import fetch from 'node-fetch'
import { setupEnvironment } from './utils'

type Status = 'success' | 'failure' | 'cancelled'
type Env = {
	WORKFLOW_NAME?: string
	SUITE?: string
	STATUS?: Status
	SLACK_WEBHOOK_URL?: string
}

const statusConfig = {
	success: {
		color: parseInt('57ab5a', 16),
		emoji: ':white_check_mark:',
	},
	failure: {
		color: parseInt('e5534b', 16),
		emoji: ':x:',
	},
	cancelled: {
		color: parseInt('768390', 16),
		emoji: ':stop_button:',
	},
}

async function run() {
	if (!process.env.GITHUB_ACTIONS) {
		throw new Error('This script can only run on GitHub Actions.')
	}
	if (!process.env.SLACK_WEBHOOK_URL) {
		console.warn(
			"Skipped beacuse process.env.SLACK_WEBHOOK_URL was empty or didn't exist",
		)
		return
	}
	if (!process.env.GITHUB_TOKEN) {
		console.warn(
			"Not using a token because process.env.GITHUB_TOKEN was empty or didn't exist",
		)
	}

	const env = process.env as Env

	assertEnv('WORKFLOW_NAME', env.WORKFLOW_NAME)
	assertEnv('SUITE', env.SUITE)
	assertEnv('STATUS', env.STATUS)
	assertEnv('SLACK_WEBHOOK_URL', env.SLACK_WEBHOOK_URL)

	await setupEnvironment()

	const targetText = await createTargetText()

	const oldwebhookContent = {
		username: `nx-ecosystem-ci (${env.WORKFLOW_NAME})`,
		avatar_url: 'https://github.com/nrwl.png',
		embeds: [
			{
				title: `${statusConfig[env.STATUS].emoji}  ${env.SUITE}`,
				description: await createDescription(env.SUITE, targetText),
				color: statusConfig[env.STATUS].color,
			},
		],
	}

	const xwebhookContent = {
		username: 'nx-ecosystem-ci (ci)',
		icon_url: 'https://github.com/nrwl.png',
		blocks: [
			{
				type: 'header',
				text: {
					type: 'plain_text',
					text: `${statusConfig[env.STATUS].emoji}  ${env.SUITE}`,
				},
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: await createDescription(env.SUITE, targetText),
				},
			},
		],
	}

	const webhookContent = {
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `Hello, this is the result of the CI's test run. ${
						statusConfig[env.STATUS].emoji
					}  ${env.SUITE}`,
				},
			},
			{
				type: 'divider',
			},
		],
	}

	const res = await fetch(env.SLACK_WEBHOOK_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(webhookContent),
	})
	if (res.ok) {
		console.log('Sent Webhook')
	} else {
		console.error(`Webhook failed ${res.status}:`, await res.text())
	}
}

function assertEnv<T>(
	name: string,
	value: T,
): asserts value is Exclude<T, undefined> {
	if (!value) {
		throw new Error(`process.env.${name} is empty or does not exist.`)
	}
}

async function createRunUrl(suite: string) {
	const result = await fetchJobs()
	if (!result) {
		return undefined
	}

	if (result.total_count <= 0) {
		console.warn('total_count was 0')
		return undefined
	}

	const job = result.jobs.find((job) => job.name === process.env.GITHUB_JOB)
	if (job) {
		return job.html_url
	}

	// when matrix
	const jobM = result.jobs.find(
		(job) => job.name === `${process.env.GITHUB_JOB} (${suite})`,
	)
	return jobM?.html_url
}

interface GitHubActionsJob {
	name: string
	html_url: string
}

async function fetchJobs() {
	const url = `${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}/jobs`
	const res = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github.v3+json',
			...(process.env.GITHUB_TOKEN
				? {
						Authorization: `token ${process.env.GITHUB_TOKEN}`,
						// eslint-disable-next-line no-mixed-spaces-and-tabs
				  }
				: undefined),
		},
	})
	if (!res.ok) {
		console.warn(
			`Failed to fetch jobs (${res.status} ${res.statusText}): ${res.text()}`,
		)
		return null
	}

	const result = await res.json()
	return result as {
		total_count: number
		jobs: GitHubActionsJob[]
	}
}

async function createDescription(suite: string, targetText: string) {
	const runUrl = await createRunUrl(suite)
	const open = runUrl === undefined ? 'Null' : `[Open](${runUrl})`

	return `
:scroll:\u00a0\u00a0${open}\u3000\u3000:zap:\u00a0\u00a0${targetText}
`.trim()
}

async function createTargetText() {
	const repoText = 'nrwl/nx'
	const nextVersion = await nextNxVersion()

	const link = `https://github.com/nrwl/nx/commits/${nextVersion}`
	return `[${repoText}@${nextVersion}](${link})`
}

run().catch((e) => {
	console.error('Error sending webhook:', e)
})

async function nextNxVersion(): Promise<string> {
	return fetch(`https://registry.npmjs.org/nx`)
		.then((response) => response.json())
		.then(
			(jsonData) =>
				(jsonData as any)?.['dist-tags']?.['next'] ??
				(jsonData as any)?.['dist-tags']?.['latest'],
		)
}
