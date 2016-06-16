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
- ``` static init() : return Promise instance => then(node-containerpattern container) ``` initialize database and return a node-containerpattern instance
- ``` static release() : return Promise instance ``` close database connection
- ``` static delete() : return Promise instance ``` release & delete database file

### node-containerpattern instance
- see [node-containerpattern](https://www.npmjs.com/package/node-containerpattern) documentation
- db : an instance of sqlite3.Database object    (see [sqlite3](https://www.npmjs.com/package/sqlite3) documentation)
- triggers, scenarios, actionstypes, actions, conditionstypes, conditions : see the following documentations

### global documentation for all contained objets

- ``` static formate(object model) ``` formate data

- ``` last() : return Promise instance => then(object model) ``` return the last insterted data
- ``` search(object model) : return Promise instance => then(array model) ``` return all the object concerned by the research
- ``` searchOne(object model) : return Promise instance => then(object model) ``` execute "search" and return the first

- ``` add(object model) : return Promise instance => then(object model) ``` add the object
- ``` edit(object model) : return Promise instance => then(object model) ``` edit the registered object
- ``` delete(object model) : return Promise instance ``` delete the registered object

### triggers

- ``` linkToScenario(object scenario, object trigger) : return Promise instance ``` link a scenario and a trigger
- ``` unlinkToScenario(object scenario, object trigger) : return Promise instance ``` unlink a scenario and a trigger

- ``` execute(object trigger, object externaldata) : return Promise instance ``` execute all the linked scenarios

### scenarios

- ``` linkToTrigger(object scenario, object trigger) : return Promise instance ``` link a scenario and a trigger
- ``` unlinkToTrigger(object scenario, object trigger) : return Promise instance ``` unlink a scenario and a trigger

- ``` linkStartAction(object scenario, object action) : return Promise instance => then(object scenario) ``` unlinkStart && link an action to the scenario
- ``` linkStartCondition(object scenario, object condition) : return Promise instance => then(object scenario) ``` unlinkStart && link a condition to the scenario
- ``` unlinkStart(object scenario) : return Promise instance => then(object scenario) ``` unlink the action or condition linked to the scenario

- ``` execute(object scenario, object externaldata) : return Promise instance ``` execute the scenario

### actions

- ``` linkAfterAction(object action, object linkedaction) : return Promise instance => then(object action) ``` unlinkAfter && link an action to the action
- ``` linkAfterCondition(object action, object linkedcondition) : return Promise instance => then(object action) ``` unlinkAfter && link a condition to the action
- ``` unlinkAfter(object action) : return Promise instance => then(object action) ``` unlink the action or condition linked to the action

- ``` bindExecuter(object actiontype, function executer) : return Promise instance ``` link an action type to a callback function
- ``` execute(object action, object externaldata) : return Promise instance ``` execute the callback function of the action's action type

- NOTE : the callback function MUST return a promise instance

### conditions

- ``` linkOnYesAction(object condition, object linkedaction) : return Promise instance => then(object condition) ``` unlinkOnYes && link an action to the condition for a "true" resolution
- ``` linkOnYesCondition(object condition, object linkedcondition) : return Promise instance => then(object condition) ``` unlinkOnYes && link a condition to the condition for a "true" resolution
- ``` unlinkOnYes(object condition) : return Promise instance => then(object condition) ``` unlink the action or condition linked to the condition

- ``` linkOnNoAction(object condition, object linkedaction) : return Promise instance => then(object condition) ``` unlinkOnNo && link an action to the condition for a "false" resolution
- ``` linkOnNoCondition(object condition, object linkedcondition) : return Promise instance => then(object condition) ``` unlinkOnNo && link a condition to the condition for a "false" resolution
- ``` unlinkOnNo(object condition) : return Promise instance => then(object condition) ``` unlink the action or condition linked to the condition

- ``` bindExecuter(object conditiontype, function executer) : return Promise instance ``` link a condition type to a callback function
- ``` execute(object condition, object externaldata) : return Promise instance ``` execute the callback function of the condition's condition type

- NOTE : the callback functions MUST return a promise instance

## Examples

```js
const scenarios = require("node-scenarios");

scenarios.init().then(function(container) {
    
    let actiontype, conditiontype;
    let actionyes, actionno;
    let condition, scenario;

    // create actions types & actions & executer

    container.get("actionstypes").add({ code: "CONSOLE", "name" : "console" }).then(function(_actiontype) {
        actiontype = _actiontype;
        return container.get("actions").add({ "name": "console yes", "type": actiontype, "params": "\"yes\"" });
    })

    .then(function(_actionyes) {
        actionyes = _actionyes;
        return container.get("actions").add({ "name": "console no", "type": actiontype, "params": "\"no\"" });
    }).then(function(_actionno) {
        actionno = _actionno;
        return Promise.resolve();
    })

    .then(function(_actionno) {
        
        return container.get("actions").bindExecuter(actiontype, function(action, data) {

            console.log(action.params);
            return Promise.resolve();

        });

    })

    // create conditions types & conditions & executer

    .then(function() {
        return container.get("conditionstypes").add({ code: "BOOLEQUAL", "name" : "equal" });
    })

    .then(function(_conditiontype) {
        conditiontype = _conditiontype;
        return container.get("conditions").add({ "name": "true", "type": conditiontype, "value": "true" });
    }).then(function(_condition) {
        condition = _condition;
        return container.get("conditions").linkOnYesAction(condition, actionyes);
    }).then(function() {
        return container.get("conditions").linkOnNoAction(condition, actionno);
    })

    .then(function() {

        return container.get("conditions").bindExecuter(conditiontype, function(condition, data) {

            if ("undefined" === typeof data.condition) {
                return Promise.reject("There is no \"condition\" data.");
            }
                else if ("boolean" !== typeof data.condition) {
                    return Promise.reject("\"condition\" data is not a boolean.");
                }
            else {
                return Promise.resolve(data.condition);
            }

        });

    })

    // create scenario

    .then(function() {
        return container.get("scenarios").add({ "name": "test", "active": true });
    }).then(function(_scenario) {
        scenario = _scenario;
        return container.get("scenarios").linkStartCondition(scenario, condition);
    })

    // execute scenario

    .then(function() {
        
        return container.get("scenarios").execute(scenario, {
            condition: false
        });

    })


    .catch(function(err) {
        console.log(err);
    });

});
```

## Tests

```bash
$ gulp
```

## License

    [ISC](LICENSE)
