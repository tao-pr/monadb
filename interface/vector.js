/**
 * Database operation vector 
 * @author TaoPR (github.com/starcolon)
 */

var assert  = require('assert');
var DB      = require('./db');
var colors  = require('colors');

var clone   = (obj) => JSON.parse(JSON.stringify(obj));

class VectorError extends Error {
  constructor(msg){
    super(msg);
    this.msg = msg;
    this.name = 'VectorError';
  }
}

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
    this.operation = Promise.resolve(db.start());
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
      .then(() => self.db.insert([record]))
      .then((res) => Object.values(res.insertedIds)[0])
    return self;
  }

  insertMany(records){
    var self = this;
    self.operation = self.operation
      .then(() => self.db.insert(records))
      .then((res) => {
        return Object.values(res.insertedIds)
      })
    return self;
  }

  set(cond,valueUpdates){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.update(cond, valueUpdates))
    return self;
  }

  findById(id){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.findById(id))
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
    else{
      if (self.db.verbose){
        console.error('[ERROR] Unable to delete records without given condition'.red);
      }
      self.operation = self.operation.then(() => {
        throw new VectorError('Delete operation requires a condition.')
      })
    }
    return self;
  }

  deleteAll(){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.delete({}))
    return self;
  }

  load(cond,sort,limit){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.load(cond,sort,limit))
    return self;
  }

  loadAll(sort){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.load({},sort))
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
   * Conditionally take some records 
   * and map then with a given function.
   * The function potentially returns a new Promise of the results.
   */
  map(cond, mapper){
    var self = this;
    return new Promise((done,reject) => 
      self.load(cond).do((ns) => {
        done(ns.map(mapper));
      }).onFailure((e) => reject(e))
    )
  }

  /**
   * Aggregate
   */
  agg(keys,by,sort,prefilter){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.agg(keys,by,sort,prefilter))
    return self;
  }

  /**
   * Multi-level aggregation (aggregation of aggregation)
   */
  multiAgg(aggList){
    var self = this;
    self.operation = self.operation.then(() => 
      self.db.multiAgg(aggList))
    return self;
  }

  /**
   * Take the recent output of the operation
   * to an external [[Promise]]
   */
  then(promise){
    var self = this;
    Promise.resolve(self.operation).then(promise);
    return self;
  }

  /**
   * Take the recent output of the operation
   * to an external [[Function]]
   */
  do(f){
    var self = this;
    self.operation = self.operation.then((any) => f(any));
    return self;
  }

  onFailure(f){
    var self = this;
    self.operation = self.operation.catch((e) => f(e));
    return self;
  }

  asPromise(){
    return this.operation;
  }
}

module.exports = Vector;