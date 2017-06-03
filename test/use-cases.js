/**
 * Use cases
 * @author TaoPR (github.com/starcolon)
 */

var jasmine   = require('jasmine');
var MongoDB   = require('../interface/db-mongo');
var Vector    = require('../interface/vector');

var _db       = new MongoDB('localhost', 'test_monad', 'one');

describe('Database Operations', function(){
  
  var vector = null;

  beforeAll(function(done){
    console.log('Initialising')
    // Ensure the test database is clean and empty
    vector = Vector.with(_db).delete();
    vector.then(() => done());
  })

  it('should initialise a new database vector', function(done){
    expect(vector.constructor.name).toEqual('Vector');
    done();
  })

  it('should add a new record', function(done){
    Vector.with(_db)
      .insert({a: 100, b: [250]})
      .count()
      .then((c) => {
        expect(c).toEqual(1);
        done();
      })
  })

  it('should query for an existing record', function(done){
    Vector.with(_db)
      .where({b: [250]})
      .count()
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
    Vector.with(_db)
      .insertMany(records)
      .whereAll()
      .count()
      .pluck((n) => {
        expect(n).toEqual(records.length+1);
        done();
      })
  })

  afterAll(function(){
    console.log('All done');
    Vector.with(_db)
      .delete()
      .then(() => done())
  })
})