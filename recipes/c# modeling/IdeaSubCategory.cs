using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TandE.Models
{
    public class IdeaSubCategory
    {
        public int IdeaID { get; set; }
        public int SubCategoryID { get; set; }

        public Idea Idea { get; set; }
        public SubCategory SubCategory { get; set; }
    }
}
