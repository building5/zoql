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
    xml2js.parseString(text, { trim: true, explicitArray: false }, (err, parsed) => {
      if (err) {
        reject(err);
      }
      resolve(parsed);
    });
  });

  const fields = _.chain(xml)
    .get('object.fields.field')
    .map((field) => {
      // XML introduces a silly "context" intermediate object
      let contexts = field.contexts.context;
      // and make sure it's an array
      if (!_.isArray(contexts)) {
        contexts = [contexts];
      }
      return {
        ...field,
        contexts,
      };
    })
    .value();

  const relatedObjects = _.chain(xml)
    .get('object.related-objects.object')
    .map(o => ({
      href: o.$.href,
      name: o.name,
      label: o.label,
    }))
    .value();

  return { fields, relatedObjects };
};
