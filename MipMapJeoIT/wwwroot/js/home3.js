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
    if (!groupLayer) return;

    // Başlangıçta görünen ilk layer'ı al
    currentLayer = groupLayer.layers.find(l => l.visible) || groupLayer.layers[0];

    // (İsteğe göre) başlangıçta sadece Uwall açık bırakma kısmını kaldırabilir/koruyabilirsin
    groupLayer.layers.forEach(l => { l.visible = (l.title === "Uwall"); });

    // SceneLayerView'leri topla (orijinal kodunla aynı)
    const layerNames = ["Uwall", "Uwindow", "Uroof", "Uground", "SHGC", "Infiltration Rate"];
    layerNames.forEach(name => {
        const layer = groupLayer.layers.find(l => l.title === name);
        if (layer) view.whenLayerView(layer).then(lv => { sceneLayerViews[name] = lv; });
    });

    // 1) slider'ları ilk aktif layer ile başlat
    initSliders(groupLayer, currentLayer).then(() => {
        drawScenarioCharts();
    });

    // 2) Her alt layer'ın visible değişimini izle; visible true olunca aktif layer yap ve slider'ları güncelle
    groupLayer.layers.forEach(layer => {
        // arcgis layer objesinin watch fonksiyonu varsa kullan (API v4.x)
        if (typeof layer.watch === "function") {
            layer.watch("visible", (newVal) => {
                if (newVal) {
                    currentLayer = layer;
                    updateSlidersForLayer(groupLayer, currentLayer);
                }
            });
        } else {
            // fallback: eğer watch yoksa başka event ekle (ör. LayerList kullanıyorsan onun event'ine bağla)
        }
    });
});

async function filterScene() {
    clearHighlighting();

    // --- Sliders ---
    const uwall = $("#uwallSlider").data("ionRangeSlider").result;
    const uwindow = $("#uwindowSlider").data("ionRangeSlider").result;
    const uroof = $("#uroofSlider").data("ionRangeSlider").result;
    const uground = $("#ugroundSlider").data("ionRangeSlider").result;
    const shgc = $("#shgcSlider").data("ionRangeSlider").result;
    const infiltration = $("#infiltrationSlider").data("ionRangeSlider").result;
    const opexbase2025 = $("#slideropexbase2025").data("ionRangeSlider").result;
    const opexbase2050 = $("#slideropexbase2050").data("ionRangeSlider").result;

    const grossFloor = $("#grossFloorSlider").data("ionRangeSlider").result;
    const qHeating2025 = $("#sliderQHeating2025").data("ionRangeSlider").result;
    const equipment2025 = $("#sliderEquipment2025").data("ionRangeSlider").result;
    const lighting2025 = $("#sliderLighting2025").data("ionRangeSlider").result;
    const emission2025 = $("#sliderEmission2025").data("ionRangeSlider").result;
    const basepv2025 = $("#sliderBasePV2025").data("ionRangeSlider").result;

    const qHeating2050 = $("#sliderQHeating2050").data("ionRangeSlider").result;
    const equipment2050 = $("#sliderEquipment2050").data("ionRangeSlider").result;
    const lighting2050 = $("#sliderLighting2050").data("ionRangeSlider").result;
    const emission2050 = $("#sliderEmission2050").data("ionRangeSlider").result;
    const basepv2050 = $("#sliderBasePV2050").data("ionRangeSlider").result;

    const iod2025 = $("#sliderIOD2025").data("ionRangeSlider").result.from_value;
    const iod2050 = $("#sliderIOD2050").data("ionRangeSlider").result.from_value;

    const groupLayer = ODTUScene.layers.find(l => l.title === "Envelope Properties");
    const activeLayer = groupLayer.layers.find(l => l.visible && l.type === "feature");
    if (!activeLayer) return;

    const query = activeLayer.createQuery();
    query.returnGeometry = false; // grafik için geometry gerekmez

    query.where = `
    Uwall BETWEEN ${uwall.from} AND ${uwall.to} AND
    Uwindow BETWEEN ${uwindow.from} AND ${uwindow.to} AND
    Uroof BETWEEN ${uroof.from} AND ${uroof.to} AND
    Uground BETWEEN ${uground.from} AND ${uground.to} AND
    SHGC BETWEEN ${shgc.from} AND ${shgc.to} AND
    Infiltration BETWEEN ${infiltration.from} AND ${infiltration.to} AND
    OPEX_BASE____ BETWEEN ${opexbase2025.from} AND ${opexbase2025.to} AND
    Gross_Floor_Area BETWEEN ${grossFloor.from} AND ${grossFloor.to} AND
    F2025_BASE_Qheating BETWEEN ${qHeating2025.from} AND ${qHeating2025.to} AND
    Equipment_Load_All_Scenarios BETWEEN ${equipment2025.from} AND ${equipment2025.to} AND
    Lighting_Load_All_Scenarios BETWEEN ${lighting2025.from} AND ${lighting2025.to} AND
    Emission_BASE__kg_CO2_ BETWEEN ${emission2025.from} AND ${emission2025.to} AND
    F2025_BASE_PV_Production_PV_ BETWEEN ${basepv2025.from} AND ${basepv2025.to} AND
    OPEX_BASE____ BETWEEN ${opexbase2050.from} AND ${opexbase2050.to} AND
    F2050_BASE_Qheating BETWEEN ${qHeating2050.from} AND ${qHeating2050.to} AND
    Equipment_Load_All_Scenarios BETWEEN ${equipment2050.from} AND ${equipment2050.to} AND
    Lighting_Load_All_Scenarios BETWEEN ${lighting2050.from} AND ${lighting2050.to} AND
    Emission_BASE__kg_CO2_ BETWEEN ${emission2050.from} AND ${emission2050.to} AND
    F2050_BASE_PV_Production_PV_ BETWEEN ${basepv2050.from} AND ${basepv2050.to}
`;

    // --- IOD filtreleri yalnızca değer varsa ekle ---
    if (iod2025 && iod2025 !== "null") {
        query.where += ` AND F2025_BASE_IOD = '${iod2025}'`;
    }

    if (iod2050 && iod2050 !== "null") {
        query.where += ` AND F2050_BASE_IOD = '${iod2050}'`;
    }

    const result = await activeLayer.queryFeatures(query);

    if (!result.features?.length) {
        activeLayer.definitionExpression = "1=0";
        console.log("Sonuç bulunamadı, layer boş gösteriliyor.");
        return;
    }

    // activeLayer.definitionExpression = `OBJECTID IN (${result.features.map(f => f.attributes.OBJECTID).join(",")})`;
    activeLayer.definitionExpression = query.where; // daha güvenli

    // grafikleri temizle ve yeniden çiz
    document.querySelectorAll(".apexcharts-canvas").forEach(el => el.remove());

    currentLayer = activeLayer;
    drawScenarioCharts();
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
async function initSliders(groupLayer, activeLayer) {
    // sadece alan isimleri tutuyoruz; layerName artık yok
    const sliders = [
        { id: "#uwallSlider", field: "Uwall" },
        { id: "#uwindowSlider", field: "Uwindow" },
        { id: "#uroofSlider", field: "Uroof" },
        { id: "#ugroundSlider", field: "Uground" },
        { id: "#shgcSlider", field: "SHGC" },
        { id: "#infiltrationSlider", field: "Infiltration" },
        { id: "#slideropexbase2025", field: "OPEX_BASE____" },
        { id: "#slideropexbase2050", field: "OPEX_BASE____" },
        { id: "#grossFloorSlider", field: "Gross_Floor_Area" },
        { id: "#sliderQHeating2025", field: "F2025_BASE_Qheating" },
        { id: "#sliderEquipment2025", field: "Equipment_Load_All_Scenarios" },
        { id: "#sliderLighting2025", field: "Lighting_Load_All_Scenarios" },
        { id: "#sliderEmission2025", field: "Emission_BASE__kg_CO2_" },
        { id: "#sliderBasePV2025", field: "F2025_BASE_PV_Production_PV_" },
        { id: "#sliderQHeating2050", field: "F2050_BASE_Qheating" },
        { id: "#sliderEquipment2050", field: "Equipment_Load_All_Scenarios" },
        { id: "#sliderLighting2050", field: "Lighting_Load_All_Scenarios" },
        { id: "#sliderEmission2050", field: "Emission_BASE__kg_CO2_" },
        { id: "#sliderBasePV2050", field: "F2050_BASE_PV_Production_PV_" }
    ];

    // Her slider'ı oluştur; aktif layer'dan min/max al (yoksa disable et)
    for (let s of sliders) {
        const layer = activeLayer || groupLayer.layers[0];
        let min = 0, max = 0, hasField = true;
        try {
            const mm = await getFieldMinMax(layer, s.field);
            min = mm.min; max = mm.max;
            // eğer min veya max NaN ise field yok varsay
            if (isNaN(min) || isNaN(max)) hasField = false;
        } catch (e) {
            hasField = false;
        }

        // Eğer ionRangeSlider zaten varsa önce destroy et (yeniden init için güvenli)
        const $el = $(s.id);
        const existing = $el.data("ionRangeSlider");
        if (existing) existing.destroy();

        // create
        $el.ionRangeSlider({
            type: "double",
            grid: true,
            min: hasField ? min : 0,
            max: hasField ? max : 1,
            from: hasField ? min : 0,
            to: hasField ? max : 1,
            step: 0.001,
            skin: "flat",
            prettify: num => num.toFixed(3),
            onFinish: function () {
                // filterScene çağrısını aktif layer ile yapıyoruz
                filterScene({
                    field: s.field,
                    layerName: (activeLayer && activeLayer.title) || null
                });
            },
            // ionRangeSlider'ın 'disable' option'ı destekleniyorsa:
            disable: !hasField
        });
    }

    // IOD değerleri
    const iodValues2025 = ["office_no_iod", "0,41", "0,43", "0,44", "0,45", "0,47", "0,5", "0,51", "0,55", "0,65"];
    const iodValues2050 = ["office_no_iod", "0,87", "0,89", "0,9", "0,96", "1,06", "1,07", "1,09", "1,12", "1,31"];

    const iodSliders = [
        { id: "#sliderIOD2025", values: iodValues2025, field: "F2025_BASE_IOD" },
        { id: "#sliderIOD2050", values: iodValues2050, field: "F2050_BASE_IOD" }
    ];

    iodSliders.forEach(s => {
        const $el = $(s.id);
        const inst = $el.data("ionRangeSlider");
        if (inst) inst.destroy(); // daha sade

        $el.ionRangeSlider({
            values: s.values,
            grid: true,
            onFinish: function (data) {
                const selected = data.from_value;
                filterScene({
                    field: s.field,
                    value: selected, // direkt string gönder — parseFloat yok
                    layerName: (activeLayer && activeLayer.title) || null
                });
            }
        });
    });
}
// -------------------------------------------------
// updateSlidersForLayer: aktif layer değişince çağrılır
// -------------------------------------------------
async function updateSlidersForLayer(groupLayer, newActiveLayer) {
    // --- Normal sliders ---
    const sliders = [
        { id: "#uwallSlider", field: "Uwall" },
        { id: "#uwindowSlider", field: "Uwindow" },
        { id: "#uroofSlider", field: "Uroof" },
        { id: "#ugroundSlider", field: "Uground" },
        { id: "#shgcSlider", field: "SHGC" },
        { id: "#infiltrationSlider", field: "Infiltration" },
        { id: "#slideropexbase2025", field: "OPEX_BASE____" },
        { id: "#slideropexbase2050", field: "OPEX_BASE____" },
        { id: "#grossFloorSlider", field: "Gross_Floor_Area" },
        { id: "#sliderQHeating2025", field: "F2025_BASE_Qheating" },
        { id: "#sliderEquipment2025", field: "Equipment_Load_All_Scenarios" },
        { id: "#sliderLighting2025", field: "Lighting_Load_All_Scenarios" },
        { id: "#sliderEmission2025", field: "Emission_BASE__kg_CO2_" },
        { id: "#sliderBasePV2025", field: "F2025_BASE_PV_Production_PV_" },
        { id: "#sliderQHeating2050", field: "F2050_BASE_Qheating" },
        { id: "#sliderEquipment2050", field: "Equipment_Load_All_Scenarios" },
        { id: "#sliderLighting2050", field: "Lighting_Load_All_Scenarios" },
        { id: "#sliderEmission2050", field: "Emission_BASE__kg_CO2_" },
        { id: "#sliderBasePV2050", field: "F2050_BASE_PV_Production_PV_" }
    ];

    for (let s of sliders) {
        const $el = $(s.id);
        const inst = $el.data("ionRangeSlider");
        if (!inst) continue;

        let hasField = true, min = 0, max = 0;
        try {
            const mm = await getFieldMinMax(newActiveLayer, s.field);
            min = mm.min; max = mm.max;
            if (isNaN(min) || isNaN(max)) hasField = false;
        } catch (e) {
            hasField = false;
        }

        inst.update({
            min: hasField ? min : 0,
            max: hasField ? max : 1,
            from: hasField ? min : 0,
            to: hasField ? max : 1,
            disable: !hasField
        });
    }

    // --- IOD sliders ---
    const iodSliders = [
        {
            id: "#sliderIOD2025",
            field: "F2025_BASE_IOD",
            values: ["office_no_iod", "0,41", "0,43", "0,44", "0,45", "0,47", "0,5", "0,51", "0,55", "0,65"]
        },
        {
            id: "#sliderIOD2050",
            field: "F2050_BASE_IOD",
            values: ["office_no_iod", "0,87", "0,89", "0,9", "0,96", "1,06", "1,07", "1,09", "1,12", "1,31"]
        }
    ];

    iodSliders.forEach(s => {
        const $el = $(s.id);
        const inst = $el.data("ionRangeSlider");
        if (inst) inst.destroy();

        $el.ionRangeSlider({
            values: s.values,
            grid: true,
            onFinish: function (data) {
                const selected = data.from_value;
                filterScene({
                    field: s.field,
                    value: selected, // sadece seçilen yıl için filtre uygular
                    layerName: newActiveLayer.title
                });
            }
        });
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
        "#slideropexbase",
        "#grossFloorSlider",
        "#sliderQHeating2025",
        "#sliderEquipment2025",
        "#sliderLighting2025",
        "#sliderEmission2025",
        "#sliderBasePV2025",
        "#sliderQHeating2050",
        "#sliderEquipment2050",
        "#sliderLighting2050",
        "#sliderEmission2050",
        "#sliderBasePV2050",
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
                hiddenFields: ["Shape__Length", "Shape__Area", "OBJECTID", "Height", "LEVEL_ID", "LEVEL_NO", "Unit_NO", "TYPE", "function_encoded", "Years", "Elevation", "Elevation_Top"],
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
    try {
        if (!currentLayer) {
            console.warn("Aktif layer bulunamadı.");
            return;
        }

        // === Yardımcılar ===
        const logError = (context, err) => console.error(`❌ ${context} hatası:`, err);
        const select = id => document.querySelector(id);

        const fetchStats = async (fields = [], type = "avg") => {
            if (!fields.length) return {};
            const q = currentLayer.createQuery();
            q.outStatistics = fields.map(f => ({
                onStatisticField: f.name,
                outStatisticFieldName: `${f.name}_${type}`,
                statisticType: type
            }));
            q.returnGeometry = false;

            // 👇 Filtre varsa where'e dahil et
            if (currentLayer.definitionExpression) {
                q.where = currentLayer.definitionExpression;
            }

            const res = await currentLayer.queryFeatures(q);
            return res.features?.[0]?.attributes ?? {};
        };

        const fetchValues = async (fields = []) => {
            if (!fields.length) return [];
            const q = currentLayer.createQuery();
            q.outFields = fields.map(f => f.name);
            q.returnGeometry = false;

            // 👇 Filtre varsa where'e dahil et
            if (currentLayer.definitionExpression) {
                q.where = currentLayer.definitionExpression;
            }

            const res = await currentLayer.queryFeatures(q);
            return res.features ?? [];
        };

        const formatKM = val => {
            if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(2) + "B";
            if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
            if (val >= 1_000) return (val / 1_000).toFixed(2) + "K";
            // küçük sayılarda orijinal davranışı koru (toLocaleString)
            return val.toLocaleString();
        };

        // canvas'ları tek seferde al
        const canvases = {
            radial: select("#radialBarChart"),
            radar: select("#radarChart"),
            slope: select("#slopeChart"),
            npvBox: select("#npvboxPlotChart"),
            roiBox: select("#roiboxPlotChart"),
            capexOpex: select("#capexopexChart"),
            kwhBox: select("#kwhChart")
        };

        // ---------- kWh/m2 STACKED BAR CHART (MEAN - HORIZONTAL) ----------
        if (canvases.kwhBox) {
            try {
                const yearDropdown = document.getElementById("yearDropdown");
                const year = yearDropdown?.value || "2025";

                // 🔹 Senaryolar
                const scenarios = [
                    { key: "BASE", label: "BASE" },
                    { key: "BASE_HP", label: "BASE + HP" },
                    { key: "Enve", label: "ENVE" },
                    { key: "Enve_HP", label: "ENVE + HP" }
                ];

                // 🔹 Qheating field'ları
                const qHeatingFields = currentLayer.fields.filter(f =>
                    scenarios.some(s => f.name === `F${year}_${s.key}_Qheating`)
                );

                if (!qHeatingFields.length) {
                    console.warn("Qheating field bulunamadı.");
                    return;
                }

                // 🔹 Sabit field'lar
                const lightingField = currentLayer.fields.find(
                    f => f.name === "Lighting_Load_All_Scenarios"
                );

                const equipmentField = currentLayer.fields.find(
                    f => f.name === "Equipment_Load_All_Scenarios"
                );

                if (!lightingField || !equipmentField) {
                    console.warn("Lighting / Equipment field bulunamadı.");
                    return;
                }

                const allFields = [...qHeatingFields, lightingField, equipmentField];
                const stats = await fetchStats(allFields, "avg");

                // 🔹 Qheating (senaryoya göre)
                const labels = [];
                const qHeatingData = [];

                scenarios.forEach(s => {
                    const fieldName = `F${year}_${s.key}_Qheating`;
                    const val = stats[`${fieldName}_avg`];

                    if (typeof val === "number" && val > 0) {
                        labels.push(s.label);
                        qHeatingData.push(+val.toFixed(2));
                    }
                });

                if (!qHeatingData.length) {
                    console.warn("Qheating ortalama değeri bulunamadı.");
                    return;
                }

                // 🔹 Sabit yükler (tüm senaryolar için aynı)
                const lightingMean = +(stats[`${lightingField.name}_avg`] || 0).toFixed(2);
                const equipmentMean = +(stats[`${equipmentField.name}_avg`] || 0).toFixed(2);

                const lightingData = new Array(qHeatingData.length).fill(lightingMean);
                const equipmentData = new Array(qHeatingData.length).fill(equipmentMean);

                // 🔥 Eski chart'ı temizle
                if (canvases.kwhBox._chart) {
                    canvases.kwhBox._chart.destroy();
                }

                // 🔹 Chart
                canvases.kwhBox._chart = new ApexCharts(canvases.kwhBox, {
                    chart: {
                        type: "bar",
                        height: 420,
                        stacked: true,
                        background: "#fff",
                        toolbar: { show: true }
                    },
                    series: [
                        {
                            name: `Qheating (${year})`,
                            data: qHeatingData
                        },
                        {
                            name: "Lighting Load",
                            data: lightingData
                        },
                        {
                            name: "Equipment Load",
                            data: equipmentData
                        }
                    ],
                    plotOptions: {
                        bar: {
                            horizontal: true,
                            barHeight: "65%",
                            borderRadius: 4
                        }
                    },
                    xaxis: {
                        title: { text: "kWh/m²" },
                        labels: {
                            formatter: v => v.toFixed(2)
                        }
                    },
                    yaxis: {
                        categories: labels,
                        title: { text: "Senaryolar" }
                    },
                    tooltip: {
                        theme: "dark",
                        shared: true,
                        intersect: false,
                        y: {
                            formatter: v => `${v.toFixed(2)} kWh/m²`
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        formatter: v => v.toFixed(2),
                        style: {
                            fontSize: "11px"
                        }
                    },
                    colors: ["#ff7043", "#42a5f5", "#9ccc65"],
                    legend: {
                        position: "top",
                        horizontalAlign: "left"
                    },
                    title: {
                        text: `Senaryolara Göre Ortalama Isıtma + İç Yükler (kWh/m²) – ${year}`,
                        align: "center",
                        style: {
                            fontSize: "16px",
                            fontWeight: "bold"
                        }
                    }
                });

                canvases.kwhBox._chart.render();

            } catch (err) {
                logError("kWh/m² Chart", err);
            }
        }

        // ---------- RADIAL BAR ----------
        if (canvases.radial) {
            try {
                const fields = currentLayer.fields.filter(f => f.name.startsWith("Payback_"));
                if (!fields.length) return console.warn("Payback alanı bulunamadı.");

                const stats = await fetchStats(fields, "max");

                const filteredData = fields
                    .map(f => {
                        const raw = stats[`${f.name}_max`];
                        const value = (typeof raw === "number") ? parseFloat(raw.toFixed(2)) : 0;
                        return {
                            label: (f.alias || f.name).replace(/^Payback[_ ]?/, "").replace(/_/g, " ").trim(),
                            value
                        };
                    })
                    .filter(item => item.value > 0);

                if (!filteredData.length) return console.warn("Radial için geçerli Payback verisi yok.");

                const series = filteredData.map(d => d.value);
                const labels = filteredData.map(d => d.label);
                const maxValue = Math.max(...series).toFixed(2);

                new ApexCharts(canvases.radial, {
                    chart: { type: 'radialBar', height: 350 },
                    series,
                    labels,
                    colors: ["#36a2eb", "#ff6384", "#ffcd56", "#4bc0c0", "#9966ff", "#ff9f40", "#8a89a6"],
                    plotOptions: {
                        radialBar: {
                            hollow: { size: '35%' },
                            track: { strokeWidth: '100%' },
                            dataLabels: {
                                name: { show: true, fontSize: '16px' },
                                value: { show: true },
                                total: {
                                    show: true,
                                    label: 'Maks.',
                                    formatter: () => `${maxValue} yıl`
                                }
                            }
                        }
                    },
                    legend: { show: true, position: 'bottom' },
                    tooltip: { theme: "dark" }, // koyu tema orijinalde yoksa eklenmez demiştin; ama diğer grafikleri korumak için burada dark bırakıyorum
                    title: { text: 'Senaryolara Göre Maks. Geri Ödeme Süresi' },
                }).render();

            } catch (err) { logError("Radial Chart", err); }
        }

        // ---------- RADAR ----------
        if (canvases.radar) {
            try {
                const iodFields = currentLayer.fields.filter(f =>
                    f.name.toUpperCase().includes("IOD") && !f.name.toUpperCase().includes("PV")
                );
                if (!iodFields.length) return console.warn("PV'siz IOD alanı bulunamadı.");

                const features = await fetchValues(iodFields);
                if (!features.length) return console.warn("IOD veri seti boş.");

                const labels = Array.from(new Set(iodFields.map(f => f.name.replace(/^F(2025|2050)_/i, ""))));

                const seriesMap = { "2025": [], "2050": [] };
                ["2025", "2050"].forEach(year => {
                    const fieldsForYear = iodFields.filter(f => f.name.startsWith(`F${year}_`));
                    fieldsForYear.forEach(f => {
                        const values = features
                            .map(feat => {
                                const v = feat.attributes[f.name];
                                if (v == null) return NaN;
                                return parseFloat(String(v).replace(",", "."));
                            })
                            .filter(v => !isNaN(v));
                        const maxVal = values.length ? Math.max(...values) : 0;
                        seriesMap[year].push(parseFloat(maxVal.toFixed(2)));
                    });
                });

                new ApexCharts(canvases.radar, {
                    chart: { type: 'radar', height: 450 },
                    series: [
                        { name: "2025", data: seriesMap["2025"] },
                        { name: "2050", data: seriesMap["2050"] }
                    ],
                    labels,
                    plotOptions: { radar: { polygons: { strokeColors: '#e0e0e0' } } },
                    tooltip: { theme: "dark" }, // ORIJINAL: tooltip.theme: "dark"
                    legend: { position: 'top' },
                    title: { text: "PV'siz IOD Değerleri - Yıllara Göre" },
                    colors: ["#36a2eb", "#ff6384"]
                }).render();

            } catch (err) { logError("Radar Chart", err); }
        }

        // ---------- SLOPE CHART ----------
        if (canvases.slope) {
            try {
                const capexFields = currentLayer.fields.filter(f => f.name.startsWith("CAPEX_"));
                const emissionFields = currentLayer.fields.filter(f =>
                    f.name.startsWith("Emission_") && !f.name.includes("_Reduction")
                );
                const reductionFields = currentLayer.fields.filter(f => f.name.startsWith("Emission_Reduction_"));
                const allFields = [...capexFields, ...emissionFields, ...reductionFields];

                if (!allFields.length) return console.warn("Slope için field bulunamadı.");

                const attrs = await fetchStats(allFields, "sum");

                const scenarioNames = ["BASE_PV", "BASE_HP", "BASE_HP_PV", "Enve", "Enve_PV", "Enve_HP", "Enve_HP_PV"];

                const getMeanValue = (prefix, scenario) => {
                    const key = Object.keys(attrs).find(k => k.startsWith(prefix) && k.includes(scenario) && k.endsWith("_sum"));
                    if (!key) return 0;
                    const raw = attrs[key];
                    // Orijinalde parseFloat(meanVal.toFixed(2)) kullanıldı — bunu koruyoruz
                    return (typeof raw === "number") ? parseFloat(raw.toFixed(2)) : parseFloat(Number(raw || 0).toFixed(2));
                };

                const seriesData = scenarioNames.map(name => ({
                    name,
                    data: [
                        { x: "Capex", y: getMeanValue("CAPEX_", name) },
                        { x: "Total Emission", y: getMeanValue("Emission_", name) },
                        { x: "Emission Reduction", y: getMeanValue("Emission_Reduction_", name) }
                    ]
                })).filter(s => s.data.some(p => p.y !== 0));

                if (!seriesData.length) return console.warn("Slope chart için geçerli seri bulunamadı.");

                new ApexCharts(canvases.slope, {
                    chart: { type: 'line', height: 500, background: '#fff', toolbar: { show: false }, zoom: { enabled: false } },
                    series: seriesData,
                    colors: ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#20c997", "#6610f2", "#8bc34a"],
                    stroke: { width: 3, curve: 'straight' },
                    xaxis: {
                        categories: ["Capex", "Total Emission", "Emission Reduction"],
                        title: { text: "Parametreler" },
                        labels: { rotate: 0, style: { fontSize: '13px' } }
                    },
                    yaxis: { title: { text: "Değerler" }, labels: { formatter: val => val.toLocaleString() } },
                    tooltip: { theme: "dark", shared: true, intersect: false }, // ORIJINAL: theme dark
                    title: { text: "Capex → Total Emission → Emission Reduction (Slope Chart - Mean)", align: "center", style: { fontSize: "16px", fontWeight: "bold" } },
                    legend: { show: true, position: "top", horizontalAlign: "center" }
                }).render();

            } catch (err) { logError("Slope Chart", err); }
        }

        // ---------- NPV BOX PLOT ----------
        if (canvases.npvBox) {
            try {
                const fields = currentLayer.fields.filter(f => f.name.startsWith("NPV_"));
                if (!fields.length) return console.warn("NPV field bulunamadı.");

                const features = await fetchValues(fields);
                if (!features.length) return console.warn("NPV verisi bulunamadı.");

                const seriesData = fields.map(f => {
                    const rawVals = features.map(feat => feat.attributes[f.name]).filter(v => v != null);
                    const values = rawVals.map(v => parseFloat(String(v).replace(",", "."))).filter(v => !isNaN(v)).sort((a, b) => a - b);
                    if (!values.length) return null;
                    const min = values[0];
                    const q1 = values[Math.floor(values.length * 0.25)];
                    const median = values[Math.floor(values.length * 0.5)];
                    const q3 = values[Math.floor(values.length * 0.75)];
                    const max = values[values.length - 1];
                    // orijinalde toFixed(2) gösterim tooltip'lerde kullanılıyordu; boxplot'un y dizisi raw sayılar olabilir fakat tooltip'te toFixed(2) uygulayacağız
                    return { x: (f.alias || f.name).replace(/^NPV_/, ""), y: [min, q1, median, q3, max] };
                }).filter(Boolean);

                if (!seriesData.length) return console.warn("Boxplot için geçerli NPV verisi bulunamadı.");

                new ApexCharts(canvases.npvBox, {
                    chart: { type: 'boxPlot', height: 450, background: '#fff', toolbar: { show: true } },
                    series: [{ name: 'NPV', data: seriesData }],
                    colors: ["#4bc0c0"],
                    tooltip: {
                        theme: "dark", // ORIJINAL: theme dark
                        shared: true,
                        custom: function ({ seriesIndex, dataPointIndex, w }) {
                            const y = w.config.series[seriesIndex].data[dataPointIndex].y;
                            const name = w.config.series[seriesIndex].data[dataPointIndex].x;
                            // burada toFixed(2) korunuyor
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
                        labels: { formatter: val => "€" + val.toFixed(2) } // ORIJINAL: toFixed(2) korunuyor
                    },
                    xaxis: { title: { text: 'Senaryolar' } },
                    title: { text: 'Senaryo Bazlı NPV Boxplot', align: 'center', style: { fontSize: '16px', fontWeight: 'bold' } }
                }).render();

            } catch (err) { logError("NPV Box", err); }
        }

        // ---------- ROI BOX PLOT ----------
        if (canvases.roiBox) {
            try {
                const fields = currentLayer.fields.filter(f => f.name.startsWith("ROI_"));
                if (!fields.length) return console.warn("ROI field bulunamadı.");

                const features = await fetchValues(fields);
                if (!features.length) return console.warn("ROI verisi bulunamadı.");

                const seriesData = fields.map(f => {
                    const rawVals = features.map(feat => feat.attributes[f.name]).filter(v => v != null);
                    const values = rawVals.map(v => parseFloat(String(v).replace(",", "."))).filter(v => !isNaN(v)).sort((a, b) => a - b);
                    if (!values.length) return null;
                    const min = values[0];
                    const q1 = values[Math.floor(values.length * 0.25)];
                    const median = values[Math.floor(values.length * 0.5)];
                    const q3 = values[Math.floor(values.length * 0.75)];
                    const max = values[values.length - 1];
                    return { x: (f.alias || f.name).replace(/^ROI[_ ]?/, ""), y: [min, q1, median, q3, max] };
                }).filter(Boolean);

                if (!seriesData.length) return console.warn("Boxplot için geçerli ROI verisi bulunamadı.");

                new ApexCharts(canvases.roiBox, {
                    chart: { type: 'boxPlot', height: 450, background: '#fff', toolbar: { show: true } },
                    series: [{ name: 'ROI', data: seriesData }],
                    colors: ["#4bc0c0"],
                    tooltip: {
                        theme: "dark", // ORIJINAL: theme dark
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
                        labels: { formatter: val => val.toFixed(2) + "%" } // ORIJINAL: toFixed(2) korunuyor
                    },
                    xaxis: { title: { text: 'Senaryolar' } },
                    title: { text: 'Senaryo Bazlı ROI Boxplot', align: 'center', style: { fontSize: '16px', fontWeight: 'bold' } }
                }).render();

            } catch (err) { logError("ROI Box", err); }
        }

        // ---------- CAPEX / OPEX ----------
        if (canvases.capexOpex) {
            try {
                const fields = currentLayer.fields.filter(f => f.name.startsWith("CAPEX_") || f.name.startsWith("OPEX_"));
                if (!fields.length) return console.warn("CAPEX/OPEX field bulunamadı.");

                const attrs = await fetchStats(fields, "sum");

                const collect = prefix => {
                    const out = {};
                    fields.filter(f => f.name.startsWith(prefix)).forEach(f => {
                        const scenario = f.name.replace(prefix, "").replace(/_+$/, "");
                        const raw = attrs[`${f.name}_sum`];
                        out[scenario] = (typeof raw === "number") ? parseFloat(raw.toFixed(2)) : parseFloat(Number(raw || 0).toFixed(2));
                    });
                    return out;
                };

                const capex = collect("CAPEX_");
                const opex = collect("OPEX_");
                const scenarioNames = Array.from(new Set([...Object.keys(capex), ...Object.keys(opex)]));

                const capexSeries = scenarioNames.map(s => capex[s] || 0);
                const opexSeries = scenarioNames.map(s => opex[s] || 0);

                new ApexCharts(canvases.capexOpex, {
                    chart: { type: 'bar', stacked: true, height: 400, background: '#fff', toolbar: { show: true } },
                    series: [
                        { name: "CAPEX (Σ)", data: capexSeries },
                        { name: "OPEX (Σ)", data: opexSeries }
                    ],
                    xaxis: { categories: scenarioNames, title: { text: "Senaryo" } },
                    yaxis: {
                        title: { text: "Ortalama Maliyet" },
                        labels: { formatter: val => formatKM(val) }
                    },
                    tooltip: {
                        theme: "dark", // ORIJINAL: theme dark
                        shared: true,
                        intersect: false,
                        y: { formatter: val => formatKM(val) } // ORIJINAL: y.formatter kullanılıyordu
                    },
                    colors: ["#1976D2", "#FFB300"],
                    legend: { position: "top", horizontalAlign: "left" },
                    plotOptions: { bar: { horizontal: false, columnWidth: '60%', borderRadius: 4 } },
                    dataLabels: { enabled: true, formatter: val => formatKM(val), style: { fontSize: '11px', colors: ['#000'] } },
                    title: { text: "Senaryolara Göre Toplam CAPEX - OPEX Maliyetleri (Σ)", align: 'center' }
                }).render();

            } catch (err) { logError("CAPEX/OPEX Chart", err); }
        }

    } catch (globalErr) {
        console.error("drawScenarioCharts genel hata:", globalErr);
    }

}
