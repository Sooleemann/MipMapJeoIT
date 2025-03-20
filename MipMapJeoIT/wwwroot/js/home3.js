
require([
    "esri/Map",
    "esri/layers/SceneLayer",
    "esri/layers/FeatureLayer",
"esri/WebScene",
"esri/views/SceneView",
"esri/layers/GraphicsLayer",
"esri/widgets/Sketch/SketchViewModel",
"esri/widgets/Slider",
"esri/geometry/operators/geodesicBufferOperator",
"esri/Graphic",
    "esri/core/promiseUtils",
    "esri/Camera"
], (Map, SceneLayer, FeatureLayer ,WebScene, SceneView, GraphicsLayer, SketchViewModel, Slider, geodesicBufferOperator, Graphic, promiseUtils, Camera) => {
    // Load webscene and display it in a SceneView

    initSliders();


let ODTUScene = new SceneLayer({
    url: "https://services3.arcgis.com/U6foQVCzh67NkRmC/arcgis/rest/services/IOD_multipatch_3857_/SceneServer"
    //definitionExpression: "Type_Toit = 'plat' AND H_MAX <= 20"
});
    let ODTUFeature = new FeatureLayer({
        url: "https://services3.arcgis.com/U6foQVCzh67NkRmC/arcgis/rest/services/IOD_multipatch_3857_/FeatureServer/23"
        //definitionExpression: "Type_Toit = 'plat' AND H_MAX <= 20"
    });


    
// create the SceneView
const view = new SceneView({
    container: "mapContainer",
    map: new Map({
        basemap: "topo-vector"
    })
});
window.view = view;
// add a GraphicsLayer for the sketches and the buffer
const sketchLayer = new GraphicsLayer();
const bufferLayer = new GraphicsLayer();
    view.map.addMany([ODTUScene,bufferLayer, sketchLayer]);

let sceneLayer = ODTUScene;
let sceneLayerView = null;
let bufferSize = 0;

// Assign scene layer once webscene is loaded and initialize UI
    //ODTUScene.load().then(() => {
    //sceneLayer = ODTUScene.layers.find((layer) => {
    //    return layer.title === "Heating System";
    //});
    //sceneLayer.outFields = ["Q_Heating_2050__kWh_m2_", "Q_Heating_20980__kWh_m2_"];

    view.whenLayerView(ODTUScene).then((layerView) => {
        queryDiv.style.display = "block";
        view.goTo(ODTUScene.fullExtent);
    sceneLayerView = layerView;
    if (geodesicBufferOperator.isLoaded()) {
    }
    });
//});

// Load the operator's dependencies
geodesicBufferOperator.load().then(() => {
    if (sceneLayerView) {
    queryDiv.style.display = "block";
    }
});

view.ui.add([queryDiv], "bottom-left");
view.ui.add([resultDiv], "top-right");

// use SketchViewModel to draw polygons that are used as a query
let sketchGeometry = null;
const sketchViewModel = new SketchViewModel({
    layer: sketchLayer,
    defaultUpdateOptions: {
    tool: "reshape",
    toggleToolOnClick: false
    },
    view: view,
    defaultCreateOptions: { hasZ: false }
});

sketchViewModel.on("create", (event) => {
    if (event.state === "complete") {
    sketchGeometry = event.graphic.geometry;
    runQuery();
    }
});

sketchViewModel.on("update", (event) => {
    if (event.state === "complete") {
    sketchGeometry = event.graphics[0].geometry;
    runQuery();
    }
});
// draw geometry buttons - use the selected geometry to sktech
const pointBtn = document.getElementById("point-geometry-button");
const lineBtn = document.getElementById("line-geometry-button");
const polygonBtn = document.getElementById("polygon-geometry-button");
pointBtn.addEventListener("click", geometryButtonsClickHandler);
lineBtn.addEventListener("click", geometryButtonsClickHandler);
polygonBtn.addEventListener("click", geometryButtonsClickHandler);
function geometryButtonsClickHandler(event) {
    const geometryType = event.target.value;
    clearGeometry();
    sketchViewModel.create(geometryType);
}

const bufferNumSlider = new Slider({
    container: "bufferNum",
    min: 0,
    max: 500,
    steps: 1,
    visibleElements: {
    labels: true
    },
    precision: 0,
    labelFormatFunction: (value, type) => {
    return `${value.toString()}m`;
    },
    values: [0]
});
// get user entered values for buffer
bufferNumSlider.on(["thumb-change", "thumb-drag"], bufferVariablesChanged);
function bufferVariablesChanged(event) {
    bufferSize = event.value;
    runQuery();
}
// Clear the geometry and set the default renderer
const clearGeometryBtn = document.getElementById("clearGeometry");
clearGeometryBtn.addEventListener("click", clearGeometry);

// Clear the geometry and set the default renderer
function clearGeometry() {
    sketchGeometry = null;
    sketchViewModel.cancel();
    sketchLayer.removeAll();
    bufferLayer.removeAll();
    clearHighlighting();
    clearCharts();
    resultDiv.style.display = "none";
}

// set the geometry query on the visible SceneLayerView
const debouncedRunQuery = promiseUtils.debounce(() => {
    if (!sketchGeometry) {
    return;
    }

    resultDiv.style.display = "block";
    updateBufferGraphic(bufferSize);
    return promiseUtils.eachAlways([queryStatistics(), updateSceneLayer()]);
});

function runQuery() {
    debouncedRunQuery().catch((error) => {
    if (error.name === "AbortError") {
        return;
    }

    console.error(error);
    });
}

// Set the renderer with objectIds
let highlightHandle = null;
function clearHighlighting() {
    if (highlightHandle) {
    highlightHandle.remove();
    highlightHandle = null;
    }
}

function highlightBuildings(objectIds) {
    // Remove any previous highlighting
    clearHighlighting();
    const objectIdField = sceneLayer.objectIdField;
    document.getElementById("count").innerHTML = objectIds.length;

    highlightHandle = sceneLayerView.highlight(objectIds);
}

// update the graphic with buffer
function updateBufferGraphic(buffer) {
    // add a polygon graphic for the buffer
    if (buffer > 0) {
    const bufferGeometry = geodesicBufferOperator.execute(
        sketchGeometry,
        buffer,
        { unit: "meters" }
    );
    if (bufferLayer.graphics.length === 0) {
        bufferLayer.add(
        new Graphic({
            geometry: bufferGeometry,
            symbol: sketchViewModel.polygonSymbol
        })
        );
    } else {
        bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry;
    }
    } else {
    bufferLayer.removeAll();
    }
}

function updateSceneLayer() {
    const query = sceneLayerView.createQuery();
    query.geometry = sketchGeometry;
    query.distance = bufferSize;
    return sceneLayerView.queryObjectIds(query).then(highlightBuildings);
}

let yearChart = null;
let materialChart = null;

function queryStatistics() {
    const statDefinitions = [
        {
            onStatisticField: "OBJECTID",
            outStatisticFieldName: "test1",
            statisticType: "sum"
        },
        {
            onStatisticField: "OBJECTID",
            outStatisticFieldName: "test2",
            statisticType: "sum"
        },
        {
            onStatisticField: "Uroof",
            outStatisticFieldName: "test3",
            statisticType: "sum"
        }
    //{
    //    onStatisticField: "CASE WHEN buildingMaterial = 'wood' THEN 1 ELSE 0 END",
    //    outStatisticFieldName: "material_wood",
    //    statisticType: "sum"
    //},
    //{
    //    onStatisticField: "CASE WHEN buildingMaterial = 'steel' THEN 1 ELSE 0 END",
    //    outStatisticFieldName: "material_steel",
    //    statisticType: "sum"
    //},
    //{
    //    onStatisticField:
    //    "CASE WHEN buildingMaterial IN ('concrete or lightweight concrete', 'brick', 'wood', 'steel') THEN 0 ELSE 1 END",
    //    outStatisticFieldName: "material_other",
    //    statisticType: "sum"
    //},
    //{
    //    onStatisticField: "CASE WHEN (yearCompleted >= '1850' AND yearCompleted <= '1899') THEN 1 ELSE 0 END",
    //    outStatisticFieldName: "year_1850",
    //    statisticType: "sum"
    //},
    //{
    //    onStatisticField: "CASE WHEN (yearCompleted >= '1900' AND yearCompleted <= '1924') THEN 1 ELSE 0 END",
    //    outStatisticFieldName: "year_1900",
    //    statisticType: "sum"
    //},
    //{
    //    onStatisticField: "CASE WHEN (yearCompleted >= '1925' AND yearCompleted <= '1949') THEN 1 ELSE 0 END",
    //    outStatisticFieldName: "year_1925",
    //    statisticType: "sum"
    //},
    //{
    //    onStatisticField: "CASE WHEN (yearCompleted >= '1950' AND yearCompleted <= '1974') THEN 1 ELSE 0 END",
    //    outStatisticFieldName: "year_1950",
    //    statisticType: "sum"
    //},
    //{
    //    onStatisticField: "CASE WHEN (yearCompleted >= '1975' AND yearCompleted <= '1999') THEN 1 ELSE 0 END",
    //    outStatisticFieldName: "year_1975",
    //    statisticType: "sum"
    //},
    //{
    //    onStatisticField: "CASE WHEN (yearCompleted >= '2000' AND yearCompleted <= '2015') THEN 1 ELSE 0 END",
    //    outStatisticFieldName: "year_2000",
    //    statisticType: "sum"
            //
    ];
    const query = sceneLayerView.createQuery();
    query.geometry = sketchGeometry;
    query.distance = bufferSize;
    query.outStatistics = statDefinitions;

    return sceneLayerView.queryFeatures(query).then((result) => {
    const allStats = result.features[0].attributes;
    updateChart(materialChart, [
        30,
        40,
        50,
        //allStats.material_steel,
        //allStats.material_other
    ]);
    updateChart(yearChart, [
        30,
        40,
        50,
        //allStats.year_1950,
        //allStats.year_1975,
        //allStats.year_2000
    ]);
    }, console.error);
}

// Updates the given chart with new data
function updateChart(chart, dataValues) {
    chart.data.datasets[0].data = dataValues;
    chart.update();
}

function createYearChart() {
    const yearCanvas = document.getElementById("year-chart");
    yearChart = new Chart(yearCanvas.getContext("2d"), {
    type: "horizontalBar",
    data: {
        labels: ["2020", "2050", "2080"],
        datasets: [
        {
            label: "Build year",
            backgroundColor: "#149dcf",
            stack: "Stack 0",
            data: [0, 0, 0]
        }
        ]
    },
    options: {
        responsive: false,
        legend: {
        display: false
        },
        title: {
        display: true,
        text: "Year"
        },
        scales: {
        xAxes: [
            {
            stacked: true,
            ticks: {
                beginAtZero: true,
                precision: 0
            }
            }
        ],
        yAxes: [
            {
            stacked: true
            }
        ]
        }
    }
    });
}
function createMaterialChart() {
    const materialCanvas = document.getElementById("material-chart");
    materialChart = new Chart(materialCanvas.getContext("2d"), {
    type: "doughnut",
    data: {
        labels: ["2020", "2050", "2080"],
        datasets: [
        {
            backgroundColor: ["#FD7F6F", "#7EB0D5", "#B2E061"],
            borderWidth: 0,
            data: [0, 0, 0]
        }
        ]
    },
    options: {
        responsive: false,
        cutoutPercentage: 35,
        legend: {
        position: "bottom"
        },
        title: {
        display: true,
        text: "Building Material"
        }
    }
    });
}

function clearCharts() {
    updateChart(materialChart, [0, 0, 0, 0, 0]);
    updateChart(yearChart, [0, 0, 0, 0, 0, 0]);
    document.getElementById("count").innerHTML = 0;
}
    function initSliders() {

        $("#functionSlider").ionRangeSlider({
            type: "double ",
            grid: true,
            min: 0,
            max: 2,
            postfix: "m²",
            skin: "flat",
            step: 0.1,
            onChange: (data) => {
                //filter2();
            }
        });
        $("#uwallSlider").ionRangeSlider({
            type: "double ",
            grid: true,
            min: 0,
            max: 2,
            postfix: "m²",
            skin: "flat",
            step: 0.1,
            onChange: (data) => {
                filter2();
            }
        });
        $("#uwindowSlider").ionRangeSlider({
            type: "double ",
            grid: true,
            min: 0,
            max: 2,
            postfix: "m²",
            skin: "flat",
            step: 0.1,
            onChange: (data) => {
                filter2();
            }
        });
        $("#uroofSlider").ionRangeSlider({
            type: "double ",
            grid: true,
            min: 0,
            max: 2,
            postfix: "m²",
            skin: "flat",
            step: 0.1,
            onChange: (data) => {
                filter2();
            }
        });
        $("#ugroundSlider").ionRangeSlider({
            type: "double ",
            grid: true,
            min: 0,
            max: 2,
            postfix: "m²",
            skin: "flat",
            step: 0.1,
            onChange: (data) => {
                filter2();
            }
        });
        $("#shgcSlider").ionRangeSlider({
            type: "double ",
            grid: true,
            min: 0,
            max: 2,
            postfix: "m²",
            skin: "flat",
            step: 0.1,
            onChange: (data) => {
                filter2();
            }
        });
        $("#infiltrationSlider").ionRangeSlider({
            type: "double ",
            grid: true,
            min: 0,
            max: 2,
            postfix: "m²",
            skin: "flat",
            step: 0.1,
            onChange: (data) => {
                filter2();
            }
        });

    }
createYearChart();
    createMaterialChart();

    let oidd;
    function filter2() {

        var v = $('#ddlLayer').val();
        var f1 = $('#filter2Height').is(':checked');
        var f2 = $('#filter2Area').is(':checked');

        var functionslider = $("#functionSlider").data("ionRangeSlider");
        var uwallslider = $("#uwallSlider").data("ionRangeSlider");
        var uwindowslider = $("#uwindowSlider").data("ionRangeSlider");
        var uroofslider = $("#uroofSlider").data("ionRangeSlider");
        var ugroundslider = $("#ugroundSlider").data("ionRangeSlider");
        var sghcslider = $("#ugroundSlider").data("ionRangeSlider");
        var infiltrationslider = $("#infiltrationSlider").data("ionRangeSlider");

        var functionMin = functionslider.result.from;
        var functionMax = functionslider.result.to;
        var uwallMin = uwallslider.result.from;
        var uwallMax = uwallslider.result.to;
        var uwindowMin = uwindowslider.result.from;
        var uwindowMax = uwindowslider.result.to;
        var uroofMin = uroofslider.result.from;
        var uroofMax = uroofslider.result.to;
        var ugroundMin = ugroundslider.result.from;
        var ugroundMax = ugroundslider.result.to;
        var sghcMin = sghcslider.result.from;
        var sghcMax = sghcslider.result.to;
        var infiltrationMin = infiltrationslider.result.from;
        var infiltrationMax = infiltrationslider.result.to;

        var query = [];
        var query2 = [];
        //if (1) {
        //    query.push(`(Height>=${functionMin} and Height<=${functionMax})`);
        //    query2.push(`($feature.Height>=${functionMin} && $feature.Height<=${functionMax})`);
        //}
        if (1) {
            query.push(`(Uwall >=${uwallMin} AND Uwall <=${uwallMax})`);
            query2.push(`($feature.Uwall >=${uwallMin} && $feature.Uwall <=${uwallMax})`);
        }
        if (1) {
            query.push(`(Uwindow >=${uwindowMin} AND Uwindow <=${uwindowMax})`);
            query2.push(`($feature.Uwindow >=${uwindowMin} && $feature.Uwindow <=${uwindowMax})`);
        }
        if (1) {
            query.push(`(Uroof >=${uroofMin} AND Uroof <=${uroofMax})`);
            query2.push(`($feature.Uroof >=${uroofMin} && $feature.Uroof <=${uroofMax})`);
        }
        if (1) {
            query.push(`(Uground >=${ugroundMin} AND Uground <=${ugroundMax})`);
            query2.push(`($feature.Uground >=${ugroundMin} && $feature.Uground <=${ugroundMax})`);
        }
        if (1) {
            query.push(`(SHGC >=${sghcMin} AND SHGC <=${sghcMax})`);
            query2.push(`($feature.SHGC >=${sghcMin} && $feature.SHGC <=${sghcMax})`);
        }
        if (1) {
            query.push(`(Infiltration >=${infiltrationMin} AND Infiltration <=${infiltrationMax})`);
            query2.push(`($feature.Infiltration>=${infiltrationMin} && $feature.Infiltration <=${infiltrationMax})`);
        }
        clearHighlighting();


        sceneLayer.load().then(() => {
            console.log("Available Fields:", sceneLayer.fields.map(f => f.name));
        });
        sceneLayer.fields.forEach(f => {
            console.log(`Field: ${f.name}, Type: ${f.type}`);
        });
        
        let whereClause = query.join(" AND ");
        //sceneLayerView.queryObjectIds(whereClause).then(highlightBuildings);
        console.log("Object ID Field:", sceneLayer.objectIdField);
        console.log("Supports Querying?", sceneLayer.capabilities?.query?.supportsStatistics);

        console.log(`Uwall >= ${ uwallMin } AND Uwall <= ${ uwallMax })
        AND(Uwindow >= ${ uwindowMin } AND Uwindow <= ${ uwindowMax })
        AND(Uroof >= ${ uroofMin } AND Uroof <= ${ uroofMax })
        AND(Uground >= ${ ugroundMin } AND Uground <= ${ ugroundMax })
        AND(SHGC >= ${ sghcMin } AND SHGC <= ${ sghcMax })
        AND(Infiltration >= ${ infiltrationMin } AND Infiltration <= ${ infiltrationMax })`);
        sceneLayerView.queryObjectIds({
            where: `(Uwall >= ${uwallMin} AND Uwall <= ${uwallMax}) 
            AND (Uwindow >= ${uwindowMin} AND Uwindow <= ${uwindowMax}) 
            AND (Uroof >= ${uroofMin} AND Uroof <= ${uroofMax}) 
            AND (Uground >= ${ugroundMin} AND Uground <= ${ugroundMax}) 
            AND (SHGC >= ${sghcMin} AND SHGC <= ${sghcMax}) 
            AND (Infiltration >= ${infiltrationMin} AND Infiltration <= ${infiltrationMax})`


        }).then((result) => {
            //let objectIds = result.features.map(feature => feature.attributes.OBJECTID);
            console.log(result);
            oidd = result;
            highlightBuildings(result); 

        });
        //sceneLayer.featureEffect = {
        //    filter: {
        //        where: whereClause
        //    },
        //    includedEffect: "bloom(2, 0.5px, 0.2)", // Bright effect for highlights
        //    excludedEffect: "grayscale(100%) opacity(30%)" // Dim non-matching features
        //};

        //var block = $('#filter2Block').val();
        //var parcel = $('#filter2Parcel').val();
        //var buildingType = $('#ddlBuildingType').val();

        //if (block) {
        //    query.push(`blockNumber='${block}'`);
        //    query2.push(`$feature.blockNumber=='${block}'`);
        //}
        //if (parcel) {
        //    query.push(`parcelNumber='${parcel}'`);
        //    query2.push(`$feature.parcelNumber=='${parcel}'`);
        //}
        //if (buildingType != "0") {

        //    query2.push(`$feature.buildingType=='${buildingType}'`);

        //}

        //if (query.length > 0)
        //    buildings2.definitionExpression = query.join(" and ");
        //else
        //    buildings2.definitionExpression = "";

        if (query2.length > 0) {

            var arcade = "When(" + query2.join(" && ") + ")";
            //sceneLayerView.queryObjectIds(arcade).then(highlightBuildings);
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
                        label: "Di?er"
                    },

                ],  // assigns symbols to features evaluating to 'low', 'moderate', or 'high'
            };
            ODTUScene.renderer = renderer;
            //if (v == "1")
            //    buildings.renderer = renderer;
            //else
            //    buildings2.renderer = renderer;


        }
        else {
            //if (v == "1")
            //    buildings.renderer = null;
            //else
            //    buildings2.renderer = null;

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

    

    document.getElementById("btnScenario").addEventListener("click", function () {
        var scenarioData = {
            objectIdList: oidd,  // oidd burada daha önce tanýmlanmýþ olmalý
            selectedYear: document.getElementById("yearDropdown").value,
            function_: document.getElementById("functionSlider").value,
            uwall: document.getElementById("uwallSlider").value,
            uwindow: document.getElementById("uwindowSlider").value,
            uroof: document.getElementById("uroofSlider").value,
            uground: document.getElementById("ugroundSlider").value,
            shgc: document.getElementById("shgcSlider").value,
            infiltration: document.getElementById("infiltrationSlider").value,
        };

        //// varsa onceki senaryoyu al
        let storedScenarios = JSON.parse(localStorage.getItem("scenarios")) || [];

        if (storedScenarios.length >= 3) { // Eðer 3 senaryo varsa
            storedScenarios.shift(); // En eski senaryoyu sil
        }

        storedScenarios.push(scenarioData);

        localStorage.setItem("scenarios", JSON.stringify(storedScenarios));
    });
   



});




