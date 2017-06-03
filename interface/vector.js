/**
 * Database operation vector 
 * @author TaoPR (github.com/starcolon)
 */

var assert  = require('assert');
var DB      = require('./db');
var colors  = require('colors');
var Promise = require('bluebird');

/**
 * Monadic container of a database operation
 */
class Vector {
  constructor(db){
    // TAOTODO: [db] must be [DBInterface] or inheritence of it
    
    var supportedPrototypes = ['MongoDB'];

    assert.deepEqual(
      supportedPrototypes.indexOf(db.constructor.name)>=0, 
      true, 
      '[Cursor] needs to be initialised with a [DBInterface].');
    this.filterCondition = {};
    this.operation = Promise.resolve(db);
  }

  /**
   * Wraps a [DBInterface] into a [Vector]
   */
  static with(db){
    return new Vector(db);
  }

  where(condition){
    var self = this;
    self.filterCondition = condition;
    return self;
  }

  insert(record){
    var self = this;
    self.operation = self.operation.then((db) => db.insert(record))
    return self;
  }

  set(valueUpdates){
    var self = this;
    self.operation = self.operation.then((db) => 
      db.update(self.filterCondition, valueUpdates))
    return self;
  }

  count(){
    var self = this;
    self.operation = self.operation.then((db) => db.count(self.filterCondition))
    return self;
  }

  delete(){
    var self = this;
    self.operation = self.operation.then((db) => db.delete(self.filterCondition))
    return self;
  }

  forEach(f){
    var self = this;
    self.operation = self.operation.then((db) => db.forEach(f))
    return self;
  }

  do(){
    var self = this;
    return self.operation;
  }

  pluck(f){
    var self = this;
    self.operation = self.operation.then((any) => f(any));
    return self;
  }
}

module.exports = Vector;