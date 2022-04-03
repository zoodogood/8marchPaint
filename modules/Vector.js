class Vector {
  #angle;
  #color;
  #size;

  #lightPower;
  #layer;

  constructor({ x, y, angle, color, size, layer, power }){
    this.state = {};

    this.position = {
      x: x ?? 0,
      y: y ?? 0
    }

    this.#angle = angle ?? 0;
    this.#color = color ?? [255, 255, 255];
    this.#size  = size  ?? 8;
    this.#lightPower = power ?? 3;

    this.#layer = layer ?? null;
  }


  display(ctx){
    ctx.fillStyle = `rgba(${ this.color[0] }, ${ this.color[1] }, ${ this.color[2] }, ${ this.state.opacity ?? 1 })`;
    ctx.font = `${ this.size / 8 }rem cursive`;

    const positionX = this.position.x;
    const positionY = this.position.y;

    ctx.save();
    ctx.translate(positionX, positionY);
    ctx.rotate( this.angle );


    const { width: baseWidth, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText("8");
    const baseHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;

    // Если объект повернут на 90°, его высота и ширина поменяются местами, этим объясняется наличие высоты в выражении ширины объекта
    const width  = Math.abs(baseWidth * Math.cos(this.angle)) + Math.abs(baseHeight * Math.sin(this.angle));
    const height = Math.abs(baseWidth * Math.sin(this.angle)) + Math.abs(baseHeight * Math.cos(this.angle));

    ctx.fillText("8", -width / 2, -height / 2);
    ctx.restore();
  }

  getPowerMultiplayer(){
    return this.#lightPower;
  }

  get angle(){
    return this.#angle;
  }
  setAngle(angle){
    this.#angle = angle;
  }

  get color(){
    return this.#color;
  }
  setColor(red, green, blue){
    this.#color = [red, green, blue];
  }

  get size(){
    return this.#size;
  }
  setSize(size){
    if (size <= 0)
      size = 1;

    this.#size = size;
  }

  get layerID(){
    return this.#layer;
  }


  toJSON(){
    return {
      x: this.position.x,
      y: this.position.y,
      size:  this.size,
      angle: this.angle,
      color: this.color,
      power: this.power
    }
  }


}
