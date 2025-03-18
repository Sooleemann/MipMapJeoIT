
var map;

require([
    "esri/views/SceneView",
    "esri/widgets/LayerList",
    "esri/core/reactiveUtils",
    "esri/Camera",
    "esri/Map",
    "esri/intl",
    "esri/layers/FeatureLayer",
    "esri/widgets/Expand",
    "esri/layers/GeoJSONLayer",
    "esri/layers/IntegratedMeshLayer",
    "esri/layers/support/Field",
    "esri/symbols/Symbol",
    "esri/WebScene",
    "esri/layers/BuildingSceneLayer",
    "esri/widgets/Slice",
    "esri/analysis/SlicePlane",
    "esri/core/Collection",
    "esri/widgets/BuildingExplorer",
    "esri/rest/query",
    "esri/rest/support/TopFeaturesQuery",
    "esri/widgets/CoordinateConversion",
    "esri/widgets/CoordinateConversion/support/Format",
    "esri/widgets/CoordinateConversion/support/Conversion",
    "esri/widgets/BasemapGallery",
    "esri/widgets/DirectLineMeasurement3D",
    "esri/widgets/AreaMeasurement3D",
    "esri/widgets/ElevationProfile",
    "esri/widgets/Daylight",
    "esri/widgets/Weather",
    "esri/geometry/support/webMercatorUtils",
    "esri/widgets/Bookmarks",
    "esri/webmap/Bookmark",
    "esri/layers/SceneLayer",
    "esri/geometry/Point",
    "esri/layers/TileLayer",
    "esri/layers/ElevationLayer",
    "esri/layers/GroupLayer",
    "esri/widgets/Editor",
    "esri/geometry/Polygon", "esri/Graphic", "esri/layers/GraphicsLayer", "esri/layers/support/LabelClass", "esri/config", "esri/layers/WebTileLayer",
    "esri/renderers/ClassBreaksRenderer", "esri/widgets/LineOfSight", "esri/layers/IntegratedMesh3DTilesLayer",
    "esri/geometry/SpatialReference", "esri/geometry/projection", "esri/analysis/ViewshedAnalysis", "esri/analysis/Viewshed", "esri/core/promiseUtils"

], (SceneView, LayerList, reactiveUtils, Camera, Map, intl,
    FeatureLayer, Expand, GeoJSONLayer, IntegratedMeshLayer, Field, Symbol, WebScene, BuildingSceneLayer, Slice, SlicePlane, Collection, BuildingExplorer,
    query, TopFeaturesQuery, CoordinateConversion, Format, Conversion, BasemapGallery,
    DirectLineMeasurement3D, AreaMeasurement3D, ElevationProfile, Daylight, Weather, webMercatorUtils, Bookmarks,
    Bookmark, SceneLayer, Point, TileLayer, ElevationLayer, GroupLayer, Editor, Polygon, Graphic, GraphicsLayer, LabelClass, esriConfig, WebTileLayer,
    ClassBreaksRenderer, LineOfSight, IntegratedMesh3DTilesLayer, SpatialReference, projection, ViewshedAnalysis, Viewshed, promiseUtils) => {
    // Load webscene and display it in a SceneView

    let lon = 32.810847;
    let lat = 39.963744;
    let z = 1364.58;
    let tilt = 49.00;
    let heading = 350;
    let view
    let activeWidget, homeCamera;
    var parselSorgula = false;
    let viewshedAnalysis, analysisView;
    let abortController = null;

    homeCamera = new Camera({
        tilt: tilt,
        heading: heading,
        position: {
            latitude: lat,
            longitude: lon,
            z: z,
        },
    });

    esriConfig.request.interceptors.push({
        urls: "atlas.harita.gov.tr",
        headers: {

            Referer: 'https://parselsorgu.tkgm.gov.tr/'
        },

        before: function (params) {
            params.requestOptions.headers = {
                Referer: 'https://parselsorgu.tkgm.gov.tr/'
            };
        },

    });

    intl.setLocale("tr");
    initUI();
    if (window.location.hash !== '') {

        var hash = window.location.hash.replace('#map=', '');
        var parts = hash.split('/');
        if (parts.length === 5) {

            lat = parseFloat(parts[0]);
            lon = parseFloat(parts[1]);
            z = parseFloat(parts[2]);
            tilt = parseFloat(parts[3]);
            heading = parseFloat(parts[4]);
        }
    }
    map = new Map({
        basemap: "hybrid",//"dark-gray-vector",
        ground: "world-elevation"
    });
    map.ground.navigationConstraint = {
        type: "none",
    };

    const drawer = document.getElementById('drawerFilter');
    drawer.addEventListener('hidden.bs.offcanvas', event => {
        $('#btnFiltre').removeClass("active");
    })

    let previewContainer = document.getElementById("previewContainer");
    let createViewshedButton = document.getElementById("btnViewshedAdd");
    let canceliewshedButton = document.getElementById("btnViewshedCancel");
    let textViewshedPrompt = document.getElementById("textViewshedPrompt");
    


    canceliewshedButton.addEventListener("click", () => {
        stopCreating();
    });

    createViewshedButton.addEventListener("click", () => {
        $('#textViewshedPrompt').show();
        abortController = new AbortController();
        updateUI();

        analysisView
            .createViewsheds({ signal: abortController.signal })

            .catch((e) => {
                // When the operation is stopped, don't do anything. Any other errors are thrown.
                if (!promiseUtils.isAbortError(e)) {
                    throw e;
                }
            })
            .finally(() => {
                // Schedule to update the UI once creating viewsheds is finished.
                updateUI();
            });

    });

    var initialViewParams = {
        container: "mapContainer",
        map: map,
        popupEnabled: true,
        camera: new Camera({
            tilt: tilt,
            heading: heading,
            position: {
                latitude: lat,
                longitude: lon,
                z: z,
                //spatialReference: { wkid: 4326 }
            },
        }),
        environment: {
            atmosphere: {
                // creates a realistic view of the atmosphere
                quality: "high"
            },
            lighting: {
                type: 'virtual'
            }
        }
    };
    let layer = new TileLayer({
        title: "Ortho Photo 10cm",
        url: "https://arcgis.mipmap.nl/server/rest/services/Hosted/TKGM_Ortho_10cm/MapServer"

    });
    map.add(layer);  // adds the layer to the map

    let elevLyr = new ElevationLayer({
        url: "https://arcgis.mipmap.nl/server/rest/services/TKGM_DTM_1m/ImageServer"
    });
    // Add elevation layer to the map's ground.
    map.ground.layers.add(elevLyr);


    //var tilesLayer = new IntegratedMesh3DTilesLayer({
    //    url: "https://localhost:7208/Luciad_Tileset_V1.0/tileset.json"//"https://3dsurectakipservis.tkgm.gov.tr/TileService/Solid/5/tileset.json"//
    //    //"https://arcgis.mipmap.nl/server/rest/services/Hosted/Luciad_Tileset_V1_0/3DTilesServer/tileset.json"
    //});
    //map.add(tilesLayer);

    view = new SceneView(initialViewParams);
    var gmlName = "M-21737291-A";//,CityGML_M-94560501-C__09.01.2025,CityGML_M-94560501-D__09.01.2025,CityGML_M-94560501-E__09.01.2025,CityGML_M-94560501-F__09.01.2025,CityGML_M-94560501-G__09.01.2025,CityGML_M-94560501-H__09.01.2025";// "M-25448841-A";// "M-25441739-A";//"F-3239548-1";// 
    const geojsonlayer = new GeoJSONLayer({
        url: "/Home/GeoJSON/" + gmlName,
        popupEnabled: true,
        outFields: ["*"],
        visible: false,
        popupTemplate: {
            title: 'Bina Özellikleri',
            content: generateContent
        },
        renderer: mimariRenderer(),
        labelingInfo: [mimariLabelClass()]
    });
    map.add(geojsonlayer);


    var gmlName2 = "CityGML_M-94560501-F__09.01.2025,M-3244706-A,M-3244705-A,M-2826521-A,M-25448841-A,M-25448841-A,M-25441739-A,F-3239548-1";// 
    const geojsonlayer2 = new GeoJSONLayer({
        url: "/Home/GeoJSON/" + gmlName2,
        popupEnabled: true,
        outFields: ["*"],
        visible: false,
        popupTemplate: {
            title: 'Bina Özellikleri',
            content: generateContent
        },
        renderer: mimariRenderer(),
        labelingInfo: [mimariLabelClass()]
    });
    map.add(geojsonlayer2);

    const layerIst = new GeoJSONLayer({
        url: "/Home/GeoJSON/M-25448841-A",
        popupEnabled: true,
        outFields: ["*"],
        visible: false,
        popupTemplate: {
            title: 'Bina Özellikleri',
            content: generateContent
        },
        renderer: mimariRenderer(),
        labelingInfo: [mimariLabelClass()]
    });
    map.add(layerIst);


    var mesh3d = new IntegratedMeshLayer({
        url: "https://arcgis.mipmap.nl/server/rest/services/TKGM_Golbasi_4326/SceneServer",
        copyright: "Mipmap",
        title: "3D Mesh",
        visible: true,
    });
    map.add(mesh3d);

    var buildings = new SceneLayer({
        title: "Binalar",
        url: "https://arcgis.mipmap.nl/server/rest/services/Hosted/TKGM_Buildings/SceneServer",
        visible: false,
        outFields: ["*"],
        popupTemplate: {
            title: 'Bina Özellikleri',
            content: buildingsContent
        },
    });
    map.add(buildings);



    


    var buildings2 = new SceneLayer({
        title: "Binalar (Kaplamasız)",
        url: "https://arcgis.mipmap.nl/server/rest/services/Hosted/TKGM_Buildings_No_Textures/SceneServer",
        popupEnabled: true,
        outFields: ["*"],
        popupTemplate: {
            title: 'Bina Özellikleri',
            content: buildingsContent
        },
    });
    map.add(buildings2);

    const statesLabelClass = new LabelClass({
        labelExpressionInfo: { expression: "$feature.adaNo + ' / ' + $feature.parselNo" },
        symbol: {
            type: "text",  // autocasts as new TextSymbol()
            color: "black",
            haloSize: 1,
            haloColor: "white"
        }
    });




    const quakeLayer = new GeoJSONLayer({
        url: "/api/Services/GetLastEarthquakes",
        popupEnabled: true,
        title: 'Son Depremler',
        outFields: ["*"],
        visible: false,
        popupTemplate: {
            title: 'Depremler',
            content: generateContent
        },
        renderer: quakesRenderer(),
        //labelingInfo: [mimariLabelClass()]
    });
    map.add(quakeLayer);

    function stopCreating() {
        abortController?.abort();
        abortController = null;
        updateUI();
    }

    function updateUI() {
        const creating = abortController != null;
        createViewshedButton.style.display = creating ? "none" : "flex";
        canceliewshedButton.style.display = creating ? "flex" : "none";
        textViewshedPrompt.style.display = creating ? "flex" : "none";
    }

    function checkFOV() {
        const viewshed = analysisView?.selectedViewshed;
        const horizontalLimit = 120;
        const verticalLimit = 90;

        if (!viewshed ) {
            return;
        }

        if (viewshed.horizontalFieldOfView > horizontalLimit) {
            viewshed.horizontalFieldOfView = horizontalLimit;
        }

        if (viewshed.verticalFieldOfView > verticalLimit) {
            viewshed.verticalFieldOfView = verticalLimit;
        }

    }


    function bearing(startLat, startLng, destLat, destLng) {
        //console.log(startLat, startLng, destLat, destLng)
        startLat = toRadians(startLat);
        startLng = toRadians(startLng);
        destLat = toRadians(destLat);
        destLng = toRadians(destLng);
        //console.log(startLat, startLng, destLat, destLng)
        let y = Math.sin(destLng - startLng) * Math.cos(destLat);
        let x = Math.cos(startLat) * Math.sin(destLat) -
            Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
        let brng = Math.atan2(y, x);
        brng = toDegrees(brng);
        return (brng + 360) % 360;
    }

    function getHeading(pointA, pointB) {
        const atan2 = Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]);
        return (
            90 - atan2 * 180 / Math.PI
        );
    }
    // Converts from degrees to radians.
    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    };

    // Converts from radians to degrees.
    function toDegrees(radians) {
        return radians * 180 / Math.PI;
    }




    let layerParsel = new FeatureLayer({
        title: "TKGM Parsel",
        objectIdField: "OBJECTID",
        source: [],
        spatialReference: { wkid: 4326 },
        geometryType: "polygon",
        outFields: ["*"],
        labelingInfo: [statesLabelClass],
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                color: [255, 255, 204, 0.1],
                style: "solid",
                outline: {  // autocasts as new SimpleLineSymbol()
                    color: [51, 51, 204, 0.9],
                    width: 2
                }
            }
        },
        popupTemplate: {
            title: 'Parsel',
            content: generateContent
        },
        fields: [
            {
                name: "OBJECTID",
                type: "string"
            },
            {
                name: "alan",
                type: "string"
            },
            {
                name: "adaNo",
                type: "string"
            },
            {
                name: "durum",
                type: "string"
            },
            {
                name: "gittigiParselListe",
                type: "string"
            }
            , {
                name: "gittigiParselSebep",
                type: "string"
            }, {
                name: "ilAd",
                type: "string"
            }, {
                name: "ilceAd",
                type: "string"
            }, {
                name: "mahalleAd",
                type: "string"
            }, {
                name: "mevkii",
                type: "string"
            }, {
                name: "nitelik",
                type: "string"
            }, {
                name: "ozet",
                type: "string"
            }, {
                name: "parselNo",
                type: "string"
            }, {
                name: "zeminKmdurum",
                type: "string"
            }
        ]
    });

    map.add(layerParsel);


    //    const tiledLayer = new WebTileLayer({
    //        urlTemplate:"https://atlas.harita.gov.tr/webservis/ortofoto/{z}/{x}/{y}.jpg?apikey=blFTJejQ0rAxRG9gMvneL13AQXPsckFh",
    ////            "https://{subDomain}.tile.opentopomap.org/{z}/{x}/{y}.png",

    //        copyright: 'HGM'
    //    });
    //    map.add(tiledLayer);

    view.when(async () => {

        viewshedAnalysis = new ViewshedAnalysis();
        view.analyses.add(viewshedAnalysis);

        analysisView = await view.whenAnalysisView(viewshedAnalysis);
        analysisView.interactive = true;

        const viewshedCounter = viewshedAnalysis.viewsheds.length;


        reactiveUtils.when(
            () => view.stationary === true,
            () => {
                if (view.extent) {
                    showWeatherInPosition(view.camera.position);
                    setLocationUrl();
                }
            },
            () => viewshedAnalysis.viewsheds.length > viewshedCounter && analysisView.selectedViewshed,
            () => {
                stopCreating();
            }
        );
        setLocationUrl();
        showWeatherInPosition(view.camera.position);

        initializePreview(previewContainer, view, null, analysisView);

        reactiveUtils.watch(
            () => analysisView?.selectedViewshed,
            (selectedViewshed) => {
                previewContainer.style.display = selectedViewshed ? "flex" : "none";
                
            }
        );

        view.ui.add("divViewshed", "top-right");

        

    });

    view.on("click", (event) => {

        var point = event.mapPoint;
        if (parselSorgula)
            getTkgmParsel(point.latitude, point.longitude);

        //const opts = {
        //    include: hurricanesLayer
        //}
        //view.hitTest(event, opts).then((response) => {
        //    // check if a feature is returned from the hurricanesLayer
        //    if (response.results.length) {
        //        const graphic = response.results[0].graphic;
        //        // do something with the graphic
        //    }
        //});
    });

    function initializePreview(previewContainer, view, programaticViewshed, analysisView) {
        // Create a new scene component with the same set of layers as the main one.
        const previewElement = document.createElement("arcgis-scene");
        previewElement.map = view.map;
        // Once the component is loaded, adjust more of its settings and change its camera to reflect the viewshed observer setup.
        previewElement.addEventListener("arcgisViewReadyChange", () => {
            const previewView = previewElement.view;
            //previewView.camera = getCameraFromViewshed(programaticViewshed);
            previewView.environment = view.environment;
            previewView.ui.components = [];

            // Have the preview's camera update dependent on the selected viewshed.
            reactiveUtils.when(
                () => {
                    const viewshed = analysisView.selectedViewshed;
                    return viewshed ? getCameraFromViewshed(viewshed) : null;
                },
                (camera) => {
                    previewView.camera = camera;
                }
            );
        });

        previewContainer.appendChild(previewElement);
    }

    function getCameraFromViewshed(viewshed) {
        return new Camera({
            position: viewshed.observer,
            heading: viewshed.heading,
            tilt: viewshed.tilt,
            // Calculate camera's diagonal field of view angle.
            fov: getDiagonal(viewshed.verticalFieldOfView, viewshed.horizontalFieldOfView)
        });
    }
    function getDiagonal(a, b) {
        return Math.sqrt(a ** 2 + b ** 2);
    }


    function quakesRenderer() {

        let r2 = new ClassBreaksRenderer({
            field: "magnitude",
            defaultSymbol: {
                type: "simple-marker", // autocasts as new SimpleFillSymbol()
                color: "black",
                size: "10px",
                outline: {
                    color: "yellow",
                    width: "2px"
                }
            },
        });
        r2.addClassBreakInfo({
            minValue: 0,
            maxValue: 5.0,
            symbol: {
                type: "simple-marker",
                color: [0, 0, 0, 0],
                size: "10px",
                outline: {
                    color: "yellow",
                    width: "2px"
                }
            }
        });
        r2.addClassBreakInfo({
            minValue: 5.1,
            maxValue: 6.0,
            symbol: {
                type: "simple-marker",
                color: [0, 0, 0, 0],
                size: "20px",
                outline: {
                    color: "orange",
                    width: "3px"
                }
            }
        });
        r2.addClassBreakInfo({
            minValue: 6.1,
            maxValue: 10.0,
            symbol: {
                type: "simple-marker",
                color: [0, 0, 0, 0],
                size: "30px",
                outline: {
                    color: "red",
                    width: "4px"
                }
            }
        });


        return r2;
    }


    function mimariLabelClass() {
        const labelClass = new LabelClass({
            symbol: {
                type: "label-3d",
                symbolLayers: [
                    {
                        type: "text",
                        material: {
                            color: "white"
                        },
                        size: 10
                    }
                ]
            },

            labelExpressionInfo: {
                expression: `
                    if(HasValue($feature,"name"))
                    {
                        if($feature.name=='Taban')
                        {
                            var r=$feature.roomName;
                            var r1=Split(r,'_');
                            return Back(r1)+" "+ $feature.calculatedArea +' m²';
                        }
                    }
                    return '';
                `,
                repeatLabel: false,
            }
        });
        return labelClass;
    }
    function getTkgmParsel(lat, lon) {

        fetch(`/Home/ParselSorgu?lon=${lon}&lat=${lat}`)
            .then((response) => response.json())
            .then(function (data) {
                setActiveWidget(null);
                if (data.success) {
                    var parsel = JSON.parse(data.data);
                    console.log(parsel);
                    const polygon = {
                        type: "polygon", // autocasts as new Polyline()
                        rings: parsel.geometry.coordinates
                    };
                    parsel.properties["OBJECTID"] = create_UUID();
                    var feature = {
                        geometry: polygon,
                        attributes: parsel.properties
                    };

                    let symbol = {
                        type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                        color: [51, 51, 204, 0.9],
                        style: "solid",
                        outline: {  // autocasts as new SimpleLineSymbol()
                            color: "white",
                            width: 1
                        }
                    };

                    let polygonGraphic = new Graphic({
                        geometry: polygon,
                        symbol: symbol,
                        attributes: parsel.properties
                    });
                    var graphics = [polygonGraphic];
                    const addEdits = {
                        addFeatures: graphics
                    };
                    applyEditsToLayer(addEdits);
                }
                else
                    Swal.fire("Parsel Sorgu", data.msg, "warning");

            });
    }

    function applyEditsToLayer(edits) {
        layerParsel
            .applyEdits(edits)
            .then((results) => {
                // if edits were removed
                if (results.deleteFeatureResults.length > 0) {
                    console.log(
                        results.deleteFeatureResults.length,
                        "features have been removed"
                    );

                }
                // if features were added - call queryFeatures to return
                //    newly added graphics
                if (results.addFeatureResults.length > 0) {
                    let objectIds = [];
                    results.addFeatureResults.forEach((item) => {
                        objectIds.push(item.OBJECTID);
                    });
                    // query the newly added features from the layer
                    layerParsel
                        .queryFeatures({
                            objectIds: objectIds
                        })
                        .then((results) => {
                            console.log(
                                results.features.length,
                                "features have been added."
                            );

                        })
                }
            })
            .catch((error) => {
                setActiveWidget(null);
            });
    }

    function create_UUID() {
        // Get the current time in milliseconds since the Unix epoch.
        var dt = new Date().getTime();
        // Replace the placeholders in the UUID template with random hexadecimal characters.
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            // Generate a random hexadecimal digit.
            var r = (dt + Math.random() * 16) % 16 | 0;
            // Update dt to simulate passage of time for the next random character.
            dt = Math.floor(dt / 16);
            // Replace 'x' with a random digit and 'y' with a specific digit (4 for UUID version 4).
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        // Return the generated UUID.
        return uuid;
    }

    function buildingsContent(feature) {


        var graphic = feature.graphic;
        var attributes = graphic.attributes;
        //let lat = graphic.geometry.centroid.latitude;
        //let lng = graphic.geometry.centroid.longitude;
        //console.log(lat, lng);
        var table = `<table class="table table-dark">`;
        console.log(attributes);

        var fields = {
            "Area": "Alan", "Height": "Yükseklik", "BuildingId": "Bina ID", "gml_id": "GML ID", "roofProjectionArea": "Çatı Projeksiyon Alanı", "blockNumber": "Ada No",
            "buildingType": "Bina Türü", "constructionID": "Yapım ID", "parcelNumber": "Parsel No", "takbisNeighbourhoodReference": "TAKBİS  Komşu Referans",
            "takbisPropertyIdentityNumber": "TAKBİS Mülkiyet ID", "tenderRegistrationNumber": "Kayıt No", "Z_Min": "En Az Yükseklik",
            "Z_Max": "En Çok Yükseklik"
        };

        for (var i in attributes) {
            var f = fields[i];
            if (!f)
                continue;
            if (i != "__OBJECTID" && attributes[i] != null)
                table += `<tr><th>${f}</td><td>${attributes[i]}</tr>`;
        }
        table += '</table>';
        return table;

    }


    function generateContent(feature) {


        var graphic = feature.graphic;
        var attributes = graphic.attributes;
        //let lat = graphic.geometry.centroid.latitude;
        //let lng = graphic.geometry.centroid.longitude;
        //console.log(lat, lng);
        var div = document.createElement("div");

        var table = document.createElement("table");
        table.classList.add("table");
        table.classList.add("table-dark");
        div.appendChild(table);

        for (var i in attributes) {

            if (i == "eventDate") {
                var tr = document.createElement("tr");
                table.appendChild(tr);
                var d = new Date(attributes[i]);

                tr.appendChild($('<th>', { "style": "text-align:left;" }).html(i )[0]);
                tr.appendChild($('<td>', { "style": "text-align:left;" }).html(d.toLocaleString())[0]);
                continue;
            }

            if (i != "__OBJECTID" && attributes[i] != null) {
                var tr = document.createElement("tr");
                table.appendChild(tr);
                tr.appendChild($('<th>', { "style": "text-align:left;" }).html(i)[0]);
                tr.appendChild($('<td>', { "style": "text-align:left;" }).html(attributes[i])[0]);
            }
                
        }
        var div2 = document.createElement("div");

        div.appendChild(div2);
        div2.classList.add("d-flex");
        div2.classList.add("justify-content-between");

        var a2 = document.createElement("a");
        div2.appendChild(a2);
        a2.text = "Buradan Bakış";
        a2.setAttribute("href", `javascript:void(0)`);
        a2.addEventListener("click", Bakis);


        return div;

    }

    function viewShed() {
        var feat = view.popup.selectedFeature;

        var c = feat.geometry.centroid;
        
        var z = c.z;

        const point = {
            type: "point",
            longitude: 32.832320,
            latitude: 39.965036,
        };


        

        const viewshed = new Viewshed({
            observer: {
                spatialReference: {
                    wkid: 4326
                },
                x: c.longitude,
                y: c.latitude,
                z: z
            },
            farDistance: 900,
            heading: getHeading([c.longitude, c.latitude], [point.longitude, point.latitude]),
            tilt: 84,
            horizontalFieldOfView: 85,
            verticalFieldOfView: 52
        });
        const viewshedAnalysis = new ViewshedAnalysis({
            viewsheds: [viewshed],
        });

        view.analyses.add(viewshedAnalysis);


    }

    function Bakis() {
        //layerBagimsiz
        

        var feat = view.popup.selectedFeature;
        if (!feat)
            return;


        console.log(feat);

        var g = map.ground;
        if (g) {
            g.queryElevation(feat.geometry.centroid).then((resultElevation) => {
                
                
                var c = feat.geometry.centroid;
                var z = c.z;

                let outSpatialReference = new SpatialReference({
                    wkid: 4326
                });

                const polyline = {
                    type: "polyline",
                    paths: [[c.longitude, c.latitude], [32.832320, 39.965036]],
                    spatialReference: outSpatialReference
                };
                const boundary = {
                    type: "polyline",
                    paths: [],
                    spatialReference: outSpatialReference
                };


                var geom = projection.project(feat.geometry, outSpatialReference);

                 
                var line1 = turf.lineString(geom.rings[0]);
                var line2 = turf.lineString([[c.longitude, c.latitude], [32.832320, 39.965036]]);
                var intersects = turf.lineIntersect(line1, line2);
                console.log(intersects);
                var cam = [c.longitude, c.latitude];
                if (intersects && intersects.features.length > 0) {
                    var intGeom = intersects.features[0].geometry;
                    cam = [intGeom.coordinates[0], intGeom.coordinates[1]];
                }

                const point = {
                    type: "point",
                    longitude: 32.832320,
                    latitude: 39.965036,
                };

                const camera = view.camera.clone();
                camera.heading = getHeading([c.longitude, c.latitude], [point.longitude, point.latitude]);
                camera.tilt = 80;
                camera.position = {
                    latitude: cam[1],
                    longitude: cam[0],
                    z: z
                }
                view.camera = camera;
            });
        }



    }

    function setLocationUrl() {
        let c = view.camera;

        var hash = `#map=${c.position.latitude.toFixed(6)}/${c.position.longitude.toFixed(6)}/${c.position.z.toFixed(2)}/${c.tilt.toFixed(2)}/${c.heading.toFixed(2)}`;
        var state = {
            lat: c.position.latitude,
            lon: c.position.longitude,
            z: c.position.z,
            heading: c.heading,
            tilt: c.tilt,
        };
        window.history.pushState(state, 'map', hash);
    }

    function mimariRenderer() {

        const renderer = {
            type: "unique-value",
            legendOptions: {
                title: "Mimari Bina"
            },
            field: "name",
            defaultSymbol: {
                type: "simple-fill",
                color: [171, 171, 171, 1],
                style: "solid",
                outline: {
                    width: 1,
                    color: '#444'
                }
            },
            uniqueValueInfos: [{
                value: "Çatı",
                label: "Çatı Kaplaması",
                symbol: {
                    type: "simple-fill",
                    color: [99, 22, 22, 1],
                    style: "solid",
                    outline: {
                        width: 0.3,
                        color: '#3d1222'
                    }
                }
            },
            {
                value: "lod1Solid",
                label: "Solid Duvar",
                symbol: {
                    type: "simple-fill",
                    color: [171, 171, 171, 0.5],
                    style: "solid",
                    outline: {
                        width: 0.5,
                        color: '#3d1222'
                    }
                }
            },
            {
                value: "Dış Pencere",
                label: "Dış Pencere",
                symbol: {
                    type: "simple-fill",
                    color: [152, 212, 205, 0.4],
                    style: "solid",
                    outline: {
                        width: 0.5,
                        color: [140, 100, 81, 1]
                    }
                }
            }, {
                value: "Dış Kapı",
                label: "Dış Kapı",
                symbol: {
                    type: "simple-fill",
                    color: [128, 59, 42, 1],
                    style: "solid",
                    outline: {
                        width: 0.5,
                        color: [69, 34, 25, 1]
                    }
                }
            },
            {
                value: "Taban",
                label: "Taban",
                symbol: {
                    type: "simple-fill",
                    color: [202, 164, 114, 1],
                    style: "solid",
                    outline: {
                        width: 0.5,
                        color: [69, 34, 25, 1]
                    }
                }
            },
            {
                value: "Bina/Yapı Giriş Kapı",
                label: "Bina/Yapı Giriş Kapı",
                symbol: {
                    type: "simple-fill",
                    color: [209, 101, 50, 1],
                    style: "solid",
                    outline: {
                        width: 0.5,
                        color: [82, 72, 67, 1]
                    }
                }
            }

            ]
        }

        return renderer;
    }

    function initUI() {

        $('#chkOrtho').on('click', () => { layer.visible = $('#chkOrtho').is(":checked"); });
        $('#chkMesh').on('click', () => {
            mesh3d.visible = $('#chkMesh').is(":checked");

        });
        $('#chkBuildings').on('click', () => {
            buildings.visible = $('#chkBuildings').is(":checked");

        });
        $('#chkBuildings2').on('click', () => {
            buildings2.visible = $('#chkBuildings2').is(":checked");
        });
        $('#chkBnIst').on('click', () => { layerIst.visible = $('#chkBnIst').is(":checked"); });
        $('#chkQuake').on('click', () => { quakeLayer.visible = $('#chkQuake').is(":checked"); });

        $('#chkBuildings3').on('click', () => {
            geojsonlayer.visible = $('#chkBuildings3').is(":checked");
            geojsonlayer2.visible = $('#chkBuildings3').is(":checked");
        });

        $('#zoomToMesh').on('click', () => {

            view.goTo(mesh3d.fullExtent);
        });
        $('#zoomToMimari').on('click', () => {

            view.goTo(geojsonlayer.fullExtent);
        });
        $('#zoomToBuildings').on('click', () => {

            view.goTo(buildings.fullExtent);
        });
        $('#zoomToBuildings2').on('click', () => {

            view.goTo(buildings2.fullExtent);
        });
        $('#zoomToMimariIst').on('click', () => {

            view.goTo(layerIst.fullExtent);
        });

        $('#zoomToQuake').on('click', () => {

            view.goTo(quakeLayer.fullExtent);
        });

        $('#chkhava').on('click', () => {
            $('#weatherBox').hide();
            showWeatherInPosition(view.camera.position);
        });

        $('[data-button="toolbar"]').on('click', toolbarButton_onClick);

        $('#ddlLayer').on('change', () => {
            var l = $('#ddlLayer').val();
            if (l == "1") {
                buildings.visible = true;
                buildings2.visible = false;
                $('#chkBuildings').prop('checked', true);
                $('#chkBuildings2').prop('checked', false);

            }
            else if (l == "2") {
                buildings.visible = false;
                buildings2.visible = true;
                $('#chkBuildings').prop('checked', false);
                $('#chkBuildings2').prop('checked', true);

            }
            //$('#filterBuildings1').hide();
            //$('#filterBuildings2').hide();
            buildings.renderer = null;
            buildings2.renderer = null;
            filter2();
            //if (v == "2")
            //    $('#filterBuildings2').show();
        });
        $('#filter2Height').on('click', () => { filter2(); });
        $('#filter2Area').on('click', () => { filter2(); });
        $('#filter2Block').on('input', () => { filter2(); });
        $('#filter2Parcel').on('input', () => { filter2(); });
        $('#ddlBuildingType').on('change', () => { filter2(); });

        $("#filter2Height2").ionRangeSlider({
            type: "double ",
            grid: true,
            min: 0,
            max: 100,
            from: 0,
            to: 100,
            postfix: "m.",
            skin: "flat",
            onChange: (data) => {
                filter2();
            }
        });
        $("#filter2Area2").ionRangeSlider({
            type: "double ",
            grid: true,
            min: 0,
            max: 2000,
            from: 0,
            to: 2000,
            postfix: "m²",
            skin: "flat",
            onChange: (data) => {
                filter2();
            }
        });

    }

    function filter2() {

        var v = $('#ddlLayer').val();
        var f1 = $('#filter2Height').is(':checked');
        var f2 = $('#filter2Area').is(':checked');

        var slider = $("#filter2Height2").data("ionRangeSlider");
        var sliderArea = $("#filter2Area2").data("ionRangeSlider");

        var h1 = slider.result.from;
        var h2 = slider.result.to;
        var a1 = sliderArea.result.from;
        var a2 = sliderArea.result.to;

        var query = [];
        var query2 = [];
        if (f1) {
            query.push(`(Height>=${h1} and Height<=${h2})`);
            query2.push(`($feature.Height>=${h1} && $feature.Height<=${h2})`);
        }
        if (f2) {
            query.push(`(Area>=${a1} and Area<=${a2})`);
            query2.push(`($feature.Area>=${a1} && $feature.Area<=${a2})`);
        }

        var block = $('#filter2Block').val();
        var parcel = $('#filter2Parcel').val();
        var buildingType = $('#ddlBuildingType').val();

        if (block) {
            query.push(`blockNumber='${block}'`);
            query2.push(`$feature.blockNumber=='${block}'`);
        }
        if (parcel) {
            query.push(`parcelNumber='${parcel}'`);
            query2.push(`$feature.parcelNumber=='${parcel}'`);
        }
        if (buildingType != "0") {

            query2.push(`$feature.buildingType=='${buildingType}'`);

        }

        //if (query.length > 0)
        //    buildings2.definitionExpression = query.join(" and ");
        //else
        //    buildings2.definitionExpression = "";

        if (query2.length > 0) {

            var arcade = "When(" + query2.join(" && ") + ",'secili','diger')";
            console.log(arcade);
            let renderer = {
                type: "unique-value",
                valueExpression: arcade, //"When($feature.count < 20, 'low', $feature.count >= 20 && $feature.count < 70, 'moderate', $feature.count >=70, 'high', 'other')",
                uniqueValueInfos: [
                    {
                        value: "secili",
                        symbol: createSymbol("#1fcf1f"),
                        label: "Seçili"
                    },
                    {
                        value: "diger",
                        symbol: createSymbol("#bab6b6"),
                        label: "Diğer"
                    },

                ],  // assigns symbols to features evaluating to 'low', 'moderate', or 'high'
            };
            if (v == "1")
                buildings.renderer = renderer;
            else
                buildings2.renderer = renderer;


        }
        else {
            if (v == "1")
                buildings.renderer = null;
            else
                buildings2.renderer = null;

        }


    }
    function createSymbol(color) {
        return {
            type: "mesh-3d",
            symbolLayers: [{
                type: "fill",
                material: { color: color, transparency: 0 },//replace
                edges: { type: "solid", color: [0, 0, 0, 0.5], size: 1, transparency: 60 }
            }]
        };
    }

    function showWeatherInPosition(position) {
        var apiUrl = `/api/services/GetWeather?lat=${position.latitude}&lon=${position.longitude}&appid=24a2e78f8adf4546c65fb79457295726&lang=tr&units=metric`;
        if (position.z < 150000 && $('#chkhava').is(":checked")) {
            // controller.abort();

            fetch(apiUrl, {
                method: 'get',
                //signal : signal,

            }).then((response) => {
                if (!response.ok) {
                    $('#weatherBox').hide();
                    return false;
                }
                return response.json();
            }).then(data => {
                if (data) {
                    var wdata = JSON.parse(data.weather);
                    var loc = JSON.parse(data.geoLocation);
                    $('#weatherBox').show();
                    let weatherHeader = document.querySelector('.weather-header');
                    let weatherIcon = document.querySelector('.weather-image');
                    let weatherValue = document.querySelector('.weather-value');
                    let weatherDescription = document.querySelector('.weather-description');
                    let basinc = document.querySelector('.basinc');
                    let ruzgar = document.querySelector('.ruzgar');
                    let nem = document.querySelector('.nem');
                    weatherHeader.innerHTML = wdata.name;//loc[0].name;
                    weatherIcon.src = '/images/weather/' + wdata.weather[0].icon + '.png';
                    basinc.innerHTML = wdata.main.pressure + 'hPA';
                    ruzgar.innerHTML = wdata.wind.speed + 'm/s';
                    nem.innerHTML = '% ' + wdata.main.humidity;
                    weatherDescription.innerHTML = wdata.weather[0].description;
                    weatherValue.innerHTML = wdata.main.temp + '°';

                    if (wdata.weather[0].icon == "01d" || wdata.weather[0].icon == "01n") {
                        view.environment.weather = {
                            type: "sunny",
                            cloudCover: 0.4
                        }
                    }
                    else if (wdata.weather[0].icon == "04d" || wdata.weather[0].icon == "04n") {
                        view.environment.weather = {
                            type: "cloudy",
                            cloudCover: 0.7
                        }
                    }
                    else if (wdata.weather[0].icon == "10d" || wdata.weather[0].icon == "10n") {
                        view.environment.weather = {
                            type: "rainy",
                            cloudCover: 0.8,
                            precipitation: 0.3
                        }
                    }
                    else if (wdata.weather[0].icon == "13d" || wdata.weather[0].icon == "13n") {
                        view.environment.weather = {
                            type: "snowy",
                            cloudCover: 0.5,
                            precipitation: 0.3,
                            snowCover: "enabled",
                        }
                    }
                    else if (wdata.weather[0].icon == "50d" || wdata.weather[0].icon == "50n") {
                        view.environment.weather = {
                            type: "foggy",
                            fogStrength: 0.4
                        }
                    }

                }
                else
                    $('#weatherBox').hide();

            }).catch(() => {
                $('#weatherBox').hide();

            });
        }
        else
            $('#weatherBox').hide();

    }

    function toolbarButton_onClick(e) {
        if ($(e.currentTarget).hasClass("active")) {
            if (activeWidget) {
                activeWidget.destroy();
                activeWidget = null;
            }
            $(e.currentTarget).removeClass("active")
            parselSorgula = false;
            return;

        }
        setActiveWidget($(e.currentTarget).attr("data-widget"));
    }

    function toggle_full_screen() {
        if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
            if (document.documentElement.requestFullScreen) {
                document.documentElement.requestFullScreen();
            }
            else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
                document.documentElement.mozRequestFullScreen();
            }
            else if (document.documentElement.webkitRequestFullScreen) {   /* Chrome, Safari & Opera */
                document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
            else if (document.msRequestFullscreen) { /* IE/Edge */
                document.documentElement.msRequestFullscreen();
            }
        }
        else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            }
            else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {   /* Chrome, Safari and Opera */
                document.webkitCancelFullScreen();
            }
            else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
        }
    }


    function showFilter() {
        //const drawer = document.getElementById('drawerFilter');


        filterCanvas.toggle();

    }

    function toggleViewshed() {
        var $d = $("#divViewshed");
        if ($d.is(":visible"))
            $d.hide();
        else
            $d.show();


    }

    function setActiveWidget(type) {
        if (activeWidget) {
            activeWidget.destroy();
            activeWidget = null;
        }
        parselSorgula = false;
        switch (type) {
            case "home":
                view.goTo(homeCamera);
                setActiveButton(null);
                break;

            case "viewshed":
                toggleViewshed();
                setActiveButton(null);
                break;

            case "parsel":
                parselSorgula = true;
                setActiveButton(document.getElementById("btnParcel"));
                break;
            case "filtre":
                //showFilter();
                setActiveButton(document.getElementById("btnFiltre"));
                break;
            case "fullscreen":
                toggle_full_screen();
                break;
            case "basemaps":

                activeWidget = new BasemapGallery({
                    view: view,
                });


                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("btnBaseMaps"));
                break;

            case "distance":
                activeWidget = new DirectLineMeasurement3D({
                    view: view
                });

                // skip the initial 'new measurement' button
                activeWidget.viewModel.start().catch((error) => {
                    if (promiseUtils.isAbortError(error)) {
                        return; // don't display abort errors
                    }
                    throw error; // throw other errors since they are of interest
                });

                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("btnMeasureLine"));
                break;
            case "area":
                activeWidget = new AreaMeasurement3D({
                    view: view
                });

                // skip the initial 'new measurement' button
                activeWidget.viewModel.start().catch((error) => {
                    if (promiseUtils.isAbortError(error)) {
                        return; // don't display abort errors
                    }
                    throw error; // throw other errors since they are of interest
                });

                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("btnMeasurePoly"));
                break;

            case "lineofsight":
                activeWidget = new LineOfSight({
                    view: view
                });

                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("btnLineOfSight"));
                break;

            case "profile":
                activeWidget = new ElevationProfile({
                    view: view,
                    profiles: [{
                        // displays elevation values from Map.ground
                        type: "ground", //autocasts as new ElevationProfileLineGround()
                        title: "Zemin"
                    }, {
                        // displays elevation values from a SceneView
                        type: "view", //autocasts as new ElevationProfileLineView()
                        title: "Ekran"
                    }]
                });
                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("btnMeasureProfile"));
                break;
            case "daylight":
                activeWidget = new Daylight({
                    view: view
                });

                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("btnDaylight"));
                break;
            case "weather":
                activeWidget = new Weather({
                    view: view
                });

                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("btnWeather"));
                break;
            case "slice":
                activeWidget = new Slice({
                    view: view
                });
                view.ui.add(activeWidget, "top-right");
                setActiveButton(document.getElementById("btnSlice"));
                break;

            //case "List":
            //    activeWidget = new LayerList({
            //        view: view
            //    });
            //    view.ui.add(activeWidget, "top-left");
            //    setActiveButton(document.getElementById("btnLayerList"));
            //    break;

            case null:
                if (activeWidget) {
                    view.ui.remove(activeWidget);
                    activeWidget.destroy();
                    activeWidget = null;
                    parselSorgula = false;

                }
                setActiveButton(null);
                break;
        }
    }
    function setActiveButton(selectedButton) {
        // focus the view to activate keyboard shortcuts for sketching
        view.focus();
        const elements = document.getElementsByClassName("active");
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
        }
        if (selectedButton) {
            selectedButton.classList.add("active");
        }
    }


});