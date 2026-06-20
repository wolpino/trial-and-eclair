using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TandE.Models.TEViewModels
{
    public class DashboardViewModel
    {
        public DashboardViewModel()
        {
        }
        public Recipe Recipe { get; set; }

        public Idea Idea { get; set; }

        public RecipeIngredient RecipeIngredient { get; set; }

        public List<RecipeIngredient> CurrentRecipeIngredients { get; set; }






    }
}
