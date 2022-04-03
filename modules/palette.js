class Paletter {
  #whenColor;
  #listeners = {};


  constructor(x, y, { currentColor = "#000000" } = {}){
    this.node = document.createElement("div");
    this.node.className = "palette-container";

    this.node.style.left = `${ x }px`;
    this.node.style.top  = `${ y }px`;
    document.body.append(this.node);

    this.setColor(currentColor);
    this.constructor.addToPlaceholder(currentColor);
    this.colorsPlaceholders = this.constructor.colorsPlaceholders.slice(0, 20);



    this.events = new EventEmitter();
    this.#whenColor = new Promise(resolve => this.events.once("value", resolve));

    this.#initInnerHTML();
    this.#setHandlers();


  }

  get whenColor(){
    return this.#whenColor;
  }


  remove(){
    this.node.remove();
    this.events.emit("value", null);

    const listeners = this.constructor.LISTENERS_TABLE;
    listeners.forEach(({ id, target, remove }) => {
      if (typeof target === "function")
        target = target(this);

      const callback = this.#listeners[id];
      remove(target, callback);
    });
  }


  setColor(color){
    color = this.constructor.parseColor(color);
    this.currentColor = color;

    this.node.style.setProperty("--palette--color", color);
  }


  #setHandlers(){
    const listeners = this.constructor.LISTENERS_TABLE;
    listeners.forEach(({ id, target, callback, add }) => {
      if (typeof target === "function")
        target = target(this);

      callback = callback.bind(this);
      this.#listeners[id] = callback;
      add(target, callback);
    });
  }


  #initInnerHTML(){
    this.node.innerHTML = `
      <input type = "color" class = "palette-colorSelect"></input>
      <button class = "palette-submit">Oк!</button>
      <ul>
        ${(() => {
            const toLiTag = ([red, green, blue]) => `
              <li
                title = "R: ${ red } G: ${ green } B: ${ blue }"
                data-color = "${ red } ${ green } ${ blue }"
                style = "--palette-colorPlaceholder--color: rgba(${ red }, ${ green }, ${ blue })"
                class = "palette-colorPlaceholder">
              </li>`;

            return this.colorsPlaceholders
              .map(this.constructor.parseColor)
              .map(toLiTag)
              .join("\n");
          })()
        }
      </ul>

    `;
    this.node.querySelector(".palette-colorSelect").value = "#" + this.currentColor
      .map(decimalNumber => (+decimalNumber).toString(16)).join("");
  }


  static LISTENERS_TABLE = [
    {
      id: "onDocumentClick",
      target: document,
      callback: function(clickEvent){
        const isIncludes = [...clickEvent.path].includes(this.node);
        if (isIncludes)
          return;

        this.remove();
      },
      add:    (target, callback) => target.addEventListener("click", callback),
      remove: (target, callback) => target.removeEventListener("click", callback)
    },
    {
      id: "onDocumentRightClick",
      target: document,
      callback: function(clickEvent){
        const isIncludes = [...clickEvent.path].includes(this.node);
        if (isIncludes)
          return;

        this.remove();
      },
      add:    (target, callback) => target.addEventListener("contextmenu", callback),
      remove: (target, callback) => target.removeEventListener("contextmenu", callback)
    },
    {
      id: "onEscapePress",
      target: document,
      callback: function(keyEvent){
        if (keyEvent.key !== "Escape")
          return;

        this.remove();
      },
      add:    (target, callback) => target.addEventListener("keydown", callback),
      remove: (target, callback) => target.removeEventListener("keydown", callback)
    },
    {
      id: "onColorSubmit",
      target: (palette) => palette.node.querySelector(".palette-submit"),
      callback: function(){
        const value = this.node.querySelector(".palette-colorSelect").value;

        const [red, green, blue] = this.constructor.parseColor(value);

        this.events.emit("value", [red, green, blue]);
        this.remove();
      },
      add:    (target, callback) => target.addEventListener("click", callback),
      remove: (target, callback) => target.removeEventListener("click", callback)
    },
    {
      id: "onColorPlaceholderClick",
      target: (palette) => palette.node.querySelector("ul"),
      callback: function(clickEvent){
        if (clickEvent.target === this.node.querySelector("ul"))
          return;

        const color = clickEvent.target.getAttribute("data-color")
          .split(" ");

        this.events.emit("value", color);
        this.remove();
      },
      add:    (target, callback) => target.addEventListener("click", callback),
      remove: (target, callback) => target.removeEventListener("click", callback)
    },
    {
      id: "onColorChange",
      target: (palette) => palette.node.querySelector(".palette-colorSelect"),
      callback: function(inputEvent){
        const color = this.node.querySelector(".palette-colorSelect").value;
        this.setColor(color);
      },
      add:    (target, callback) => target.addEventListener("input", callback),
      remove: (target, callback) => target.removeEventListener("input", callback)
    }
  ];

  static addToPlaceholder(color){
    color = this.parseColor(color).join(" ");

    const index = this.colorsPlaceholders.indexOf(color);
    if (~index)
      this.colorsPlaceholders.splice(index, 1);

    this.colorsPlaceholders.unshift(color);
  };

  static colorsPlaceholders = [
    "255 255 255", "170 170 170", "80 80 80",   "0 0 0",
    "255 30 30",   "30 200 30",   "30 30 200",  "255 255 30",
    "255 40 120",  "255 120 40",  "120 255 40", "40 255 120",
    "40 120 255",  "120 40 255"
  ];

  static parseColor(color){
    if (color instanceof Array)
      return color.slice(0, 3);


    if (color.startsWith("#")){
      color = [...color.matchAll(/[0-9a-f]{2}/g)]
        .map(hexadecimal => parseInt(hexadecimal, 16));

      return color.slice(0, 3);
    }

    if (color.startsWith("rgb")){
      color = [...color.matchAll(/\d+/g)];
      return color.slice(0, 3);
    }


    if (/^(?:\d{1,3}(?:\s|$))+$/.test(color)){
      color = color.split(" ");
      return color.slice(0, 3);
    }


    throw new Error(`Unknow Color ${ color }`);
  };
}
