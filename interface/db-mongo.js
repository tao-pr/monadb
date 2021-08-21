/**
 * MongoDB interface
 * @author TaoPR (github.com/tao-pr)
 */

var colors  = require('colors');
var MongoClient   = require('mongodb').MongoClient;
var DB      = require('./db');

class MongoDB extends DB {
  constructor(options){
    let svr = options.svr;
    let dbname = options.dbname;
    let collection = options.collection;
    let verbose = options.verbose || false;

    super(svr, dbname, collection, verbose);
  }

  start(){
    var self = this;
    let dbname = this.dbname;
    this.client = null;
    return new Promise((done, reject) => {
      MongoClient.connect('mongodb://localhost:27017/', (e,client) => {
        if (e){
          console.error('Error connecting to MongoDB');
          return reject(e)
        }
        else {
          if (self.verbose)
            console.log('MongoDB connected'.green);
          self.client = client;
          self.db = self.client.db(dbname).collection(self.collection);
          return done(self)
        }
      })
    })
  }

  release(){
    if (this.client){
      this.client.close(); // Terminate the connection
    }
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
      const p = self.db.find(cond || {})
        .forEach((n) => {
          f(n)
        })

      p.then(() => done())
    })
    return self;
  }

  insert(rec){
    var self = this;
    return new Promise((done, reject) => {
      self.db.insertMany(rec, {raw: true}, (err,res) => {
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
      var options = {raw: true, upsert: false}
      self.db.updateMany(cond, {'$set': updates}, options, (err,res) => {
        if (err){
          if (self.verbose){
            console.error(err);
            console.error(`[ERROR] updating to ${self.collection}`.red);
          }
          return reject(err);
        }
        else {
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
      self.db.deleteMany(cond, (err,res) => {
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

      self.db.aggregate(ops).toArray((err, g) => {
        if (err) reject(err);
        done(g)
      })
    })
  }

  multiAgg(aggs){
    var self = this;
    return new Promise((done, reject) => {
      // keys = ['key1', 'key2']
      // by   = {count: {$sum: 1}}
      // sort = {val1: -1, val2: 1}
      
      // Construct the operation chain for Mongo aggregation
      let ops = [];
      aggs.forEach((agg) => {
        var [keys, by, sort, prefilter] = agg
        if (prefilter) ops.push({'$match': prefilter});

        let group = {'_id': Object.fromEntries(keys.map(k => [k, '$'+k]))};
        Object.entries(by).forEach(kv => {
          let [col,how] = kv;
          group[col] = how
        })
        ops.push({'$group': group});

        if (sort) ops.push({'$sort':sort})  
      })
      
      self.db.aggregate(ops).toArray((err, g) => {
        if (err) reject(err);
        done(g)
      })
    })
  }

}

Object.assign(MongoDB, DB);

module.exports = MongoDB;