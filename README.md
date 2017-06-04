# MONADBJS

Fully functional database interface for JS.

---

## Interface

Running sequential database operations more like a fluent interface sequence.

```javascript
var M  = require('./monadb');
var db = new M('mongo', 'localhost', 'db1', 'collection1');

db.insert({name: 'Javi', title: 'MD' })
  .insert({name: 'Craig', title: 'N/A'})
  .set({}, {'$set': {'hometown': 'Wellington'}})
  .loadAll()
  .pluck((ns) => doSomething(ns))
  .insert({name: 'Kevin', 'title': 'Architect', 'hometown': 'Sydney'})
  .count({'hometown': 'Wellington'})
  .pluck((n) => console.log(n, ' people live in Wellington'))
  .deleteAll()
```

Deal with the data always inside the chainable container.

---

# Licence

MIT