using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TandE.Models.TEViewModels
{
    public class IdeaViewModel
    {
        public IdeaViewModel()
        {
            ListofCategories = new List<Category>();
            ListofIdeas = new List<Idea>();
        }
        public List<Category> ListofCategories { get; set; }
        public List<Idea> ListofIdeas { get; set; }


        public int IdeaID { get; set; }

        public string IdeaName { get; set; }
        public string RefURL1 { get; set; }
        public int CategoryID { get; set; }
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