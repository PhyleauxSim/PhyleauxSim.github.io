/*
*Shapes array is an array of all possible shapes for species object.
*Coalescents array is an array of all live coalescent objects.
*/
var shapes = ["rect","circle"];
var models = [];

/**
*Class that holds the atributes for a species object.
*Shape variable represents 1 out of the possible shapes in the shapes array.
*Color variable represents color of the pecies object.
*/
class atributes{
  constructor(){
    this.shape = shapes[Math.floor((shapes.length)*Math.random())];
    this.color = [Math.round(255*Math.random()),
      Math.round(255*Math.random()),
      Math.round(255*Math.random())];
  }
}

/**
*Generic class for parent child structure.
*Parent object is another object that is before this object in the tree.
*Children array is filled with species objects that come after this object in
the tree.
* @param {object} parent parent object
*/
class object{
  constructor(parent){
    this.parent = parent;
    this.children = [];
    this.element;

    if (parent == undefined){
      this.atributes = new atributes();
    }else{
      this.atributes = this.parent.atributes;
    }
    if(this.atributes.shape == 'circle'){
      this.append = function(where,x,y,r){
        this.element = where.append(this.atributes.shape)
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
        this.element = where.append(this.atributes.shape)
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

/**
*Class for live coalescent/genetic-drift models.
*Parent object is the html element that contains this model.
*Type is a int 1 or -1 that determines the direction of the live model.
* @param {element} parent html element
* @param {int} w width of svg
* @param {int} h height of svg
* @param {int} type -1 or 1 : type of live model
*/
class model{
  constructor(parent,w,h,type){
    this.time = 0;
    this.parent = parent;
    this.type = type;
    this.svg;
    this.w = w;
    this.h = h;
    this.objects = [];
    this.speed = 1;this.tempSpeed = 1;
    this.mutation = 0.1
    this.interval = 10;
    this.r;
    this.main = null;

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
    *starts and restarts the live animation of the model
    */
    this.start = function(){
      if(this.speed == 0){
        this.speed = this.tempSpeed;
        return;
      }
      if(this.objects[0] != undefined){

      }
      var sampSize = document.getElementById('sampleSize').value;
      var svg = this.svg.node().getBoundingClientRect();
      for(var i = 0;i < sampSize;i++){
        var xpos = svg.width/(parseInt(sampSize)+1)*(i+1);
        if(this.type > 0)
          var ypos = svg.height*0.9;
        else
          var ypos = svg.height*0.1;
        var obj = new object();
        this.objects.push(obj);
        if(this.objects[this.objects.length-1].atributes.shape == 'circle')
          this.objects[this.objects.length-1].append(this.svg,xpos,ypos,this.r);
        else
          this.objects[this.objects.length-1].append(this.svg,xpos-this.r,ypos-this.r,this.r*2,this.r*2);
      }
      if(this.main == null){
        var t = this;
        this.main = setInterval(function(){t.draw();}, this.interval);
      }
    }

    this.stop = function(){
      if(this.speed != 0){
        this.tempSpeed = this.speed;
        this.speed = 0;
      }
    }

    /**
    *draws live animation of model
    */
    this.draw = function(){
      var circles = this.svg.selectAll("circle");
      var length = circles._groups[0].length;
      for(var i = 0;i < length;i++){
        if(this.type > 0)
          circles._groups[0][i].cy.baseVal.value-=this.speed;
        else
          circles._groups[0][i].cy.baseVal.value+=this.speed;
      }
      var rects = this.svg.selectAll("rect");
      var length = rects._groups[0].length;
      for(var i = 0;i < length;i++){
        if(this.type > 0)
          rects._groups[0][i].y.baseVal.value-=this.speed;
        else {
          rects._groups[0][i].y.baseVal.value+=this.speed;
        }
      }
      this.time += 0.01 * this.speed;
    }
    this.getInfo = function(info){
      return this.info;
    }
  }
}
