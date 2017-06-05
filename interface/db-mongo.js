/**
 * MongoDB interface
 * @author TaoPR (github.com/starcolon)
 */

var Promise = require('bluebird');
var colors  = require('colors');
var mongo   = require('mongoskin');
var DB      = require('./db');

class MongoDB extends DB {
  constructor(svr, dbname, collection, verbose){
    super(svr, dbname, collection, verbose);
    var connUrl = `mongodb://localhost/${dbname}`
    console.log(`Connecting to ${connUrl}`.green);
    this.db = mongo.db(connUrl).collection(collection);
  }

  load(cond){
    var self = this;
    return new Promise((done, reject) => {
      self.db.find(cond || {}).toArray(function(err,ns){
        if (err) reject(err);
        else done(ns);
      })
    })
  }

  iterate(cond, f){
    var self = this;
    return new Promise((done, reject) => {
      var cursor = self.db.find(cond || {});
      // TAOTODO: Wait ?
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
          if (verbose) console.error(`[ERROR] inserting to ${self.collection}`.red);
          return reject(err);
        }
        else {
          return done(res);
        }
      })
    })
  }

  update(cond, updater){
    var self = this;
    return new Promise((done, reject) => {
      var options = {raw: true, upsert: true}
      self.db.update(cond, updater, options, (err,res) => {
        if (err){
          if (verbose) console.error(`[ERROR] updating to ${self.collection}`.red);
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
          if (verbose) console.error(`[ERROR] counting number of records in ${self.collection}`.red);
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
          if (verbose) console.error(`[ERROR] deleting records from ${self.collection}`.red);
          return reject(err);
        }
        else {
          return done();
        }
      })
    })
  }
}

Object.assign(MongoDB, DB);

module.exports = MongoDB;