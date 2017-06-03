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
      .pluck((n) => {
        expect(n).toEqual(1);
      })
      .loadAll()
      .pluck((recs) => {
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
      .pluck((ids) => {
        expect(ids.length).toEqual(records.length);
      })
      .countAll()
      .pluck((n) => {
        expect(n).toEqual(records.length+1);
      })
      .count({a: {'$gte': 400}})
      .pluck((n) => {
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
      .pluck((c) => {
        expect(c).toEqual(3);
        done();
      })
  })

  it('should delete a record based on condition')

  it('should handle exception')

  afterAll(function(){
    console.log('All done');
    V$.with(_db)
      .deleteAll()
      .then(() => done())
  })
})