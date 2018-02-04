# maptalks-WebglHeatLayer
maptalks heat  on webgl


 # Support 1 Million Points

 [exmaple](https://deyihu.github.io/src/maptalks-WebglHeatLayer/examples/)

![](examples/image/2018-01-24_124849.png)


# API



 <pre>




 var data1=[],data2=[];

 data1.push({ 
                coordinates:[lng,lat],
                count:10*Math.random(),
                id:id
 });

 
 data2.push({ 
                coordinates:[lng,lat],
                count:10*Math.random(),
                id:id
 });


  var layer=new maptalks.WebGlHeatLayer('idididid',data1,{
        alphaRange: 0.2
    })
  map.addLayer(layer)

  //移除

  map.removeLayer(layer)


  //重置数据

  layer.resetData(data2)


  //添加数据

  layer.addData(data2)


//移除数据

layer.removeData(data1);


//清除

layer.clear()

 </pre>


 
