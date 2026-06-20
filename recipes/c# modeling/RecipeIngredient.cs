using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TandE.Models
{

    public enum Unit
    {
        teaspoon, tablespoon, fluid_ounce, cup, quart, gallon, milliliter, liter, pound, ounce, milligram, gram, kilogram, inch, centimeter, whole
    }

    public class RecipeIngredient : BaseEntity
    {
        public int RecipeIngredientID { get; set; }
        public int RecipeID { get; set; }
        public int IngredientID { get; set; }
        public int Measurement { get; set; }
        public Unit Unit { get; set; }

        public Recipe Recipe { get; set; }
        public Ingredient Ingredient { get; set; }
            
    }
}
