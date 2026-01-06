const [
    Map, SceneLayer, FeatureLayer, WebScene, SceneView, GraphicsLayer, SketchViewModel, Slider,
    geodesicBufferOperator, Graphic, promiseUtils, Camera, LayerList, reactiveUtils, intl, Expand,
    GeoJSONLayer, IntegratedMeshLayer, Field, Symbol, BuildingSceneLayer, Slice, SlicePlane, Collection,
    BuildingExplorer, query, TopFeaturesQuery, CoordinateConversion, Format, Conversion, BasemapGallery,
    DirectLineMeasurement3D, AreaMeasurement3D, ElevationProfile, Daylight, Weather, webMercatorUtils,
    Bookmarks, Bookmark, Point, TileLayer, ElevationLayer, GroupLayer, Editor, Polygon, LabelClass,
    config, WebTileLayer, ClassBreaksRenderer, LineOfSight, IntegratedMesh3DTilesLayer, SpatialReference,
    project, ViewshedAnalysis, Viewshed, OrientedImageryLayer, FeatureTable, Legend, Sketch
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
    "@arcgis/core/widgets/FeatureTable.js",
    "@arcgis/core/widgets/Legend", "esri/widgets/Sketch",
]);

let homeCamera;
let activeWidget = null;
let sceneLayerView;
let sceneLayerViews = {};
let sceneLayer;
let highlightHandles = [];
let highlightHandle = null;
let sliderDefaults = {};
let featureTable;
let activeLayerView;
let activeLayer;
let highlight;
let currentLayer;
let sketchGeometry = null;
let selectedObjectIds = [];

let ODTUScene = new WebScene({
    portalItem: { id: "3adfc71e9e2a41cba7607b88046d6ecc" }
});

const view = new SceneView({
    container: "mapContainer",
    map: ODTUScene
});
window.view = view;

const layerList = new LayerList({
    view: view
});

const layerListExpand = new Expand({
    view: view,
    content: layerList,
    expanded: false,
    group: "top-left-tools"
});

view.ui.add(layerListExpand, "top-left");


const legend = new Legend({
    view: view
});

const legendExpand = new Expand({
    view: view,
    content: legend,
    expanded: false,
    group: "top-left-tools"
});
view.ui.add(legendExpand, "top-left");

const sketchLayer = new GraphicsLayer();
//view.map.add(sketchLayer);

// 2️⃣ Sketch widget
const sketch = new Sketch({
    view: view,
    layer: sketchLayer,
    creationMode: "update",
    availableCreateTools: ["polygon"], // sadece polygon aracı
    visibleElements: {
        selectionTools: false,
        settingsMenu: false
    }
});


const sketchExpand = new Expand({
    view: view,
    content: sketch,
    expanded: false,
    group: "top-left-tools"
});

// 4️⃣ UI’ya ekle
view.ui.add(sketchExpand, "top-left");


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

sketch.on("create", (event) => {
    if (event.state === "complete") {
        sketchGeometry = event.graphic.geometry;
        highlightBuildings();
    }
});

// Çizim güncellendiğinde
sketch.on("update", (event) => {
    if (event.state === "complete" && event.graphics.length > 0) {
        sketchGeometry = event.graphics[0].geometry;
        // highlightBuildings();
    }
});

function highlightBuildings() {
    if (!currentLayer || !sketchGeometry) return;

    view.whenLayerView(currentLayer).then((sceneLayerView) => {
        const query = sceneLayerView.createQuery();
        query.geometry = sketchGeometry;
        query.spatialRelationship = "intersects";

        sceneLayerView.queryObjectIds(query).then((objectIds) => {
            selectedObjectIds = objectIds || [];

            // Highlight
            if (highlightHandle) highlightHandle.remove();
            if (selectedObjectIds.length > 0) {
                highlightHandle = sceneLayerView.highlight(selectedObjectIds);
            }

            // FeatureLayer filtreleme
            if (selectedObjectIds.length > 0) {
                currentLayer.definitionExpression = `OBJECTID IN (${selectedObjectIds.join(",")})`;
            } else {
                currentLayer.definitionExpression = null; // tümünü göster
            }
        });
    });
}

// Çizim silindiğinde
sketch.on("delete", () => {
    sketchGeometry = null;
    selectedObjectIds = [];
    if (highlightHandle) {
        highlightHandle.remove();
        highlightHandle = null;
    }
    currentLayer.definitionExpression = null; // tüm feature'ları göster
});

async function filterScene() {
    //clearHighlighting();

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

    //const iod2025 = $("#sliderIOD2025").data("ionRangeSlider").result.from_value;
    //const iod2050 = $("#sliderIOD2050").data("ionRangeSlider").result.from_value;


    //const groupLayer = ODTUScene.layers.find(l => l.title === "Envelope Properties");
    const groupTitles = ["Envelope Properties", "KPI Parameters"];
    const targetGroups = ODTUScene.layers.filter(l => groupTitles.includes(l.title));

    // 2. Bu gruplardan hangisi şu an görünür (visible)? Onu bulalım.
    const activeGroup = targetGroups.find(g => g.visible);

    if (!activeGroup) {
        console.warn("Lütfen bir katman grubunu (Envelope veya KPI) aktif hale getirin.");
        return;
    }
    const activeLayer = activeGroup.layers.find(l => l.visible && l.type === "feature");
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
            disable: !hasField
        });
    }
}
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

}

// Filtreyi temizle
function clearHighlighting() {
    highlightHandles.forEach(h => {
        try { h.remove(); } catch (e) { }
    });
    highlightHandles = [];

    const groupTitles = ["Envelope Properties", "KPI Parameters"];

    groupTitles.forEach(title => {
        const groupLayer = ODTUScene.layers.find(l => l.title === title);

        if (groupLayer) {
            // Bu grubun içindeki tüm görünür feature katmanlarını bul
            groupLayer.layers.forEach(layer => {
                if (layer.visible && layer.type === "feature") {
                    layer.definitionExpression = null; // Filtreyi kaldır, tüm verileri göster
                }
            });
        }
    });
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
            div.style.height = "30vh";
            div.style.width = "100%";

            var conDiv = document.getElementById("tableContainer");
            conDiv.innerHTML = ""; // önceki tabloyu temizle
            conDiv.appendChild(div);

            // 1. Her iki grup katmanını kontrol et
            const groupTitles = ["Envelope Properties", "KPI Parameters"];
            const targetGroups = view.map.layers.filter(l => groupTitles.includes(l.title));

            // 2. Bu gruplardan hangisi şu an görünür (visible)?
            const activeGroup = targetGroups.find(g => g.visible);

            if (!activeGroup) {
                alert("Tabloyu açmak için önce bir katman grubunu (Envelope veya KPI) aktif yapın!");
                break;
            }
            const activeLayer = activeGroup.layers.find(l => l.visible && (l.type === "feature" || l.type === "scene"));

            if (!activeLayer) {
                alert("Seçili grupta tablosu açılacak aktif bir katman bulunamadı!");
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
            document.getElementById("tableContainer").style.height = "30vh"; 
            document.getElementById("mapContainer").style.height = "70vh";

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

function initScenarioPanel() {
    const btn = document.getElementById("btnScenario");
    const panel = document.getElementById("scenarioContainer");
    const resizer = document.getElementById("scenarioResizer");

    if (!btn || !panel || !resizer) {
        console.warn("Scenario elemanları yok:", { btn, panel, resizer });
        return;
    }

    const MIN_W = 320;
    const MAX_W = () => Math.min(window.innerWidth * 0.7, 900);

    let lastWidth = null; // kullanıcı sürüklediyse hatırla
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    function forceMapResize() {
        const v = window.view || window.sceneView || window.mapView;
        try { v && typeof v.resize === "function" && v.resize(); } catch { }
        window.dispatchEvent(new Event("resize"));
    }

    function resizeApexCharts() {
        window.resizeScenarioCharts && window.resizeScenarioCharts();
    }


    let __pendingResize = false;

    function hardResizeAll() {
        if (__pendingResize) return;
        __pendingResize = true;

        requestAnimationFrame(() => {
            __pendingResize = false;

            const v = window.view || window.sceneView || window.mapView;
            try { v && typeof v.resize === "function" && v.resize(); } catch { }

            try { window.resizeScenarioCharts && window.resizeScenarioCharts(); } catch { }
        });
    }


    // initScenarioPanel içindeki toggle kısmı
    btn.addEventListener("click", () => {
        const open = panel.classList.toggle("open");

        if (open) {
            const defaultW = 420; // CSS default’un
            panel.style.width = `${lastWidth ?? defaultW}px`;
        } else {
            panel.style.width = "0px";
        }

        requestAnimationFrame(hardResizeAll);
    });


    // ✅ Resize drag
    resizer.addEventListener("mousedown", (e) => {
        if (!panel.classList.contains("open")) return;

        isResizing = true;
        startX = e.clientX;
        startWidth = panel.getBoundingClientRect().width;
        document.body.classList.add("scenario-resizing");
        e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
        if (!isResizing) return;

        const dx = e.clientX - startX;
        let w = startWidth + dx;

        w = Math.max(MIN_W, Math.min(MAX_W(), w));
        panel.style.width = `${w}px`; // inline width → panel büyür
        lastWidth = w;

        hardResizeAll();
    });

    window.addEventListener("mouseup", () => {
        if (!isResizing) return;
        isResizing = false;
        document.body.classList.remove("scenario-resizing");
        requestAnimationFrame(hardResizeAll);
    });

    window.addEventListener("resize", () => {
        if (!panel.classList.contains("open")) return;

        const cap = MAX_W();
        const w = panel.getBoundingClientRect().width;

        if (w > cap) {
            panel.style.width = `${cap}px`;
            lastWidth = cap;
        }
        requestAnimationFrame(hardResizeAll);
    });
}

// module ise bu daha garanti:
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScenarioPanel);
} else {
    initScenarioPanel();
}


// === GLOBAL CHART REFERANSLARI ===
let radialBarChart;
let barChart;
let radarChart;
let boxPlotChart;



// global: tüm chart instance'larını tut
window.__scenarioCharts = window.__scenarioCharts || {};

// render helper
function renderScenarioChart(key, el, options) {
    // eski varsa destroy
    if (window.__scenarioCharts[key]) {
        try { window.__scenarioCharts[key].destroy(); } catch { }
        window.__scenarioCharts[key] = null;
    }

    // responsive için kritik: parent genişliği değişince Apex'e resize dedirt
    options.chart = options.chart || {};
    options.chart.parentHeightOffset = 0;

    const chart = new ApexCharts(el, options);
    window.__scenarioCharts[key] = chart;
    chart.render();
}

function destroyAllScenarioCharts() {
    const reg = window.__scenarioCharts || {};
    Object.values(reg).forEach(ch => { try { ch.destroy(); } catch { } });
    window.__scenarioCharts = {};
}

// panel resize'da çağıracağın fonksiyon (senin initScenarioPanel içinden)
window.resizeScenarioCharts = function () {
    const reg = window.__scenarioCharts || {};
    Object.values(reg).forEach(ch => { try { ch.resize(); } catch { } });
};


async function drawScenarioCharts() {
    try {
        if (!currentLayer) {
            console.warn("Aktif layer bulunamadı.");
            return;
        }

        // ✅ önce eskileri düzgün kapat (canvas silme yok!)
        destroyAllScenarioCharts();

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
            return val.toLocaleString();
        };

        const canvases = {
            radial: document.querySelector("#radialBarChart"),
            radar: document.querySelector("#radarChart"),
            slope: document.querySelector("#slopeChart"),
            npvBox: document.querySelector("#npvboxPlotChart"),
            roiBox: document.querySelector("#roiboxPlotChart"),
            capexOpex: document.querySelector("#capexopexChart"),
            kwhBox: document.querySelector("#kwhChart")
        };


        // ---------- CAPEX / OPEX ----------
        if (canvases.capexOpex) {
            try {
                const fields = currentLayer.fields.filter(f => f.name.startsWith("OPEX_") || f.name.startsWith("CAPEX_"));
                if (!fields.length) {
                    console.warn("CAPEX/OPEX field bulunamadı.");
                } else {
                    const attrs = await fetchStats(fields, "sum");

                    const collect = prefix => {
                        const out = {};
                        fields.filter(f => f.name.startsWith(prefix)).forEach(f => {
                            const scenario = f.name.replace(prefix, "").replace(/_+$/, "");
                            const raw = attrs[`${f.name}_sum`];
                            out[scenario] = (typeof raw === "number")
                                ? parseFloat(raw.toFixed(2))
                                : parseFloat(Number(raw || 0).toFixed(2));
                        });
                        return out;
                    };

                    const opex = collect("OPEX_");
                    const capex = collect("CAPEX_");

                    const scenarioNames = Array.from(new Set([...Object.keys(capex), ...Object.keys(opex)]));
                    const baseIndex = scenarioNames.indexOf("BASE");
                    if (baseIndex > 0) scenarioNames.unshift(scenarioNames.splice(baseIndex, 1)[0]);

                    const opexSeries = scenarioNames.map(s => opex[s] || 0);
                    const capexSeries = scenarioNames.map(s => capex[s] || 0);

                    renderScenarioChart("capexOpex", canvases.capexOpex, {
                        chart: { type: 'bar', stacked: true, height: 400, background: '#fff', toolbar: { show: true } },
                        series: [
                            { name: "OPEX (Σ)", data: opexSeries },
                            { name: "CAPEX (Σ)", data: capexSeries }
                        ],
                        xaxis: { categories: scenarioNames, title: { text: "Scenarios" } },
                        yaxis: {
                            title: { text: "Total Cost (TCO)" },
                            labels: { formatter: val => formatKM(val) }
                        },
                        tooltip: {
                            theme: "dark",
                            shared: true,
                            intersect: false,
                            y: { formatter: val => formatKM(val) }
                        },
                        colors: ["#FFB300", "#1976D2"],
                        legend: { position: "top", horizontalAlign: "left" },
                        plotOptions: { bar: { horizontal: false, columnWidth: '60%', borderRadius: 4 } },
                        dataLabels: { enabled: true, formatter: val => formatKM(val), style: { fontSize: '11px', colors: ['#000'] } },
                        title: { text: "Total CAPEX and OPEX", align: 'center' }
                    });
                }
            } catch (err) { logError("CAPEX/OPEX Chart", err); }
        }

        // ---------- ROI BOX PLOT ----------
        if (canvases.roiBox) {
            try {
                const MIN_LIMIT = -1000;
                const fields = currentLayer.fields.filter(f => f.name.startsWith("ROI_"));
                if (!fields.length) {
                    console.warn("ROI field bulunamadı.");
                } else {
                    const features = await fetchValues(fields);
                    if (!features.length) {
                        console.warn("ROI verisi bulunamadı.");
                    } else {
                        const seriesData = fields.map(f => {
                            const rawVals = features.map(feat => feat.attributes[f.name]).filter(v => v != null);
                            const values = rawVals
                                .map(v => parseFloat(String(v).replace(",", ".")))
                                .filter(v => !isNaN(v))
                                .sort((a, b) => a - b);

                            if (!values.length) return null;

                            const realMin = values[0];
                            const min = Math.max(realMin, MIN_LIMIT);
                            const q1 = values[Math.floor(values.length * 0.25)];
                            const median = values[Math.floor(values.length * 0.5)];
                            const q3 = values[Math.floor(values.length * 0.75)];
                            const max = values[values.length - 1];

                            return {
                                x: (f.alias || f.name).replace(/^ROI[_ ]?/, ""),
                                y: [min, q1, median, q3, max],
                                _realMin: realMin
                            };
                        }).filter(Boolean);

                        if (!seriesData.length) {
                            console.warn("Boxplot için geçerli ROI verisi bulunamadı.");
                        } else {
                            renderScenarioChart("roiBox", canvases.roiBox, {
                                chart: { type: 'boxPlot', height: 450, background: '#fff', toolbar: { show: true } },
                                series: [{ name: 'ROI', data: seriesData }],
                                colors: ["#4bc0c0"],
                                tooltip: {
                                    theme: "dark",
                                    shared: true,
                                    custom: function ({ seriesIndex, dataPointIndex, w }) {
                                        const data = w.config.series[seriesIndex].data[dataPointIndex];
                                        const y = data.y;
                                        return `<div style="padding:6px">
                                            <strong>${data.x}</strong><br/>
                                            Max: ${y[4].toFixed(2)}%<br/>
                                            Q3: ${y[3].toFixed(2)}%<br/>
                                            Medyan: ${y[2].toFixed(2)}%<br/>
                                            Q1: ${y[1].toFixed(2)}%<br/>
                                            Min: ${data._realMin.toFixed(2)}%
                                        </div>`;
                                    }
                                },
                                yaxis: { title: { text: 'ROI (%)' }, labels: { formatter: val => val.toFixed(2) + "%" } },
                                xaxis: { title: { text: 'Scenarios' } },
                                title: { text: 'Return on Investment (ROI) Distribution', align: 'center', style: { fontSize: '16px', fontWeight: 'bold' } }
                            });
                        }
                    }
                }
            } catch (err) { logError("ROI Box", err); }
        }

        // ---------- NPV BOX PLOT ----------
        if (canvases.npvBox) {
            try {
                const MIN_LIMIT = -1_000_000;
                const fields = currentLayer.fields.filter(f => f.name.startsWith("NPV_"));
                if (!fields.length) {
                    console.warn("NPV field bulunamadı.");
                } else {
                    const features = await fetchValues(fields);
                    if (!features.length) {
                        console.warn("NPV verisi bulunamadı.");
                    } else {
                        const seriesData = fields.map(f => {
                            const rawVals = features.map(feat => feat.attributes[f.name]).filter(v => v != null);
                            const values = rawVals
                                .map(v => parseFloat(String(v).replace(",", ".")))
                                .filter(v => !isNaN(v))
                                .sort((a, b) => a - b);

                            if (!values.length) return null;

                            const realMin = values[0];
                            const min = Math.max(realMin, MIN_LIMIT);
                            const q1 = values[Math.floor(values.length * 0.25)];
                            const median = values[Math.floor(values.length * 0.5)];
                            const q3 = values[Math.floor(values.length * 0.75)];
                            const max = values[values.length - 1];

                            return {
                                x: (f.alias || f.name).replace(/^NPV[_ ]?/, ""),
                                y: [min, q1, median, q3, max],
                                _realMin: realMin
                            };
                        }).filter(Boolean);

                        if (!seriesData.length) {
                            console.warn("Boxplot için geçerli NPV verisi bulunamadı.");
                        } else {
                            renderScenarioChart("npvBox", canvases.npvBox, {
                                chart: { type: 'boxPlot', height: 450, background: '#fff', toolbar: { show: true } },
                                series: [{ name: 'NPV', data: seriesData }],
                                colors: ["#4bc0c0"],
                                tooltip: {
                                    theme: "dark",
                                    shared: true,
                                    custom: function ({ seriesIndex, dataPointIndex, w }) {
                                        const data = w.config.series[seriesIndex].data[dataPointIndex];
                                        const y = data.y;
                                        return `<div style="padding:6px">
                                            <strong>${data.x}</strong><br/>
                                            Min (Clamp): €${y[0].toFixed(2)}<br/>
                                            Gerçek Min: €${data._realMin.toFixed(2)}<br/>
                                            Q1: €${y[1].toFixed(2)}<br/>
                                            Medyan: €${y[2].toFixed(2)}<br/>
                                            Q3: €${y[3].toFixed(2)}<br/>
                                            Max: €${y[4].toFixed(2)}
                                        </div>`;
                                    }
                                },
                                yaxis: { title: { text: 'NPV (€)' }, labels: { formatter: val => "€" + val.toFixed(2) } },
                                xaxis: { title: { text: 'Scenarios' } },
                                title: { text: 'Net Present Value (NPV) Distribution', align: 'center', style: { fontSize: '16px', fontWeight: 'bold' } }
                            });
                        }
                    }
                }
            } catch (err) { logError("NPV Box", err); }
        }

        // ---------- kWh/m2 Qheating ----------
        if (canvases.kwhBox) {
            try {
                const year = document.getElementById("yearDropdown")?.value || "2025";

                const scenarios = [
                    { key: "BASE", label: "BASE" },
                    { key: "BASE_HP", label: "BASE + HP" },
                    { key: "Enve", label: "ENVE" },
                    { key: "Enve_HP", label: "ENVE + HP" }
                ];

                const qHeatingFields = currentLayer.fields.filter(f =>
                    scenarios.some(s => f.name === `F${year}_${s.key}_Qheating`)
                );
                if (!qHeatingFields.length) {
                    console.warn("Qheating field bulunamadı.");
                } else {
                    const lightingField = currentLayer.fields.find(f => f.name === "Lighting_Load_All_Scenarios");
                    const equipmentField = currentLayer.fields.find(f => f.name === "Equipment_Load_All_Scenarios");

                    if (!lightingField || !equipmentField) {
                        console.warn("Lighting / Equipment field bulunamadı.");
                    } else {
                        const allFields = [...qHeatingFields, lightingField, equipmentField];
                        const stats = await fetchStats(allFields, "avg");

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
                        } else {
                            const lightingMean = +(stats[`${lightingField.name}_avg`] || 0).toFixed(2);
                            const equipmentMean = +(stats[`${equipmentField.name}_avg`] || 0).toFixed(2);

                            const lightingData = new Array(qHeatingData.length).fill(lightingMean);
                            const equipmentData = new Array(qHeatingData.length).fill(equipmentMean);

                            renderScenarioChart("kwhBox", canvases.kwhBox, {
                                chart: { type: "bar", height: 420, stacked: true, background: "#fff", toolbar: { show: true } },
                                series: [
                                    { name: `Qheating (${year})`, data: qHeatingData },
                                    { name: "Lighting Load", data: lightingData },
                                    { name: "Equipment Load", data: equipmentData }
                                ],
                                plotOptions: { bar: { horizontal: true, barHeight: "65%", borderRadius: 4 } },
                                xaxis: { title: { text: "Enerji (kWh/m²)" }, labels: { formatter: v => v.toFixed(2) } },
                                yaxis: { categories: labels, title: { text: "Senaryolar" } },
                                tooltip: { theme: "dark", shared: true, intersect: false, y: { formatter: v => `${v.toFixed(2)} kWh/m²` } },
                                dataLabels: { enabled: true, formatter: v => v.toFixed(2), style: { fontSize: "11px" } },
                                colors: ["#ff7043", "#42a5f5", "#9ccc65"],
                                legend: { position: "top", horizontalAlign: "left" },
                                title: { text: `Heating, Equipment and Lighting Loads – ${year}`, align: "center", style: { fontSize: "16px", fontWeight: "bold" } }
                            });
                        }
                    }
                }
            } catch (err) { logError("kWh/m² Chart", err); }
        }

        // ---------- SLOPE CHART ----------
        if (canvases.slope) {
            try {
                const capexFields = currentLayer.fields.filter(f => f.name.startsWith("CAPEX_"));
                const emissionFields = currentLayer.fields.filter(f => f.name.startsWith("Emission_") && !f.name.includes("_Reduction"));
                const reductionFields = currentLayer.fields.filter(f => f.name.startsWith("Emission_Reduction_"));
                const allFields = [...capexFields, ...emissionFields, ...reductionFields];

                if (!allFields.length) {
                    console.warn("Slope için field bulunamadı.");
                } else {
                    const attrs = await fetchStats(allFields, "sum");

                    const scenarioNames = ["BASE_PV", "BASE_HP", "BASE_HP_PV", "Enve", "Enve_PV", "Enve_HP", "Enve_HP_PV"];
                    const scenarioColors = {
                        BASE_PV: "#1f77b4",
                        BASE_HP: "#ff7f0e",
                        BASE_HP_PV: "#2ca02c",
                        Enve: "#d62728",
                        Enve_PV: "#9467bd",
                        Enve_HP: "#17becf",
                        Enve_HP_PV: "#bcbd22"
                    };

                    const getSumValue = (prefix, scenario) => {
                        const key = Object.keys(attrs).find(k => k.startsWith(prefix) && k.includes(scenario) && k.endsWith("_sum"));
                        if (!key) return 0;
                        const raw = attrs[key];
                        return typeof raw === "number" ? parseFloat(raw.toFixed(2)) : parseFloat(Number(raw || 0).toFixed(2));
                    };

                    const seriesData = scenarioNames.map(name => ({
                        name,
                        color: scenarioColors[name],
                        data: [
                            { x: "Capex", y: getSumValue("CAPEX_", name) },
                            { x: "Total Emission", y: getSumValue("Emission_", name) },
                            { x: "Emission Reduction", y: getSumValue("Emission_Reduction_", name) }
                        ]
                    })).filter(s => s.data.some(p => p.y !== 0));

                    if (!seriesData.length) {
                        console.warn("Slope chart için geçerli seri bulunamadı.");
                    } else {
                        renderScenarioChart("slope", canvases.slope, {
                            chart: { type: "line", height: 500, background: "#fff", toolbar: { show: false }, zoom: { enabled: false } },
                            series: seriesData,
                            stroke: { width: 3, curve: "straight" },
                            xaxis: { categories: ["Capex", "Total Emission", "Emission Reduction"], title: { text: "Parametreler" }, labels: { rotate: 0, style: { fontSize: "13px" } } },
                            yaxis: { title: { text: "Değerler" }, labels: { formatter: val => val.toLocaleString() } },
                            tooltip: { theme: "dark", shared: true, intersect: false },
                            legend: { show: true, position: "top", horizontalAlign: "center" },
                            title: { text: "Capex, Total Emission, Emission Reduction", align: "center", style: { fontSize: "16px", fontWeight: "bold" } }
                        });
                    }
                }
            } catch (err) { logError("Slope Chart", err); }
        }

        // ---------- RADIAL BAR ----------
        if (canvases.radial) {
            try {
                const fields = currentLayer.fields.filter(f => f.name.startsWith("Payback_"));
                if (!fields.length) {
                    console.warn("Payback alanı bulunamadı.");
                } else {
                    const stats = await fetchStats(fields, "max");
                    const MAX_PAYBACK = 25;

                    const filteredData = fields.map(f => {
                        let raw = stats[`${f.name}_max`];
                        if (raw === null || raw === undefined) raw = MAX_PAYBACK;
                        const value = (typeof raw === "number") ? parseFloat(raw.toFixed(2)) : MAX_PAYBACK;
                        return {
                            label: (f.alias || f.name).replace(/^Payback[_ ]?/, "").replace(/_/g, " ").trim(),
                            value
                        };
                    });

                    const series = filteredData.map(d => d.value);
                    const labels = filteredData.map(d => d.label);
                    const maxValue = Math.max(...series).toFixed(2);

                    renderScenarioChart("radial", canvases.radial, {
                        chart: { type: 'radialBar', height: 550 },
                        series,
                        labels,
                        colors: ["#36a2eb", "#ff6384", "#ffcd56", "#4bc0c0", "#9966ff", "#ff9f40", "#8a89a6"],
                        plotOptions: {
                            radialBar: {
                                hollow: { size: '35%' },
                                track: { strokeWidth: '100%' },
                                dataLabels: {
                                    name: { show: true, fontSize: '16px' },
                                    value: { show: true, formatter: val => `${val} yıl` },
                                    total: { show: true, label: 'Maks.', formatter: () => `${maxValue} yıl` }
                                }
                            }
                        },
                        tooltip: {
                            theme: "dark",
                            shared: false,
                            followCursor: true,
                            y: { formatter: val => `${val} yıl` }
                        },
                        legend: { show: true, position: 'bottom' },
                        title: { text: 'Senaryolara Göre Maks. Geri Ödeme Süresi' }
                    });
                }
            } catch (err) { logError("Radial Chart", err); }
        }

        // ---------- RADAR ----------
        if (canvases.radar) {
            try {
                const iodFields = currentLayer.fields.filter(f =>
                    f.name.toUpperCase().includes("IOD") && !f.name.toUpperCase().includes("PV")
                );
                if (!iodFields.length) {
                    console.warn("PV'siz IOD alanı bulunamadı.");
                } else {
                    const features = await fetchValues(iodFields);
                    if (!features.length) {
                        console.warn("IOD veri seti boş.");
                    } else {
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

                        renderScenarioChart("radar", canvases.radar, {
                            chart: { type: 'radar', height: 450 },
                            series: [
                                { name: "2025", data: seriesMap["2025"] },
                                { name: "2050", data: seriesMap["2050"] }
                            ],
                            labels,
                            plotOptions: { radar: { polygons: { strokeColors: '#e0e0e0' } } },
                            tooltip: { theme: "dark" },
                            legend: { position: 'top' },
                            title: { text: "2025-2050 Indoor Overheating Degree (IOD)" },
                            colors: ["#36a2eb", "#ff6384"]
                        });
                    }
                }
            } catch (err) { logError("Radar Chart", err); }
        }

        // ✅ ilk render sonrası bir resize tetikle (panel açılırken iyi gelir)
        requestAnimationFrame(() => {
            try { window.resizeScenarioCharts && window.resizeScenarioCharts(); } catch { }
        });

    } catch (globalErr) {
        console.error("drawScenarioCharts genel hata:", globalErr);
    }
}

document.getElementById("btnInfo").addEventListener("click", function () {
    // PDF dosya yolunu buraya koy
    const pdfUrl = "/pdf.pdf";
    window.open(pdfUrl, "_blank");
});