module.exports = {
  ALL_RECIPES: (page, limit, category, search) =>
    `recipes:${page}:${limit}:${category || "all"}:${search || ""}`,

  RECIPE: (id) => `recipe:${id}`,

  CATEGORY: (id, page, limit) =>
    `category:${id}:${page}:${limit}`,

  COUNTRY: (country, page, limit) =>
    `country:${country}:${page}:${limit}`,

  FEATURED: "featured-recipes",

  RANDOM: (limit) => `random:${limit}`,
};
