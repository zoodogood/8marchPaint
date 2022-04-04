class Light {
  constructor({ force, sourceVector, receivers }){
    const sourceX = sourceVector.position.x;
    const sourceY = sourceVector.position.y;

    receivers = receivers.filter(vector => !sourceVector.layerID || vector.layerID === sourceVector.layerID);

    force *= this.constructor.FORCE_MULTIPLAYER
    force *= 1.07 ** sourceVector.getPowerMultiplayer();
    force *= 1 + sourceVector.size / 120;

    for (const receiver of receivers){

      if (receiver._taked.length >= this.constructor.RECEIVERS_LIMIT)
        continue;

      if (receiver._taked.includes(sourceVector))
        continue;

      const distance = ((sourceX - receiver.position.x) ** 2 + (sourceY - receiver.position.y) ** 2) ** 0.5;

      globalThis.max = Math.max(receiver.size, globalThis.max ?? 0);
      globalThis.min = Math.min(receiver.size, globalThis.min ?? Infinity);

      if (force - distance <= 0)
        continue;

      receiver.takeLigth(force - distance);
      receiver._taked.push(sourceVector);
      new Light({ force: receiver.state.opacity * 25, sourceVector: receiver, receivers: globalThis.visualizer.vectors });
    }
  }

  static FORCE_MULTIPLAYER = 0.95;
  static RECEIVERS_LIMIT = 5;
  static FORCE_LIMIT = 0.05;
}

Vector.prototype.takeLigth = function(force){
  if (this.state.opacity >= 1)
    return;

  this.state.opacity += 0.008 * force;
}
