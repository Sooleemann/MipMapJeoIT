namespace MipMapJeoIT.Models
{
    public class GeoJsonModel
    {

        public string type { get; set; }
        public List<Feature> features { get; set; }

    }

    public class Feature
    {
        public string type { get; set; }
        public int id { get; set; }
        public Geometry geometry { get; set; }
        public Properties properties { get; set; }
    }

    //public class Geometry
    //{
    //    public string type { get; set; }
    //    public List<double> coordinates { get; set; }
    //}

    public class Properties
    {
        public int Id { get; set; }
        public DateTime EventDate { get; set; }
        public double Longitude { get; set; }
        public double Latitude { get; set; }
        public double Magnitude { get; set; }
        public string MagnitudeType { get; set; }
        public string Location { get; set; }
        public double Depth { get; set; }
        public double Rms { get; set; }
        public double Erh { get; set; }
        public double Erz { get; set; }
        public int Gap { get; set; }
        public int EaeventId { get; set; }
        public int CrustModelId { get; set; }
        public int eventTypeId { get; set; }
        public string? eventType { get; set; }
        //public string? magnitudeDescription { get; set; }
        //public DateTime? formattedDate { get; set; }
        //public string? depthDescription { get; set; }
        public int refId { get; set; }
        //public string? province { get; set; }
        //public string? district { get; set; }
        //public string? typeName { get; set; }
        //public string? typeNameEng { get; set; }
        //public string? magnitudeName { get; set; }
        //public string? magnitudeNameEng { get; set; }
        //public string? timeName { get; set; }
        //public string? timeNameEng { get; set; }
        //public string? momentTensor { get; set; }
        //public string? distanceInformation { get; set; }
        //public string? bulletins { get; set; }
        //public string? moments { get; set; }
        //public string? amplitudes { get; set; }



    }

}
