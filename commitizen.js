import { execSync } from 'child_process'

// prettier-ignore
const scopes = [
    { value: 'tests',       name: 'tests:         adding a new test suite' },
    { value: 'repo',        name: 'repo:          anything related to managing the repo itself' },
    { value: 'misc',        name: 'misc:          misc stuff' },
    { value: 'utils',       name: 'utils:         any changes in the utils file'},
  ];

// precomputed scope
const scopeComplete = execSync('git status --porcelain || true')
	.toString()
	.trim()
	.split('\n')
	.find((r) => ~r.indexOf('M  tests'))
	?.replace(/(\/)/g, '%%')
	?.match(/tests%%((\w|-)*)/)?.[1]

/** @type {import('cz-git').CommitizenGitOptions} */
export default {
	/** @usage `pnpm commit :f` */
	alias: {
		f: 'feat(tests): added new tests for my-plugin',
		b: 'chore(repo): bump dependencies',
	},
	scopes,
	defaultScope: scopeComplete,
	scopesSearchValue: true,
	maxSubjectLength: 100,
	allowCustomScopes: false,
	allowEmptyScopes: false,
	allowCustomIssuePrefix: false,
	allowEmptyIssuePrefix: false,
	types: [
		{ value: 'feat', name: 'feat:     A new feature' },
		{ value: 'fix', name: 'fix:      A bug fix' },
		{ value: 'docs', name: 'docs:     Documentation only changes' },
		{
			value: 'cleanup',
			name: 'cleanup:  A code change that neither fixes a bug nor adds a feature',
		},
		{
			value: 'chore',
			name: "chore:    Other changes that don't modify src or test files",
		},
	],
}
