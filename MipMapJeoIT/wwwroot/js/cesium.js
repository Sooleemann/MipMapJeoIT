

var terrainProvider = new Cesium.CesiumTerrainProvider({
    url: 'https://terrain.tkgm.gov.tr/tilesets/tile/16/78664/47474.terrain?v=1.1.0',
            requestVertexNormals: true
});
const terrainProvider2 = await Cesium.EllipsoidTerrainProvider();

const viewer = new Cesium.Viewer('cesiumContainer', {
    //terrain: Cesium.Terrain.fromWorldTerrain(),
    //terrainProvider : terrainProvider
});

viewer.dataSources.add(Cesium.GeoJsonDataSource.load('/home/GeoJSON/M-3244705-A,M-3244706-A,M-2826521-A', {
    stroke: Cesium.Color.GRAY,
    fill: Cesium.Color.PINK,
    strokeWidth: 3,
    markerSymbol: '?'
}));



viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(32.80977, 39.9680597, 980),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-15.0),
    }
});
createTileSet();



async function createTileSet() {

    //const tileset2 = await Cesium.Cesium3DTileset.fromUrl(
    //    "https://sampleservices.luciad.com/ogc/3dtiles/marseille-mesh/tileset.json");

    //viewer.scene.primitives.add(tileset2);


    const tileset = await Cesium.Cesium3DTileset.fromUrl( "/Luciad_Tileset_V1.0/tileset.json");

    viewer.scene.primitives.add(tileset);


    const tileset2 = await Cesium.Cesium3DTileset.fromUrl("https://3dsurectakipservis.tkgm.gov.tr/TileService/Texture/5/tileset.json");

    viewer.scene.primitives.add(tileset2);



    var style = new Cesium.Cesium3DTileStyle({
        color: {
            conditions:[["true","color('#cccccc')"]]
        }
    });
    

    style.anchorLineEnabled = true;

    // style.anchorLineColor = ‘color(“blue”)’;

    //tileset.style = style;

}