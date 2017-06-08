/**
 * Use cases
 * @author TaoPR (github.com/starcolon)
 */

var jasmine   = require('jasmine');
var MongoDB   = require('../interface/db-mongo');
var V$        = require('../interface/vector');

var _db       = new MongoDB('localhost', 'test_monad', 'one');

describe('Database Operations', function(){
  
  var vector = null;

  beforeAll(function(done){
    console.log('Initialising')
    // Ensure the test database is clean and empty
    vector = V$.with(_db).deleteAll();
    vector.then(() => done());
  })

  it('should initialise a new database vector', function(done){
    expect(vector.constructor.name).toEqual('Vector');
    done();
  })

  it('should add a new record', function(done){
    V$.with(_db)
      .insert({a: 100, b: [250]})
      .countAll()
      .then((c) => {
        expect(c).toEqual(1);
        done();
      })
  })

  it('should query for an existing record', function(done){
    V$.with(_db)
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
        done();
      })
  })

  it('should add a bulk of records', function(done){
    var records = [
      {a: 200, b:[1,2,3]},
      {a: 300, b:[]},
      {a: 400, b:[1,2,3]},
      {a: 500, b:{foo: 'bar'}}
    ];
    V$.with(_db)
      .insertMany(records)
      .do((ids) => {
        expect(ids.length).toEqual(records.length);
      })
      .countAll()
      .do((n) => {
        expect(n).toEqual(records.length+1);
      })
      .count({a: {'$gte': 400}})
      .do((n) => {
        expect(n).toEqual(2);
        done();
      })
  })

  it('should iteratively traverse records', function(done){
    V$.with(_db)
      .forEach({b:[1,2,3]}, (r) => {
        // Even though MongoDB iteration ends will null,
        // the interface has to prevent from transmitting it.
        expect(r).not.toBeNull();
        // Only two elements (200, 400) should reside
        expect(r.a == 200 || r.a == 400).toBeTruthy();
        expect(r.a != 200 && r.a != 400).toBeFalsy();
      })
      .then(() => done())
  })

  it('should update a record', function(done){
    V$.with(_db)
      .set({a: 300}, {'$set': {b: [1,2,3]}})
      .count({b: [1,2,3]})
      .do((c) => {
        expect(c).toEqual(3);
      })
      .count({b: []})
      .do((c) => {
        expect(c).toEqual(0);
        done();
      });
  })

  it('should delete a record based on condition', function(done){
    V$.with(_db)
      .delete({a: {'$lte': 300}})
      .countAll()
      .do((c) => {
        expect(c).toEqual(2);
        done();
      })
  })

  it('should handle exception', function(done){
    V$.with(_db)
      .delete()
      .onFailure((e) => {
        expect(e).not.toBeNull;
        done();
      })
  })

  it('should pass through another promise via [then]', function(done){
    var records = [
      {t: 1, i: [1,2,3]},
      {t: 1, i: [3,4,5]},
      {t: 1, i: [6,5,4]},
      {t: 1, i: [1,2,3]},
      {t: 1, i: [2,3,3]}
    ];
    var vec = [];
    V$.with(_db)
      .insertMany(records)
      .do(() => vec.push(1))
      .then(V$.with(_db)
              .loadAll({t: 1})
              .do((ns) => vec.push(2))
              .forEach({t: 1}, () => vec.push(3))
              .do(() => {
                expect(vec).toEqual([1,2,3,3,3,3,3]);
                done();
              }))
  })

  afterAll(function(){
    console.log('All done');
    V$.with(_db)
      .deleteAll()
      .then(() => done())
  })
})