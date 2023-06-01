# Nx Ecosystem CI

## How it works

The Nx Ecosystem CI is a fork of the [Vite Ecosystem CI](https://github.com/vitejs/vite-ecosystem-ci) but it is adjusted for the Nx ecosystem. It works in the following way:

1. It clones the provided repo which uses Nx
2. It installs the project’s dependencies
3. It runs a number of scripts specified by the project’s author (eg. `test`, `build`, `e2e`)
4. It migrates the repository to the next version of Nx (using `nx migrate next`)
5. It runs the scripts again
6. It reports the results of the runs to the [Nrwl Community slack](https://join.slack.com/t/nrwlcommunity/shared_invite/zt-1wbp4do0g-3czhwijFnRzsilGI7eJuag), in the `#nx-ecosystem-ci` channel

The main difference between the Nx Ecosystem CI and the Vite Ecosystem CI is that Nx Ecosystem CI uses the `next` version of Nx as published on `npm`, rather than cloning and building Nx locally, like Vite does in the Vite Ecosystem CI.

## How to add your project to the Nx Ecosystem CI

### Adding a new test suite

To add a new test suite for your project in the Nx Ecosystem CI, you would need to create a new file under the tests directory. The name of this file should reflect the suite it represents, for example, [`nx-rspack.ts`](tests/nx-rspack.ts).

The first step is to import the necessary modules and types from `utils.ts` and `types.ts` at the top of your file:

```ts
import { runInRepo } from '../utils'
import { RunOptions } from '../types'
```

`RunOptions` is a type that represents the `options` for running a test suite. It includes properties such as the repository to test, the branch to use, and the commands to run for building, testing, and performing e2e tests.

Next, you need to define the `test` function that accepts the `RunOptions`. Within this function, you'll call the `runInRepo` function, passing in the `options` as well as any specific properties required for your suite:

Again, using the example of `nx-rspack`:

```ts
export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nrwl/nx-labs',
		branch: 'main',
		build: ['build rspack'],
		test: ['test rspack'],
		e2e: ['e2e rspack-e2e'],
	})
}
```

In this example, the suite is set up to run on the [`nrwl/nx-labs`](https://github.com/nrwl/nx-labs) repository on the `'main'` branch. It will run `build rspack`, `test rspack`, and `e2e rspack-e2e` as its build, test, and e2e tests respectively. These commands will be invoked using the package manager used by your repository. So, in the `nx-labs` case, it will run `yarn build rspack` in the `nrwl/nx-labs` repo.

### Defining the `package.json` scripts

For this reason, adding a new test suite to the Nx Ecosystem CI also requires setting up appropriate `scripts` in your repository's `package.json` file. These scripts provide the commands that will be invoked by your package manager to carry out the `build`, `test`, and `e2e` steps.

Here's an example of how scripts might be configured in a `package.json` file for a repository using Nx:

```json
"scripts": {
    …
    "build": "nx build",
    "test": "nx test",
    "e2e": "nx e2e"
    …
},
```

These scripts should be set up in such a way that they can be invoked directly by your package manager. For example, in a repository using `pnpm`, you could run the build script with the command `pnpm run build`.

When you create your test suite file, you'll specify these script names in the `build`, `test`, and `e2e` properties of the options object passed to `runInRepo`.

```ts
export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'my-repo/my-nx-plugin',
		branch: 'main',
		build: ['build'],
		test: ['test'],
		e2e: ['e2e'],
	})
}
```

With this setup, the Nx Ecosystem CI will run these scripts in your repository as part of its CI process, or just when you run `pnpm test <name-of-suite>` locally.

### Specifying the `packageManager` in your `package.json`

It is also important to specify the package manager you're using in your `package.json` file. This is because Nx Ecosystem CI needs to know which package manager to use when installing dependencies and running scripts for your project. By default, Nx Ecosystem CI uses `pnpm`, but not all projects use this package manager.

To specify your package manager, add a [`packageManager` field](https://nodejs.org/api/packages.html#packagemanager) to your `package.json` file. This field should have a string value that represents the package manager you're using, and potentially it's version. For example, in the [`nrwl/nx-labs`](https://github.com/nrwl/nx-labs) we specify the `packageManager` like [this](https://github.com/nrwl/nx-labs/blob/main/package.json#LL25C1-L25C36):

```json
{
"name": "nx-labs",
"version": "1.0.0-rc.1",
...
"packageManager": "yarn@1.22.19",
...
}
```

Once you've added the `packageManager` field to your `package.json`, Nx Ecosystem CI will use the specified package manager when running your test suite. This ensures that your project is built, tested, and runs in the same environment as it would in your local development setup.

### Adding the suite to the GitHub workflow configuration

In addition to creating the test suite and setting up the `package.json` scripts, you will also need to add the name of the new suite to the workflow configuration files in the [`.github/workflows`](.github/workflows) directory of the Nx Ecosystem CI repository. This suite name should match the filename of your test suite script.

There are two workflow files you'll need to update:

- [.github/workflows/ecosystem-ci.yml](.github/workflows/ecosystem-ci.yml)
- [.github/workflows/ecosystem-ci-selected.yml](.github/workflows/ecosystem-ci-selected.yml)

In `.github/workflows/ecosystem-ci.yml` you'll find a `strategy` section with a `matrix` property. This `matrix` property specifies an array of `suite` names for the workflow to run. You'll need to add your new `suite` name to this array.

Here's what the `strategy` section might look like after adding a new `suite` named `my-new-suite`:

```yaml
strategy:
  matrix:
    suite:
      - ….
      - nx-remix
      - nx-rspack
      - …
      - my-new-suite # your new suite
```

By adding your `suite` name to this file, you're instructing the Nx Ecosystem CI to include your `suite` in its test runs.

You also need to include your suite in the [.github/workflows/ecosystem-ci-selected.yml](.github/workflows/ecosystem-ci-selected.yml) file. This workflow is designed to allow manual selection of a test `suite` to run. To add a `suite` to this workflow, you add it to the `options` array under `workflow_dispatch > inputs > suite`. Here's what it might look like with a new `suite` named `my-new-suite`:

```yaml
on:
  workflow_dispatch:
    inputs:
      suite:
        description: 'testsuite to run'
        required: true
        type: choice
        options:
          - ….
          - nx-remix
          - nx-rspack
          - …
          - my-new-suite # your new suite
```

Adding your suite name to this file allows it to be manually selected for a test run via the GitHub Actions interface. This manual selection process provides additional flexibility and control over the testing process, allowing you to run individual suites as needed.
