using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace TandE.Models
{
    public class Ingredient : BaseEntity
    {
        public int IngredientID { get; set; }
        public string IngredientName { get; set; }
        public string ApplicationUserId { get; set; }
        public virtual ApplicationUser User { get; set; }

        public ICollection<RecipeIngredient> Recipes { get; set; }
    }
}
