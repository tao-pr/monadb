/**
 * MonaDB JS
 * Functional interface for database operations
 * @author TaoPR (github.com/starcolon)
 */

var mongoDB = require('./interface/db-mongo');
var V$      = require('./interface/vector');

class MonaDB extends V$ {
  constructor(dbtype, svr, port, dbname, collection){
    var map = {
      'mongo': mongoDB
    }
    if (dbtype in map){
      var db = new map[dbtype]({
        svr: svr, 
        dbname: dbname, 
        port: port,
        collection: collection
      });
      super(db);
    }
    else {
      throw new TypeError(`${dbtype} is not a valid database type.`);
    }
  }
}

module.exports = MonaDB;