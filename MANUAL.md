# MonadbJS

The interface of MonadbJS is designed specifically for 
running a _sequential_ operation chain. The chain of 
the operation can be expressed via fluent interface like so.

---

### First step

After an installation, you can start using _MonadbJS_ by:

```javascript
var M  = require('monadbjs');
```

Create a database interface as following.

```javascript
var db = new M('mongo', 'localhost', 'mydatabase', 'mycollection');
```

> NOTE: Only Mongo interface is available up to date.

---

### Query

Load the entire collection at once.

```javascript
db.loadAll().do((records) => ...)
```

Load the collection by filter.

```javascript
db.loadAll({ age: {'$gt': 25}}).do((filteredRecords) => ...)
```

Count the number of the records

```javascript
db.countAll().do((n) => ...)
```

Count the number of the records by filter.

```javascript
db.count({ age: {'$lt': 50}}).do((n) => ...)
```

Iterate through records by filter.

```javascript
db.forEach({ age: {'$lt': 50}}, (rec) => ...)
```

Iterate through records, map it by particular function.
Wrap the output as another Promise.

```javascript
// Read all records of which age is lower than 40,
// take only salary attribute appended with currency. 
db.map({ age: {'$lt': 40}}, (rec) => rec.salary + ' THB')
  .then((rec) => ...)
```

---

### Insert / Write

Insert a record.

```javascript
db.insert({name: 'Tian', age: 85, salary: 8000})
```

Insert multiple records.

```javascript
db.insertMany([row1, row2, row3, row4])
  .do((ids) => {
    var [row1Id, row2Id, row3Id, row4Id] = ids;
    ...
  })
```

Update existing records

```javascript
// Increase salary of all records aged over 50 by 500
db.set({age: {'$gt': 50}}, {'$inc': {salary: 500}})
```

---

### Delete

Delete records by filter

```javascript
db.delete({salary: {'$lte': 1000}})
```

---

### Handling internal exception

When an operation is possibly error-prone.

```javascript
db.insertMany([row1, row2])
  .delete(condition)
  .onFailure((e) => ...)
```

---

