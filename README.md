# node-scenarios
A simple way to manage scenarios, with customizable triggers/conditions/actions

## Installation

```bash
$ npm install node-scenarios
```

## Features

- create triggers (detected presence, called url, crons, etc...)
- create scenarios, with complex routes
- create customizable conditions with given data
- create customizable actions (email, url call, GPIO, etc...)

## Doc


### node-scenarios
- ``` static init() : return Promise instance => then(container) ``` initialize database and return a promise with container parameter
- ``` static release() : return Promise instance ``` close database connection
- ``` static delete() : return Promise instance ``` release & delete database file

### "container" data
- see [node-containerpattern](https://www.npmjs.com/package/node-containerpattern) documentation
- db : an instance of sqlite3.Database object  (see [sqlite3](https://www.npmjs.com/package/sqlite3) documentation)
- triggers, scenarios, actionstypes, actions, conditionstypes, conditions : see the following documentations

### triggers
### scenarios
### actionstypes
### actions
### conditionstypes
### conditions

## Examples

```js


```

## Tests

```bash
$ gulp
```

## License

  [ISC](LICENSE)
