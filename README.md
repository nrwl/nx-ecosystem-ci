# nx-ecosystem-ci

This repository is used to run integration tests for [Nx](https://nx.dev) ecosystem projects. Check out the [Nx Github repo](https://github.com/nrwl/nx).

The purpose of this repository is to make sure that projects using Nx are compatible with the `next` version of Nx.

It's inspired by the [vitejs/ecosystem-ci](https://github.com/vitejs/vite-ecosystem-ci).

> This repository started as a fork of [vitejs/ecosystem-ci](https://github.com/vitejs/vite-ecosystem-ci), thank you [Vite.js](https://vitejs.dev/) team! Original fork can be found [here](https://github.com/nrwl/nx-ecosystem-ci-fork), but it was moved to a standalone repository to avoid confusion with the original project, and to allow for more flexibility in the future, enable issue reporting, and make PRs easier to manage.

## via github workflow

### scheduled

Workflows are sheduled to run automatically every Monday, Wednesday and Friday

### manually

- open [workflow](../../actions/workflows/ecosystem-ci-selected.yml)
- click 'Run workflow' button on top right of the list
- select suite to run in dropdown
- start workflow

## via shell script

- clone this repo
- run `pnpm i`
- run `pnpm test all` to run all suites
- or `pnpm test <suitename>` to select a suite
- or just `pnpm test` to get prompts to select a suite
- or `tsx ecosystem-ci.ts`

The repositories are checked out into `workspace` subdirectory as shallow clones

# how to add a new integration test

Please read our [contributing guide](CONTRIBUTING.md) for details on how to add a new integration test.

> the current utilities focus on `pnpm` based projects. Consider switching to `pnpm` or contribute utilities for other pms

# reporting results

## Slack

Results are posted automatically to `#nx-ecosystem-ci` channel on [Nrwl Community slack](https://join.slack.com/t/nrwlcommunity/shared_invite/zt-1wbp4do0g-3czhwijFnRzsilGI7eJuag)

### on your own Slack server

- Follow the instructions [here](https://api.slack.com/messaging/webhooks) to create an incoming webhook for your Slack workspace
- copy the webhook url
- get in touch with admins of this repo so they can add the webhook

#### how to add a slack webhook here - in your fork/repo

- Go to `<github repo>/settings/secrets/actions` and click on `New repository secret`
- set `Name` as `SLACK_WEBHOOK_URL`
- paste the slack webhook url you copied from above into `Value`
- Click `Add secret`
