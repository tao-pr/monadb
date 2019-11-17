/**
 * Use cases
 * @author TaoPR (github.com/starcolon)
 */

var jasmine = require('jasmine');
var MongoDB = require('../interface/db-mongo');
var V       = require('../interface/vector');

const TIMEOUT = 400;

var _db     = new MongoDB({
  svr:        'localhost', 
  dbname:     'test_monad', 
  collection: 'one', 
  verbose:    false
});

const promiseTimeout = time => () => new Promise(
  resolve => setTimeout(resolve, time, time)
);

describe('Database Operations', function(){
  
  global.vector = null;
  global.id = null;

  beforeEach(function(done){
    console.log('Initialising')
    // Ensure the test database is clean and empty
    V.with(_db).deleteAll().then(() => done())
  })

  it('should add a new record', function(done){
    V.with(_db)
      .insert({a: 100, b: [250]})
      .onFailure((e) => {
        console.error('ERROR insertion'); // TAODEBUG:
        console.error(e);
      })
      .countAll()
      .then((c) => {
        expect(c).toEqual(1);
        done();
      })
  }, TIMEOUT)

  it('should query for an existing record', function(done){
    V.with(_db)
      .insert({a: 100, b: [250]})
      .count({b: [250]})
      .do((n) => {
        expect(n).toEqual(1);
      })
      .loadAll()
      .do((recs) => {
        expect(recs.length).toEqual(1);
        expect(recs[0].a).toEqual(100);
        expect(recs[0].b).toEqual([250]);
        expect(recs[0]._id).not.toEqual(undefined);
        id = recs[0]._id;
        done();
      })
  }, TIMEOUT)

  it('should add a bulk of records', function(done){
    var records = [
      {a: 200, b:[1,2,3]},
      {a: 300, b:[]},
      {a: 400, b:[1,2,3]},
      {a: 500, b:{foo: 'bar'}}
    ];
    V.with(_db)
      .insertMany(records)
      .do((ids) => {
        expect(ids.length).toEqual(records.length);
      })
      .countAll()
      .do((n) => {
        expect(n).toEqual(records.length);
      })
      .count({a: {'$gte': 400}})
      .do((n) => {
        expect(n).toEqual(2);
        done();
      })
  }, TIMEOUT)

  it('should iteratively traverse records', function(done){
    var records = [
      {a: 200, b:[1,2,3]},
      {a: 300, b:[]},
      {a: 400, b:[1,2,3]},
      {a: 500, b:{foo: 'bar'}}
    ];
    V.with(_db)
      .insertMany(records)
      .forEach({b:[1,2,3]}, (r) => {
        // Even though MongoDB iteration ends will null,
        // the interface has to prevent from transmitting it.
        expect(r).not.toBeNull();
        // Only two elements (200, 400) should reside
        expect(r.a == 200 || r.a == 400).toBeTruthy();
        expect(r.a != 200 && r.a != 400).toBeFalsy();
      })
      .then(() => done())
  }, TIMEOUT)

  it('should map the results and create another Promise of them', function(done){
    var take_b = function(n){ return n.b }

    var records = [
      {a: 200, b:[1,2,3]},
      {a: 300, b:[]},
      {a: 400, b:[1,2,3]},
      {a: 500, b:{foo: 'bar'}}
    ];

    V.with(_db)
      .insertMany(records)
      .map({a: {'$in': [200,300,400,500]}}, take_b)
      .then((ns) => {
        var expectedArray = [[1,2,3],[],[1,2,3],{foo: 'bar'}];
        var expectedNS = expectedArray.map((n) => n.toString());
        var actualNS = ns.map((n) => n.toString());
        
        expect(actualNS.sort().join(',')).toEqual(expectedNS.sort().join(','));
        done();
      })
  }, TIMEOUT)

  it('should update a record', function(done){
    var records = [
      {a: 200, b:[1,2,3]},
      {a: 300, b:[]},
      {a: 400, b:[1,2,3]},
      {a: 500, b:{foo: 'bar'}}
    ];

    V.with(_db)
      .insertMany(records)
      .set({a: 300}, {b: [1,2,3]})
      .count({b: [1,2,3]})
      .do((c) => {
        expect(c).toEqual(3);
      })
      .count({b: []})
      .do((c) => {
        expect(c).toEqual(0);
        done();
      });
  }, TIMEOUT)

  it('should delete a record based on condition', function(done){
    var records = [
      {v:1, foo: 'aaa'},
      {v:1, foo: 'aab'},
      {v:1, foo: 'aac'},
      {v:1, foo: 'aad'},
      {v:2, foo: 'aaa'}
    ];
    V.with(_db)
      .insertMany(records)
      .count({v: 1}) 
      .do((n) => expect(n).toEqual(records.length-1)) // Should exist after adding
      .delete({v: 1})
      .count({v: 1})
      .do((c) => {
        expect(c).toEqual(0);
      })
      .count({v: 2})
      .do((c) => {
        expect(c).toEqual(1);
        done();
      })
  }, TIMEOUT)

  it('should handle exception', function(done){
    V.with(_db)
      .delete() // This should cause an error
      .onFailure((e) => {
        console.log("This will cause an error, which is fine.")
        expect(e).not.toBeNull;
        done();
      })
  }, TIMEOUT)

  it('should pass through another promise via [then]', function(done){
    var records = [
      {t: 1, i: [1,2,3]},
      {t: 1, i: [3,4,5]},
      {t: 1, i: [6,5,4]},
      {t: 1, i: [1,2,3]},
      {t: 1, i: [2,3,3]}
    ];
    var vec = [];
    V.with(_db)
      .insertMany(records)
      .then(V.with(_db)
              .loadAll({t: 1})
              .do((ns) => expect(ns.length).toEqual(records.length))
              .do(() => {done()}))
  }, TIMEOUT)

  it('Chain multiple vectors', function(done){
    var vec1 = V.with(_db).insertMany([{a: 7, b: 0.5}, {a:7, b: -0.5}]).asPromise();
    var vec2 = V.with(_db).insertMany([{a: 8, b: 0.5}, {a:8, b: -0.1}]).asPromise();
    var vec3 = V.with(_db).load({'$or': [{a: 7}, {a: 8}]})
    
    Promise
      .all([vec1, vec2])
      .then(() => vec3.asPromise())
      .then((output) => {
        let nn = output.map((n) => [n.a, n.b])
        expect(nn).toContain([7, 0.5])
        expect(nn).toContain([7,-0.5])
        expect(nn).toContain([8, 0.5])
        expect(nn).toContain([8,-0.1])
      })
      .then(() => done())
  }, TIMEOUT)

  it('Query and sort', function(done){
    V.with(_db)
      .insertMany([
        {a: 155, i: 0, v: 25, w: 1},
        {a: 155, i: 5, v: 0,  w: -3},
        {a: 155, i: 10,v: 5,  w: 1},
        {a: 155, i: 15,v: 5,  w: 0},
        {a: 155, i: 20,v: 2,  w: 10},
        {a: 155, i: 25,v: 2,  w: 5},
        {a: 255, i: 25,v: 2,  w: 5}
      ])
      .load({a:155}, {'v': 1, 'w': -1})
      .do((ns) => {
        ns = ns.map((n) => {
          return {a: n.a, i: n.i, v: n.v, w: n.w}
        })
        expect(ns).toEqual([
          {a: 155, i: 5, v: 0,  w: -3},
          {a: 155, i: 20,v: 2,  w: 10},
          {a: 155, i: 25,v: 2,  w: 5},
          {a: 155, i: 10,v: 5,  w: 1},
          {a: 155, i: 15,v: 5,  w: 0},
          {a: 155, i: 0, v: 25, w: 1}
        ])
      })
      .then(() => done())
  }, TIMEOUT)

  it('Aggregate and sort', function(done){
    let keys = ['k'];
    let by = {qty: {'$sum': '$qty'}};
    let sort = {};
    let prefilter = {'qty': {'$gt': 0}};

    V.with(_db)
      .insertMany([
        {k: 'Water', p: 0.5, qty: 0},
        {k: 'Water', p: 1.5, qty: 10},
        {k: 'Water', p: 2.5, qty: 20},
        {k: 'Pepsi', p: 3.5, qty: 20},
        {k: 'Beer',  p: 4.0, qty: 1},
        {k: 'Beer',  p: 4.5, qty: 25}
      ])
      .agg(keys, by, sort, prefilter)
      .do((ns) => {
        console.log(ns);
        // TAOTODO:
      })
      .then(() => done())
  }, TIMEOUT)

  afterAll(function(done){
    console.log('All done, tearing down');
    V.with(_db)
      .deleteAll()
      .then(() => done())
  }, TIMEOUT)
})