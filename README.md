# MonadbJS

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/7391808872d841d6ae927df05a22daf3)](https://www.codacy.com/app/tao/monadb?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=starcolon/monadb&amp;utm_campaign=Badge_Grade)
[![Build Status](https://travis-ci.org/starcolon/monadb.svg?branch=master)](https://travis-ci.org/starcolon/monadb)

Fully functional database interface for JS.

---

Find full documentation here at [MANUAL.md on Github](https://github.com/starcolon/monadb/blob/master/MANUAL.md)

---

## Installation

Via npm:

```
$ npm install monadbjs
```

---

## Interface

Running sequential database operations more like a fluent interface sequence.

```javascript
var M  = require('monadbjs');
var db = new M('mongo', 'localhost', 'db1', 'collection1');

db.insert({name: 'Javi', title: 'MD' })
  .insert({name: 'Craig', title: 'N/A'})
  .set({}, {'$set': {'hometown': 'Wellington'}})
  .loadAll()
  .do((ns) => doSomething(ns))
  .insert({name: 'Kevin', 'title': 'Architect', 'hometown': 'Sydney'})
  .count({'hometown': 'Wellington'})
  .do((n) => console.log(n, ' people live in Wellington'))
  .deleteAll()
```

## Usage scenarios

Load the records given the query condition

```javascript
db.load({id: 150001000})
  .do((rec) => f(rec))
```

Insert records then trigger another `Promise`

```javascript
var records = [
  {a: 100, b: 200},
  {a: 100, b: null},
  {a: 200, b: null},
  {a: 300, b: 200}
];
db.insertMany(records)
  .countAll()
  .do((num) => console.log(num))
  .then(anotherPromise); // Trigger next promise as long as we finish
```

Update / Delete 

```javascript
db.update({g: 100}, {'$set': {g: 150}})
  .count({g: 100})
  .do((n) => console.log(`${n} records left`))
  .delete({g: null})
  .delete({g: 500})
  .countAll()
```

Iterate through records

```javascript
db.forEach({foo: {'$gt': 0}}, (rec) => {
  console.log(rec);
  doSomething(rec);
})
```

Map records and wrap into a new `Promise`

```javascript
db.insertMany(myRecords)
  .map({}, (n) => n.name)
  .then((ns) => ns.forEach((n) => console.log(n))) // New promise
```

Handle internal error

```javascript
db.update({}, {'$set': {a: 100, b: 200}}) // Operation which may break
  .onFailure((e) => {
    console.error(`Exception raised ${e}`);
  })
```

---

# Licence

MIT