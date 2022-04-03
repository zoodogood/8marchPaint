class Canvas {
  #loop;

  constructor(querySelector, size = {}){
    this.events = new EventEmitter();
    this.node = document.querySelector(querySelector);

    this.node.width  = size.width  ?? 470;
    this.node.height = size.heigth ?? 470;

    this.ctx = this.node.getContext("2d");
    this.#loop = new GameLoop(() => this.events.emit("frame", this.ctx));

    this.#_fixPixelRatio();
    this.#setHandlers();

    Object.assign(this.ctx, {
      textBaseline: "top"
    });
  }

  #setHandlers(){
    this.node.addEventListener("click",       this.#clickHandler.bind(this));
    this.node.addEventListener("mousedown",   this.#mouseDownHandler.bind(this));
    this.node.addEventListener("mouseup",     this.#mouseUpHandler.bind(this));
    this.node.addEventListener("mousemove",   this.#mouseMoveHandler.bind(this));
    this.node.addEventListener("mouseleave",  this.#mouseLeaveHandler.bind(this));
    this.node.addEventListener("mouseenter",  this.#mouseEnterHandler.bind(this));
    this.node.addEventListener("contextmenu", this.#openContextHandler.bind(this));

    this.node.addEventListener("keydown", keyEvent => {
      let stringView = `KEY_${ keyEvent.keyCode }`;

      if (keyEvent.ctrlKey)
        stringView += " + CTRL";

      if (keyEvent.shiftKey)
        stringView += " + SHIFT";

      if (keyEvent.altKey)
        stringView += " + ALT";

      if (keyEvent.repeat)
        stringView += "--REPEAT";

      this.events.emit("keyDown", stringView);
      globalThis.__lastPressedKey = keyEvent.keyCode;
    });

    this.node.addEventListener("wheel", wheekEvent => {
      wheekEvent.preventDefault();
      const stringView = `WHEEL_${ wheekEvent.deltaY < 0 ? "UP" : "DOWN" }`;
      this.events.emit("keyDown", stringView);
    });

    const resizeObserver = new ResizeObserver(this.#resizeHandler.bind(this));
    resizeObserver.observe(this.node);
  }

  #clickHandler(clickEvent){
    const x = clickEvent.offsetX;
    const y = clickEvent.offsetY;

    this.events.emit("click", x, y);
  }

  #mouseDownHandler(clickEvent){
    const x = clickEvent.offsetX;
    const y = clickEvent.offsetY;

    const eventName = ["mouseDown", "mouseMiddleDown", "mouseRigthDown"][clickEvent.button];
    if (!eventName)
      throw new Error("Unknow mouse functional");

    this.events.emit(eventName, x, y);
  }

  #mouseUpHandler(clickEvent){
    const x = clickEvent.offsetX;
    const y = clickEvent.offsetY;

    const eventName = ["mouseUp", "mouseMiddleUp", "mouseRigthUp"][clickEvent.button];
    if (!eventName)
      throw new Error("Unknow mouse functional");

    this.events.emit(eventName, x, y);
  }

  #mouseEnterHandler(mouseEvent){
    this.events.emit("mouseEnter");
  }

  #mouseLeaveHandler(mouseEvent){
    this.events.emit("mouseLeave");
  }

  #mouseMoveHandler(mouseEvent){
    const x = mouseEvent.offsetX;
    const y = mouseEvent.offsetY;

    this.events.emit("mouseMove", x, y);
  }

  #openContextHandler(mouseEvent){
    mouseEvent.preventDefault();
    const x = mouseEvent.offsetX;
    const y = mouseEvent.offsetY;

    this.events.emit("rigthClick", x, y);
  }

  #resizeHandler(entries){
    console.log(entries);
  }


  #_fixPixelRatio(){
    const DPI = window.devicePixelRatio;
    const { width, height } = this.node.getBoundingClientRect();
    const [ scaleX, scaleY ] = [this.node.width / width, this.node.height / height];
    this.ctx.scale(scaleX, scaleY);
    this.ctx.scaleFactor = { x: scaleX, y: scaleY };
  }
}


class GameLoop {
  #freeze;
  #ended;

  #lastLoopTimestamp = Date.now();

  constructor(callback){
    this.callback = callback;
    this.loop = this.loop.bind(this);

    globalThis.requestAnimationFrame(this.loop);
  }

  async loop(){
    this.callback();
    if (this.#freeze?.status === true)
      await this.#freeze.promise;

    if (this.#ended?.status === true)
      return;

    const passed = Date.now() - this.#lastLoopTimestamp;
    this.#lastLoopTimestamp += passed;

    globalThis.fps = ~~(1000 / passed);

    requestAnimationFrame(this.loop);
  }

  stop(){
    let resolveFunc = null;
    const promise = new Promise(resolve => resolveFunc = resolve);

    this.#freeze = {
      status: true,
      promise
    }
  }

  resume(){
    if (this.#freeze?.status !== true)
      return null;

    this.#freeze.status = false;
    this.#freeze.promise.resolve();

    delete this.#freeze.promise;
  }

  end(){
    this.#ended = {
      status: true
    };
  }
}
