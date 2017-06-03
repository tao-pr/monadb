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
    var supportedPrototypes = ['MongoDB'];
    assert.deepEqual(
      supportedPrototypes.indexOf(db.constructor.name)>=0, 
      true, 
      '[Cursor] needs to be initialised with a [DBInterface].');
    this.db = db;
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

  whereAll(){
    var self = this;
    self.filterCondition = {};
    return self;
  }

  insert(record){
    var self = this;
    self.operation = self.operation.then(() => self.db.insert(record))
    return self;
  }

  set(valueUpdates){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.update(self.filterCondition, valueUpdates))
    return self;
  }

  count(){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.count(self.filterCondition))
    return self;
  }

  delete(){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.delete(self.filterCondition))
    return self;
  }

  loadAll(){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.loadAll(self.filterCondition))
    return self;
  }

  forEach(f){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.forEach(f))
    return self;
  }

  /**
   * Take the recent output of the operation
   * to an external [[Promise]]
   */
  then(promise){
    var self = this;
    return Promise.resolve(self.operation).then(promise);
  }

  /**
   * Take the recent output of the operation
   * to an external [[Function]]
   */
  pluck(f){
    var self = this;
    self.operation = self.operation.then((any) => f(any));
    return self;
  }

  onFailure(f){
    var self = this;
    self.operation = self.operation.catch((e) => f(e));
    return self;
  }
}

module.exports = Vector;