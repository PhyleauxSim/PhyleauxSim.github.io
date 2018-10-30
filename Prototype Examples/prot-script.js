/*
*Shapes array is an array of all possible shapes for species object.
*Coalescents array is an array of all live coalescent objects.
*/
var shapes = ["rect","circle"];
var models = [];

function setup(){

}

function draw(){
  for(var i = 0;i < models.length;i++){
    models[i].draw();
  }
}

/**
*Class that holds the atributes for a species object.
*Shape variable represents 1 out of the possible shapes in the shapes array.
*Color variable represents color of the pecies object.
*/
class atributes{
  constructor(){
    this.shape = shapes[Math.floor((shapes.length)*Math.random())];
    this.color = [255*Math.random(),255*Math.random(),255*Math.random()];
  }
}

/**
*Generic class for parent child structure.
*Parent object is another species object that is before this object in the tree.
*Children array is filled with species objects that come after this object in
the tree.
* @param {object} parent species object
*/
class object{
  constructor(parent){
    this.parent = parent;
    this.children = [];

    if (parent == undefined){
      this.atributes = new atributes();
    }else{
      this.atributes = this.parent.atributes;
    }
  }
}

class model{
  constructor(parent,w,h){
    this.parent = parent;
    this.svg;
    this.w = w;
    this.h = h;
    this.objects = [];

    /**
    *Creates a svg inside of this.parent
    */
    this.create = function(){
      var coalSVG = d3
      .select(this.parent)
      .append("svg")
      .attr("width", this.w)
      .attr("height", this.h);
      this.svg = coalSVG;
    }

    /**
    *starts the live animation of the model
    */
    this.start = function(){
      for(var i = 0;i < document.getElementById('sampleSize').value;i++){
        this.objects.push([new object()]);
        this.svg.append(this.objects[i][0].atributes.shape)
        .attr("fill","rgb(" +
        this.objects[i][0].atributes.color[0] + "," +
        this.objects[i][0].atributes.color[1] + "," +
        this.objects[i][0].atributes.color[2] + ")")
        .attr("r",10)
        .attr("cx",150)
        .attr("cy",150);
      }
    }

    /**
    *draws live animation of model
    */
    this.draw = function(){
      for(var i = 0;i < this.objects.length;i++){

      }
    }
  }
}
