# zoql

Command line tool to execute [Zuora Object Query Language][ZOQL]. Currently very
rought and simple, but it works.

## Installation

```bash
$ npm install -g zoql 
```

## Usage

```bash
$ zoql --help
  Usage: zoql [options] [query]

  Executes a ZOQL query

  Options:

    -V, --version      output the version number
    --limit [n]        Limit number of response records (default: Infinity)
    --count            Returns record count
    --url [url]        Zuora REST URL (default: https://rest.zuora.com/)
    --username [user]  Zuora username
    --password [pass]  Zuora password
    -h, --help         output usage information
```

## Environment variabls

Some command line options can be provided as environment variables. When both 
the environment variable and the command line option are given, the command line
option takes precedence. 

 * `ZUORA_URL` - Zuora REST URL (`--url`)
 * `ZUORA_USERNAME` - Zuora username (`--username`)
 * `ZUORA_PASSWORD` - Zuora password (`--password`)
 
## Examples

```bash
# Return ids from all accounts
$ zoql -- "select Id from Account"

# Return id and timestamps of all rate plan charges updated after a given date$ 
$ zoql -- "select Id, UpdatedDate from RatePlanCharge where UpdatedDate >= '2018-05-11T10:40:14-07:00'"
```

 [ZOQL]: https://knowledgecenter.zuora.com/DC_Developers/K_Zuora_Object_Query_Language
