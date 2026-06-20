using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TandE.Models
{
    public class Category : BaseEntity
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; }
        public string CategoryDesc { get; set; }

        public ICollection<Idea> Ideas { get; set; }
    }
}
