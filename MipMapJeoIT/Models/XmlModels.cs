using System.Xml.Serialization;
namespace Mipmap.Tkgm.Models;

// using System.Xml.Serialization;
// XmlSerializer serializer = new XmlSerializer(typeof(CityModel));
// using (StringReader reader = new StringReader(xml))
// {
//    var test = (CityModel)serializer.Deserialize(reader);
// }

[XmlRoot(ElementName = "Envelope")]
public class Envelope
{

    [XmlElement(ElementName = "lowerCorner")]
    public string lowerCorner { get; set; }

    [XmlElement(ElementName = "upperCorner")]
    public string upperCorner { get; set; }

    [XmlAttribute(AttributeName = "srsDimension")]
    public int srsDimension { get; set; }

    [XmlAttribute(AttributeName = "srsName")]
    public string srsName { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "boundedBy")]
public class boundedBy
{

    [XmlElement(ElementName = "Envelope")]
    public Envelope Envelope { get; set; }

    [XmlElement(ElementName = "RoofSurface")]
    public RoofSurface RoofSurface { get; set; }

    [XmlElement(ElementName = "WallSurface")]
    public WallSurface WallSurface { get; set; }

    [XmlElement(ElementName = "GroundSurface")]
    public GroundSurface GroundSurface { get; set; }
}

[XmlRoot(ElementName = "textureCoordinates")]
public class textureCoordinates
{

    [XmlAttribute(AttributeName = "ring")]
    public string ring { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "TexCoordList")]
public class TexCoordList
{

    [XmlElement(ElementName = "textureCoordinates")]
    public textureCoordinates textureCoordinates { get; set; }
}

[XmlRoot(ElementName = "target")]
public class target
{

    [XmlElement(ElementName = "TexCoordList")]
    public TexCoordList TexCoordList { get; set; }

    [XmlAttribute(AttributeName = "uri")]
    public string uri { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "ParameterizedTexture")]
public class ParameterizedTexture
{

    [XmlElement(ElementName = "imageURI")]
    public string imageURI { get; set; }

    [XmlElement(ElementName = "target")]
    public List<target> target { get; set; }
}

[XmlRoot(ElementName = "surfaceDataMember")]
public class surfaceDataMember
{

    [XmlElement(ElementName = "ParameterizedTexture")]
    public ParameterizedTexture ParameterizedTexture { get; set; }
}

[XmlRoot(ElementName = "Appearance")]
public class Appearance
{

    [XmlElement(ElementName = "theme")]
    public string theme { get; set; }

    [XmlElement(ElementName = "surfaceDataMember")]
    public surfaceDataMember surfaceDataMember { get; set; }
}

[XmlRoot(ElementName = "appearance")]
public class appearance
{

    [XmlElement(ElementName = "Appearance")]
    public Appearance Appearance { get; set; }
}

[XmlRoot(ElementName = "doubleAttribute")]
public class doubleAttribute
{

    [XmlElement(ElementName = "value")]
    public double value { get; set; }

    [XmlAttribute(AttributeName = "name")]
    public string name { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "stringAttribute")]
public class stringAttribute
{

    [XmlElement(ElementName = "value")]
    public int value { get; set; }

    [XmlAttribute(AttributeName = "name")]
    public string name { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "intAttribute")]
public class intAttribute
{

    [XmlElement(ElementName = "value")]
    public int value { get; set; }

    [XmlAttribute(AttributeName = "name")]
    public string name { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "measuredHeight")]
public class measuredHeight
{

    [XmlAttribute(AttributeName = "uom")]
    public string uom { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "posList")]
public class posList
{

    [XmlAttribute(AttributeName = "srsDimension")]
    public int srsDimension { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "LinearRing")]
public class LinearRing
{

    [XmlElement(ElementName = "posList")]
    public posList posList { get; set; }

    [XmlAttribute(AttributeName = "id")]
    public string id { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "exterior")]
public class exterior
{

    [XmlElement(ElementName = "LinearRing")]
    public LinearRing LinearRing { get; set; }

    [XmlElement(ElementName = "CompositeSurface")]
    public CompositeSurface CompositeSurface { get; set; }
}

[XmlRoot(ElementName = "Polygon")]
public class Polygon
{

    [XmlElement(ElementName = "exterior")]
    public exterior exterior { get; set; }

    [XmlAttribute(AttributeName = "id")]
    public string id { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "surfaceMember")]
public class surfaceMember
{

    [XmlElement(ElementName = "Polygon")]
    public Polygon Polygon { get; set; }

    [XmlAttribute(AttributeName = "href")]
    public string href { get; set; }

    [XmlElement(ElementName = "CompositeSurface")]
    public CompositeSurface CompositeSurface { get; set; }
}

[XmlRoot(ElementName = "MultiSurface")]
public class MultiSurface
{

    [XmlElement(ElementName = "surfaceMember")]
    public List<surfaceMember> surfaceMember { get; set; }
}

[XmlRoot(ElementName = "lod0FootPrint")]
public class lod0FootPrint
{

    [XmlElement(ElementName = "MultiSurface")]
    public MultiSurface MultiSurface { get; set; }
}

[XmlRoot(ElementName = "lod0RoofEdge")]
public class lod0RoofEdge
{

    [XmlElement(ElementName = "MultiSurface")]
    public MultiSurface MultiSurface { get; set; }
}

[XmlRoot(ElementName = "CompositeSurface")]
public class CompositeSurface
{

    [XmlElement(ElementName = "surfaceMember")]
    public List<surfaceMember> surfaceMember { get; set; }
}

[XmlRoot(ElementName = "Solid")]
public class Solid
{

    [XmlElement(ElementName = "exterior")]
    public exterior exterior { get; set; }
}

[XmlRoot(ElementName = "lod1Solid")]
public class lod1Solid
{

    [XmlElement(ElementName = "Solid")]
    public Solid Solid { get; set; }
}

[XmlRoot(ElementName = "lod2MultiSurface")]
public class lod2MultiSurface
{

    [XmlElement(ElementName = "MultiSurface")]
    public MultiSurface MultiSurface { get; set; }
}

[XmlRoot(ElementName = "LineString")]
public class LineString
{

    [XmlElement(ElementName = "posList")]
    public posList posList { get; set; }
}

[XmlRoot(ElementName = "curveMember")]
public class curveMember
{

    [XmlElement(ElementName = "LineString")]
    public LineString LineString { get; set; }
}

[XmlRoot(ElementName = "MultiCurve")]
public class MultiCurve
{

    [XmlElement(ElementName = "curveMember")]
    public curveMember curveMember { get; set; }
}

[XmlRoot(ElementName = "lod2TerrainIntersection")]
public class lod2TerrainIntersection
{

    [XmlElement(ElementName = "MultiCurve")]
    public MultiCurve MultiCurve { get; set; }
}

[XmlRoot(ElementName = "lod2Geometry")]
public class lod2Geometry
{

    [XmlElement(ElementName = "MultiSurface")]
    public MultiSurface MultiSurface { get; set; }
}

[XmlRoot(ElementName = "RoofSurface")]
public class RoofSurface
{

    [XmlElement(ElementName = "name")]
    public string name { get; set; }

    [XmlElement(ElementName = "lod2MultiSurface")]
    public lod2MultiSurface lod2MultiSurface { get; set; }
}

[XmlRoot(ElementName = "WallSurface")]
public class WallSurface
{

    [XmlElement(ElementName = "name")]
    public string name { get; set; }

    [XmlElement(ElementName = "lod2MultiSurface")]
    public lod2MultiSurface lod2MultiSurface { get; set; }
}

[XmlRoot(ElementName = "BuildingInstallation")]
public class BuildingInstallation
{

    [XmlElement(ElementName = "name")]
    public string name { get; set; }

    [XmlElement(ElementName = "class")]
    public string @class { get; set; }

    [XmlElement(ElementName = "lod2Geometry")]
    public lod2Geometry lod2Geometry { get; set; }

    [XmlElement(ElementName = "boundedBy")]
    public List<boundedBy> boundedBy { get; set; }

    [XmlAttribute(AttributeName = "id")]
    public string id { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "outerBuildingInstallation")]
public class outerBuildingInstallation
{

    [XmlElement(ElementName = "BuildingInstallation")]
    public BuildingInstallation BuildingInstallation { get; set; }
}

[XmlRoot(ElementName = "GroundSurface")]
public class GroundSurface
{

    [XmlElement(ElementName = "name")]
    public string name { get; set; }

    [XmlElement(ElementName = "lod2MultiSurface")]
    public lod2MultiSurface lod2MultiSurface { get; set; }
}

[XmlRoot(ElementName = "Building")]
public class Building
{

    [XmlElement(ElementName = "name")]
    public string name { get; set; }

    [XmlElement(ElementName = "appearance")]
    public appearance appearance { get; set; }

    [XmlElement(ElementName = "doubleAttribute")]
    public doubleAttribute doubleAttribute { get; set; }

    [XmlElement(ElementName = "stringAttribute")]
    public List<stringAttribute> stringAttribute { get; set; }

    [XmlElement(ElementName = "intAttribute")]
    public List<intAttribute> intAttribute { get; set; }

    [XmlElement(ElementName = "class")]
    public string @class { get; set; }

    [XmlElement(ElementName = "measuredHeight")]
    public measuredHeight measuredHeight { get; set; }

    [XmlElement(ElementName = "lod0FootPrint")]
    public lod0FootPrint lod0FootPrint { get; set; }

    [XmlElement(ElementName = "lod0RoofEdge")]
    public lod0RoofEdge lod0RoofEdge { get; set; }

    [XmlElement(ElementName = "lod1Solid")]
    public lod1Solid lod1Solid { get; set; }

    [XmlElement(ElementName = "lod2MultiSurface")]
    public lod2MultiSurface lod2MultiSurface { get; set; }

    [XmlElement(ElementName = "lod2TerrainIntersection")]
    public lod2TerrainIntersection lod2TerrainIntersection { get; set; }

    [XmlElement(ElementName = "outerBuildingInstallation")]
    public outerBuildingInstallation outerBuildingInstallation { get; set; }

    [XmlElement(ElementName = "boundedBy")]
    public List<boundedBy> boundedBy { get; set; }

    [XmlAttribute(AttributeName = "id")]
    public string id { get; set; }

    [XmlText]
    public string text { get; set; }
}

[XmlRoot(ElementName = "cityObjectMember")]
public class cityObjectMember
{

    [XmlElement(ElementName = "Building")]
    public Building Building { get; set; }
}

[XmlRoot(ElementName = "CityModel")]
public class CityModel
{

    [XmlElement(ElementName = "boundedBy")]
    public boundedBy boundedBy { get; set; }

    [XmlElement(ElementName = "cityObjectMember")]
    public cityObjectMember cityObjectMember { get; set; }

    [XmlAttribute(AttributeName = "xmlns")]
    public string xmlns { get; set; }

    [XmlAttribute(AttributeName = "xsi")]
    public string xsi { get; set; }

    [XmlAttribute(AttributeName = "xlink")]
    public string xlink { get; set; }

    [XmlAttribute(AttributeName = "gml")]
    public string gml { get; set; }

    [XmlAttribute(AttributeName = "app")]
    public string app { get; set; }

    [XmlAttribute(AttributeName = "brid")]
    public string brid { get; set; }

    [XmlAttribute(AttributeName = "bldg")]
    public string bldg { get; set; }

    [XmlAttribute(AttributeName = "frn")]
    public string frn { get; set; }

    [XmlAttribute(AttributeName = "grp")]
    public string grp { get; set; }

    [XmlAttribute(AttributeName = "gen")]
    public string gen { get; set; }

    [XmlAttribute(AttributeName = "luse")]
    public string luse { get; set; }

    [XmlAttribute(AttributeName = "dem")]
    public string dem { get; set; }

    [XmlAttribute(AttributeName = "tran")]
    public string tran { get; set; }

    [XmlAttribute(AttributeName = "tun")]
    public string tun { get; set; }

    [XmlAttribute(AttributeName = "veg")]
    public string veg { get; set; }

    [XmlAttribute(AttributeName = "wtr")]
    public string wtr { get; set; }

    [XmlAttribute(AttributeName = "schemaLocation")]
    public string schemaLocation { get; set; }

    [XmlText]
    public string text { get; set; }
}











