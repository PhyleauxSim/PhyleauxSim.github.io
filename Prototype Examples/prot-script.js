/*
*Shapes array is an array of all possible shapes for species object.
*Coalescents array is an array of all live coalescent objects.
*/
var shapes = ["rect","circle"];
var models = [];

function run(){
  for(var i = 0;i < models.length;i++){
    models[i].draw();
  }
}
var interval= 10;
var main = setInterval(run, 10);
/**
*Class that holds the atributes for a species object.
*Shape variable represents 1 out of the possible shapes in the shapes array.
*Color variable represents color of the pecies object.
*/
class atributes{
  constructor(){
    this.shape = shapes[Math.floor((shapes.length)*Math.random())];
    this.color = [Math.round(255*Math.random()),Math.round(255*Math.random()),Math.round(255*Math.random())];
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
    this.object;

    if (parent == undefined){
      this.atributes = new atributes();
    }else{
      this.atributes = this.parent.atributes;
    }
    if(this.atributes.shape == 'circle'){
      this.append = function(where,x,y,r){
        where.append(this.atributes.shape)
        .attr("fill","rgb(" +
        this.atributes.color[0] + "," +
        this.atributes.color[1] + "," +
        this.atributes.color[2] + ")")
        .attr("r",r)
        .attr('cx',x)
        .attr('cy',y);
      }
    }else{
      this.append = function(where,x,y,xlen,ylen){
        where.append(this.atributes.shape)
        .attr("fill","rgb(" +
        this.atributes.color[0] + "," +
        this.atributes.color[1] + "," +
        this.atributes.color[2] + ")")
        .attr('width',xlen)
        .attr('height',ylen)
        .attr('x',x)
        .attr('y',y);
      }
    }
    this.createChildren = function(mutation){
      var random;
      do{
        random = 100*Math.random();
        var obj = new object(this);
        this.children.push(obj);
      }while(random <= mutation);
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
    this.speed = 1;
    this.mutation = 0.1
    this.r;

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
      this.r = this.svg.node().getBoundingClientRect().width*0.02;
    }

    /**
    *starts the live animation of the model
    */
    this.start = function(){
      var sampSize = document.getElementById('sampleSize').value;
      var svg = this.svg.node().getBoundingClientRect();
      for(var i = 0;i < sampSize;i++){
        var xpos = svg.width/(parseInt(sampSize)+1)*(i+1);
        var ypos = svg.height*0.9;
        var obj = new object();
        this.objects.push(obj);
        if(this.objects[this.objects.length-1].atributes.shape == 'circle')
          this.objects[this.objects.length-1].append(this.svg,xpos,ypos,this.r);
        else
          this.objects[this.objects.length-1].append(this.svg,xpos-this.r,ypos-this.r,this.r*2,this.r*2);
      }
    }

    /**
    *draws live animation of model
    */
    this.draw = function(){
      var circles = this.svg.selectAll("circle");
      var length = circles._groups[0].length;
      for(var i = 0;i < length;i++){
        circles._groups[0][i].cy.baseVal.value-=this.speed;
      }
      var rects = this.svg.selectAll("rect");
      var length = rects._groups[0].length;
      for(var i = 0;i < length;i++){
        rects._groups[0][i].y.baseVal.value-=this.speed;
      }
    }
    this.getInfo = function(info){
      return this.info;
    }
  }
}
