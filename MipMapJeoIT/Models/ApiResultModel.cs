namespace MipMapJeoIT.Models
{
    public class ApiResultModel<T>
    {

        public bool IsSucceded { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
    }
}
