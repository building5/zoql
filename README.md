# zoql

Command line tool to execute [Zuora Object Query Language][ZOQL]. Currently very
rough and simple, but it works.

## Installation

```bash
$ npm install -g zoql
```

## Usage

```
$ zoql --help

  Usage: zoql [options] <query>

  Executes a ZOQL query

  Options:

    -V, --version        output the version number
    --quiet              do not show info messages or progress indicator
    --limit [n]          limit number of response records (default: Infinity)
    --count              returns record count
    --describe [object]  describes an object's fields and related objects
    --url [url]          Zuora REST URL (default: https://rest.zuora.com/)
    --username [user]    Zuora username
    --password [pass]    Zuora password
    -h, --help           output usage information
```

## Environment variables

Some command line options can be provided as environment variables. When both
the environment variable and the command line option are given, the command line
option takes precedence.

 * `ZUORA_URL` - Zuora REST URL (`--url`)
 * `ZUORA_USERNAME` - Zuora username (`--username`)
 * `ZUORA_PASSWORD` - Zuora password (`--password`)

## Examples

```bash
# Return ids from all accounts
$ zoql "select Id from Account"

# Return id and timestamps of all rate plan charges updated after a given date
$ zoql "select Id, UpdatedDate from RatePlanCharge where UpdatedDate >= '2018-05-11T10:40:14-07:00'"

# Return a list of fields and related objects for Subscription
$ zoql --describe Subscription
```

## Wishlist

 * Unit tests
 * Prompt for password if it's omitted
 * Authenticate using OAuth; cache authentication token

 [ZOQL]: https://knowledgecenter.zuora.com/DC_Developers/K_Zuora_Object_Query_Language
