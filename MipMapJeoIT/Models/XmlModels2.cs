//using System.Xml.Serialization;

//namespace Mipmap.Tkgm.Models
//{

//    //[XmlRoot(ElementName = "Envelope", Namespace = "http://www.opengis.net/gml")]
//    public class Envelope
//    {
//        [XmlElement(ElementName = "lowerCorner", Namespace = "http://www.opengis.net/gml")]
//        public string LowerCorner { get; set; }
//        [XmlElement(ElementName = "upperCorner", Namespace = "http://www.opengis.net/gml")]
//        public string UpperCorner { get; set; }
//        [XmlAttribute(AttributeName = "srsDimension")]
//        public string SrsDimension { get; set; }
//        [XmlAttribute(AttributeName = "srsName")]
//        public string SrsName { get; set; }
//    }

//    [XmlRoot(ElementName = "boundedBy", Namespace = "http://www.opengis.net/gml")]
//    public class BoundedBy
//    {
//        [XmlElement(ElementName = "Envelope", Namespace = "http://www.opengis.net/gml")]
//        public Envelope Envelope { get; set; }
//    }

//    [XmlRoot(ElementName = "textureCoordinates", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//    public class TextureCoordinates
//    {
//        [XmlAttribute(AttributeName = "ring")]
//        public string Ring { get; set; }
//        [XmlText]
//        public string Text { get; set; }
//    }

//    [XmlRoot(ElementName = "TexCoordList", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//    public class TexCoordList
//    {
//        [XmlElement(ElementName = "textureCoordinates", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//        public TextureCoordinates TextureCoordinates { get; set; }
//    }

//    [XmlRoot(ElementName = "target", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//    public class Target
//    {
//        [XmlElement(ElementName = "TexCoordList", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//        public TexCoordList TexCoordList { get; set; }
//        [XmlAttribute(AttributeName = "uri")]
//        public string Uri { get; set; }
//    }

//    [XmlRoot(ElementName = "ParameterizedTexture", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//    public class ParameterizedTexture
//    {
//        [XmlElement(ElementName = "imageURI", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//        public string ImageURI { get; set; }
//        [XmlElement(ElementName = "target", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//        public List<Target> Target { get; set; }
//    }

//    [XmlRoot(ElementName = "surfaceDataMember", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//    public class SurfaceDataMember
//    {
//        [XmlElement(ElementName = "ParameterizedTexture", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//        public ParameterizedTexture ParameterizedTexture { get; set; }
//    }

//    [XmlRoot(ElementName = "Appearance", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//    public class Appearance
//    {
//        [XmlElement(ElementName = "theme", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//        public string Theme { get; set; }
//        [XmlElement(ElementName = "surfaceDataMember", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//        public SurfaceDataMember SurfaceDataMember { get; set; }
//    }

//    [XmlRoot(ElementName = "appearance", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//    public class AppearanceContent
//    {
//        [XmlElement(ElementName = "Appearance", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//        public Appearance Appearance { get; set; }
//    }

//    [XmlRoot(ElementName = "doubleAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//    public class DoubleAttribute
//    {
//        [XmlElement(ElementName = "value", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public string Value { get; set; }
//        [XmlAttribute(AttributeName = "name")]
//        public string Name { get; set; }
//    }

//    [XmlRoot(ElementName = "stringAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//    public class StringAttribute
//    {
//        [XmlElement(ElementName = "value", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public string Value { get; set; }
//        [XmlAttribute(AttributeName = "name")]
//        public string Name { get; set; }
//    }

//    [XmlRoot(ElementName = "intAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//    public class IntAttribute
//    {
//        [XmlElement(ElementName = "value", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public string Value { get; set; }
//        [XmlAttribute(AttributeName = "name")]
//        public string Name { get; set; }
//    }

//    [XmlRoot(ElementName = "measuredHeight", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class MeasuredHeight
//    {
//        [XmlAttribute(AttributeName = "uom")]
//        public string Uom { get; set; }
//        [XmlText]
//        public string Text { get; set; }
//    }

//    [XmlRoot(ElementName = "posList", Namespace = "http://www.opengis.net/gml")]
//    public class PosList
//    {
//        [XmlAttribute(AttributeName = "srsDimension")]
//        public string SrsDimension { get; set; }
//        [XmlText]
//        public string Text { get; set; }
//    }

//    [XmlRoot(ElementName = "LinearRing", Namespace = "http://www.opengis.net/gml")]
//    public class LinearRing
//    {
//        [XmlElement(ElementName = "posList", Namespace = "http://www.opengis.net/gml")]
//        public PosList PosList { get; set; }
//        [XmlAttribute(AttributeName = "id", Namespace = "http://www.opengis.net/gml")]
//        public string Id { get; set; }

//        [XmlElement(ElementName = "pos", Namespace = "http://www.opengis.net/gml")]
//        public List<string> Pos { get; set; }

//    }

//    [XmlRoot(ElementName = "exterior", Namespace = "http://www.opengis.net/gml")]
//    public class Exterior
//    {
//        [XmlElement(ElementName = "LinearRing", Namespace = "http://www.opengis.net/gml")]
//        public LinearRing LinearRing { get; set; }
//        [XmlElement(ElementName = "CompositeSurface", Namespace = "http://www.opengis.net/gml")]
//        public CompositeSurface CompositeSurface { get; set; }
//    }

//    [XmlRoot(ElementName = "Polygon", Namespace = "http://www.opengis.net/gml")]
//    public class Polygon
//    {
//        [XmlElement(ElementName = "exterior", Namespace = "http://www.opengis.net/gml")]
//        public Exterior Exterior { get; set; }
//        [XmlAttribute(AttributeName = "id", Namespace = "http://www.opengis.net/gml")]
//        public string Id { get; set; }
//    }

//    [XmlRoot(ElementName = "surfaceMember", Namespace = "http://www.opengis.net/gml")]
//    public class SurfaceMember
//    {
//        [XmlElement(ElementName = "Polygon", Namespace = "http://www.opengis.net/gml")]
//        public Polygon Polygon { get; set; }
//        [XmlAttribute(AttributeName = "href", Namespace = "http://www.w3.org/1999/xlink")]
//        public string Href { get; set; }
//        [XmlElement(ElementName = "CompositeSurface", Namespace = "http://www.opengis.net/gml")]
//        public CompositeSurface CompositeSurface { get; set; }
//    }

//    [XmlRoot(ElementName = "MultiSurface", Namespace = "http://www.opengis.net/gml")]
//    public class MultiSurface
//    {
//        [XmlElement(ElementName = "surfaceMember", Namespace = "http://www.opengis.net/gml")]
//        public List<SurfaceMember> SurfaceMember { get; set; }
//    }

//    [XmlRoot(ElementName = "lod0FootPrint", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Lod0FootPrint
//    {
//        [XmlElement(ElementName = "MultiSurface", Namespace = "http://www.opengis.net/gml")]
//        public MultiSurface MultiSurface { get; set; }
//    }

//    [XmlRoot(ElementName = "lod0RoofEdge", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Lod0RoofEdge
//    {
//        [XmlElement(ElementName = "MultiSurface", Namespace = "http://www.opengis.net/gml")]
//        public MultiSurface MultiSurface { get; set; }
//    }

//    [XmlRoot(ElementName = "CompositeSurface", Namespace = "http://www.opengis.net/gml")]
//    public class CompositeSurface
//    {
//        [XmlElement(ElementName = "surfaceMember", Namespace = "http://www.opengis.net/gml")]
//        public List<SurfaceMember> SurfaceMember { get; set; }
//    }

//    [XmlRoot(ElementName = "Solid", Namespace = "http://www.opengis.net/gml")]
//    public class Solid
//    {
//        [XmlElement(ElementName = "exterior", Namespace = "http://www.opengis.net/gml")]
//        public Exterior Exterior { get; set; }
//    }

//    [XmlRoot(ElementName = "lod1Solid", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Lod1Solid
//    {
//        [XmlElement(ElementName = "Solid", Namespace = "http://www.opengis.net/gml")]
//        public Solid Solid { get; set; }
//    }

//    [XmlRoot(ElementName = "lod2MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Lod2MultiSurface
//    {
//        [XmlElement(ElementName = "MultiSurface", Namespace = "http://www.opengis.net/gml")]
//        public MultiSurface MultiSurface { get; set; }
//    }

//    [XmlRoot(ElementName = "LineString", Namespace = "http://www.opengis.net/gml")]
//    public class LineString
//    {
//        [XmlElement(ElementName = "posList", Namespace = "http://www.opengis.net/gml")]
//        public PosList PosList { get; set; }
//    }

//    [XmlRoot(ElementName = "curveMember", Namespace = "http://www.opengis.net/gml")]
//    public class CurveMember
//    {
//        [XmlElement(ElementName = "LineString", Namespace = "http://www.opengis.net/gml")]
//        public LineString LineString { get; set; }
//    }

//    [XmlRoot(ElementName = "MultiCurve", Namespace = "http://www.opengis.net/gml")]
//    public class MultiCurve
//    {
//        [XmlElement(ElementName = "curveMember", Namespace = "http://www.opengis.net/gml")]
//        public CurveMember CurveMember { get; set; }
//    }

//    [XmlRoot(ElementName = "lod2TerrainIntersection", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Lod2TerrainIntersection
//    {
//        [XmlElement(ElementName = "MultiCurve", Namespace = "http://www.opengis.net/gml")]
//        public MultiCurve MultiCurve { get; set; }
//    }

//    [XmlRoot(ElementName = "lod2Geometry", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Lod2Geometry
//    {
//        [XmlElement(ElementName = "MultiSurface", Namespace = "http://www.opengis.net/gml")]
//        public MultiSurface MultiSurface { get; set; }
//    }

//    [XmlRoot(ElementName = "RoofSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class RoofSurface
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }
//        [XmlElement(ElementName = "lod2MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod2MultiSurface Lod2MultiSurface { get; set; }
//    }


//    [XmlRoot(ElementName = "boundedBy", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class BoundedBy2
//    {
//        [XmlElement(ElementName = "RoofSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public RoofSurface RoofSurface { get; set; }
//        [XmlElement(ElementName = "WallSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public WallSurface WallSurface { get; set; }
//        [XmlElement(ElementName = "FloorSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public FloorSurface FloorSurface { get; set; }
//        [XmlElement(ElementName = "InteriorWallSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public InteriorWallSurface InteriorWallSurface { get; set; }
//        [XmlElement(ElementName = "CeilingSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public CeilingSurface CeilingSurface { get; set; }
//    }



//    [XmlRoot(ElementName = "WallSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class WallSurface
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }

//        [XmlElement(ElementName = "lod2MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod2MultiSurface Lod2MultiSurface { get; set; }

//        [XmlElement(ElementName = "opening", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public List<Opening> Opening { get; set; }

//        [XmlElement(ElementName = "lod4MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod4MultiSurface Lod4MultiSurface { get; set; }
//    }


//    [XmlRoot(ElementName = "BuildingInstallation", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class BuildingInstallation
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }
//        [XmlElement(ElementName = "class", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public string Class { get; set; }
//        [XmlElement(ElementName = "lod2Geometry", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod2Geometry Lod2Geometry { get; set; }
//        [XmlElement(ElementName = "boundedBy", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public List<BoundedBy2> BoundedBy2 { get; set; }
//        [XmlAttribute(AttributeName = "id", Namespace = "http://www.opengis.net/gml")]
//        public string Id { get; set; }
//    }

//    [XmlRoot(ElementName = "outerBuildingInstallation", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class OuterBuildingInstallation
//    {
//        [XmlElement(ElementName = "BuildingInstallation", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public BuildingInstallation BuildingInstallation { get; set; }
//    }

//    [XmlRoot(ElementName = "GroundSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class GroundSurface
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }
//        [XmlElement(ElementName = "lod2MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod2MultiSurface Lod2MultiSurface { get; set; }
//    }

//    [XmlRoot(ElementName = "lod4MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Lod4MultiSurface
//    {
//        [XmlElement(ElementName = "MultiSurface", Namespace = "http://www.opengis.net/gml")]
//        public MultiSurface MultiSurface { get; set; }
//    }


//    [XmlRoot(ElementName = "Door", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Door
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }
//        [XmlElement(ElementName = "intAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public IntAttribute IntAttribute { get; set; }
//        [XmlElement(ElementName = "lod4MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod4MultiSurface Lod4MultiSurface { get; set; }
//        [XmlAttribute(AttributeName = "id", Namespace = "http://www.opengis.net/gml")]
//        public string Id { get; set; }
//    }

//    [XmlRoot(ElementName = "opening", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Opening
//    {
//        [XmlElement(ElementName = "Door", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Door Door { get; set; }
//        [XmlElement(ElementName = "Window", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Window Window { get; set; }
//    }


//    [XmlRoot(ElementName = "Window", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Window
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }
//        [XmlElement(ElementName = "intAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public IntAttribute IntAttribute { get; set; }
//        [XmlElement(ElementName = "lod4MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod4MultiSurface Lod4MultiSurface { get; set; }
//        [XmlAttribute(AttributeName = "id", Namespace = "http://www.opengis.net/gml")]
//        public string Id { get; set; }
//    }

//    [XmlRoot(ElementName = "FloorSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class FloorSurface
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }
//        [XmlElement(ElementName = "lod4MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod4MultiSurface Lod4MultiSurface { get; set; }
//    }


//    [XmlRoot(ElementName = "CeilingSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class CeilingSurface
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }
//        [XmlElement(ElementName = "lod4MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod4MultiSurface Lod4MultiSurface { get; set; }
//    }

//    [XmlRoot(ElementName = "interior", Namespace = "http://www.opengis.net/gml")]
//    public class Interior
//    {
//        [XmlElement(ElementName = "LinearRing", Namespace = "http://www.opengis.net/gml")]
//        public LinearRing LinearRing { get; set; }
//    }

//    [XmlRoot(ElementName = "InteriorWallSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class InteriorWallSurface
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }
//        [XmlElement(ElementName = "lod4MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod4MultiSurface Lod4MultiSurface { get; set; }
//        [XmlElement(ElementName = "opening", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public List<Opening> Opening { get; set; }
//    }

//    [XmlRoot(ElementName = "Room", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Room
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }
//        [XmlElement(ElementName = "stringAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public List<StringAttribute> StringAttribute { get; set; }
//        [XmlElement(ElementName = "intAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public List<IntAttribute> IntAttribute { get; set; }
//        [XmlElement(ElementName = "doubleAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public List<DoubleAttribute> DoubleAttribute { get; set; }
//        [XmlElement(ElementName = "class", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public string Class { get; set; }
//        [XmlElement(ElementName = "lod4MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod4MultiSurface Lod4MultiSurface { get; set; }

//        [XmlElement(ElementName = "boundedBy", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public List<BoundedBy2> BoundedBy2 { get; set; }
//        [XmlAttribute(AttributeName = "id", Namespace = "http://www.opengis.net/gml")]
//        public string Id { get; set; }
//    }

//    [XmlRoot(ElementName = "interiorRoom", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class InteriorRoom
//    {
//        [XmlElement(ElementName = "Room", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Room Room { get; set; }
//    }

//    [XmlRoot(ElementName = "Building", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//    public class Building
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }

//        [XmlElement(ElementName = "appearance", Namespace = "http://www.opengis.net/citygml/appearance/2.0")]
//        public Appearance Appearance { get; set; }

//        [XmlElement(ElementName = "doubleAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public DoubleAttribute DoubleAttribute { get; set; }

//        [XmlElement(ElementName = "stringAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public List<StringAttribute> StringAttribute { get; set; }

//        [XmlElement(ElementName = "intAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public List<IntAttribute> IntAttribute { get; set; }

//        [XmlElement(ElementName = "class", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public string Class { get; set; }

//        [XmlElement(ElementName = "measuredHeight", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public MeasuredHeight MeasuredHeight { get; set; }

//        [XmlElement(ElementName = "lod0FootPrint", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod0FootPrint Lod0FootPrint { get; set; }

//        [XmlElement(ElementName = "lod0RoofEdge", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod0RoofEdge Lod0RoofEdge { get; set; }

//        [XmlElement(ElementName = "lod1Solid", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod1Solid Lod1Solid { get; set; }

//        [XmlElement(ElementName = "lod2MultiSurface", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod2MultiSurface Lod2MultiSurface { get; set; }
//        [XmlElement(ElementName = "lod2TerrainIntersection", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Lod2TerrainIntersection Lod2TerrainIntersection { get; set; }
//        [XmlElement(ElementName = "outerBuildingInstallation", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public OuterBuildingInstallation OuterBuildingInstallation { get; set; }
//        [XmlElement(ElementName = "boundedBy", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public List<BoundedBy2> BoundedBy2 { get; set; }

//        [XmlElement(ElementName = "interiorRoom", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public List<InteriorRoom> InteriorRoom { get; set; }

//        [XmlAttribute(AttributeName = "id", Namespace = "http://www.opengis.net/gml")]
//        public string Id { get; set; }
//    }

//    [XmlRoot(ElementName = "groupMember", Namespace = "http://www.opengis.net/citygml/cityobjectgroup/2.0")]
//    public class GroupMember
//    {
//        [XmlAttribute(AttributeName = "href", Namespace = "http://www.w3.org/1999/xlink")]
//        public string Href { get; set; }
//    }

//    [XmlRoot(ElementName = "geometry", Namespace = "http://www.opengis.net/citygml/cityobjectgroup/2.0")]
//    public class Geometry
//    {
//        [XmlElement(ElementName = "MultiSurface", Namespace = "http://www.opengis.net/gml")]
//        public MultiSurface MultiSurface { get; set; }
//    }


//    [XmlRoot(ElementName = "parent", Namespace = "http://www.opengis.net/citygml/cityobjectgroup/2.0")]
//    public class Parent
//    {
//        [XmlAttribute(AttributeName = "href", Namespace = "http://www.w3.org/1999/xlink")]
//        public string Href { get; set; }
//    }

//    [XmlRoot(ElementName = "CityObjectGroup", Namespace = "http://www.opengis.net/citygml/cityobjectgroup/2.0")]
//    public class CityObjectGroup
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }

//        [XmlElement(ElementName = "stringAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public StringAttribute StringAttribute { get; set; }

//        [XmlElement(ElementName = "intAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public List<IntAttribute> IntAttribute { get; set; }

//        [XmlElement(ElementName = "class", Namespace = "http://www.opengis.net/citygml/cityobjectgroup/2.0")]
//        public string Class { get; set; }

//        [XmlElement(ElementName = "parent", Namespace = "http://www.opengis.net/citygml/cityobjectgroup/2.0")]
//        public Parent Parent { get; set; }

//        [XmlElement(ElementName = "geometry", Namespace = "http://www.opengis.net/citygml/cityobjectgroup/2.0")]
//        public Geometry Geometry { get; set; }

//        [XmlAttribute(AttributeName = "id", Namespace = "http://www.opengis.net/gml")]
//        public string Id { get; set; }

//        [XmlElement(ElementName = "groupMember", Namespace = "http://www.opengis.net/citygml/cityobjectgroup/2.0")]
//        public List<GroupMember> GroupMember { get; set; }
//    }



//    [XmlRoot(ElementName = "GenericCityObject", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//    public class GenericCityObject
//    {
//        [XmlElement(ElementName = "name", Namespace = "http://www.opengis.net/gml")]
//        public string Name { get; set; }
//        [XmlElement(ElementName = "intAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public List<IntAttribute> IntAttribute { get; set; }
//        [XmlElement(ElementName = "stringAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public List<StringAttribute> StringAttribute { get; set; }
//        [XmlElement(ElementName = "doubleAttribute", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public List<DoubleAttribute> DoubleAttribute { get; set; }
//        [XmlElement(ElementName = "class", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public string Class { get; set; }
//        [XmlElement(ElementName = "lod2Geometry", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public Lod2Geometry Lod2Geometry { get; set; }
//        [XmlAttribute(AttributeName = "id", Namespace = "http://www.opengis.net/gml")]
//        public string Id { get; set; }
//    }

//    [XmlRoot(ElementName = "cityObjectMember", Namespace = "http://www.opengis.net/citygml/2.0")]
//    public class CityObjectMember
//    {
//        [XmlElement(ElementName = "Building", Namespace = "http://www.opengis.net/citygml/building/2.0")]
//        public Building Building { get; set; }

//        [XmlElement(ElementName = "CityObjectGroup", Namespace = "http://www.opengis.net/citygml/cityobjectgroup/2.0")]
//        public CityObjectGroup CityObjectGroup { get; set; }

//        [XmlElement(ElementName = "GenericCityObject", Namespace = "http://www.opengis.net/citygml/generics/2.0")]
//        public GenericCityObject GenericCityObject { get; set; }
//    }



//    [XmlRoot(ElementName = "CityModel", Namespace = "http://www.opengis.net/citygml/2.0")]
//    public class CityModel
//    {
//        [XmlElement(ElementName = "boundedBy", Namespace = "http://www.opengis.net/gml")]
//        public BoundedBy BoundedBy { get; set; }

//        [XmlElement(ElementName = "cityObjectMember", Namespace = "http://www.opengis.net/citygml/2.0")]
//        public List<CityObjectMember> CityObjectMember { get; set; }

//        [XmlAttribute(AttributeName = "xmlns")]
//        public string Xmlns { get; set; }
//        [XmlAttribute(AttributeName = "xsi", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Xsi { get; set; }
//        [XmlAttribute(AttributeName = "xlink", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Xlink { get; set; }
//        [XmlAttribute(AttributeName = "gml", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Gml { get; set; }
//        [XmlAttribute(AttributeName = "app", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string App { get; set; }
//        [XmlAttribute(AttributeName = "brid", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Brid { get; set; }
//        [XmlAttribute(AttributeName = "bldg", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Bldg { get; set; }
//        [XmlAttribute(AttributeName = "frn", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Frn { get; set; }
//        [XmlAttribute(AttributeName = "grp", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Grp { get; set; }
//        [XmlAttribute(AttributeName = "gen", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Gen { get; set; }
//        [XmlAttribute(AttributeName = "luse", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Luse { get; set; }
//        [XmlAttribute(AttributeName = "dem", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Dem { get; set; }
//        [XmlAttribute(AttributeName = "tran", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Tran { get; set; }
//        [XmlAttribute(AttributeName = "tun", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Tun { get; set; }
//        [XmlAttribute(AttributeName = "veg", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Veg { get; set; }
//        [XmlAttribute(AttributeName = "wtr", Namespace = "http://www.w3.org/2000/xmlns/")]
//        public string Wtr { get; set; }
//        [XmlAttribute(AttributeName = "schemaLocation", Namespace = "http://www.w3.org/2001/XMLSchema-instance")]
//        public string SchemaLocation { get; set; }
//    }




//}