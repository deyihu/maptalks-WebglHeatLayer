

const SphericalMercator=require('@mapbox/sphericalmercator');
var merc = new SphericalMercator({
    size: 256
});

const   defaultoptions={
    size: 30000,
    units: 'm',
    opacity: 1,
    gradientTexture: false,
    alphaRange: 1,
    padding: 0
    
}

function extend(dest,args){
    for(var key in args){
        dest[key]=args[key];
    }
    return dest;
 }


 
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

 function uuid(prefix = 'ID') {
    let uuid = new Array(36), rnd = 0, r;
    for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            uuid[i] = '-';
        } else if (i === 14) {
            uuid[i] = '4';
        } else {
            if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = CHARS[(i === 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return prefix + '-' + uuid.join('');
}


class WebGlHeatLayer extends maptalks.Layer {

    constructor(id, data, options) {
        // options.doubleBuffer=true;
        super(id, options);
        this.data=this._filterData(data)
        this._initOptions(options);
        this.inited=false;
    }

    getData() {
        return this.data||[];
    }


    getCanvas(){
        return this.rendererCanvas;
    }

    setCanvas(canvas){
        this.rendererCanvas=canvas;
    }

    redraw() {
        const renderer = this._getRenderer();
        if (renderer) {
            renderer.setToRedraw();
        }
        return this;
    }

    onRemove (map) {
        this.inited=false;
    }



    clear () {
        this.heatmap.clear();
        this.heatmap.update();
        this.heatmap.display();
        this.data=[];
        this.redraw();
    }

   /**
    *  reset data
    * @param {*} data 
    */
    resetData (data) {
        this.data=this._filterData(data);
        this.redraw();
    }

   

    /**
     * 增量数据
     * @param {*} data 
     */
    addData (data) {
        if(!Array.isArray(data)) data=[data];
        this.data=this.data.concat(this._filterData(data));
        this.redraw();
    }

    
    removeData (data) {
        var idMap={};
        if(Array.isArray(data)){
               for(var i=0;i<data.length;i++){
                   idMap[(data[i].id)]=data[i].id;
               }
        }else{
               idMap[(data.id)]=data.id;
        }
        var _data=[];
        for(var i=0,len=this.data.length;i<len;i++){
                var id=this.data[i].id;
                if(idMap[id]!=undefined) continue;
                _data.push(this.data[i]);
        }
        this.data=_data;
        this.redraw();
        // this._reset();
    
    }


    _initOptions(options){
        this.options=extend(this.options,defaultoptions)
        this.options=extend(this.options,options);
    }

    _init () {
        var canvas=this.rendererCanvas;
        var options=this.options;
        if(!this.heatMapcanvas){
            this.heatMapcanvas=document.createElement('canvas');
            this.heatMapcanvas.width=canvas.width;
            this.heatMapcanvas.height=canvas.height;
        }
        try {
            if(!this.heatmap){
                this.heatmap = window.createWebGLHeatmap({
                    canvas: this.heatMapcanvas,
                    gradientTexture: options.gradientTexture,
                    alphaRange: [0, options.alphaRange],
                    // gl:this.getRenderer().gl
                });
            }
            
        } catch (e) {
            console.error(e)
            
        }
       
    }

    _reset () {
        var size=this.getMap().getSize();
        var width=size.width,height=size.height;
        if(this.heatMapcanvas!=size.width){
            this.heatMapcanvas.width=size.width;
        }
        if(this.heatMapcanvas.height!=size.height){
            this.heatMapcanvas.height=size.height;
        }
        this.heatmap.adjustSize(width,height);
        this._redraw();
    }

    /**
     * 数据格式化
     * @param {*} data 
     */
    _filterData (data) {
        for(var i=0,len=data.length;i<len;i++){
            var mercatormeters=[];
            var coordinates=data[i].coordinates;
            if(Array.isArray(coordinates[0])){
                for(var j=0;j<coordinates.length;j++){
                    var mercatormeter=merc.forward(coordinates[j]);
                    mercatormeters.push(mercatormeter)
                }
            }else{
                mercatormeters=merc.forward(coordinates);
            }
            data[i].mercatormeters=mercatormeters;
            if(data[i].id==undefined) data[i].id=uuid();

        }
        return data;
    }




   

    /**
     *  //经纬度转屏幕坐标
     * @param {*} lnglat 
     * @param {*} mercatormeters 
     */
    _lnglatToPixel(lnglat,mercatormeters){
        if(!Array.isArray(lnglat)) {
            console.error(lnglat)
            throw new Error('lnglat is error');
        }
        let map=this.getMap();
        const projection = map.getProjection();
        var xyArray=[];
        if(Array.isArray(lnglat[0])){
            for(let i=0;i<lnglat.length;i++){
                var _lnglat=lnglat[i];
                var lng=_lnglat[0];
                var lat=_lnglat[1];
                var xy=projection.project(new maptalks.Coordinate(lng, lat));
                xy = map._prjToContainerPoint(xy);
                xyArray.push([xy.x,xy.y]);
            }
        }else{
            var lng=lnglat[0];
            var lat=lnglat[1];
            var xy=projection.project(new maptalks.Coordinate(lng, lat));
            xy = map._prjToContainerPoint(xy);
            xyArray= [xy.x,xy.y];
        }
        return xyArray;
    }

    _redraw () {
        var map = this.getMap(),
            heatmap = this.heatmap,
            data = this.data,
            dataLen = data.length,
            floor = Math.floor,
            multiply = this._multiply;
        const renderer=this.getRenderer();
        const extent=map.getExtent();
        const miny=extent.ymin,minx=extent.xmin,maxy=extent.ymax,maxx=extent.xmax;
        if (!map) throw new Error('not find map')
        var geometry,type,coordinates,mercatormeters;
        // var timeId='大量的数据热区 绘制热区时间 ';
        heatmap.clear();
        if (dataLen) {
            // console.time(timeId)
            for (var i = 0; i < dataLen; i++) {
                var dataVal = data[i];
                coordinates=dataVal.coordinates;
                var lng=coordinates[0],lat=coordinates[1];
                if(lng<minx||lng>maxx||lat<miny||lat>maxy) continue;
                mercatormeters=dataVal.mercatormeters;
                var size=dataVal.count||10;
                var xy=this._lnglatToPixel(coordinates,mercatormeters);
                heatmap.addPoint(
                    floor(xy[0]),
                    floor(xy[1]),size
                );
            }
            // console.timeEnd(timeId)
            heatmap.update();
        }
        heatmap.display();
        var context=renderer.context|| this.rendererCanvas.getContext('2d');
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.save();
        context.drawImage(this.heatmap.canvas,0,0,context.canvas.width,context.canvas.height);
        context.restore();
        // renderer.completeRender();
    }
   
}

WebGlHeatLayer.mergeOptions({});

WebGlHeatLayer.registerJSONType('WebGlHeatLayer');

class WebGlHeatLayerRenderer extends maptalks.renderer.CanvasRenderer{

    getLayer(){
        return this.layer;
    }

    draw() {
        const map = this.getMap(),
            layer = this.layer;
        this.prepareCanvas();
        if(!layer.getCanvas()){
            layer.setCanvas(this.canvas)
        }
       
        if(!layer.inited) {
            layer._init();
            layer.inited=true;
        }
        layer._reset();
        this.completeRender();
    }


    drawOnInteracting() {
        this.draw();
    }

    

    onResize() {
        if (this.canvas) {
            // this._heater._width  = this.canvas.width;
            // this._heater._height = this.canvas.height;
        }
        super.onResize.apply(this, arguments);
    }

    onRemove() {
        // this.clearHeatCache();
     
    }

    clearHeatCache() {
        // delete this._heatViews;
    }
}
WebGlHeatLayer.registerRenderer('canvas',WebGlHeatLayerRenderer);
// WebGlHeatLayer.registerRenderer('gl',WebGlHeatLayerRenderer);
maptalks.WebGlHeatLayer=WebGlHeatLayer;