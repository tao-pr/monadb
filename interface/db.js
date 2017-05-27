/**
 * Abstract low-level DB Interface
 * @author TaoPR (github.com/starcolon)
 */

var Promise = require('bluebird');
var colors  = require('colors');

class Connection {
  constructor(svr, dbname, collection){
    this.svr = svr;
    this.dbname = dbname;
    this.collection = collection;
  }
}

class Cursor {
  static with(db){
    assert.deepEqual(db.constructor.name, 'DB', '[Cursor] needs to be initialised with a [DB].');
    this.db = db;
  }
}

module.exports = {
  'Connection': Connection,
  'Cursor': Cursor
}