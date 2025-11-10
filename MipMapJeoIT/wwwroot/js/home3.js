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
let currentLayer;

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
const expnad = new Expand({
    view: view,
    content: layerList,
    expanded: false
});
view.ui.add(expnad, "top-left");

view.when(() => {
    $('[data-button="toolbar"]').on('click', toolbarButton_onClick);
    homeCamera = view.camera.clone();

    const groupLayer = ODTUScene.layers.find(l => l.title === "Envelope Properties");

    if (groupLayer) {
        // GroupLayer içindeki Uwall katmanını bul
        const uwallLayer = groupLayer.layers.find(l => l.title === "Uwall");
        currentLayer = groupLayer.layers.find(l => l.visible);

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
    drawScenarioCharts()
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

function toggle_full_sceen() {
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
                hiddenFields: ["Shape__Length", "Shape__Area", "OBJECTID"],
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

function forceViewResize() {

    const v = window.view || window.sceneView || window.mapView;

    try { v && typeof v.resize === "function" && v.resize(); } catch { }
    window.dispatchEvent(new Event("resize"));
}

btnScenario.addEventListener("click", () => {
    const isOpen = scenarioContainer.classList.contains("open");

    if (isOpen) {
        scenarioContainer.classList.remove("open");
        requestAnimationFrame(forceViewResize);
    } else {
        scenarioContainer.classList.add("open");
        //if (typeof drawScenarioCharts === "function") drawScenarioCharts();
        requestAnimationFrame(forceViewResize);
    }
});


// === GLOBAL CHART REFERANSLARI ===
let radialBarChart;
let barChart;
let radarChart;
let boxPlotChart;

async function drawScenarioCharts() {
    // === RADIAL BAR CHART ===
    const radialBarCanvas = document.querySelector("#radialBarChart");

    if (radialBarCanvas && currentLayer) {
        // Payback ile başlayan tüm alanlar
        const fields = currentLayer.fields.filter(f => f.name.startsWith("Payback_"));
        if (!fields.length) return console.warn("Payback alanı bulunamadı.");

        // OutStatistics ile max değerleri al
        const statQuery = currentLayer.createQuery();
        statQuery.outStatistics = fields.map(f => ({
            onStatisticField: f.name,
            outStatisticFieldName: `${f.name}_max`,
            statisticType: "max"
        }));

        currentLayer.queryFeatures(statQuery).then(result => {
            const stats = result.features?.[0]?.attributes;
            if (!stats) return console.warn("İstatistik sonucu boş.");

            const filteredData = fields
                .map(f => {
                    const val = stats[`${f.name}_max`];
                    return {
                        label: (f.alias || f.name).replace(/^Payback /, "").replace(/_/g, " ").trim(),
                        value: typeof val === "number" ? parseFloat(val.toFixed(2)) : 0
                    };
                })
                .filter(item => item.value > 0); // 0 olanları at

            // Series ve labels dizilerini oluştur
            const series = filteredData.map(item => item.value);
            const labels = filteredData.map(item => item.label);

            // Ortadaki sabit max değeri al (0 olanlar dahil değil)
            const maxValue = Math.max(...series).toFixed(2);


            const radialBarChart = new ApexCharts(radialBarCanvas, {
                chart: { type: 'radialBar', height: 350 },
                series: series,
                labels: labels,
                colors: ["#36a2eb", "#ff6384", "#ffcd56", "#4bc0c0", "#9966ff", "#ff9f40", "#8a89a6"],
                plotOptions: {
                    radialBar: {
                        hollow: { size: '35%' },
                        track: { strokeWidth: '100%' },
                        dataLabels: {
                            name: { show: true, fontSize: '16px' },
                            value: { show: true }, // dilim değerini gizle
                            total: {
                                show: true,
                                label: 'Maks.',
                                formatter: () => `${maxValue} yıl` // ortadaki sabit max değer
                            }
                        }
                    }
                },
                legend: { show: true, position: 'bottom' },
                title: { text: 'Senaryolara Göre Maks. Geri Ödeme Süresi' },
            });

            radialBarChart.render();
        }).catch(err => console.error(err));
    }

    // === RADAR CHART ===
    const radarCanvas = document.querySelector("#radarChart");
    if (radarCanvas && currentLayer) {
        // PV’siz IOD alanları
        const iodFields = currentLayer.fields.filter(f =>
            f.name.toUpperCase().includes("IOD") && !f.name.toUpperCase().includes("PV")
        );
        if (!iodFields.length) return console.warn("PV'siz IOD alanı bulunamadı.");

        // Labels (senaryolar)
        const labelsSet = new Set();
        iodFields.forEach(f => labelsSet.add(f.name.replace(/^F(2025|2050)_/i, "")));
        const labels = Array.from(labelsSet);

        // queryFeatures ile tüm değerleri çek
        const query = currentLayer.createQuery();
        query.where = "1=1";
        query.outFields = iodFields.map(f => f.name);
        query.returnGeometry = false;

        currentLayer.queryFeatures(query).then(result => {
            if (!result.features.length) return console.warn("Veri yok.");

            const seriesMap = { "2025": [], "2050": [] };

            ["2025", "2050"].forEach(year => {
                const fieldsForYear = iodFields.filter(f => f.name.startsWith(`F${year}_`));

                fieldsForYear.forEach(f => {
                    let values = result.features.map(feat => {
                        let val = feat.attributes[f.name];
                        if (val == null) return NaN;
                        val = val.toString().replace(",", ".");
                        return parseFloat(val);
                    }).filter(v => !isNaN(v));

                    const maxVal = values.length ? Math.max(...values) : 0;
                    seriesMap[year].push(parseFloat(maxVal.toFixed(2)));
                });
            });

            console.log("IOD Fields:", iodFields.map(f => f.name));
            console.log("SeriesMap:", seriesMap);

            // ✅ Başlangıçta her iki seri de aktif, null dizisi yok
            const series = [
                { name: "2025", data: seriesMap["2025"] },
                { name: "2050", data: seriesMap["2050"] }
            ];

            const radarChart = new ApexCharts(radarCanvas, {
                chart: { type: 'radar', height: 450 },
                dataLabels: {
                    enabled: true   // veya false
                },
                series: series,
                labels: labels,
                plotOptions: { radar: { polygons: { strokeColors: '#e0e0e0' } } },
                tooltip: { theme: "dark" },
                legend: { position: 'top' },
                title: { text: "PV'siz IOD Değerleri - Yıllara Göre" },
                colors: ["#36a2eb", "#ff6384"]
            });

            // ✅ Legend event override kaldırıldı
            radarChart.render();

        }).catch(err => console.error(err));
    }

    // === CAPEX → EMISSION → EMISSION REDUCTION (SLOPE CHART) ===
    const slopeCanvas = document.querySelector("#slopeChart");
    if (slopeCanvas && currentLayer) {

        // === 1️⃣ İlgili alanları filtrele ===
        const capexFields = currentLayer.fields.filter(f => f.name.startsWith("CAPEX_"));
        const emissionFields = currentLayer.fields.filter(f =>
            f.name.startsWith("Emission_") && !f.name.includes("_Reduction")
        );
        const reductionFields = currentLayer.fields.filter(f =>
            f.name.startsWith("Emission_Reduction_")
        );

        const allFields = [...capexFields, ...emissionFields, ...reductionFields];

        if (!allFields.length) {
            console.warn("Slope chart için field bulunamadı.");
            return;
        }

        // === 2️⃣ outStatistics ile mean değerlerini al ===
        const statQuery = currentLayer.createQuery();
        statQuery.outStatistics = allFields.map(f => ({
            onStatisticField: f.name,
            outStatisticFieldName: `${f.name}_mean`,
            statisticType: "avg"
        }));
        statQuery.returnGeometry = false;

        currentLayer.queryFeatures(statQuery).then(statResult => {
            const attrs = statResult.features[0]?.attributes ?? {};

            // === 3️⃣ Mean değerlerini senaryolara göre ayıkla ===
            const scenarioNames = [
                "BASE_PV","BASE_HP","BASE_HP_PV","Enve","Enve_PV","Enve_HP","Enve_HP_PV"
            ];

            const getMeanValue = (prefix, scenario) => {
                const key = Object.keys(attrs).find(k => k.startsWith(prefix) && k.includes(scenario) && k.endsWith("_mean"));
                return key ? parseFloat(attrs[key]) || 0 : 0;
            };

            const seriesData = scenarioNames.map(name => ({
                name: name,
                data: [
                    { x: "Capex", y: getMeanValue("CAPEX_", name) },
                    { x: "Total Emission", y: getMeanValue("Emission_", name) },
                    { x: "Emission Reduction", y: getMeanValue("Emission_Reduction_", name) }
                ]
            })).filter(s => s.data.some(p => p.y !== 0));

            // === 4️⃣ Renk paleti ===
            const colors = [
                "#007bff", "#28a745", "#ffc107", "#dc3545",
                "#6f42c1", "#20c997", "#6610f2", "#8bc34a"
            ];

            // === 5️⃣ Grafiği oluştur ===
            const slopeChart = new ApexCharts(slopeCanvas, {
                chart: {
                    type: 'line',
                    height: 500,
                    background: '#fff',
                    toolbar: { show: false },
                    zoom: { enabled: false }
                },
                plotOptions: {
                    line: {
                        horizontal: false // yatay çizilmesini engelle (varsayılan dikey)
                    }
                },
                series: seriesData,
                colors: colors,
                stroke: {
                    width: 3,
                    curve: 'straight'
                },
                xaxis: {
                    categories: ["Capex", "Total Emission", "Emission Reduction"],
                    title: { text: "Parametreler" },
                    labels: {
                        rotate: 0,         // yazılar dik olmasın
                        style: {
                            fontSize: '13px'
                        }
                    }
                },
                yaxis: {
                    title: { text: "Değerler" },
                    labels: { formatter: val => val.toLocaleString() }
                },
                tooltip: {
                    theme: "dark",
                    shared: true,
                    intersect: false
                },
                title: {
                    text: "Capex → Total Emission → Emission Reduction (Slope Chart - Mean)",
                    align: "center",
                    style: { fontSize: "16px", fontWeight: "bold" }
                },
                legend: {
                    show: true,
                    position: "top",
                    horizontalAlign: "center"
                }
            });


            slopeChart.render();
        });
    }
    // === NPV BOX PLOT ===
    const npvboxPlotCanvas = document.querySelector("#npvboxPlotChart");
    if (npvboxPlotCanvas && currentLayer) {

        // NPV_ ile başlayan alanları al
        const fields = currentLayer.fields.filter(f =>
            f.name.startsWith("NPV_")
        );

        // Veri sorgulaması
        const query = currentLayer.createQuery();
        query.outFields = fields.map(f => f.name);
        query.returnGeometry = false;

        currentLayer.queryFeatures(query).then(result => {
            if (!result.features.length) {
                console.warn("NPV verisi bulunamadı.");
                return;
            }

            // Her NPV alanı için değerleri çıkar
            const seriesData = fields.map(f => {
                const values = result.features
                    .map(feat => parseFloat(feat.attributes[f.name]))
                    .filter(v => !isNaN(v));

                if (!values.length) return null;

                // Boxplot istatistikleri: min, Q1, median, Q3, max
                values.sort((a, b) => a - b);
                const min = values[0];
                const q1 = values[Math.floor(values.length * 0.25)];
                const median = values[Math.floor(values.length * 0.5)];
                const q3 = values[Math.floor(values.length * 0.75)];
                const max = values[values.length - 1];

                return {
                    x: (f.alias || f.name).replace(/^NPV_/, ""),
                    y: [min, q1, median, q3, max]
                };
            }).filter(Boolean);

            if (!seriesData.length) {
                console.warn("Boxplot için geçerli NPV verisi bulunamadı.");
                return;
            }

            // Grafiği oluştur
            const npvboxplot = new ApexCharts(npvboxPlotCanvas, {
                chart: {
                    type: 'boxPlot',
                    height: 450,
                    background: '#fff',
                    toolbar: { show: true }
                },
                series: [{
                    name: 'NPV',
                    data: seriesData
                }],
                colors: ["#4bc0c0"],
                title: {
                    text: 'Senaryo Bazlı NPV Boxplot',
                    align: 'center',
                    style: { fontSize: '16px', fontWeight: 'bold' }
                },
                tooltip: {
                    theme: 'dark',
                    shared: true,
                    custom: function ({ seriesIndex, dataPointIndex, w }) {
                        const y = w.config.series[seriesIndex].data[dataPointIndex].y;
                        const name = w.config.series[seriesIndex].data[dataPointIndex].x;
                        return `<div style="padding:5px">
                        <strong>${name}</strong><br/>
                        Min: €${y[0].toFixed(2)}<br/>
                        Q1: €${y[1].toFixed(2)}<br/>
                        Medyan: €${y[2].toFixed(2)}<br/>
                        Q3: €${y[3].toFixed(2)}<br/>
                        Max: €${y[4].toFixed(2)}
                    </div>`;
                    }
                },
                yaxis: {
                    title: { text: 'NPV (€)' },
                    labels: {
                        formatter: val => "€" + val.toFixed(2)
                    }
                },
                xaxis: { title: { text: 'Senaryolar' } }
            });

            npvboxplot.render();
        });
    }


    // === ROI BOX PLOT ===
    const boxPlotCanvas = document.querySelector("#roiboxPlotChart");
    if (boxPlotCanvas && currentLayer) {

        // ROI_ ile başlayan alanları al
        const fields = currentLayer.fields.filter(f =>
            f.name.startsWith("ROI_")
        );

        // Veri sorgulaması
        const query = currentLayer.createQuery();
        query.outFields = fields.map(f => f.name);
        query.returnGeometry = false;

        currentLayer.queryFeatures(query).then(result => {
            if (!result.features.length) {
                console.warn("ROI verisi bulunamadı.");
                return;
            }

            // Her ROI alanı için ROI değerlerini çıkar
            const seriesData = fields.map(f => {
                const values = result.features
                    .map(feat => parseFloat(feat.attributes[f.name]))
                    .filter(v => !isNaN(v));

                if (!values.length) return null;

                // Boxplot istatistikleri: min, Q1, median, Q3, max
                values.sort((a, b) => a - b);
                const min = values[0];
                const q1 = values[Math.floor(values.length * 0.25)];
                const median = values[Math.floor(values.length * 0.5)];
                const q3 = values[Math.floor(values.length * 0.75)];
                const max = values[values.length - 1];

                return {
                    x: (f.alias || f.name).replace(/^ROI /, ""),
                    y: [min, q1, median, q3, max]
                };
            }).filter(Boolean);

            if (!seriesData.length) {
                console.warn("Boxplot için geçerli ROI verisi bulunamadı.");
                return;
            }

            // Grafiği oluştur
            const roiboxplot = new ApexCharts(boxPlotCanvas, {
                chart: {
                    type: 'boxPlot',
                    height: 450,
                    background: '#fff',
                    toolbar: { show: true }
                },
                series: [{
                    name: 'ROI',
                    data: seriesData
                }],
                colors: ["#4bc0c0"],
                title: {
                    text: 'Senaryo Bazlı ROI Boxplot',
                    align: 'center',
                    style: { fontSize: '16px', fontWeight: 'bold' }
                },
                tooltip: {
                    theme: 'dark',
                    shared: true,
                    custom: function ({ seriesIndex, dataPointIndex, w }) {
                        const y = w.config.series[seriesIndex].data[dataPointIndex].y;
                        const name = w.config.series[seriesIndex].data[dataPointIndex].x;
                        return `<div style="padding:5px">
                <strong>${name}</strong><br/>
                Min: ${y[0].toFixed(2)}%<br/>
                Q1: ${y[1].toFixed(2)}%<br/>
                Medyan: ${y[2].toFixed(2)}%<br/>
                Q3: ${y[3].toFixed(2)}%<br/>
                Max: ${y[4].toFixed(2)}%
                </div>`;
                    }
                },
                yaxis: {
                    title: { text: 'ROI (%)' },
                    labels: {
                        formatter: val => val.toFixed(2) + "%"
                    }
                },
                xaxis: { title: { text: 'Senaryolar' } }
            });

            roiboxplot.render();
        });
    }

    // === 1. CAPEX ve OPEX alanlarını bul ===
    const capexOpexDiv = document.querySelector("#capexopexChart");
    if (!capexOpexDiv) return;


    if (!currentLayer) {
        console.warn("Görünür layer bulunamadı.");
        return;
    }

    try {
        // === 1. CAPEX ve OPEX alanlarını bul ===
        const fields = currentLayer.fields.filter(f =>
            f.name.startsWith("CAPEX_") || f.name.startsWith("OPEX_")
        );

        if (!fields.length) {
            console.warn("CAPEX/OPEX field bulunamadı.");
            return;
        }

        const capexFields = fields.filter(f => f.name.startsWith("CAPEX_"));
        const opexFields = fields.filter(f => f.name.startsWith("OPEX_"));

        // === 2. Tek bir outStatistics sorgusu ile tüm mean değerlerini al ===
        const statQuery = currentLayer.createQuery();
        statQuery.outStatistics = fields.map(f => ({
            onStatisticField: f.name,
            outStatisticFieldName: `${f.name}_mean`,
            statisticType: "avg"
        }));

        const statResult = await currentLayer.queryFeatures(statQuery);
        const attrs = statResult.features[0]?.attributes ?? {};

        // === 3. Mean değerlerini senaryolara göre ayıkla ===
        const getFieldMeans = (fieldList, prefix) => {
            const data = {};
            fieldList.forEach(f => {
                const scenario = f.name.replace(prefix, "").replace(/_+$/, "");
                const meanVal = attrs[`${f.name}_mean`];
                data[scenario] = meanVal != null ? parseFloat(meanVal.toFixed(2)) : 0;
            });
            return data;
        };

        const capexData = getFieldMeans(capexFields, "CAPEX_");
        const opexData = getFieldMeans(opexFields, "OPEX_");

        // === 4. Ortak senaryo adlarını oluştur ===
        const scenarioNames = Array.from(
            new Set([...Object.keys(capexData), ...Object.keys(opexData)])
        );

        const capexSeries = scenarioNames.map(s => capexData[s] || 0);
        const opexSeries = scenarioNames.map(s => opexData[s] || 0);

        // === 5. K/M/B formatlama fonksiyonu ===
        const formatValue = val => {
            if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(2) + "B";
            if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
            if (val >= 1_000) return (val / 1_000).toFixed(2) + "K";
            return val.toLocaleString();
        };

        // === 6. Grafik oluştur ===
        const capexOpexChart = new ApexCharts(capexOpexDiv, {
            chart: {
                type: 'bar',
                stacked: true,
                height: 400,
                background: '#fff',
                toolbar: { show: true }
            },
            series: [
                { name: "CAPEX (x̄)", data: capexSeries },
                { name: "OPEX (x̄)", data: opexSeries }
            ],
            xaxis: { categories: scenarioNames, title: { text: "Senaryo" } },
            yaxis: {
                title: { text: "Ortalama Maliyet" },
                labels: { formatter: formatValue }
            },
            tooltip: {
                shared: true,
                intersect: false,
                theme: 'dark',
                y: { formatter: formatValue }
            },
            colors: ["#1976D2", "#FFB300"],
            legend: { position: "top", horizontalAlign: "left" },
            plotOptions: {
                bar: { horizontal: false, columnWidth: '60%', borderRadius: 4 }
            },
            dataLabels: {
                enabled: true,
                formatter: formatValue,
                style: { fontSize: '11px', colors: ['#000'] }
            },
            title: {
                text: "Senaryolara Göre Ortalama CAPEX - OPEX Maliyetleri (x̄)",
                align: 'center'
            }
        });

        capexOpexChart.render();

    } catch (err) {
        console.error("CAPEX/OPEX grafiği oluşturulamadı:", err);
    }

}

function getAllScenarioValues() {
    const scenarios = [];

    for (let i = 1; i <= 4; i++) {
        //const yearSelect = document.querySelector(`#yearSelect${i}`);
        //const selectedYear = yearSelect ? yearSelect.value : null;
        const selectedYear = 2025

        const baseRadio = document.querySelector(`#baseOption${i}`);
        const enveRadio = document.querySelector(`#enveOption${i}`);
        let selectedType = null;
        if (baseRadio?.checked) selectedType = 'BASE';
        else if (enveRadio?.checked) selectedType = 'Enve';

        const hpCheckbox = document.querySelector(`#hpOption${i}`);
        const pvCheckbox = document.querySelector(`#pvOption${i}`);
        const hpSelected = hpCheckbox?.checked || false;
        const pvSelected = pvCheckbox?.checked || false;

        scenarios.push({
            year: selectedYear,
            type: selectedType,
            hp: hpSelected,
            pv: pvSelected
        });
    }

    console.log(scenarios);
    return scenarios;
}

async function updateScenarioCharts() {
    const scenarios = getAllScenarioValues();
    if (!currentLayer) return console.warn("Görünür layer bulunamadı.");

    const means = [];
    const boxStats = []; // BoxPlot için [min, q1, median, q3, max] dizilerini tutacak
    const scenarioLabels = [];

    for (let i = 0; i < scenarios.length; i++) {
        const values = scenarios[i];

        // === Field adı oluştur ===
        let fieldName = `F${values.year}_${values.type}`;
        if (values.hp && values.pv) fieldName += "_HP_PV";
        else if (values.hp) fieldName += "_HP";
        else if (values.pv) fieldName += "_PV";
        fieldName += "_Qheating";

        // === Label oluştur ===
        let label = `${values.year} ${values.type}`;
        if (values.hp && values.pv) label += " (HP+PV)";
        else if (values.hp) label += " (HP)";
        else if (values.pv) label += " (PV)";
        scenarioLabels.push(label);

        // === Field kontrol ===
        const exists = currentLayer.fields.some(f => f.name === fieldName);
        if (!exists) {
            console.warn(`Scenario ${i + 1}: Field mevcut değil ->`, fieldName);
            means.push(null);
            boxStats.push([0, 0, 0, 0, 0]);
            continue;
        }

        try {
            // === İstatistik sorgusu (mean, min, max, std) ===
            const statQuery = currentLayer.createQuery();
            statQuery.outStatistics = [
                { onStatisticField: fieldName, outStatisticFieldName: "mean_value", statisticType: "avg" },
                { onStatisticField: fieldName, outStatisticFieldName: "min_value", statisticType: "min" },
                { onStatisticField: fieldName, outStatisticFieldName: "max_value", statisticType: "max" },
                { onStatisticField: fieldName, outStatisticFieldName: "stddev_value", statisticType: "stddev" }
            ];

            const statResult = await currentLayer.queryFeatures(statQuery);
            const attrs = statResult.features[0]?.attributes ?? {};

            // --- Mean bar & radial ---
            const meanValue = attrs.mean_value ?? null;
            const roundedMean = meanValue !== null ? parseFloat(meanValue.toFixed(2)) : null;
            means.push(roundedMean);

            // --- BoxPlot ---
            const min = attrs.min_value ?? 0;
            const max = attrs.max_value ?? 0;
            const median = meanValue ?? 0;
            const std = attrs.stddev_value ?? 0;
            const q1 = median - std;
            const q3 = median + std;
            boxStats.push([parseFloat(min.toFixed(2)), parseFloat(q1.toFixed(2)), parseFloat(median.toFixed(2)), parseFloat(q3.toFixed(2)), parseFloat(max.toFixed(2))]);

        } catch (err) {
            console.error(`Scenario ${i + 1} hata:`, err);
            means.push(null);
            boxStats.push([0, 0, 0, 0, 0]);
        }
    }

    const colors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63"];

    // --- Radial Bar ---
    if (radialBarChart) {
        radialBarChart.updateOptions({ labels: scenarioLabels, colors: colors });
        radialBarChart.updateSeries(means);
    }

    // --- Bar Chart ---
    if (barChart) {
        barChart.updateOptions({
            chart: {
                type: "bar",
                animations: { enabled: true, easing: "easeinout", speed: 700 },
                toolbar: { show: false }
            },
            xaxis: { categories: scenarioLabels, labels: { show: false } },
            legend: { show: true, position: "bottom", horizontalAlign: "center" },
            colors: colors,
            plotOptions: { bar: { borderRadius: 6, columnWidth: "50%", distributed: true } },
            dataLabels: {
                enabled: true,
                style: { fontSize: "12px", fontWeight: "bold", colors: ["#000"] }, // Yazılar siyah
                formatter: val => (val != null ? `${val.toFixed(2)}` : "-"),
                offsetY: -10
            },
            tooltip: {
                theme: "dark", // tooltip’in arka planını da isteğe göre ayarlayabilirsin
                style: { fontSize: "12px", color: "#000" }, // yazıyı siyah yapıyoruz
                y: { formatter: val => `${val?.toFixed(2)} kWh/m²` }
            },
            grid: { borderColor: "#ddd", strokeDashArray: 4 },
        });
        barChart.updateSeries([{ name: "Mean", data: means }]);
    }


    // --- Radar Chart ---
    if (radarChart) {
        radarChart.updateOptions({
            labels: scenarioLabels,
            colors: colors,
            tooltip: {
                theme: "dark",
                style: { fontSize: "12px", color: "#000" },
                y: { formatter: val => val?.toFixed(2) }
            }
        });
        radarChart.updateSeries([{ name: "Mean", data: means }]);
    }

    // --- BoxPlot Chart ---
    if (boxPlotChart) {
        const boxData = boxStats.map((arr, i) => ({ x: scenarioLabels[i], y: arr }));
        boxPlotChart.updateOptions({
            colors: colors,
            tooltip: {
                theme: "dark",
                style: { fontSize: "12px", color: "#000" },
                y: { formatter: val => Array.isArray(val) ? val.map(v => v?.toFixed(2)).join(", ") : val?.toFixed(2) }
            }
        });
        boxPlotChart.updateSeries([{ name: "Scenario Stats", data: boxData }]);
    }


}

const createScenarioBtn = document.getElementById('btnCreateScenarios');

createScenarioBtn.addEventListener('click', () => {
    updateScenarioCharts();
});
