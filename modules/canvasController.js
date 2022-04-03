class SimpleManager extends EventEmitter {
  constructor(querySelector, creator){
    super();

    this.creator = creator;

    this.node = document.querySelector(querySelector);
    if (this.node.tagName !== "SELECT")
      throw new TypeError("Target tag must be <select>");

    this.node.selectedIndex = -1;

    this.#setHandlers();
  }


  #setHandlers(){
    this.node.addEventListener("change", changeEvent => {
      const label = [...this.node.selectedOptions].at(0).value;
      this.node.selectedIndex = -1;

      this.constructor.action.call(this, label);
    });
  }


  static action(label){
    this.constructor.ACTIONS_LIST[label].callback.call(this);
  }

  static ACTIONS_LIST = {}
}



class SaverManager extends SimpleManager {
  constructor(querySelector, creator){
    super(querySelector, creator);
  }


  static ACTIONS_LIST = {
    clipboardRestore: {
      callback: async function(){
        const data = await window.navigator.clipboard.readText();

        this.emit("putObjectsJSON", data);
        this.creator.takeVectors(data);
      }
    },

    clipboardSave: {
      callback: function(){
        const json = this.creator.toJSON();
        window.navigator.clipboard.writeText(json);



      }
    },

    fileRestore: {
      callback: async function(){
        const node = document.createElement("input");
        node.style.display = "none";
        node.setAttribute("type", "file");
        node.setAttribute("accept", ".json");

        node.click();
        const whenFileLoaded = new Promise(async (resolve, reject) => {
          node.oninput = resolve;
          // Клик по странице означает, что пользователь не выбрал ни единого файла и ивент oninput не сработал
          await delay(20);
          document.body.addEventListener("pointerup", reject, {once: true});
        });
        await whenFileLoaded.catch(() => {});
        const file = node.files[0];
        if (!file)
          return;

        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
          this.emit("putObjectsJSON", reader.result);
          this.creator.takeVectors(reader.result);
        }

        reader.onerror = () => {
          alert( reader.error );
        }

      }
    },

    fileSave: {
      callback: function(){
        const json = this.creator.toJSON();
        const title = this.creator.canvas.title ?? "default";

        const blob = "data:text/json;charset=utf-8," + encodeURIComponent(json);
        const node = document.createElement("a");
        node.style.display = "none";

        node.setAttribute("href", blob);
        node.setAttribute("download", `8-${ title }.json`);
        node.click();

        node.remove();
      }

    },

    openTab: {
      callback: async function(){
        const tabWindow = window.open("visualizer.html", location.hostname);
        tabWindow.postMessage(this.creator.toJSON());
      }
    },

    hideController: {
      callback: function(){
        document.querySelector("body > section").remove();
      }
    }
  }

}



class ParamsManager extends SimpleManager {
  constructor(querySelector, creator){
    super(querySelector, creator);
  }

  static ACTIONS_LIST = {
    setCanvasBackgound: {
      callback: async function(){
        const node = this.creator.canvas.node;
        const currentColor = window.getComputedStyle(node).backgroundColor;

        await delay(5);

        const pageX = window.innerWidth / 2;
        const pageY = window.innerHeigth / 2;

        const palette = new Paletter(pageX, pageY, {currentColor});
        palette.node.style.transform = "translate(-50%, -50%) scale(2)";

        const color = await palette.whenColor;

        if (color === null)
          return;

        node.style.background = `rgb(${ color.join(", ") })`;
      }
    },

    setCanvasSize: {
      callback: async function(){
        const node = this.creator.canvas.node;
        const current = [node.width, node.height];

        const out = prompt("Ширина & Высота указанные через любой символ", `Текущее значение: ${ current.join(" ") }`);
        if (!out)
          return;

        const [width, height] = out.match(/\d+/g);
        node.width = width;
        node.height = height;
      }
    },

    setTitle: {
      callback: function(){
        const out = prompt("Введите значение", "");
        if (!out)
          return;

        document.title = `${ out } - ${ {Creator: "Создание", Visualizer: "Визуализация"}[this.creator.constructor.name] }`;
      }
    },

    setLayerID: {
      callback: function(){
        const out = prompt("Идентификатор слоя — уникальная метка, фигуры одного слоя не передают свет фигурам с другим ID", "");
        if (!out)
          return;

      }
    }
  }
}
