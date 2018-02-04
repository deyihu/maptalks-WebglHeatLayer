
var layer;

var data = [];
var map;
var nameArr=[
    'HZYH2015-1.json',
    'HZYH2015-2.json',
    'HZYH2015-3.json',
    'HZYH2015-4.json',
    'HZYH2016-1.json',
    'HZYH2016-2.json',
    'HZYH2016-3.json',
    'HZYH2016-4.json'
    // ,'HZYH2017-1.json',
    // 'HZYH2017-2.json',
    // 'HZYH2017-3.json',
    // 'HZYH2017-4.json'
];
function init() {
      //初始化gaeainfo地图
      map = new maptalks.Map("map-container",{
        // center : [175.46873, -37.90258],
        center : [31.30150538026905,120.61955565318601].reverse(),
        zoom   :  8,
        minZoom:5,
        pitch:30,
        maxPitch:60,
        // maxExtent : new maptalks.Extent(119.89,30.75,121.406,32.08),
        attributionControl : {
        'content' : '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        baseLayer : new maptalks.TileLayer('tile',{
            urlTemplate: '//{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
            subdomains: ['a','b','c','d']
        })
    });
    map.on('click',function(e){
        console.log(e)
    })
  
    var options={
        alphaRange: 0.01
    }
    layer=new maptalks.WebGlHeatLayer('flasjlasf',[],options)
    map.addLayer(layer)

  
    setTimeout(function(e){
       for(var x in nameArr){
           request1(nameArr[x])
       }
    },500)



}

var count=0;
var num=1;

function request1(name) {
    $.get('data/'+name, function (rs) {
        var poiList=rs.data;
        var data1=[];
        for( var i=0;i<poiList.length;i++){
            var poiInfo=poiList[i];
            var coord=[poiInfo.X,poiInfo.Y];
        
            data1.push({
                coordinates:coord,
                count:10*Math.random(),
                id:count
            });

            data.push({
                coordinates:coord,
                count:15*Math.random(),
                id:count
            });
            count++;
           
        }
        console.log('count:',count)
         layer.addData(data1)
         num++;
         console.log(num)
         if(num==nameArr.length){
             $('#loadingdiv').hide();
         }
    });


}


init();