# MONADBJS

Fully functional database interface for JS.

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
  .then(anotherPromise);
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
  doSomething(f);
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