using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TandE.Models.TEViewModels
{
    public class RecipeViewModel
    {
        public RecipeViewModel()
        {
            CurrentRecipeIngredients = new List<RecipeIngredient>();
            ListOfIngredients = new List<SelectListItem>();
        }
        public Recipe Recipe { get; set; }

        public RecipeIngredient RecipeIngredient { get; set; }

        public List<RecipeIngredient> CurrentRecipeIngredients { get; set; }

        public List<SelectListItem> ListOfIngredients { get; set; }

        public Ingredient Ingredient { get; set; }





    }
}
