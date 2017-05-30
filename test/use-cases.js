/**
 * Use cases
 * @author TaoPR (github.com/starcolon)
 */

var jasmine   = require('jasmine');
var DB        = require('../interface/db');
var Vector    = require('../interface/vector');

var _db       = new DB('localhost', 'test_monad', 'one');

describe('Database Operations', function(){
  
  var vector = null;

  beforeAll(function(done){
    console.log('Initialising')
    vector = Vector.with(_db);
    // TAOTODO: Ensure all records are deleted beforehand
    done();
  })

  it('should initialise a new database vector', function(done){
    expect(vector.constructor.name).toEqual('Vector');
    done();
  })

  it('should add a new record', function(done){
    vector.insert({a: 100, b: [250]})
          .count()
          .do()
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