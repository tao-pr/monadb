/**
 * Abstract low-level DB Interface
 * @author TaoPR (github.com/starcolon)
 */

var Promise = require('bluebird');
var colors  = require('colors');

class DBInterface {
  constructor(svr, dbname, collection){
    this.svr = svr;
    this.dbname = dbname;
    this.collection = collection;
  }

  find(cond){
    console.log('[find] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  insert(rec){
    console.log('[insert] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  update(cond, updater){
    console.log('[update] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  delete(cond){
    console.log('[delete] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  drop(){
    console.log('[drop] is not implemented.'.yellow);
    return Promise.resolve(this);
  }
}

class Cursor {
  constructor(db){
    assert.deepEqual(db.constructor.name, 'DBInterface', '[Cursor] needs to be initialised with a [DBInterface].');
  }

  static with(db){
    var cursor = new Cursor(db);
    return cursor;
  }

  static where()

}

module.exports = {
  'DBInterface': DBInterface,
  'Cursor': Cursor
}