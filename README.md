# nx-ecosystem-ci

This repository is used to run integration tests for Nx ecosystem projects. It's inspired by the [vitejs/ecosystem-ci](https://github.com/vitejs/ecosystem-ci).

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
- run `pnpm test` to run all suites
- or `pnpm test <suitename>` to select a suite
- or `tsx ecosystem-ci.ts`

The repositories are checked out into `workspace` subdirectory as shallow clones

# how to add a new integration test

- check out the existing [tests](./tests) and add one yourself. Thanks to some utilities it is really easy
- once you are confidente the suite works, add it to the lists of suites in the [workflows](../../actions/)

> the current utilities focus on pnpm based projects. Consider switching to pnpm or contribute utilities for other pms
> TODO: add note about `packageManager: yarn` on package.json here.

# reporting results

## Slack

Results are posted automatically to `#nx-ecosystem-ci` channel on [Nrwl Community slack](https://join.slack.com/t/nrwlcommunity/shared_invite/zt-1wbp4do0g-3czhwijFnRzsilGI7eJuag)

### on your own server

- Go to `Server settings > Integrations > Webhooks` and click `New Webhook`
- Give it a name, icon and a channel to post to
- copy the webhook url
- get in touch with admins of this repo so they can add the webhook

#### how to add a slack webhook here

- Go to `<github repo>/settings/secrets/actions` and click on `New repository secret`
- set `Name` as `SLACK_WEBHOOK_URL`
- paste the slack webhook url you copied from above into `Value`
- Click `Add secret`
