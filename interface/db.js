/**
 * Abstract low-level DB Interface
 * @author TaoPR (github.com/starcolon)
 */

var Promise = require('bluebird');
var colors  = require('colors');

/**
 * All of methods of [[DBInterface]] must always return a [[Promise]]
 */
class DBInterface {
  constructor(svr, dbname, collection, verbose){
    this.svr = svr;
    this.dbname = dbname;
    this.collection = collection;
    this.verbose = verbose || false;
  }

  find(cond){
    console.warn('[find] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  insert(rec){
    console.warn('[insert] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  update(cond, updater){
    console.warn('[update] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  count(cond){
    console.warn('[count] is not implemented'.yellow);
    return Promise.resolve(this);
  }

  delete(cond){
    console.warn('[delete] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  drop(){
    console.warn('[drop] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  forEach(f){
    console.warn('[forEach] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

}


module.exports = DBInterface;