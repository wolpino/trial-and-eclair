using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace TandE.Models
{
    public class Recipe : BaseEntity
    {
        public Recipe()
        {
            Ingredients = new List<RecipeIngredient>();
        }
        public int RecipeID { get; set; }
        [Required]
        public string RecipeName { get; set; }
        public string RefURL2 { get; set; }
        public string RefURL3 { get; set; }
        public string RefURL4 { get; set; }
        public string VersionNotes { get; set; }
        public int IdeaID { get; set; }

        [UIHint("tinymce_full")]
        public string Method { get; set; }
  
        public DateTime? NextVersionCreated { get; set; }
        public string ApplicationUserId { get; set; }
        public virtual ApplicationUser User { get; set; }

        public Idea Idea { get; set; }
        public List<RecipeIngredient> Ingredients { get; set; }


    }
}
