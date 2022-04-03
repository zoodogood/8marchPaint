class Light {
  constructor({ force, sourceVector, receivers }){
    const sourceX = sourceVector.position.x;
    const sourceY = sourceVector.position.y;

    receivers = receivers.filter(vector => !sourceVector.layerID || vector.layerID === sourceVector.layerID);

    for (const receiver of receivers){

      if (receiver._taked.length >= this.constructor.RECEIVERS_LIMIT)
        continue;

      if (receiver._taked.includes(sourceVector))
        continue;

      const distance = ((sourceX - receiver.position.x) ** 2 + (sourceY - receiver.position.y) ** 2) ** 0.5;
      if (force - distance <= 0)
        continue;

      receiver.takeLigth(force - distance);
      receiver._taked.push(sourceVector);
      new Light({ force: receiver.state.opacity * 25, sourceVector: receiver, receivers: globalThis.visualizer.vectors });
    }
  }

  static RECEIVERS_LIMIT = 5;
}

Vector.prototype.takeLigth = function(force){
  if (this.state.opacity > 1)
    return;

  force *= this.size;
  force *= 1.2 ** this.getPowerMultiplayer();
  this.state.opacity += 0.001 * force;
}
