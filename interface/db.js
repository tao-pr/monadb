/**
 * Abstract low-level DB Interface
 * @author TaoPR (github.com/starcolon)
 */

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

  /**
   * Exhaustive version of querying
   */
  load(cond, sort){
    console.warn('[find] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  /**
   * Iterative version of querying
   */
  iterate(cond, f, sort){
    console.warn('[iterate] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  getById(id){
    console.warn('[getById] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  update(cond, updater){
    console.warn('[update] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  updateById(id, updater){
    console.warn('[updateById] is not implemented'.yellow);
    return Promise.resolve(this);
  }

  insert(rec){
    console.warn('[insert] is not implemented.'.yellow);
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

  deleteById(id){
    console.warn('[deleteById] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

  drop(){
    console.warn('[drop] is not implemented.'.yellow);
    return Promise.resolve(this);
  }

}


module.exports = DBInterface;