var shapes = ["polygon","rect","circle"];
var coalescents = [];
/*
*Creates a svg inside of an object with id 'live'.
*/
function createLive(where){
  var coalSVG = document.createElement("svg");
  coalSVG.style.width = "100%";
  coalSVG.style.height = "100%";
  coalSVG.id = "coalSVG" + coalescents.length;
  coalescents.push(coalSVG);
  document.getElementById(where).append(coalSVG);
}

/*
*Class that holds the atributes for a species object.
*Shape variable represents 1 out of the possible shapes in the shapes array.
*Color variable represents color of the pecies object.
*/
class atributes{
  constructor(){
    this.shape = Math.floor(3*Math.random());
    this.color = [255*Math.random(),255*Math.random(),255*Math.random()];
  }
}

/*
*Generic class for parent child structure.
*Parent object is another species object that is before this object in the tree.
*Children array is filled with species objects that come after this object in
the tree.
*/
class species{
  constructor(parent){
    this.parent = parent;
    this.children = [];

    if (parent == undefined){
      this.atributes = new atributes();
    }else{
      this.atributes = this.parent.atributes;
    }

    this.show = function(){

    }
  }
}
