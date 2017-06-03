/**
 * Database operation vector 
 * @author TaoPR (github.com/starcolon)
 */

var assert  = require('assert');
var DB      = require('./db');
var colors  = require('colors');
var Promise = require('bluebird');

var clone   = (obj) => JSON.parse(JSON.stringify(obj));

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

  /**
   * Create a new [DBInterface] 
   * which runs straight after [v] has done all of its operations.
   */
  static after(v){
    var v_ = Vector(v.db);
    v_.operation = v.then(() => v_.db);
    return v_;
  }

  insert(record){
    var self = this;
    self.operation = self.operation
      .then(() => self.db.insert(record))
      .then((res) => res.insertedIds[0])
    return self;
  }

  insertMany(records){
    var self = this;
    self.operation = self.operation
      .then(() => Promise.all(records.map(r => self.db.insert(r))))
      .then((ns) => ns.map((n) => n.insertedIds[0]))
    return self;
  }

  set(valueUpdates){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.update(clone(self.filterCondition), valueUpdates))
    return self;
  }

  countAll(){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.count({}))
    return self;
  }

  count(cond){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.count(cond))
    return self;
  }

  delete(cond){
    var self = this;
    if (cond)
      self.operation = self.operation.then(() => 
        self.db.delete(cond))
    else
      console.error('[ERROR] Unable to delete records without given condition'.red);
    return self;
  }

  deleteAll(){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.delete({}))
    return self;
  }

  load(){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.load(cond))
    return self;
  }

  loadAll(){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.load({}))
    return self;
  }

  forEach(cond, f){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.iterate(cond, f))
    return self;
  }

  forEachAll(f){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.iterate({}, f))
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

  /**
   * Execute a function [f] if 
   * the [filterF] which takes the value of the 
   * recent output returns truthy value
   */
  if(filterF, f){
    var self = this;
    self.operation = self.operation.then((v) => {
      if (filterF(v)) f(v);
      return v;
    })
  }
}

module.exports = Vector;