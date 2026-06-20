using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TandE.Models
{
    public class Idea : BaseEntity
    {
        public int IdeaID { get; set; }
        [Display(Name ="Idea")]
        public string IdeaName { get; set; }
        [Display(Name = "Reference URL")]
        public string RefURL1 { get; set; }
        [Display(Name = "Category")]
        public int CategoryID { get; set; }
        [Display(Name = "Notes")]
        public string InitialNotes { get; set; }

        public string ApplicationUserId { get; set; }
        public virtual ApplicationUser User { get; set; }
        public Category Category { get; set; }
        public ICollection<Recipe> Recipes { get; set; }
        private ICollection<IdeaSubCategory> _subCategories;
        public ICollection<IdeaSubCategory> SubCategories
        {
            get
            {
                return _subCategories ?? (_subCategories = new List<IdeaSubCategory>());
            }
            set
            {
                _subCategories = value;
            }
        }


    }

}