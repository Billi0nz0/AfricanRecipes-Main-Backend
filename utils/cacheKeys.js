exports.ALL_RECIPES = (page, limit, category, search) =>
  `recipes:${page}:${limit}:${category || "all"}:${search || "none"}`;

exports.RECIPE = (id) =>
  `recipe:${id}`;

exports.CATEGORY = (id) =>
  `recipes-category:${id}`;

exports.COUNTRY = (country) =>
  `recipes-country:${country}`;

exports.FEATURED = "featured-recipes";

exports.RANDOM = "random-recipes";