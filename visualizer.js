class Visualizer {
  constructor(canvas){
    this.canvas = canvas;
    this.vectors = [];

    this.#setHandlers();

    this.paramsManager = new SaverManager("#saverManager", this);
  }

  #setHandlers(){
    this.canvas.events.on("frame", ctx => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      this.vectors.forEach(vector => vector.display(ctx, { scale: canvas.scale }));
    });


    this.canvas.events.on("mouseDown", async (x, y) => {
      const whenMouseUp = new Promise(resolve => document.addEventListener("mouseup", resolve, {once: true}))
        .finally(() => whenMouseUp.done = true);

      const onMove = (cursorX, cursorY) => ([x, y] = [cursorX, cursorY]);
      this.canvas.events.on("mouseMove", onMove);

      while (whenMouseUp.done !== true){
        await delay(50);
        this.vectors.forEach(vector => vector._taked = []);
        const sourceVector = { position: {x, y}, power: 6 };
        new Light({ force: 25, sourceVector, receivers: this.vectors });
      }

      this.canvas.events.removeListener("mouseMove", onMove);
    });

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
}


const canvas = new Canvas("canvas");
canvas.node.focus();

globalThis.visualizer = new Visualizer(canvas);



window.addEventListener("message", (messageEvent) => {
  console.log(messageEvent);
});
