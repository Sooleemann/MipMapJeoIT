const [
    Map, SceneLayer, FeatureLayer, WebScene, SceneView, GraphicsLayer, SketchViewModel, Slider,
    geodesicBufferOperator, Graphic, promiseUtils, Camera, LayerList, reactiveUtils, intl, Expand,
    GeoJSONLayer, IntegratedMeshLayer, Field, Symbol, BuildingSceneLayer, Slice, SlicePlane, Collection,
    BuildingExplorer, query, TopFeaturesQuery, CoordinateConversion, Format, Conversion, BasemapGallery,
    DirectLineMeasurement3D, AreaMeasurement3D, ElevationProfile, Daylight, Weather, webMercatorUtils,
    Bookmarks, Bookmark, Point, TileLayer, ElevationLayer, GroupLayer, Editor, Polygon, LabelClass,
    config, WebTileLayer, ClassBreaksRenderer, LineOfSight, IntegratedMesh3DTilesLayer, SpatialReference,
    project, ViewshedAnalysis, Viewshed, OrientedImageryLayer, FeatureTable
] = await $arcgis.import([
    "@arcgis/core/Map.js",
    "@arcgis/core/layers/SceneLayer.js",
    "@arcgis/core/layers/FeatureLayer.js",
    "@arcgis/core/WebScene.js",
    "@arcgis/core/views/SceneView.js",
    "@arcgis/core/layers/GraphicsLayer.js",
    "@arcgis/core/widgets/Sketch/SketchViewModel.js",
    "@arcgis/core/widgets/Slider.js",
    "@arcgis/core/geometry/operators/geodesicBufferOperator.js",
    "@arcgis/core/Graphic.js",
    "@arcgis/core/core/promiseUtils.js",
    "@arcgis/core/Camera.js",
    "@arcgis/core/widgets/LayerList.js",
    "@arcgis/core/core/reactiveUtils.js",
    "@arcgis/core/intl.js",
    "@arcgis/core/widgets/Expand.js",
    "@arcgis/core/layers/GeoJSONLayer.js",
    "@arcgis/core/layers/IntegratedMeshLayer.js",
    "@arcgis/core/layers/support/Field.js",
    "@arcgis/core/symbols/Symbol.js",
    "@arcgis/core/layers/BuildingSceneLayer.js",
    "@arcgis/core/widgets/Slice.js",
    "@arcgis/core/analysis/SlicePlane.js",
    "@arcgis/core/core/Collection.js",
    "@arcgis/core/widgets/BuildingExplorer.js",
    "@arcgis/core/rest/query.js",
    "@arcgis/core/rest/support/TopFeaturesQuery.js",
    "@arcgis/core/widgets/CoordinateConversion.js",
    "@arcgis/core/widgets/CoordinateConversion/support/Format.js",
    "@arcgis/core/widgets/CoordinateConversion/support/Conversion.js",
    "@arcgis/core/widgets/BasemapGallery.js",
    "@arcgis/core/widgets/DirectLineMeasurement3D.js",
    "@arcgis/core/widgets/AreaMeasurement3D.js",
    "@arcgis/core/widgets/ElevationProfile.js",
    "@arcgis/core/widgets/Daylight.js",
    "@arcgis/core/widgets/Weather.js",
    "@arcgis/core/geometry/support/webMercatorUtils.js",
    "@arcgis/core/widgets/Bookmarks.js",
    "@arcgis/core/webmap/Bookmark.js",
    "@arcgis/core/geometry/Point.js",
    "@arcgis/core/layers/TileLayer.js",
    "@arcgis/core/layers/ElevationLayer.js",
    "@arcgis/core/layers/GroupLayer.js",
    "@arcgis/core/widgets/Editor.js",
    "@arcgis/core/geometry/Polygon.js",
    "@arcgis/core/layers/support/LabelClass.js",
    "@arcgis/core/config.js",
    "@arcgis/core/layers/WebTileLayer.js",
    "@arcgis/core/renderers/ClassBreaksRenderer.js",
    "@arcgis/core/widgets/LineOfSight.js",
    "@arcgis/core/layers/IntegratedMesh3DTilesLayer.js",
    "@arcgis/core/geometry/SpatialReference.js",
    "@arcgis/core/geometry/operators/projectOperator.js",
    "@arcgis/core/analysis/ViewshedAnalysis.js",
    "@arcgis/core/analysis/Viewshed.js",
    "@arcgis/core/layers/OrientedImageryLayer.js",
    "@arcgis/core/widgets/FeatureTable.js"
]);


// Load webscene and display it in a SceneView
let homeCamera;
let activeWidget = null;
let sceneLayerView;
let sceneLayerViews = {};
let sceneLayer;
let highlightHandles = [];
let sliderDefaults = {};
let featureTable;
let activeLayerView;
let activeLayer;
let highlight;


let ODTUScene = new WebScene({
    portalItem: { id: "3adfc71e9e2a41cba7607b88046d6ecc" }
});

const view = new SceneView({
    container: "mapContainer",
    map: ODTUScene
});
window.view = view;



const layerList = new LayerList({
    view: view,
});
view.ui.add(layerList, { position: "top-left" });

view.when(() => {
    $('[data-button="toolbar"]').on('click', toolbarButton_onClick);
    homeCamera = view.camera.clone();

    const groupLayer = ODTUScene.layers.find(l => l.title === "Envelope Properties");

    if (groupLayer) {
        // GroupLayer içindeki Uwall katmanını bul
        const uwallLayer = groupLayer.layers.find(l => l.title === "Uwall");

        // Tüm alt katmanları kontrol et
        groupLayer.layers.forEach(l => {
            // Sadece Uwall açık kalsın
            l.visible = (l.title === "Uwall");
        });
    }

    const layerNames = ["Uwall", "Uwindow", "Uroof", "Uground", "SHGC", "Infiltration Rate"];

    layerNames.forEach(name => {
        const layer = groupLayer.layers.find(l => l.title === name);
        if (layer) {
            view.whenLayerView(layer).then(lv => {
                sceneLayerViews[name] = lv;
            });
        }
    });

    initSliders(groupLayer);
});

async function filterScene() {
    clearHighlighting();

    // --- Mevcut 6 slider ---
    const uwall = $("#uwallSlider").data("ionRangeSlider").result;
    const uwindow = $("#uwindowSlider").data("ionRangeSlider").result;
    const uroof = $("#uroofSlider").data("ionRangeSlider").result;
    const uground = $("#ugroundSlider").data("ionRangeSlider").result;
    const shgc = $("#shgcSlider").data("ionRangeSlider").result;
    const infiltration = $("#infiltrationSlider").data("ionRangeSlider").result;

    // --- Diğer sliderlar ---
    const grossFloor = $("#grossFloorSlider").data("ionRangeSlider").result;
    const qHeating2025 = $("#sliderQHeating2025").data("ionRangeSlider").result;
    const equipment2025 = $("#sliderEquipment2025").data("ionRangeSlider").result;
    const lighting2025 = $("#sliderLighting2025").data("ionRangeSlider").result;
    const emission2025 = $("#sliderEmission2025").data("ionRangeSlider").result;

    const qHeating2050 = $("#sliderQHeating2050").data("ionRangeSlider").result;
    const equipment2050 = $("#sliderEquipment2050").data("ionRangeSlider").result;
    const lighting2050 = $("#sliderLighting2050").data("ionRangeSlider").result;
    const emission2050 = $("#sliderEmission2050").data("ionRangeSlider").result;

    // --- IOD sliderları (string) ---
    const iod2025 = $("#sliderIOD2025").data("ionRangeSlider").result.from_value;
    const iod2050 = $("#sliderIOD2050").data("ionRangeSlider").result.from_value;

    const groupLayer = ODTUScene.layers.find(l => l.title === "Envelope Properties");
    const activeLayer = groupLayer.layers.find(l => l.visible && l.type === "feature");
    if (!activeLayer) return;

    const lv = await view.whenLayerView(activeLayer);
    const query = activeLayer.createQuery();
    query.returnGeometry = true;

    // --- where koşulu ---
    query.where = `
        Uwall >= ${uwall.from} AND Uwall <= ${uwall.to} AND
        Uwindow >= ${uwindow.from} AND Uwindow <= ${uwindow.to} AND
        Uroof >= ${uroof.from} AND Uroof <= ${uroof.to} AND
        Uground >= ${uground.from} AND Uground <= ${uground.to} AND
        SHGC >= ${shgc.from} AND SHGC <= ${shgc.to} AND
        Infiltration >= ${infiltration.from} AND Infiltration <= ${infiltration.to} AND
        Gross_Floor_Area >= ${grossFloor.from} AND Gross_Floor_Area <= ${grossFloor.to} AND
        F2025_BASE_Qheating >= ${qHeating2025.from} AND F2025_BASE_Qheating <= ${qHeating2025.to} AND
        Equipment_Load_All_Scenarios >= ${equipment2025.from} AND Equipment_Load_All_Scenarios <= ${equipment2025.to} AND
        Lighting_Load_All_Scenarios >= ${lighting2025.from} AND Lighting_Load_All_Scenarios <= ${lighting2025.to} AND
        Emission_BASE__kg_CO2_ >= ${emission2025.from} AND Emission_BASE__kg_CO2_ <= ${emission2025.to} AND
        F2050_BASE_Qheating >= ${qHeating2050.from} AND F2050_BASE_Qheating <= ${qHeating2050.to} AND
        Equipment_Load_All_Scenarios >= ${equipment2050.from} AND Equipment_Load_All_Scenarios <= ${equipment2050.to} AND
        Lighting_Load_All_Scenarios >= ${lighting2050.from} AND Lighting_Load_All_Scenarios <= ${lighting2050.to} AND
        Emission_BASE__kg_CO2_ >= ${emission2050.from} AND Emission_BASE__kg_CO2_ <= ${emission2050.to} 
    `;

    const result = await activeLayer.queryFeatures(query);

    if (!result.features || result.features.length === 0) {
        activeLayer.definitionExpression = "1=0";
        console.log("Sonuç bulunamadı, layer boş gösteriliyor.");
        return;
    }

    const objectIds = result.features.map(f => f.attributes.OBJECTID);
    activeLayer.definitionExpression = `OBJECTID IN (${objectIds.join(",")})`;

    console.log("Toplam highlight edilen OBJECTID sayısı:", objectIds.length);
    //console.log("DefinitionExpression set edildi:", activeLayer.definitionExpression);
}
// --- Sliderların min/max değerlerini WebScene layer'larından al ---
async function getFieldMinMax(layer, field) {
    const query = layer.createQuery();
    query.returnGeometry = false;
    query.outStatistics = [
        { onStatisticField: field, outStatisticFieldName: "minVal", statisticType: "min" },
        { onStatisticField: field, outStatisticFieldName: "maxVal", statisticType: "max" }
    ];
    const result = await layer.queryFeatures(query);
    if (!result.features || result.features.length === 0) {
        //console.warn("Field bulunamadı veya feature yok:", field, "in layer:", layer.title);
        return { min: 0, max: 2 };
    }

    const stats = result.features[0].attributes;
    return { min: stats.minVal ?? 0, max: stats.maxVal ?? 2 };
}
// --- Sliderları başlat ---
async function initSliders(groupLayer) {
    const sliders = [
        { id: "#uwallSlider", field: "Uwall", layerName: "Uwall" },
        { id: "#uwindowSlider", field: "Uwindow", layerName: "Uwindow" },
        { id: "#uroofSlider", field: "Uroof", layerName: "Uroof" },
        { id: "#ugroundSlider", field: "Uground", layerName: "Uground" },
        { id: "#shgcSlider", field: "SHGC", layerName: "SHGC" },
        { id: "#infiltrationSlider", field: "Infiltration", layerName: "Infiltration Rate" },

        { id: "#grossFloorSlider", field: "Gross_Floor_Area", layerName: "Uwall" },
        // ---- 2025 Sliders ----
        { id: "#sliderQHeating2025", field: "F2025_BASE_Qheating", layerName: "Uwall" },
        { id: "#sliderEquipment2025", field: "Equipment_Load_All_Scenarios", layerName: "Uwall" },
        { id: "#sliderLighting2025", field: "Lighting_Load_All_Scenarios", layerName: "Uwall" },
        { id: "#sliderEmission2025", field: "Emission_BASE__kg_CO2_", layerName: "Uwall" },

        // ---- 2050 Sliders ----
        { id: "#sliderQHeating2050", field: "F2050_BASE_Qheating", layerName: "Uwall" },
        { id: "#sliderEquipment2050", field: "Equipment_Load_All_Scenarios", layerName: "Uwall" },
        { id: "#sliderLighting2050", field: "Lighting_Load_All_Scenarios", layerName: "Uwall" },
        { id: "#sliderEmission2050", field: "Emission_BASE__kg_CO2_", layerName: "Uwall" },

    ];

    for (let s of sliders) {
        const layer = groupLayer.layers.find(l => l.title === s.layerName);
        if (!layer) continue;

        const { min, max } = await getFieldMinMax(layer, s.field);

        $(s.id).ionRangeSlider({
            type: "double",
            grid: true,
            min: min,
            max: max,
            from: min,
            to: max,
            step: 0.001,
            skin: "flat",
            prettify: function (num) {
                return num.toFixed(3); // hep 3 basamak
            },
            onFinish: filterScene
        });
    }

    const iodValues = [
        "office_no_iod",
        "0.65",
        "0.44",
        "0.5",
        "0.55",
        "0.43",
        "0.51",
        "0.41",
        "0.47",
        "0.45"
    ];

    $("#sliderIOD2025 , #sliderIOD2050").ionRangeSlider({
        values: iodValues,
        grid: true,
        onFinish: function (data) {
            const selected = data.from_value;
            filterScene({
                field: "F2025_BASE_IOD",
                value: selected,
                layerName: "Uwall"
            });
        }
    });
}
// Filtreyi temizle
function clearHighlighting() {
    highlightHandles.forEach(h => {
        try { h.remove(); } catch (e) { }
    });
    highlightHandles = [];

    const groupLayer = ODTUScene.layers.find(l => l.title === "Envelope Properties");
    const activeLayer = groupLayer.layers.find(l => l.visible && l.type === "feature");
    if (activeLayer) {
        activeLayer.definitionExpression = null; // bütün veriler geri gelir
    }
}

function enableFeatureTableRowClick(table) {
    table.on("row-click", function (event) {
        const objectId = event.row.data.OBJECTID;
        if (!objectId) {
            console.warn("OBJECTID bulunamadı!");
            return;
        }

        view.whenLayerView(table.layer).then(layerView => {
            // Önce varsa eski highlight'ı kaldır
            if (highlight) {
                highlight.remove();
            }

            // Yeni highlight
            highlight = layerView.highlight(objectId);

            // Zoom
            table.layer.queryFeatures({
                objectIds: [objectId],
                outFields: ["*"],
                returnGeometry: true
            }).then(result => {
                if (result.features.length > 0 && result.features[0].geometry) {
                    const geom = result.features[0].geometry;

                    // SceneView'da extent ile gitmek genellikle daha güvenli
                    let target;
                    if (geom.type === "point") {
                        target = geom;
                    } else {
                        target = geom.extent || geom; // polygon/multipoint varsa extent kullan
                    }

                    view.goTo({
                        target: target,
                        tilt: 60,    // isteğe bağlı, daha iyi 3D görünüm
                        zoom: 17     // isteğe bağlı, SceneView'da scale yerine zoom
                    }).catch(err => console.error(err));
                }
            });

        }).catch(err => console.error(err));
    });
}

$("#btnFilterClear").on("click", function () {


    //// Tüm sliderları resetle
    const sliders = [
        "#uwallSlider",
        "#uwindowSlider",
        "#uroofSlider",
        "#ugroundSlider",
        "#shgcSlider",
        "#infiltrationSlider",
        "#grossFloorSlider",
        "#sliderQHeating2025",
        "#sliderEquipment2025",
        "#sliderLighting2025",
        "#sliderEmission2025",
        "#sliderQHeating2050",
        "#sliderEquipment2050",
        "#sliderLighting2050",
        "#sliderEmission2050",
        "#sliderIOD2025",
        "#sliderIOD2050"
    ];

    sliders.forEach(id => {
        const slider = $(id).data("ionRangeSlider");
        if (slider) slider.reset();
    });

    clearHighlighting();
});

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

function toggleFeatureTable() {
    document.getElementById("mapContainer").style.height = "100vh";
    document.getElementById("tableContainer").style.display = "none";

}

function toolbarButton_onClick(e) {
    if (e.currentTarget.id === "btnFiltre") return; //


    if ($(e.currentTarget).hasClass("active")) {
        if (activeWidget) {
            activeWidget.destroy();
            activeWidget = null;
        }
        if (e.currentTarget.id === "btnFiltre") return; //
        $(e.currentTarget).removeClass("active")
        if (e.currentTarget.id == "btnFeatureTable")
            toggleFeatureTable();
        return;

    }
    setActiveWidget($(e.currentTarget).attr("data-widget"));
}

function setActiveWidget(type) {
    if (activeWidget) {
        activeWidget.destroy();
        activeWidget = null;
    }
    switch (type) {
        case "home":
            view.goTo(homeCamera);
            setActiveButton(null);
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

        case "FeatureTable":
            var div = document.createElement("div");
            div.id = "FtableDiv";
            div.style.height = "50vh";
            div.style.width = "100%";

            var conDiv = document.getElementById("tableContainer");
            conDiv.innerHTML = ""; // önceki tabloyu temizle
            conDiv.appendChild(div);

            // Aktif Layer'i bul
            const groupLayersss = view.map.layers.find(l => l.title === "Envelope Properties");

            // GroupLayer altındaki ilk görünür FeatureLayer’i bul
            const activeLayer = groupLayersss.layers.find(l => l.visible && l.type === "feature");

            if (!activeLayer) {
                alert("Tablosu açılacak aktif FeatureLayer yok!");
                break;
            }

            activeWidget = new FeatureTable({
                returnGeometryEnabled: true,
                view: view,
                layer: activeLayer,
                container: div,
                actionColumnConfig: {
                    label: "Zoom to feature",
                    icon: "zoom-to-object",
                    callback: ({ feature }) => view.goTo(feature),
                },
            });

            document.getElementById("tableContainer").style.display = "block";
            document.getElementById("mapContainer").style.height = "50vh";

            setActiveButton(document.getElementById("btnFeatureTable"));
            break;

        case "daylight":
            activeWidget = new Daylight({
                view: view
            });

            view.ui.add(activeWidget, "top-right");
            setActiveButton(document.getElementById("btnDaylight"));
            break;

        case "slice":
            activeWidget = new Slice({
                view: view
            });
            view.ui.add(activeWidget, "top-right");
            setActiveButton(document.getElementById("btnSlice"));
            break;

        case null:
            if (activeWidget) {
                view.ui.remove(activeWidget);
                activeWidget.destroy();
                activeWidget = null;
            }
            setActiveButton(null);
            break;
    }
}

function setActiveButton(selectedButton) {
    view.focus();
    const elements = document.getElementsByClassName("toolbar-btn");
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove("active");
        if (elements[i].id === "btnFiltre") continue;
    }
    if (selectedButton) {
        selectedButton.classList.add("active");
    }
}

const yearDropdown = document.getElementById("yearDropdown");

function updateYearContent() {
    const selectedYear = yearDropdown.value;

    document.getElementById("content2025").classList.add("d-none");
    document.getElementById("content2050").classList.add("d-none");

    const contentEl = document.getElementById("content" + selectedYear);
    if (contentEl) contentEl.classList.remove("d-none");
}

// Event binding
if (yearDropdown) {
    yearDropdown.addEventListener("change", updateYearContent);
    // açılışta bir kere çalıştır
    updateYearContent();
}

const btnScenario = document.getElementById("btnScenario");
const scenarioContainer = document.getElementById("scenarioContainer");
const mapContainer = document.getElementById("mapContainer");

btnScenario.addEventListener("click", async () => {
    const isOpen = scenarioContainer.style.width && scenarioContainer.style.width !== "0px";

    if (isOpen) {
        // Scenario panel kapatma
        scenarioContainer.style.width = "0";
        mapContainer.style.height = "";
        mapContainer.style.flex = "1";

    } else {
        // Panel aç
        scenarioContainer.style.width = "900px"; // panel genişliği
        mapContainer.style.flex = "1 1 calc(100% - 900px)"; // harita küçülüyor

        // Ajax ile içerik yükle
        const response = await fetch("/Home/Scenario");
        const html = await response.text();
        scenarioContainer.innerHTML = html;

        drawScenarioCharts();
    }
});

function drawScenarioCharts() {
    // === PIE CHART ===
    const pieCanvas = document.querySelector("#pieChart");
    if (pieCanvas) {
        const pieChart = new ApexCharts(pieCanvas, {
            chart: {
                type: 'pie',
                height: 263,
                background: '#fff'
            },
            series: [10, 20, 30, 40],
            labels: ["A", "B", "C", "D"],
            colors: ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"],
            legend: { position: 'bottom' },
            title: { text: 'Sample Pie Chart' }
        });
        pieChart.render();
    }

    // === BOX PLOT (Bar taklidi) ===
    const boxPlotCanvas = document.querySelector("#boxPlotChart");
    if (boxPlotCanvas) {
        const boxPlotChart = new ApexCharts(boxPlotCanvas, {
            chart: {
                type: 'bar',
                height: 250,
                background: '#fff'
            },
            series: [{
                name: 'Values',
                data: [12, 19, 7]
            }],
            xaxis: { categories: ["Set 1", "Set 2", "Set 3"] },
            colors: ["#4bc0c0"],
            title: { text: 'Sample Box Plot (Bar Chart)' }
        });
        boxPlotChart.render();
    }

    // === SCATTER ===
    const scatterCanvas = document.querySelector("#scatterChart");
    if (scatterCanvas) {
        const scatterChart = new ApexCharts(scatterCanvas, {
            chart: {
                type: 'scatter',
                height: 250,
                background: '#fff'
            },
            series: [{
                name: "Random Points",
                data: [
                    [-10, 0],
                    [-5, 5],
                    [0, 10],
                    [5, 5],
                    [10, 0]
                ]
            }],
            colors: ["#ff6384"],
            xaxis: { tickAmount: 5 },
            yaxis: { tickAmount: 5 }
        });
        scatterChart.render();
    }

    // === BAR CHART ===
    const barCanvas = document.querySelector("#barChart");
    if (barCanvas) {
        const barChart = new ApexCharts(barCanvas, {
            chart: {
                type: 'bar',
                height: 250,
                background: '#fff'
            },
            series: [{
                name: 'Votes',
                data: [12, 19, 3, 5, 2]
            }],
            xaxis: {
                categories: ["Red", "Blue", "Yellow", "Green", "Purple"]
            },
            colors: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"]
        });
        barChart.render();
    }
}
