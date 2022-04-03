
class EventEmitter {
  constructor(){
    this.events = {};
  }



  on(event, listener){
    if (typeof this.events[event] !== "object")
      this.events[event] = [];

    this.events[event].push(listener);
  }



  removeListener(event, listener){
    if (typeof this.events[event] !== "object")
      return;

    let index = this.events[event].indexOf(listener);
    if (~index)
      this.events[event].splice(index, 1);

  }



  emit(event, ...args){
    if (typeof this.events[event] !== "object")
      return;

    let listeners = this.events[event];

    for (let listener of listeners)
      listener.apply(this, args);
  }




  once(event, listener){
    let callback = (...args) => {
      this.removeListener(event, callback);
      listener.apply(this, args);
    }
    this.on(event, callback);
  }



}


globalThis.events = new EventEmitter();
