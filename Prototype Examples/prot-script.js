var shapes = ["polygon","rect","circle"]
function setup(){

  console.log("Setup Complete");
}

function createLive(){
  var coalSVG = document.createElement("svg");
  coalSVG.style.width = "100%";
  coalSVG.style.height = "100%";
  coalSVG.id = "coalSVG";
  document.getElementById("live").append(coalSVG);

  for(var i = 0;i < 10;i++){
    var obj = new species();
    obj.show();
  }
}

class atributes{
  constructor(){
    this.shape = Math.floor(3*Math.random());
    this.color = [255*Math.random(),255*Math.random(),255*Math.random()];
  }
}

class species{
  constructor(parent){
    this.parent = parent;

    if (parent == undefined){
      this.atributes = new atributes();
    }else{
      this.atributes = this.parent.atributes;
    }

    this.show = function(){
      var ele = document.createElement(shapes[this.atributes.shape]);
      if(this.atributes.shape == 3){
        coalSVG.append(shapes[this.atributes.shape]).attr('cx',100*Math.random()).attr('cy',100*Math.random());
      }else{
        coalSVG.append(shapes[this.atributes.shape]).attr('x',100*Math.random()).attr('y',100*Math.random());
      }
    }
  }
}
