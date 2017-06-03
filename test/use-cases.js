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

  afterAll(function(){
    console.log('All done');
    // TAOTODO: Delete all records
  })
})