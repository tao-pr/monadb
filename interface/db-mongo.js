/**
 * MongoDB interface
 * @author TaoPR (github.com/starcolon)
 */

var Promise = require('promise');
var colors  = require('colors');
var mongo   = require('mongodb');
var DB      = require('./db');

class MongoDB extends DB {
  constructor(options){
    let svr = options.svr;
    let dbname = options.dbname;
    let collection = options.collection;
    let verbose = options.verbose || false;

    super(svr, dbname, collection, verbose);

    let connUrl = `mongodb://localhost:27017`;
    this.pool = new mongo.MongoClient(connUrl, {useUnifiedTopology: true});
  }

  start(){
    var self = this;
    return new Promise((done, reject) => {
      return this.pool.connect((e) => {
        console.log(`Connecting to : ${connUrl}`);
        if (e){
          console.error(`Error connecting to : ${connUrl}`);
          return Promise.reject(e)
        }
        else {
          console.log(`Connected : ${connUrl}`);
          self.db = self.pool.db(self.dbname);
        }
      })
    })
  }

  release(){
    this.pool.close(); // Terminate the connection
  }

  load(cond, sort){
    var self = this;
    return new Promise((done, reject) => {
      var loader = self.db.find(cond || {});
      if (sort){
        loader = loader.sort(sort)
      }
      loader.toArray(function(err,ns){
        if (err) reject(err);
        else done(ns);
      })
    })
  }

  findById(id){
    var self = this;
    return new Promise((done, reject) => {
      self.db
        .find({_id: new mongo.ObjectId(id)})
        .toArray((err, ns) => {
          if (err){
            return reject({fn: 'getById', error: err})
          }
          else {
            return done(ns[0])
          }
        })
    })
  }

  iterate(cond, f, sort){
    var self = this;
    return new Promise((done, reject) => {
      var cursor = self.db.find(cond || {});
      cursor.each((err,n) => {
        if (err) return reject(err);
        else if (n) f(n);
        else {
          // End of inputs, [n] will be NULL
          done()
        }
      })
    })
    return self;
  }

  insert(rec){
    var self = this;
    return new Promise((done, reject) => {
      self.db.insert(rec, {raw: true}, (err,res) => {
        if (err) {
          if (self.verbose) console.error(`[ERROR] inserting to ${self.collection}`.red);
          return reject(err);
        }
        else {
          return done(res);
        }
      })
    })
  }

  update(cond, updates){
    var self = this;
    return new Promise((done, reject) => {
      // TAOTODO: Multiple records option?
      var options = {raw: true, upsert: false}
      self.db.update(cond, {'$set': updates}, options, (err,res) => {
        if (err){
          console.log(err); // TAODEBUG:
          console.log(updates)
          if (self.verbose) console.error(`[ERROR] updating to ${self.collection}`.red);
          return reject(err);
        }
        else {
          // TAOTODO: This should <bind> some useful value
          return done();
        }
      })
    })
  }

  count(cond){ 
    var self = this;
    return new Promise((done, reject) => {
      self.db.count(cond, (err,n) => {
        if (err){
          if (self.verbose) console.error(`[ERROR] counting number of records in ${self.collection}`.red);
          return reject(err);
        }
        else {
          return done(n);
        }
      })
    })
  }

  delete(cond){
    var self = this;
    return new Promise((done, reject) => {
      self.db.remove(cond, (err,res) => {
        if (err){
          if (self.verbose) console.error(`[ERROR] deleting records from ${self.collection}`.red);
          return reject(err);
        }
        else {
          return done();
        }
      })
    })
  }

  agg(keys,by,sort,prefilter){
    var self = this;
    return new Promise((done, reject) => {
      // keys = ['key1', 'key2']
      // by   = {count: {$sum: 1}}
      // sort = {val1: -1, val2: 1}
      
      // Construct the operation chain for Mongo aggregation
      let ops = [];
      if (prefilter) ops.push({'$match': prefilter});

      let group = {'_id': Object.fromEntries(keys.map(k => [k, '$'+k]))};
      Object.entries(by).forEach(kv => {
        let [col,how] = kv;
        group[col] = how
      })
      ops.push({'$group': group});

      if (sort) ops.push({'$sort':sort})

      self.db.aggregate(ops, (err,res) => {
        if (err){
          if (self.verbose) console.error(`[ERROR] deleting records from ${self.collection}`.red);
          return reject(err);
        }
        else {
          return done(err);
        }
      })
    })
  }

}

Object.assign(MongoDB, DB);

module.exports = MongoDB;