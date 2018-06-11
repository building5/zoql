#!/usr/bin/env node

// Copyright (c) 2018, David M. Lee, II
const ProgressBar = require('progress');
const _ = require('lodash');
const program = require('commander');

const { version } = require('./package');
const { zoql, zoqlMore, zoqlDescribe } = require('./src/zoql');

program
  .version(version)
  .description('Executes a ZOQL query')
  .arguments('<query>')
  .option('--quiet', 'do not show info messages or progress indicator')
  .option('--limit [n]', 'limit number of response records', Infinity)
  .option('--count', 'returns record count')
  .option('--describe [object]', "describes an object's fields and related objects")
  .option('--url [url]', 'Zuora REST URL (default: https://rest.zuora.com/)')
  .option('--username [user]', 'Zuora username')
  .option('--password [pass]', 'Zuora password')
  .parse(process.argv);

const baseURL = program.url || process.env.ZUORA_URL || 'https://rest.zuora.com/';
const username = program.username || process.env.ZUORA_USERNAME;
const password = program.password || process.env.ZUORA_PASSWORD;
const { count, quiet, describe } = program;

const query = program.args.join(' ');

let fail = false;
if (!query && !describe) {
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
  if (describe) {
    const fields = await zoqlDescribe({
      baseURL,
      username,
      password,
      object: describe,
    });
    console.log(JSON.stringify(fields, null, 2));
    return;
  }

  let { limit } = program;

  if (!quiet) {
    let prompt = '> ';
    if (count) {
      prompt += '(count) ';
    }
    prompt += query;
    if (!count && Number.isFinite(limit)) {
      prompt += ` LIMIT ${limit}`;
    }
    console.error(prompt);
  }

  let response = await zoql({
    baseURL, username, password, query,
  });

  if (count) {
    console.log(response.size);
    return;
  }

  limit = Math.min(limit, response.size);
  const bar = quiet || process.stdout.isTTY ? null : new ProgressBar('[:bar] :percent :etas', {
    total: limit,
    width: 42,
  });

  function log(res) {
    _.forEach(res.records, (record) => {
      console.log(JSON.stringify(record));
      if (bar) {
        bar.tick();
      }
      limit -= 1;
      if (limit <= 0) {
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
