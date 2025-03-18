using Microsoft.AspNetCore.Mvc;
using System.Globalization;



namespace MipMapJeoIT.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {

        private readonly IConfiguration configuration;
        private readonly IHttpClientFactory httpClientFactory;
        private readonly IWebHostEnvironment env;

        /// <summary>
        /// construction
        /// </summary>
        /// <param name="context"></param>
        /// <param name="configuration"></param>
        /// <param name="httpClientFactory"></param>
        public ServicesController(IConfiguration configuration, IHttpClientFactory httpClientFactory, IWebHostEnvironment env)
        {

            this.configuration = configuration;
            this.httpClientFactory = httpClientFactory;
            this.env = env;
        }

        [Route("[action]")]
        //[HttpGet("GetWeather")]
        public async Task<IActionResult> GetWeather(double lon, double lat, string? lang)
        {


            NumberFormatInfo numberFormatInfo = new NumberFormatInfo();
            numberFormatInfo.NumberDecimalSeparator = ".";

            string? apiKey = configuration["WeatherApiKey"]; //  "24a2e78f8adf4546c65fb79457295726"; 
            if (string.IsNullOrWhiteSpace(lang))
                lang = "tr";

            var httpClient = httpClientFactory.CreateClient();

            var geoUrl = $"https://api.openweathermap.org/geo/1.0/reverse?limit=5&lat={lat.ToString(numberFormatInfo)}&lon={lon.ToString(numberFormatInfo)}&appid={apiKey}&lang={lang}&units=metric";
            string geoLocation = "{}";
            using (var response = await httpClient.GetAsync(geoUrl))
            {
                response.EnsureSuccessStatusCode();
                geoLocation = await response.Content.ReadAsStringAsync();

            }

            var apiUrl = $"https://api.openweathermap.org/data/2.5/weather?lat={lat.ToString(numberFormatInfo)}&lon={lon.ToString(numberFormatInfo)}&appid={apiKey}&lang={lang}&units=metric";

            using (var response = await httpClient.GetAsync(apiUrl))
            {
                response.EnsureSuccessStatusCode();
                var value = await response.Content.ReadAsStringAsync();

                return Ok(new { weather = value, geoLocation });
            }


        }


        //[HttpGet]
        //[Route("GetLastEarthquakes")]
        //public async Task<GeoJsonModel> GetLastEarthquakes()
        //{
        //    ApiResultModel<string> apiResultModel = new ApiResultModel<string>();

        //    var httpClient = httpClientFactory.CreateClient();
        //    string? url = configuration["AfadUrl"];


        //    using StringContent jsonContent = new(
        //                JsonSerializer.Serialize(new
        //                {
        //                    EventSearchFilterList = new object[]{
        //                            new {
        //                                FilterType= 9,
        //                                Value= DateTime.Now.ToString("o")
        //                                    },
        //                            new {
        //                                FilterType= 8,
        //                                Value= DateTime.Now.AddDays(-30).ToString("o")
        //                            },
        //                            new {
        //                                FilterType= 11,
        //                                Value= "4"
        //                            },
        //                            new {
        //                                FilterType= 12,
        //                                Value= "9"
        //                            },
        //                        },
        //                    Skip = 0,
        //                    Take = 20,
        //                    SortDescriptor = new
        //                    {
        //                        field = "eventDate",
        //                        dir = "desc"
        //                    }

        //                }),
        //                Encoding.UTF8,
        //                "application/json");

        //    using HttpResponseMessage response = await httpClient.PostAsync(url, jsonContent);

        //    var jsonResponse = await response.Content.ReadFromJsonAsync<EartquakeModel>();

        //    GeoJsonModel geojson = new GeoJsonModel();
        //    geojson.type = "FeatureCollection";
        //    geojson.features = new List<Feature>();
        //    if (jsonResponse != null && jsonResponse.eventList != null)
        //    {
        //        foreach (var item in jsonResponse.eventList)
        //        {
        //            var f = new Feature();
        //            f.type = "Feature";
        //            f.id = item.Id;
        //            f.geometry = new Geometry();
        //            f.geometry.type = "Point";
        //            f.geometry.coordinates = new List<double> { item.Latitude, item.Longitude };

        //            f.properties = new Properties
        //            {
        //                Rms = item.Rms,
        //                //amplitudes = item.amplitudes,
        //                //district = item.district,
        //                //momentTensor = item.momentTensor,
        //                //bulletins = item.bulletins,
        //                CrustModelId = item.CrustModelId,
        //                Depth = item.Depth,
        //                //depthDescription = item.depthDescription,
        //                //distanceInformation = item.distanceInformation,
        //                EaeventId = item.EaeventId,
        //                Erh = item.Erh,
        //                Erz = item.Erz,
        //                EventDate = item.EventDate,
        //                eventType = item.eventType,
        //                //formattedDate = item.formattedDate,
        //                Id = item.Id,
        //                Gap = item.Gap,
        //                Latitude = item.Latitude,
        //                Longitude = item.Longitude,
        //                Magnitude = item.Magnitude,
        //                //magnitudeDescription = item.magnitudeDescription,
        //                //magnitudeName = item.magnitudeName,
        //                //magnitudeNameEng = item.magnitudeNameEng,
        //                MagnitudeType = item.MagnitudeType,
        //                //moments = item.moments,
        //                //province = item.province,
        //                refId = item.refId,
        //                //timeName = item.timeName,
        //                //timeNameEng = item.timeNameEng,
        //                //typeName = item.typeName,
        //                //typeNameEng = item.typeNameEng,
        //                eventTypeId = item.eventTypeId,
        //                Location = item.Location
        //            };


        //            geojson.features.Add(f);

        //        }

        //    }


        //    return geojson;
        //}



    }

}
