#!/usr/bin/env node

// Copyright (c) 2018, David M. Lee, II
const ProgressBar = require('progress');
const _ = require('lodash');
const program = require('commander');

const { version } = require('./package');
const { zoql, zoqlMore } = require('./index');

program
  .version(version)
  .description('Executes a ZOQL query')
  .arguments('<query>')
  .option('--limit [n]', 'limit number of response records', Infinity)
  .option('--count', 'returns record count')
  .option('--url [url]', 'Zuora REST URL (default: https://rest.zuora.com/)')
  .option('--username [user]', 'Zuora username')
  .option('--password [pass]', 'Zuora password')
  .parse(process.argv);

const baseURL = program.url || process.env.ZUORA_URL || 'https://rest.zuora.com/';
const username = program.username || process.env.ZUORA_USERNAME;
const password = program.password || process.env.ZUORA_PASSWORD;

const query = program.args.join(' ');

let fail = false;
if (!query) {
  console.error('Missing query');
  fail = true;
}
if (!baseURL) {
  console.error('Missing --url or ZUORA_URL');
  fail = true;
}
if (!username) {
  console.error('Missing --username or ZUORA_USERNAME');
  fail = true;
}
if (!password) {
  console.error('Missing --password or ZUORA_PASSWORD');
  fail = true;
}

if (fail) {
  program.help();
}

async function main() {
  const { count } = program;
  let { limit } = program;

  let prompt = '> ';
  if (count) {
    prompt += '(count) ';
  }
  prompt += query;
  if (!count && Number.isFinite(limit)) {
    prompt += ` LIMIT ${limit}`;
  }
  console.error(prompt);

  let response = await zoql({
    baseURL, username, password, query,
  });

  if (count) {
    console.log(response.size);
    return;
  }

  limit = Math.min(limit, response.size);
  const bar = new ProgressBar('[:bar] :percent :etas', {
    total: limit,
    width: 42,
  });

  function log(res) {
    _.forEach(res.records, (record) => {
      console.log(JSON.stringify(record));
      bar.tick();
      if (bar.curr >= bar.total) {
        process.exit(0);
      }
    });
  }

  log(response);
  while (!response.done) {
    response = await zoqlMore({
      baseURL, username, password, queryLocator: response.queryLocator,
    });
    log(response);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
