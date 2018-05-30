// Copyright (c) 2018, David M. Lee, II
const fetch = require('node-fetch');
const ProgressBar = require('progress');
const program = require('commander');
const url = require('url');
const { version } = require('./package');

program
    .version(version)
    .description('Executes a ZOQL query')
    .arguments('[query]')
    .option('--limit [n]', 'Limit number of response records', Infinity)
    .option('--count', 'Returns record count')
    .option('--url [url]', 'Zuora REST URL (default: https://rest.zuora.com/)')
    .option('--username [user]', 'Zuora username')
    .option('--password [pass]', 'Zuora password')
    .parse(process.argv);

const baseURL = program.url || process.env.ZUORA_URL || 'https://rest.zuora.com/';
const username = program.username || process.env.ZUORA_USERNAME;
const password = program.password || process.env.ZUORA_PASSWORD;

async function zoql(queryString) {
  return fetch(url.resolve(baseURL, 'v1/action/query'), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      apiAccessKeyId: username,
      apiSecretAccessKey: password,
    },
    body: JSON.stringify({ queryString }),
  }).then(async (response) => {
    if (!response || !response.ok) {
      console.error(`Unexpected ZOQL query response ${response.status}`);
      console.error(await response.text());
      process.exit(1);
    }

    return response.json();
  });
}

async function zoqlMore(queryLocator) {
  return fetch(url.resolve(baseURL, 'v1/action/queryMore'), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      apiAccessKeyId: username,
      apiSecretAccessKey: password,
    },
    body: JSON.stringify({ queryLocator }),
  }).then(async (response) => {
    if (!response || !response.ok) {
      console.error(`Unexpected ZOQL queryMore response ${response.status}`);
      console.error(await response.text());
      process.exit(1);
    }

    return response.json();
  });

}

async function main() {
  const { count } = program;
  let { limit } = program;

  const query = program.args.join(' ');

  if (!query || !baseURL || !username || !password) {
    program.help();
  }

  let prompt = '> ';
  if (count) {
    prompt += '(count) ';
  }
  prompt += query;
  if (!count && Number.isFinite(limit)) {
    prompt += ` LIMIT ${limit}`;
  }
  console.error(prompt);

  let response = await zoql(query);

  if (count) {
    console.log(response.size);
    return;
  }

  limit = Math.min(limit, response.size);
  const bar = new ProgressBar('[:bar] :percent :etas', {
    total: limit,
    width: 42,
  });

  function log(response) {
    response.records.forEach(record => {
      console.log(JSON.stringify(record));
      bar.tick();
      if (bar.curr >= bar.total) {
        process.exit(0);
      }
    });
  }

  log(response);
  while (!response.done) {
    response = await zoqlMore(response.queryLocator);
    log(response);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
