function delay(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}


function letters(numb){
  numb = String( numb );

  const THRESHOLD = 5;
  const DISTANCE  = 3;

  if (numb.length <= THRESHOLD)
    return numb;

  const cut = numb.length - (numb.length % (THRESHOLD - DISTANCE + 1) + DISTANCE);
  numb = numb.slice(0, numb.length - cut);

  let letters = ["", "K", "M", "B", "T", "q", "Q", "s", "S", "O", "N", "d", "U", "D", "z", "Z", "x", "X", "c", "C", "v", "V", "!", "@", "#", "$", "/", "%", "^", "&", "*"];
  const letter = letters[ ~~(cut / DISTANCE) ] || `e+${ cut }`;

  return `${ numb }${ letter }`;
}



Array.prototype.sortBy = function(property, {reverse = false} = {}){
  const func = reverse ?
    ((a, b) => b[property] - a[property]) :
    ((a, b) => a[property] - b[property]) ;

  return this.sort(func);
}


Array.prototype.random = function(pop, weights){
  let index;
  if (weights) {
    let last = 0;
    let limites = this.map((e, i) => last = e._weight + last);

    let rand = Math.random() * limites.at(-1);
    index = limites.findIndex(e => e >= rand);
  }
  else index = Math.floor(Math.random() * this.length);

  let input = this[index];
  if (pop) this.splice(index, 1);
  return input;
}


function random(...arguments){
  let lastArgument = arguments.splice(-1).last;
  let options = {round: true};

  if (typeof lastArgument === "object"){
    Object.assign(options, lastArgument);
    lastArgument = arguments.splice(-1).last;
  }

  const max = lastArgument + Number(options.round);
  const min = arguments.length ? arguments[0] : 0;
  let rand = Math.random() * (max - min) + min;

  if (options.round){
    rand = Math.floor(rand);
  }
  return rand;
}


function similarity(a, b) {

  if (a.toLowerCase() == b.toLowerCase()) return 0;
  a = a.toLowerCase().split("");
  b = b.toLowerCase().split("");
  let i = 0, w = 0;

  while( i < Math.max(a.length, b.length) ){
    if (a[i] == b[i]) {}
    else if (a[i] == b[i + 1] && a[i + 1] == b[i]){
      a[i] = b[i + 1];
      a[i + 1] = b[i];
      b[i] = a[i];
      b[i + 1] = a[i + 1];
      w += 1;
      i++;
    }
    else if (a[i] == b[i + 1]){
      b.splice(i, 1);
      w += 0.75;
    }
    else if (a[i + 1] == b[i] || b[i] == undefined){
      b.splice(i, 0, a[i])
      w += 0.75;
    }
    else {
      b[i] = a[i];
      w += 1;
    }
    i++;
  }
  return w;
};

function getSimilar(arr, str) {
  if (arr.find((el) => el.toLowerCase() === str.toLowerCase())) return str;
  let max = Infinity;
  let input;
  arr.filter(el => el.length - str.length < 2 && el.length - str.length > -2).forEach(el => {
      let w = similarity(str, el);
      if (w < max && w < str.length + 2) max = w, input = el;
  });
  return input || false;
}



function ending(numb = 0, wordBase, zerofifth, first, second, opt = {}) {
  numb = +numb;

  if ( Number.isNaN(numb) )
    return NaN;

  let fix = Infinity;

  if (numb > 20)
    fix = 10;

  let end = (numb % fix > 4 || numb % fix == 0) ? zerofifth : (numb % fix > 1) ? second : first;

  input = wordBase + end;
  if (opt.bold) {
    numb = "**" + numb + "**";
  }
  if (!opt.slice){
    input = numb + " " + input;
  }
  return input;
};



document.addEventListener("mousemove", ({pageX, pageY}) => globalThis.pageCursorPosition = { pageX, pageY });
