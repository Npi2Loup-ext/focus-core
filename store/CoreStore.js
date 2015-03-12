//The store is an event emitter.
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var getEntityInformations = require('../definition/entity/builder').getEntityInformations;
var capitalize = require('lodash/string/capitalize');
var Immutable = require('immutable');
var AppDispatcher = require('../dispatcher');
/**
 * @class CoreStore
 */
class CoreStore extends EventEmitter {

  /**
   * Contructor of the store class.
   */
  constructor(config) {
    assign(this, {
      config
    });
    //Initialize the data as immutable map.
    this.data = Immutable.Map({});
    this.customHandler = assign({}, config.customHandler);
    //Register all gernerated methods.
    this.buildDefinition();
    this.buildEachNodeChangeEventListener();
    this.registerDispatcher();
  }

  /**
   * Initialize the store configuration.
   * @param {object} storeConfiguration - The store configuration for the initialization.
   */
  buildDefinition() {
      /**
       * Build the definitions for the entity (may be a subject.)
       * @type {object}
       */
      this.definition = getEntityInformations(
        this.config.definitionPath,
        this.config.customDefinition
      );
      return this.definition;
    }
  /**
  * Build a change listener for each property in the definition. (should be macro entities);
  */
  buildEachNodeChangeEventListener() {
      //Loop through each store properties.
      for (var definition in this.definition) {
        var capitalizeDefinition = capitalize(definition);
        //Creates the change listener
        this[`add${capitalizeDefinition}ChangeListener`] = function (cb) {
            this.addListener(`${definition}:change`, cb);
        };
        //Create an update method.
        this[`update${capitalizeDefinition}`] = function (dataNode) {
          //CheckIsObject
          this.data = this.data.set(definition,dataNode);
          this.emit(`${definition}:change`);
        };
        //Create a get method.
        this[`get${capitalizeDefinition}`] = function () {
          return this.data.get(definition).toJS();
        };
      }
    }
  /**
   * The store registrer itself on the dispatcher.
   */
  registerDispatcher(){
    var currentStore = this;
    this.dispatch = AppDispatcher.register(function(transferInfo) {
      var rawData = transferInfo.action.data;
      var type = transferInfo.action.type;
      for(var node in rawData){
        if(currentStore.definition[node]){
          //Call a custom handler if this exists.
          if(currentStore.customHandler && currentStore.customHandler[node] &&  currentStore.customHandler[node][type]){
            currentStore.customHandler[node][type].call(currentStore, rawData[node])
          }else {
            //Update the data for the given node. and emit the change/.
            currentStore[`${type}${capitalize(node)}`](rawData[node]);
          }
        }
      }
      console.log('dispatchHandler:action', transferInfo);
    });
  }
    /**
     * Add a listener on a store event.
     * @param {string}   eventName - Event name.
     * @param {Function} cb - CallBack to call on the event change name.
     */
  addListener(eventName, cb) {
    this.on(eventName, cb);
  }
}
module.exports = CoreStore;
