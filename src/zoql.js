// Copyright (c) 2018, David M. Lee, II
const fetch = require('node-fetch');
const url = require('url');
const xml2js = require('xml2js');
const _ = require('lodash');

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

module.exports.zoqlDescribe = async ({
  baseURL, username, password, object,
}) => {
  const response = await fetch(url.resolve(baseURL, `v1/describe/${decodeURIComponent(object)}`), {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'text/xml', // API does not support JSON responses
      apiAccessKeyId: username,
      apiSecretAccessKey: password,
    },
  });

  if (!response || !response.ok) {
    console.error(`Unexpected ZOQL queryMore response ${response.status}`);
    console.error(await response.text());
    process.exit(1);
  }

  const text = await response.text();
  const xml = await new Promise((resolve, reject) => {
    xml2js.parseString(text, { trim: true }, (err, parsed) => {
      if (err) {
        reject(err);
      }
      resolve(parsed);
    });
  });

  const fields = _.chain(xml)
    .get('object.fields')
    .flatMap('field')
    .map((field) => {
      const noSillyArrays = _.mapValues(field, v => _.size(v) > 1 ? v : v[0]);
      noSillyArrays.contexts = noSillyArrays.contexts.context;
      return noSillyArrays;
    })
    .value();

  const relatedObjects = _.chain(xml)
    .get('object.related-objects[0].object')
    .map(o => ({
      href: o.$.href,
      name: o.name[0],
      label: o.label[0],
    }))
    .value();

  return { fields, relatedObjects };
};
