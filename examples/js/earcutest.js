var context=document.getElementById('mycanvas').getContext("2d")
context.stokeStyle=context.fillStyle='red';

var path=[0,0,100,0,100,100,0,100];
context.beginPath();
for(var i=0;i<path.length-1;i+=2){
  var x=path[i],y=path[i+1];
  if(i==0){
    context.moveTo(x,y)
  }else{
    context.lineTo(x,y);
  }
}
context.closePath();
context.stroke();

path=[20,20,60,20,60,40,20,40];
// context.beginPath();
for(var i=0;i<path.length-1;i+=2){
  var x=path[i],y=path[i+1];
  if(i==0){
    context.moveTo(x,y)
  }else{
    context.lineTo(x,y);
  }
}
context.closePath();
context.fill('evenodd')

// context.fillRect(0,0,100,100);

// var xy=[[0,0],[100,0],[100,100],[0,100]]
// var holes=[[20,20],[40,20],[40,40],[20,40]]                              

// var data=earcut.flatten(
//     [[[661,112],[661,96],[666,96],[666,87],[743,87],[771,87],[771,114],[750,114],[750,113],[742,113],[742,106],[710,106],[710,113],[666,113],[666,112]]])
//   console.log(data)
//     var  indices = earcut(data.vertices, data.holes, data.dimensions);
//     console.log(indices)


// console.log(ver)

// context.save();
// context.fillStyle='blue';
// context.beginPath();

// for(var i=0;i<ver.length/2;i++){
//     var x=ver[i],y=ver[i+1];
//     if(i==0){

//         context.moveTo(x,y);
//     }
//     else{
//         context.lineTo(x,y);
//     }
// }
// context.closePath();
// context.fill();
// context.restore();

