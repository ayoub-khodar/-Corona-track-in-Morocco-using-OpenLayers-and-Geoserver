window.onload = init;
function init(){
    var map = new ol.Map({
        target : 'carte11',
        controls: ol.control.defaults().extend([
            new ol.control.ScaleLine(),
            new ol.control.FullScreen(),
            new ol.control.OverviewMap(),
            new ol.control.ZoomSlider(),
          
        ]),
        layers : [
            new ol.layer.Group({
                title:'Basemap',
                fold:'open',
                layers:[
                    new ol.layer.Tile({
                        title:'OSM',
                        type:'Basemap',
                        visible:true,
                        source : new ol.source.OSM()
                    }),
                ],

            }),
            new ol.layer.Group({
                title:'Overlays',
                fold:'open',
                layers:[
                  
                    new ol.layer.Tile({
                        title:'Provinces',
                        type:'Overlays',
                        visible:false,
                        source : new ol.source.TileWMS({
                            url : "http://localhost:8080/geoserver/EHTP/wms",
                            params : {
                                "LAYERS" : "Provinces2014",
                                "TRANSPARENT" : "true",
                                "WIDTH" : 640,
                                "HEIGHT" : 480
                            }
                        }),

                    }),
                    new ol.layer.Tile({
                        title:'Regions',
                        type:'Overlays',
                        visible:true,
                        source : new ol.source.TileWMS({
                            url : "http://localhost:8080/geoserver/EHTP/wms",
                            params : {
                                "LAYERS" : "regions2014",
                                "TRANSPARENT" : "true",
                                "WIDTH" : 640,
                                "HEIGHT" : 480
                            }
                        }),

                    }),
                ],

            }),
       
        ],
        view : new ol.View({
            center : ol.proj.transform([-7.63, 33.56],"EPSG:4326" , "EPSG:3857"),
            zoom : 6
        })
    });
    var layerSwitcher = new ol.control.LayerSwitcher({
    });
    map.addControl(layerSwitcher);

    //Map2
    var map2 = new ol.Map({
        target : 'tanirightcarte',
        controls: ol.control.defaults().extend([
            new ol.control.ScaleLine(),
            new ol.control.FullScreen(),
            new ol.control.OverviewMap(),
            new ol.control.ZoomSlider(),
            
          
        ]),
        layers : [
            new ol.layer.Tile({
                source : new ol.source.OSM()
            }),
            new ol.layer.Tile({
                source : new ol.source.TileWMS({
                    url : "http://localhost:8080/geoserver/EHTP/wms",
                    params : {
                        "LAYERS" : "Provinces2014",
                        "TRANSPARENT" : "true",
                        "WIDTH" : 640,
                        "HEIGHT" : 480
                    }
                })
            }),
        ],
        view : new ol.View({
            center : ol.proj.transform([-7.63, 33.56],"EPSG:4326" , "EPSG:3857"),
            zoom : 6
        })
    });



    //Fonction qui vérifie si la couche est visible
    function checkAddress()
    {
        var chkBox = document.querySelectorAll('.layer-switcher li.layer input')[0];
        console.log(chkBox);
        var chkBox2 = document.querySelectorAll('.layer-switcher li.layer input')[1];
        console.log(chkBox2);
        if ((chkBox.checked) && (chkBox2.checked) )
        {
            return true
        }
        if ((!chkBox.checked) && (chkBox2.checked) )
        {
            return false
        }
        else{
            return true
        }
    }


    //affichage du popup
    map.on('singleclick', function(evt) {
        var a = checkAddress();
        console.log(a);
        
        if (a==true){
            var wmsSource = new ol.source.TileWMS({
                url : "http://localhost:8080/geoserver/EHTP/wms",
                                    params : {
                                        "LAYERS" : "regions2014",
                                        "TRANSPARENT" : "true",
                                        "WIDTH" : 640,
                                        "HEIGHT" : 480
                                    },serverType: 'geoserver',
                                    crossOrigin: 'anonymous',
              });
              
              var wmsLayer = new ol.layer.Tile({
                source: wmsSource
              });
            var view = new ol.View({
                center: ol.proj.transform([-7.63, 33.56],"EPSG:4326" , "EPSG:3857"),
                zoom: 6
              });
              let ClickedCoordinate = evt.coordinate;
        
      
        var viewResolution = /** @type {number} */ (view.getResolution());
        var url = wmsSource.getFeatureInfoUrl(
          evt.coordinate, viewResolution, 'EPSG:3857',
          {'INFO_FORMAT': 'application/json',
          'propertyName': 'nom_reg,Confirmed,Dead,TauxD,PopUrbaine,PopRurale,DensitéPOP,TauxMaladie'});
             
       if (url) {
        fetch(url)
          .then(function (response) { 
          var contentType = response.headers.get("content-type");
          if(contentType && contentType.indexOf("application/json") !== -1) {
                    return response.json().then(function(json) {
                        console.log(json.features[0]);
                        if(json.features[0]==undefined){
                            console.log("hipi");
                            document.getElementById('feature-name').innerHTML = "";
                            document.getElementById('feature-additional-info').innerHTML = "";
                            document.getElementById("overlay-container").style.visibility='hidden';
                        }
                        else{
                            var feature = json.features[0];
                            var pointNum = parseFloat(feature.properties.TauxD); pointNum=pointNum*100;pointNum=Math.round(pointNum);pointNum=pointNum/100;
                            var density = parseFloat(feature.properties.DensitéPOP); density=density*100;density=Math.round(density);density=density/100;
                            var tmaladie = parseFloat(feature.properties.TauxMaladie); tmaladie=tmaladie*100;tmaladie=Math.round(tmaladie);tmaladie=tmaladie/100;
                      document.getElementById('feature-name').innerHTML = "<h5 style="+"text-align:center;"+">"+ feature.properties.nom_reg +"</h5>";
                      document.getElementById('feature-additional-info').innerHTML = "<p><span style="+"font-weight: bold;font-size:6px;text-color:grey;padding-left:5px;"+">Nom de région : </span><span style="+"text-color:grey;font-size:12px;"+">"+feature.properties.nom_reg+"</span></p>" 
                      +"<p><span style="+"font-weight: bold;padding-left:5px;font-size:6px;text-color:grey"+">Cas confirmés : </span><span style="+"text-color:grey;font-size:15px;"+">"+feature.properties.Confirmed+"</span></p>" + 
                      "<p><span style="+"font-weight: bold;padding-left:5px;font-size:6px;text-color:grey"+">Cas  de  mort : </span><span style="+"text-color:grey;font-size:15px;"+">"+feature.properties.Dead+"</span></p>"+ 
                      "<p><span style="+"font-weight: bold;font-size:6px;text-color:grey"+">Taux de décés : </span><span style="+"text-color:grey;font-size:15px;"+">"+pointNum+"</span></p>"+
                      "<p><span style="+"font-weight: bold;padding-left:5px;font-size:6px;text-color:grey"+">Population urbaine : </span><span style="+"text-color:grey;font-size:15px;"+">"+feature.properties.PopUrbaine+"</span></p>"+
                      "<p><span style="+"font-weight: bold;padding-left:5px;font-size:6px;text-color:grey"+">Population rurale : </span><span style="+"text-color:grey;font-size:15px;"+">"+feature.properties.PopRurale+"</span></p>"+
                      "<p><span style="+"font-weight: bold;padding-left:5px;font-size:6px;text-color:grey"+">Densité de population : </span><span style="+"text-color:grey;font-size:15px;"+">"+density+"</span></p>"+
                      "<p><span style="+"font-weight: bold;padding-left:5px;font-size:6px;text-color:grey"+">Taux de maladie : </span><span style="+"text-color:grey;font-size:15px;"+">"+tmaladie+"</span></p>"
                      ;
                      document.getElementById('popup-closer').innerHTML = "✖";   
                      document.getElementById("overlay-container").style.visibility='visible';
                    }
                        overlayLayer.setPosition(ClickedCoordinate);
                      
              });
          } else {
      console.log("Oops, nous n'avons pas du JSON!");
      document.getElementById('feature-name').innerHTML = "";
      document.getElementById('feature-additional-info').innerHTML = "";
      document.getElementById('popup-closer').innerHTML = "";
     // document.getElementsByClassName('overlay-container').style = "overlay-containerhiddden";
     console.log("lest change vdiz")
     

}
           
 
          });
      }
        }
        else {
            var wmsSource = new ol.source.TileWMS({
                url : "http://localhost:8080/geoserver/EHTP/wms",
                                    params : {
                                        "LAYERS" : "Provinces2014",
                                        "TRANSPARENT" : "true",
                                        "WIDTH" : 640,
                                        "HEIGHT" : 480
                                    },serverType: 'geoserver',
                                    crossOrigin: 'anonymous',
              });
              
              var wmsLayer = new ol.layer.Tile({
                source: wmsSource
              });
            var view = new ol.View({
                center: ol.proj.transform([-7.63, 33.56],"EPSG:4326" , "EPSG:3857"),
                zoom: 6
              });
              let ClickedCoordinate = evt.coordinate;

        
        var viewResolution = /** @type {number} */ (view.getResolution());
        var url = wmsSource.getFeatureInfoUrl(
          evt.coordinate, viewResolution, 'EPSG:3857',
          {'INFO_FORMAT': 'application/json',
          'propertyName': 'libelle,Confirmed'});
             
       if (url) {
        fetch(url)
          .then(function (response) { 
          var contentType = response.headers.get("content-type");
          if(contentType && contentType.indexOf("application/json") !== -1) {
                    return response.json().then(function(json) {
                        if(json.features[0]==undefined){
                            console.log("hipi");
                            document.getElementById('feature-name').innerHTML = "";
                            document.getElementById('feature-additional-info').innerHTML = "";
                        }
                        else{
                            console.log(json.features[0]);
                      var feature = json.features[0];
                      document.getElementById('feature-name').innerHTML = "<h2>"+ feature.properties.libelle +"</h2>";
                      document.getElementById('feature-additional-info').innerHTML = "<p>" +feature.properties.Confirmed +"</p>";
                      overlayLayer.setPosition(ClickedCoordinate);
                        }
                        
              });
          } else {
      console.log("Oops, nous n'avons pas du JSON!");
      document.getElementById('feature-name').innerHTML = "";
      document.getElementById('feature-additional-info').innerHTML = "";
}
           
 
          });
      }
        }
     

    });
  
      
      
      map.on('pointermove', function(evt) {
        
        if (evt.dragging) {
          return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        var hit = map.forEachLayerAtPixel(pixel, function() {
          return true;
        });
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
      });

    const overlayContainerElement = document.querySelector('.overlay-container');
      const overlayLayer = new ol.Overlay({
          element : overlayContainerElement,
          autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
      })
      map.addOverlay(overlayLayer);
      const overlayFeatureName = document.getElementById('feature-name');
      const overlayFeatureAdditionInfo = document.getElementById('feature-additional-info');
      var closer = document.getElementById('popup-closer');
      closer.onclick = function() {
        overlayLayer.setPosition(undefined);
        closer.blur();
        return false;
      };


}