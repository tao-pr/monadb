/**
 * Database operation vector 
 * @author TaoPR (github.com/starcolon)
 */

var assert  = require('assert');
var DB      = require('./db');
var colors  = require('colors');
var Promise = require('bluebird');

class Vector {
  constructor(db){
    // TAOTODO: [db] must be [DBInterface] or inheritence of it
    assert.deepEqual(db.constructor.name, 'DBInterface', '[Cursor] needs to be initialised with a [DBInterface].');
  }

  /**
   * Wraps a [DBInterface] into a [Vector]
   */
  static with(db){
    return new Vector(db);
  }

  where(condition){
    return function(v){}
  }

  set(valueUpdates){
    return function(v){}
  }

  save(){}
}

module.exports = Vector;