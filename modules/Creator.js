class Creator {
  constructor(canvas){
    this.canvas = canvas;
    this.cursor = new Cursor(this);

    this.events = new EventEmitter();

    this.vectors = [];

    this.saverManager  = new SaverManager("#saverManager", this);
    this.paramsManager = new ParamsManager("#paramsManager", this);

    this.#setHandlers();
  }

  #setHandlers(){
    this.canvas.events.on("click", (x, y) => {
      const { color, size, angle } = this.params;
      const vector = new Vector({ x, y, color, size, angle });
      this.vectors.push(vector);
    });

    this.canvas.events.on("frame", ctx => {
      ctx.clearRect(0, 0, ctx.canvas.width / ctx.scaleFactor.x, ctx.canvas.height / ctx.scaleFactor.y);
      this.vectors.forEach(vector => vector.display(ctx));
      this.cursor.display(ctx);
    });

    this.canvas.events.on("keyDown", string => this.constructor.KEY_BUILDING[ string ]?.call(this));

    this.canvas.events.on("mouseRigthDown", async (x, y) => {

      const whenMouseUp = new Promise(resolve => document.addEventListener("mouseup", resolve, {once: true}))
        .finally(() => whenMouseUp.done = true);

      const onMove = (cursorX, cursorY) => ([x, y] = [cursorX, cursorY]);
      this.canvas.events.on("mouseMove", onMove);

      while (whenMouseUp.done !== true){
        let nearest = { vector: null, distance: 18 };
        for (const vector of this.vectors){
          const distance = ((x - vector.position.x) ** 2 + (y - vector.position.y) ** 2) ** 0.5;
          if (distance < nearest.distance)
            nearest = { vector, distance };

        }
        if (nearest.vector !== null){
          const index = this.vectors.indexOf(nearest.vector);
          if (!~index)
            throw new Error("how can this be??");

          this.vectors.splice(index, 1);
        }
        await delay(350);
      }

      this.canvas.events.removeListener("mouseMove", onMove);



    });

    document.addEventListener("keydown", keyEvent => {
      let stringView = `KEY_${ keyEvent.keyCode }`;

      if (keyEvent.ctrlKey)
        stringView += " + CTRL";

      if (keyEvent.shiftKey)
        stringView += " + SHIFT";

      if (keyEvent.altKey)
        stringView += " + ALT";

      if (keyEvent.repeat)
        stringView += "--REPEAT";

      stringView += "--GLOBAL";
      this.constructor.KEY_BUILDING[ stringView ]?.call(this);
    });
  }

  get params(){
    const  { color, size, angle } = this.cursor;
    return { color, size, angle };
  }

  toJSON(){

    const canvas = {
      title:  this.canvas.title,
      width:  this.canvas.node.width,
      height: this.canvas.node.height,
      background: getComputedStyle( this.canvas.node ).backgroundColor.match(/\d+/g)

    };
    const object = {type: "8marchCreator", canvas, vectors: this.vectors};
    return JSON.stringify(object, null, 2);
  }

  takeVectors(vectorsJSON){
    let data;
    try {
      data = JSON.parse(vectorsJSON);
      if (data.type !== "8marchCreator")
        throw new TypeError("not that json");


    } catch (err) {
      alert("Во время загрузки произошла ошибка. Подробнее в консоли разработчика");
      console.log(`\n\n-- ОШИБКА ЗАГРУЗКИ ${ new Intl.DateTimeFormat("ru-ru", {minute: "2-digit", hour: "2-digit"}).format() }`);
      console.error(err);
      return;
    }
    const vectors = data.vectors
      .map(vector => new Vector(vector));

    vectors.forEach(vector => vector.state.opacity = 0);
    this.vectors.push(...vectors);

    if (data.canvas.title){
      this.canvas.title = data.canvas.title;
      document.title = `${ this.canvas.title } - Визуализация`;
    }

    this.canvas.node.width  = Math.max(data.canvas.width  ?? 0, this.canvas.node.width);
    this.canvas.node.height = Math.max(data.canvas.height ?? 0, this.canvas.node.height);
    this.canvas.node.style.backgroundColor = `rgb(${ data.canvas.background.join(", ") })`;
  }

  static KEY_BUILDING = {
    "WHEEL_UP": function(){
      this.cursor.setAngle( this.cursor.angle + Math.PI / 12 );
    },

    "WHEEL_DOWN": function(){
      this.cursor.setAngle( this.cursor.angle - Math.PI / 12 );
    },

    // +
    "KEY_187": function(){
      this.cursor.setSize( this.cursor.size + 1 );
    },
    "KEY_187--REPEAT": function(){
      this.constructor.KEY_BUILDING.KEY_187.call(this);
    },

    // -
    "KEY_189": function(){
      this.cursor.setSize( this.cursor.size - 1 );
    },
    "KEY_189--REPEAT": function(){
      this.constructor.KEY_BUILDING.KEY_189.call(this);
    },

    // Z
    "KEY_90 + CTRL": function(){
      this.vectors.pop();
    },

    // P
    "KEY_80--GLOBAL": async function(){
      const { pageX, pageY } = globalThis.pageCursorPosition;
      const color = await new Paletter(pageX, pageY, {currentColor: this.cursor.color})
        .whenColor;

      if (color === null)
        return;

      this.cursor.setColor( ...color );
    },

    // Digits:
    "KEY_48": function(){
      this.cursor.setColor("255", "255", "255");
    },
    "KEY_49": function(){
      this.cursor.setColor("255", "96", "48");
    },
    "KEY_50": function(){
      this.cursor.setColor("180", "255", "255");
    },
    "KEY_51": function(){
      this.cursor.setColor("255", "203", "219");
    },
    "KEY_52": function(){
      this.cursor.setColor("255", "96", "48");
    },
    "KEY_53": function(){
      this.cursor.setColor("255", "96", "48");
    },
    "KEY_54": function(){
      this.cursor.setColor("255", "96", "48");
    },
    "KEY_55": function(){
      this.cursor.setColor("255", "96", "48");
    },
    "KEY_56": function(){
      this.cursor.setColor("255", "96", "48");
    },
    "KEY_57": function(){
      this.cursor.setColor("40", "200", "48");
    }

  }
}


class Cursor extends Vector {

  constructor(creator){
    super({});

    this.creator = creator;
    this.canvas = this.creator.canvas;
    this.setSize(8);

    this.#setHandlers();
  }



  #setHandlers(){

    this.canvas.events.on("mouseLeave", () => this.visible = false);

    this.canvas.events.on("mouseEnter", () => this.visible = true);


    this.canvas.events.on("mouseMove", (x, y) => {


      this.position.x = x;
      this.position.y = y;

      this.display(this.canvas.ctx);
    });
  }

  display(ctx){
    const restoreValue = ctx.globalAlpha;
    ctx.globalAlpha = this.visible ? 0.5 : 0;
    super.display(ctx);
    ctx.globalAlpha = restoreValue;
  }


  static MAXIMUM_SIZE = 24;
}
