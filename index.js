// Copyright (c) 2018, David M. Lee, II
const fetch = require('node-fetch');
const url = require('url');

module.exports.zoql = async ({
  baseURL, username, password, query,
}) => {
  const response = await fetch(url.resolve(baseURL, 'v1/action/query'), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      apiAccessKeyId: username,
      apiSecretAccessKey: password,
    },
    body: JSON.stringify({ queryString: query }),
  });

  if (!response || !response.ok) {
    console.error(`Unexpected ZOQL query response ${response.status}`);
    console.error(await response.text());
    process.exit(1);
  }

  return response.json();
};

module.exports.zoqlMore = async ({
  baseURL, username, password, queryLocator,
}) => {
  const response = await fetch(url.resolve(baseURL, 'v1/action/queryMore'), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      apiAccessKeyId: username,
      apiSecretAccessKey: password,
    },
    body: JSON.stringify({ queryLocator }),
  });

  if (!response || !response.ok) {
    console.error(`Unexpected ZOQL queryMore response ${response.status}`);
    console.error(await response.text());
    process.exit(1);
  }

  return response.json();
};

