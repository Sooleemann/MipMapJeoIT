using Microsoft.AspNetCore.Mvc;
using MipMap;
using MipMapJeoIT.Models;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using Newtonsoft.Json.Linq;
using ProjNet.CoordinateSystems;
using ProjNet.CoordinateSystems.Transformations;
using System.Diagnostics;
using System.Globalization;
using System.Text;
using System.Xml;
using System.Xml.Serialization;

namespace MipMapJeoIT.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IWebHostEnvironment hostEnvironment;

        public HomeController(ILogger<HomeController> logger, IWebHostEnvironment hostEnvironment)
        {
            _logger = logger;
            this.hostEnvironment = hostEnvironment;
        }
        public IActionResult Index()
        {

            return View();
        }
        public IActionResult Cesium()
        {

            return View();
        }

        public async Task<IActionResult> GeoJSON(string id)
        {

            return await Task.Run<IActionResult>(() =>
            {

                FeatureCollection featureCollection = new FeatureCollection();

                string[] binalar = id.Split(',');

                foreach (string b in binalar)
                {
                    //var xml = System.IO.Path.Combine(hostEnvironment.WebRootPath, "F-3239541-A.gml");
                    var xml = System.IO.Path.Combine(hostEnvironment.WebRootPath, "gml", b + ".gml");
                    string CultureName = Thread.CurrentThread.CurrentCulture.Name;
                    CultureInfo ci = new CultureInfo(CultureName);
                    if (ci.NumberFormat.NumberDecimalSeparator != ".")
                    {
                        ci.NumberFormat.NumberDecimalSeparator = ".";
                        Thread.CurrentThread.CurrentCulture = ci;
                        Thread.CurrentThread.CurrentUICulture = ci;
                    }

                    CityModel model;
                    XmlSerializer serializer = new XmlSerializer(typeof(CityModel));

                    using (XmlReader reader = XmlReader.Create(xml))
                    {
                        model = (CityModel)serializer.Deserialize(reader);
                    }



                    string coordinatSistem = model.BoundedBy.Envelope.SrsName;
                    AttributesTable attr = new AttributesTable();
                    NetTopologySuite.Geometries.Polygon poly;
                    NetTopologySuite.Features.Feature feat1;

                    foreach (var member in model.CityObjectMember)
                    {
                        if (member.Building != null)
                        {
                            var building = member.Building;
                            attr.Add("id", building.Id);
                            foreach (var feature in building.StringAttribute)
                            {
                                attr.Add(feature.Name, feature.Value);
                            }
                            foreach (var feature in building.IntAttribute)
                            {
                                attr.Add(feature.Name, feature.Value);
                            }
                            foreach (var feature in building.DoubleAttribute)
                            {
                                attr.Add(feature.Name, feature.Value);
                            }
                            if (building.DateAttribute != null)
                                attr.Add(building.DateAttribute.Name, building.DateAttribute.Value);

                            attr.Add("name", "lod0FootPrint");
                            int i = 0;
                            if (building.Lod0FootPrint != null)
                            {
                                foreach (var item in building.Lod0FootPrint.MultiSurface.SurfaceMember)
                                {
                                    if (i > 0)
                                    {
                                        attr.Add("name", "Lod0FootPrint");
                                        attr.Add("id", Guid.NewGuid());
                                        attr.Add("level", "Lod0");
                                    }
                                    if (item.Polygon.Exterior.LinearRing.PosList != null)
                                    {
                                        string stringGeom = item.Polygon.Exterior.LinearRing.PosList.Text;
                                        poly = GetPolygon(coordinatSistem, stringGeom);
                                    }
                                    else
                                    {
                                        poly = GetPolygon(coordinatSistem, item.Polygon.Exterior.LinearRing.Pos);
                                    }

                                    feat1 = new NetTopologySuite.Features.Feature
                                    {
                                        Geometry = poly,
                                        Attributes = attr,

                                    };
                                    featureCollection.Add(feat1);
                                    i++;
                                }
                            }
                            if (building.Lod0RoofEdge != null)
                            {
                                foreach (var item in building.Lod0RoofEdge.MultiSurface.SurfaceMember)
                                {
                                    if (item.Polygon.Exterior.LinearRing.PosList != null)
                                    {
                                        string stringGeom = item.Polygon.Exterior.LinearRing.PosList.Text;
                                        poly = GetPolygon(coordinatSistem, stringGeom);
                                    }
                                    else
                                    {
                                        poly = GetPolygon(coordinatSistem, item.Polygon.Exterior.LinearRing.Pos);
                                    }


                                    attr = new AttributesTable();
                                    attr.Add("name", "Lod0RoofEdge");
                                    attr.Add("id", Guid.NewGuid());
                                    attr.Add("level", "Lod0");
                                    feat1 = new NetTopologySuite.Features.Feature
                                    {
                                        Geometry = poly,
                                        Attributes = attr,

                                    };
                                    featureCollection.Add(feat1);
                                }
                            }
                            if (building.Lod1Solid != null)
                            {
                                if (building.Lod1Solid.CompositeSolid != null)
                                {
                                    foreach (var surface in building.Lod1Solid.CompositeSolid.SolidMember.Solid.Exterior.CompositeSurface.SurfaceMember)
                                    {
                                        attr = new AttributesTable();
                                        attr.Add("name", "lod1Solid");
                                        attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                        attr.Add("id", Guid.NewGuid());
                                        attr.Add("level", "Lod1");
                                        if (surface.Polygon.Exterior.LinearRing.PosList != null)
                                        {
                                            string stringGeom = surface.Polygon.Exterior.LinearRing.PosList.Text;
                                            poly = GetPolygon(coordinatSistem, stringGeom);
                                        }
                                        else
                                        {
                                            poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                        }

                                        feat1 = new NetTopologySuite.Features.Feature
                                        {
                                            Geometry = poly,
                                            Attributes = attr,

                                        };
                                        featureCollection.Add(feat1);
                                    }

                                }
                                if (building.Lod1Solid.Solid != null)
                                {
                                    foreach (var surface in building.Lod1Solid.Solid.Exterior.CompositeSurface.SurfaceMember)
                                    {
                                        attr = new AttributesTable();
                                        attr.Add("name", "lod1Solid");
                                        attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                        attr.Add("id", Guid.NewGuid());
                                        attr.Add("level", "Lod1");
                                        if (surface.Polygon.Exterior.LinearRing.PosList != null)
                                        {
                                            string stringGeom = surface.Polygon.Exterior.LinearRing.PosList.Text;
                                            poly = GetPolygon(coordinatSistem, stringGeom);
                                        }
                                        else
                                        {
                                            poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                        }

                                        feat1 = new NetTopologySuite.Features.Feature
                                        {
                                            Geometry = poly,
                                            Attributes = attr,

                                        };
                                        featureCollection.Add(feat1);
                                    }

                                }

                            }
                            if (building.Lod2TerrainIntersection != null)
                            {
                                attr = new AttributesTable();
                                attr.Add("name", "Lod2TerrainIntersection");
                                attr.Add("level", "Lod2");
                                attr.Add("id", Guid.NewGuid());
                                var curve = building.Lod2TerrainIntersection.MultiCurve.CurveMember.LineString;

                                if (curve.PosList != null)
                                {
                                    string stringGeom = curve.PosList.Text;
                                    poly = GetPolygon(coordinatSistem, stringGeom);
                                }
                                else
                                {
                                    poly = GetPolygon(coordinatSistem, curve.Pos);
                                }

                                feat1 = new NetTopologySuite.Features.Feature
                                {
                                    Geometry = poly,
                                    Attributes = attr,

                                };
                                featureCollection.Add(feat1);


                            }

                            if (building.BoundedBy2 != null)
                            {
                                foreach (var boundedBy in building.BoundedBy2)
                                {

                                    if (boundedBy.WallSurface != null)
                                    {
                                        foreach (var surface in boundedBy.WallSurface.Lod2MultiSurface.MultiSurface.SurfaceMember)
                                        {
                                            attr = new AttributesTable();
                                            attr.Add("name", boundedBy.WallSurface.Name);
                                            attr.Add("level", "Lod2");
                                            attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                            attr.Add("id", Guid.NewGuid());



                                            if (surface.Polygon.Exterior.LinearRing.PosList == null)
                                                poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                            else
                                                poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.PosList.Text);

                                            feat1 = new NetTopologySuite.Features.Feature
                                            {
                                                Geometry = poly,
                                                Attributes = attr,

                                            };
                                            featureCollection.Add(feat1);

                                        }

                                        if (boundedBy.WallSurface.Lod4MultiSurface != null)
                                        {
                                            var lod4 = boundedBy.WallSurface.Lod4MultiSurface;
                                            foreach (var surface in lod4.MultiSurface.SurfaceMember)
                                            {
                                                attr = new AttributesTable();
                                                attr.Add("name", boundedBy.WallSurface.Name);
                                                attr.Add("level", "Lod4");
                                                attr.Add("linear_id", string.IsNullOrEmpty(surface.Polygon.Exterior.LinearRing.Id) ? Guid.NewGuid() : surface.Polygon.Exterior.LinearRing.Id);
                                                attr.Add("id", Guid.NewGuid());
                                                if (surface.Polygon.Exterior.LinearRing.PosList == null)
                                                    poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                                else
                                                    poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.PosList.Text);

                                                feat1 = new NetTopologySuite.Features.Feature
                                                {
                                                    Geometry = poly,
                                                    Attributes = attr,

                                                };
                                                featureCollection.Add(feat1);

                                            }

                                        }
                                        if (boundedBy.WallSurface.Opening != null)
                                        {
                                            foreach (var open in boundedBy.WallSurface.Opening)
                                            {
                                                if (open.Door != null)
                                                {
                                                    var lod4 = open.Door.Lod4MultiSurface;
                                                    foreach (var surface in lod4.MultiSurface.SurfaceMember)
                                                    {
                                                        attr = new AttributesTable();
                                                        attr.Add("name", open.Door.Name);
                                                        attr.Add("level", "Lod4");
                                                        attr.Add("linear_id", string.IsNullOrEmpty(surface.Polygon.Exterior.LinearRing.Id) ? Guid.NewGuid() : surface.Polygon.Exterior.LinearRing.Id);
                                                        attr.Add("id", Guid.NewGuid());
                                                        if (surface.Polygon.Exterior.LinearRing.PosList == null)
                                                            poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                                        else
                                                            poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.PosList.Text);

                                                        feat1 = new NetTopologySuite.Features.Feature
                                                        {
                                                            Geometry = poly,
                                                            Attributes = attr,

                                                        };
                                                        featureCollection.Add(feat1);

                                                    }
                                                }
                                                if (open.Window != null)
                                                {
                                                    var lod4 = open.Window.Lod4MultiSurface;
                                                    foreach (var surface in lod4.MultiSurface.SurfaceMember)
                                                    {
                                                        attr = new AttributesTable();
                                                        attr.Add("name", open.Window.Name);
                                                        attr.Add("level", "Lod4");
                                                        attr.Add("linear_id", string.IsNullOrEmpty(surface.Polygon.Exterior.LinearRing.Id) ? Guid.NewGuid() : surface.Polygon.Exterior.LinearRing.Id);
                                                        attr.Add("id", Guid.NewGuid());
                                                        if (surface.Polygon.Exterior.LinearRing.PosList == null)
                                                            poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                                        else
                                                            poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.PosList.Text);

                                                        feat1 = new NetTopologySuite.Features.Feature
                                                        {
                                                            Geometry = poly,
                                                            Attributes = attr,

                                                        };
                                                        featureCollection.Add(feat1);

                                                    }
                                                }
                                            }


                                        }


                                    }
                                    if (boundedBy.RoofSurface != null)
                                    {
                                        foreach (var surface in boundedBy.RoofSurface.Lod2MultiSurface.MultiSurface.SurfaceMember)
                                        {
                                            attr = new AttributesTable();
                                            attr.Add("name", boundedBy.RoofSurface.Name);
                                            attr.Add("level", "Lod2");
                                            attr.Add("linear_id", string.IsNullOrEmpty(surface.Polygon.Exterior.LinearRing.Id) ? Guid.NewGuid() : surface.Polygon.Exterior.LinearRing.Id);
                                            attr.Add("id", Guid.NewGuid());
                                            if (surface.Polygon.Exterior.LinearRing.PosList == null)
                                                poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                            else
                                                poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.PosList.Text);

                                            feat1 = new NetTopologySuite.Features.Feature
                                            {
                                                Geometry = poly,
                                                Attributes = attr,

                                            };
                                            featureCollection.Add(feat1);

                                        }
                                    }
                                    if (boundedBy.GroundSurface != null)
                                    {
                                        foreach (var surface in boundedBy.GroundSurface.Lod2MultiSurface.MultiSurface.SurfaceMember)
                                        {
                                            attr = new AttributesTable();
                                            attr.Add("name", boundedBy.GroundSurface.Name);
                                            attr.Add("level", "Lod2");
                                            attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                            attr.Add("id", Guid.NewGuid());

                                            if (surface.Polygon.Exterior.LinearRing.PosList != null)
                                                poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.PosList.Text);
                                            else
                                                poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);

                                            feat1 = new NetTopologySuite.Features.Feature
                                            {
                                                Geometry = poly,
                                                Attributes = attr,

                                            };
                                            featureCollection.Add(feat1);

                                        }
                                    }


                                }
                            }
                            if (building.ConsistsOfBuildingPart != null)
                            {
                                foreach (var part in building.ConsistsOfBuildingPart)
                                {
                                    foreach (var boundedBy in part.BuildingPart.BoundedBy2)
                                    {
                                        if (boundedBy.WallSurface != null)
                                        {
                                            foreach (var surface in boundedBy.WallSurface.Lod2MultiSurface.MultiSurface.SurfaceMember)
                                            {
                                                attr = new AttributesTable();
                                                attr.Add("name", boundedBy.WallSurface.Name);
                                                attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                                attr.Add("id", Guid.NewGuid());
                                                attr.Add("level", "Lod2");

                                                poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.PosList.Text);

                                                feat1 = new NetTopologySuite.Features.Feature
                                                {
                                                    Geometry = poly,
                                                    Attributes = attr,

                                                };
                                                featureCollection.Add(feat1);

                                            }
                                        }
                                        if (boundedBy.RoofSurface != null)
                                        {
                                            foreach (var surface in boundedBy.RoofSurface.Lod2MultiSurface.MultiSurface.SurfaceMember)
                                            {
                                                attr = new AttributesTable();
                                                attr.Add("name", boundedBy.RoofSurface.Name);
                                                attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                                attr.Add("id", Guid.NewGuid());
                                                attr.Add("level", "Lod2");

                                                poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.PosList.Text);

                                                feat1 = new NetTopologySuite.Features.Feature
                                                {
                                                    Geometry = poly,
                                                    Attributes = attr,

                                                };
                                                featureCollection.Add(feat1);

                                            }
                                        }
                                        if (boundedBy.GroundSurface != null)
                                        {
                                            foreach (var surface in boundedBy.GroundSurface.Lod2MultiSurface.MultiSurface.SurfaceMember)
                                            {
                                                attr = new AttributesTable();
                                                attr.Add("name", boundedBy.GroundSurface.Name);
                                                attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                                attr.Add("id", Guid.NewGuid());
                                                attr.Add("level", "Lod2");

                                                poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.PosList.Text);

                                                feat1 = new NetTopologySuite.Features.Feature
                                                {
                                                    Geometry = poly,
                                                    Attributes = attr,

                                                };
                                                featureCollection.Add(feat1);

                                            }
                                        }

                                    }


                                }


                            }
                            if (building.InteriorRoom != null)
                            {
                                foreach (var interiorRoom in building.InteriorRoom)
                                {
                                    if (interiorRoom.Room != null)
                                    {
                                        var room = interiorRoom.Room;
                                        string roomName = room.Name;
                                        Dictionary<string, string> keyValues = new Dictionary<string, string>();
                                        foreach (var item in room.StringAttribute)
                                        {
                                            keyValues.Add(item.Name, item.Value);
                                        }
                                        foreach (var item in room.IntAttribute)
                                        {
                                            keyValues.Add(item.Name, item.Value);
                                        }
                                        foreach (var item in room.DoubleAttribute)
                                        {
                                            keyValues.Add(item.Name, item.Value);
                                        }
                                        if (room.BoundedBy2 != null)
                                        {
                                            foreach (var item in room.BoundedBy2)
                                            {
                                                if (item.CeilingSurface != null)
                                                {
                                                    foreach (var surface in item.CeilingSurface.Lod4MultiSurface.MultiSurface.SurfaceMember)
                                                    {
                                                        attr = new AttributesTable();
                                                        attr.Add("name", item.CeilingSurface.Name);
                                                        attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                                        attr.Add("id", Guid.NewGuid());
                                                        attr.Add("level", "Lod4");
                                                        attr.Add("roomName", roomName);
                                                        foreach (var d in keyValues)
                                                        {
                                                            attr.Add(d.Key, d.Value);

                                                        }


                                                        if (surface.Polygon.Exterior.LinearRing.PosList != null)
                                                        {
                                                            string stringGeom = surface.Polygon.Exterior.LinearRing.PosList.Text;
                                                            poly = GetPolygon(coordinatSistem, stringGeom);
                                                        }
                                                        else
                                                        {
                                                            poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                                        }


                                                        feat1 = new NetTopologySuite.Features.Feature
                                                        {
                                                            Geometry = poly,
                                                            Attributes = attr,

                                                        };
                                                        featureCollection.Add(feat1);

                                                    }
                                                }
                                                if (item.WallSurface != null)
                                                {
                                                    if (item.WallSurface.Lod4MultiSurface != null)
                                                    {
                                                        foreach (var surface in item.WallSurface.Lod4MultiSurface.MultiSurface.SurfaceMember)
                                                        {
                                                            attr = new AttributesTable();
                                                            attr.Add("name", item.WallSurface.Name);
                                                            attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                                            attr.Add("id", Guid.NewGuid());
                                                            attr.Add("level", "Lod4");
                                                            attr.Add("roomName", roomName);
                                                            foreach (var d in keyValues)
                                                            {
                                                                attr.Add(d.Key, d.Value);

                                                            }


                                                            if (surface.Polygon.Exterior.LinearRing.PosList != null)
                                                            {
                                                                string stringGeom = surface.Polygon.Exterior.LinearRing.PosList.Text;
                                                                poly = GetPolygon(coordinatSistem, stringGeom);
                                                            }
                                                            else
                                                            {
                                                                poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                                            }
                                                            feat1 = new NetTopologySuite.Features.Feature
                                                            {
                                                                Geometry = poly,
                                                                Attributes = attr,

                                                            };
                                                            featureCollection.Add(feat1);

                                                        }
                                                    }
                                                }
                                                if (item.FloorSurface != null)
                                                {
                                                    foreach (var surface in item.FloorSurface.Lod4MultiSurface.MultiSurface.SurfaceMember)
                                                    {
                                                        attr = new AttributesTable();
                                                        attr.Add("name", item.FloorSurface.Name);
                                                        attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                                        attr.Add("id", Guid.NewGuid());
                                                        attr.Add("level", "Lod4");
                                                        attr.Add("roomName", roomName);
                                                        foreach (var d in keyValues)
                                                        {
                                                            attr.Add(d.Key, d.Value);

                                                        }


                                                        if (surface.Polygon.Exterior.LinearRing.PosList != null)
                                                        {
                                                            string stringGeom = surface.Polygon.Exterior.LinearRing.PosList.Text;
                                                            poly = GetPolygon(coordinatSistem, stringGeom);
                                                        }
                                                        else
                                                        {
                                                            poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                                        }

                                                        feat1 = new NetTopologySuite.Features.Feature
                                                        {
                                                            Geometry = poly,
                                                            Attributes = attr,

                                                        };
                                                        featureCollection.Add(feat1);

                                                    }
                                                }
                                                if (item.RoofSurface != null)
                                                {
                                                    foreach (var surface in item.RoofSurface.Lod2MultiSurface.MultiSurface.SurfaceMember)
                                                    {
                                                        attr = new AttributesTable();
                                                        attr.Add("name", item.RoofSurface.Name);
                                                        attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                                        attr.Add("id", Guid.NewGuid());
                                                        attr.Add("level", "Lod2");
                                                        attr.Add("roomName", roomName);
                                                        foreach (var d in keyValues)
                                                        {
                                                            attr.Add(d.Key, d.Value);

                                                        }


                                                        if (surface.Polygon.Exterior.LinearRing.PosList != null)
                                                        {
                                                            string stringGeom = surface.Polygon.Exterior.LinearRing.PosList.Text;
                                                            poly = GetPolygon(coordinatSistem, stringGeom);
                                                        }
                                                        else
                                                        {
                                                            poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                                        }
                                                        feat1 = new NetTopologySuite.Features.Feature
                                                        {
                                                            Geometry = poly,
                                                            Attributes = attr,

                                                        };
                                                        featureCollection.Add(feat1);

                                                    }
                                                }
                                                if (item.InteriorWallSurface != null)
                                                {
                                                    foreach (var surface in item.InteriorWallSurface.Lod4MultiSurface.MultiSurface.SurfaceMember)
                                                    {
                                                        attr = new AttributesTable();
                                                        attr.Add("name", item.InteriorWallSurface.Name);
                                                        attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                                        attr.Add("id", Guid.NewGuid());
                                                        attr.Add("level", "Lod4");
                                                        attr.Add("roomName", roomName);
                                                        foreach (var d in keyValues)
                                                        {
                                                            attr.Add(d.Key, d.Value);

                                                        }


                                                        if (surface.Polygon.Exterior.LinearRing.PosList != null)
                                                        {
                                                            string stringGeom = surface.Polygon.Exterior.LinearRing.PosList.Text;
                                                            poly = GetPolygon(coordinatSistem, stringGeom);
                                                        }
                                                        else
                                                        {
                                                            poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                                        }
                                                        feat1 = new NetTopologySuite.Features.Feature
                                                        {
                                                            Geometry = poly,
                                                            Attributes = attr,

                                                        };
                                                        featureCollection.Add(feat1);

                                                    }
                                                }
                                                if (item.GroundSurface != null)
                                                {
                                                    foreach (var surface in item.GroundSurface.Lod2MultiSurface.MultiSurface.SurfaceMember)
                                                    {
                                                        attr = new AttributesTable();
                                                        attr.Add("name", item.GroundSurface.Name);
                                                        attr.Add("linear_id", surface.Polygon.Exterior.LinearRing.Id);
                                                        attr.Add("id", Guid.NewGuid());
                                                        attr.Add("level", "Lod2");
                                                        attr.Add("roomName", roomName);
                                                        foreach (var d in keyValues)
                                                        {
                                                            attr.Add(d.Key, d.Value);

                                                        }


                                                        if (surface.Polygon.Exterior.LinearRing.PosList != null)
                                                        {
                                                            string stringGeom = surface.Polygon.Exterior.LinearRing.PosList.Text;
                                                            poly = GetPolygon(coordinatSistem, stringGeom);
                                                        }
                                                        else
                                                        {
                                                            poly = GetPolygon(coordinatSistem, surface.Polygon.Exterior.LinearRing.Pos);
                                                        }
                                                        feat1 = new NetTopologySuite.Features.Feature
                                                        {
                                                            Geometry = poly,
                                                            Attributes = attr,

                                                        };
                                                        featureCollection.Add(feat1);

                                                    }
                                                }
                                            }
                                        }
                                    }
                                }



                            }
                        }

                        if (member.CityObjectGroup != null)
                        {
                            var cityGroup = member.CityObjectGroup;
                            string groupName = cityGroup.Name;
                            string className = cityGroup.Class;
                            string groupValue = "";
                            if (cityGroup.StringAttribute != null)
                                groupValue = cityGroup.StringAttribute.Value;

                            if (cityGroup.Geometry != null)
                            {
                                if (cityGroup.Geometry.MultiSurface != null && cityGroup.Geometry.MultiSurface.SurfaceMember != null)
                                {
                                    foreach (var surfaceMember in cityGroup.Geometry.MultiSurface.SurfaceMember)
                                    {
                                        attr = new AttributesTable();

                                        attr.Add("name", groupName);
                                        attr.Add("id", Guid.NewGuid());
                                        attr.Add("class", className);
                                        if (cityGroup.StringAttribute != null)
                                        {
                                            attr.Add(cityGroup.StringAttribute.Name, cityGroup.StringAttribute.Value);

                                        }
                                        if (cityGroup.IntAttribute != null)
                                        {
                                            foreach (var intA1 in cityGroup.IntAttribute)
                                            {
                                                if (!attr.Any(x => x.Key == intA1.Name))
                                                    attr.Add(intA1.Name, intA1.Value);

                                            }

                                        }


                                        if (surfaceMember.Polygon.Exterior.LinearRing.PosList != null)
                                        {
                                            string stringGeom = surfaceMember.Polygon.Exterior.LinearRing.PosList.Text;
                                            poly = GetPolygon(coordinatSistem, stringGeom);
                                        }
                                        else
                                        {
                                            poly = GetPolygon(coordinatSistem, surfaceMember.Polygon.Exterior.LinearRing.Pos);
                                        }

                                        feat1 = new NetTopologySuite.Features.Feature
                                        {
                                            Geometry = poly,
                                            Attributes = attr,

                                        };
                                        featureCollection.Add(feat1);
                                    }
                                }
                            }

                            if (member.GenericCityObject != null)
                            {


                                if (member.GenericCityObject.Lod2Geometry2 != null)
                                {
                                    var lod2 = member.GenericCityObject.Lod2Geometry2;
                                    if (lod2.MultiSurface != null && lod2.MultiSurface.SurfaceMember != null)
                                    {
                                        foreach (var surfaceMember in lod2.MultiSurface.SurfaceMember)
                                        {
                                            attr = new AttributesTable();

                                            attr.Add("name", groupName);
                                            attr.Add("id", Guid.NewGuid());
                                            attr.Add("class", className);
                                            if (cityGroup.StringAttribute != null)
                                            {
                                                attr.Add(cityGroup.StringAttribute.Name, cityGroup.StringAttribute.Value);

                                            }

                                            if (cityGroup.IntAttribute != null)
                                            {
                                                foreach (var intA1 in cityGroup.IntAttribute)
                                                {
                                                    if (!attr.Any(x => x.Key == intA1.Name))
                                                        attr.Add(intA1.Name, intA1.Value);

                                                }

                                            }

                                            attr.Add("level", "Lod2");

                                            if (surfaceMember.Polygon.Exterior.LinearRing.PosList != null)
                                            {
                                                string stringGeom = surfaceMember.Polygon.Exterior.LinearRing.PosList.Text;
                                                poly = GetPolygon(coordinatSistem, stringGeom);
                                            }
                                            else
                                            {
                                                poly = GetPolygon(coordinatSistem, surfaceMember.Polygon.Exterior.LinearRing.Pos);
                                            }

                                            feat1 = new NetTopologySuite.Features.Feature
                                            {
                                                Geometry = poly,
                                                Attributes = attr,

                                            };
                                            featureCollection.Add(feat1);
                                        }
                                    }

                                }



                            }

                        }
                    }
                }
                GeoJsonWriter geoJsonWriter = new GeoJsonWriter();
                geoJsonWriter.Dimension = 3;

                var json = geoJsonWriter.Write(featureCollection);
                var buffer = Encoding.UTF8.GetBytes(json);
                return File(buffer, "application/vnd.geo+json", "building.json");
            });

        }

        private NetTopologySuite.Geometries.Polygon GetPolygon(string inputCoordSys, string coordinateContent)
        {
            NumberFormatInfo nfi = new NumberFormatInfo
            {
                NumberDecimalSeparator = "."
            };
            double[] footPrintCoords = coordinateContent.Split(new char[] { ' ', '\t', '\n' }, StringSplitOptions.RemoveEmptyEntries).Select(i => Convert.ToDouble(i, nfi)).ToArray();

            List<CoordinateZ> coordinates = [];

            for (int i = 0; i < footPrintCoords.Length; i += 3)
            {
                coordinates.Add(new CoordinateZ
                {
                    X = footPrintCoords[i],
                    Y = footPrintCoords[i + 1],
                    Z = footPrintCoords[i + 2]
                });
            }

            GeometryFactory geometryFactory = new GeometryFactory();
            NetTopologySuite.Geometries.Polygon poly = geometryFactory.CreatePolygon(coordinates.ToArray());

            var coordSystems = GetCoordinatSystems();

            var SourceCoordSystem = new CoordinateSystemFactory().CreateFromWkt(coordSystems[inputCoordSys]);

            var TargetCoordSystem = new CoordinateSystemFactory().CreateFromWkt(coordSystems["epsg:4326"]);

            var trans = new CoordinateTransformationFactory().CreateFromCoordinateSystems(SourceCoordSystem, TargetCoordSystem);

            poly = geometryFactory.CreatePolygon(coordinates.ToArray());

            poly.Apply(new MTF(trans.MathTransform));
            poly.SRID = 4326;

            return poly;
        }


        public async Task<IActionResult> ParselSorgu(double lon, double lat)
        {

            try
            {

                NumberFormatInfo nfi = new NumberFormatInfo { NumberDecimalSeparator = "." };
                string url = string.Format("https://cbsapi.tkgm.gov.tr/megsiswebapi.v3/api/parsel/{0}/{1}/", lat.ToString(nfi), lon.ToString(nfi));

                HttpRequestMessage req = new HttpRequestMessage(HttpMethod.Get, url);
                req.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

                req.Headers.Add("Host", "megsisapi.tkgm.gov.tr");
                req.Headers.Add("Origin", "https://parselsorgu.tkgm.gov.tr");
                req.Headers.Add("Referer", "https://parselsorgu.tkgm.gov.tr/");
                string data = string.Empty;

                using (HttpClient client = new HttpClient())
                {
                    using (HttpResponseMessage res = await client.SendAsync(req))
                    {
                        if (res.StatusCode == System.Net.HttpStatusCode.OK)
                        {
                            data = await res.Content.ReadAsStringAsync();
                        }
                        else if (res.StatusCode == System.Net.HttpStatusCode.Forbidden)
                        {
                            return Ok(new { success = false, msg = "Günlük sorgu limitini aþtýnýz" });
                        }
                    }
                }

                if (string.IsNullOrEmpty(data))
                {
                    return Ok(new { success = false, msg = "Geri dönüþ deðeri alýnamadý." });
                }
                else
                {
                    if (data.Contains("Günlük sorgu limitini aþtýnýz"))
                        return Ok(new { success = false, msg = "Günlük sorgu limitini aþtýnýz" });
                }
                JObject obj = JObject.Parse(data);

                if (obj != null)
                {
                    return Ok(new { success = true, data });

                }
                else
                    return Ok(new { success = false, msg = "Sorgu sonucu boþ gelmiþtir." });
            }
            catch (Exception e)
            {
                return Ok(new { success = false, msg = e.ToString() });
            }

        }

        private NetTopologySuite.Geometries.Polygon GetPolygon(string inputCoordSys, List<string> pos)
        {
            NumberFormatInfo nfi = new NumberFormatInfo
            {
                NumberDecimalSeparator = "."
            };

            List<CoordinateZ> coordinates = [];

            foreach (var p in pos)
            {
                double[] footPrintCoords = p.Split(new char[] { ' ', '\t', '\n' }, StringSplitOptions.RemoveEmptyEntries).Select(i => Convert.ToDouble(i, nfi)).ToArray();

                coordinates.Add(new CoordinateZ
                {
                    X = footPrintCoords[0],
                    Y = footPrintCoords[1],
                    Z = footPrintCoords[2]
                });

            }


            GeometryFactory geometryFactory = new GeometryFactory();
            NetTopologySuite.Geometries.Polygon poly = geometryFactory.CreatePolygon(coordinates.ToArray());

            var coordSystems = GetCoordinatSystems();

            var SourceCoordSystem = new CoordinateSystemFactory().CreateFromWkt(coordSystems[inputCoordSys.ToLower()]);
            var TargetCoordSystem = new CoordinateSystemFactory().CreateFromWkt(coordSystems["epsg:4326"]);

            var trans = new CoordinateTransformationFactory().CreateFromCoordinateSystems(SourceCoordSystem, TargetCoordSystem);

            poly = geometryFactory.CreatePolygon(coordinates.ToArray());

            poly.Apply(new MTF(trans.MathTransform));
            poly.SRID = 4326;

            return poly;
        }


        private Dictionary<string, string> GetCoordinatSystems()
        {
            Dictionary<string, string> coordSystems = new Dictionary<string, string>();

            coordSystems.Add("epsg:5254", "PROJCS[\"TUREF / TM30\", GEOGCS[\"TUREF\",DATUM[\"Turkish_National_Reference_Frame\",SPHEROID[\"GRS 1980\",6378137,298.257222101], TOWGS84[0,0,0,0,0,0,0]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"5252\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",30],PARAMETER[\"scale_factor\",1],PARAMETER[\"false_easting\",500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1, AUTHORITY[\"EPSG\",\"9001\"]],AUTHORITY[\"EPSG\",\"5254\"]]");

            coordSystems.Add("epsg:5255", "PROJCS[\"TUREF / TM33\", GEOGCS[\"TUREF\",DATUM[\"Turkish_National_Reference_Frame\",SPHEROID[\"GRS 1980\",6378137,298.257222101], TOWGS84[0,0,0,0,0,0,0]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"5252\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",33],PARAMETER[\"scale_factor\",1],PARAMETER[\"false_easting\",500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1, AUTHORITY[\"EPSG\",\"9001\"]],AUTHORITY[\"EPSG\",\"5255\"]]");

            coordSystems.Add("epsg:5256", "PROJCS[\"TUREF / TM36\",GEOGCS[\"TUREF\",DATUM[\"Turkish_National_Reference_Frame\",SPHEROID[\"GRS 1980\",6378137,298.257222101],TOWGS84[0,0,0,0,0,0,0]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]], AUTHORITY[\"EPSG\",\"5252\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",36],PARAMETER[\"scale_factor\",1],PARAMETER[\"false_easting\",500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],AUTHORITY[\"EPSG\",\"5256\"]]");

            coordSystems.Add("epsg:5257", "PROJCS[\"TUREF / TM39\", GEOGCS[\"TUREF\",DATUM[\"Turkish_National_Reference_Frame\",SPHEROID[\"GRS 1980\",6378137,298.257222101],TOWGS84[0,0,0,0,0,0,0]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"5252\"]],PROJECTION[\"Transverse_Mercator\"],PARAMETER[\"latitude_of_origin\",0],PARAMETER[\"central_meridian\",39],PARAMETER[\"scale_factor\",1],PARAMETER[\"false_easting\",500000],PARAMETER[\"false_northing\",0],UNIT[\"metre\",1,AUTHORITY[\"EPSG\",\"9001\"]],AUTHORITY[\"EPSG\",\"5257\"]]");

            coordSystems.Add("epsg:4326", "GEOGCS[\"WGS 84\",DATUM[\"WGS_1984\",SPHEROID[\"WGS 84\",6378137,298.257223563,AUTHORITY[\"EPSG\",\"7030\"]],AUTHORITY[\"EPSG\",\"6326\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4326\"]]");

            return coordSystems;
        }


        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
