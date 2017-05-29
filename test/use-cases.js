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
    vector = Vector.with(_db);
    done();
  })

  it('should initialise a new database vector', function(done){
    expect(vector.constructor.name).toEqual('Vector');
  })
})