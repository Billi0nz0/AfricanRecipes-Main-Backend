const Recipe = require("../models/recipeModel");
const translate = require("../services/azureTranslate");

// Small delay to avoid rate limiting
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.translateRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found",
            });
        }

        // Requested language (default: Igbo)
        const lang = (req.query.lang || "ig").toLowerCase();

        // Ensure translations Map exists
        if (!recipe.translations) {
            recipe.translations = new Map();
        }

        // Return cached translation if available
        const cachedTranslation = recipe.translations.get(lang);

        if (
            cachedTranslation &&
            cachedTranslation.title &&
            cachedTranslation.ingredients?.length > 0 &&
            cachedTranslation.instructions?.length > 0
        ) {
            console.log(`Returning cached ${lang} translation...`);
            return res.json(cachedTranslation);
        }

        // -----------------------------
        // Translation helper
        // -----------------------------
        const translateText = async (text) => {
            if (!text || !text.trim()) return "";

            try {
                const translated = await translate(text.trim(), lang);

                // Small delay between API calls
                await wait(200);

                return translated || text;
            } catch (err) {
                console.log(`Failed translating "${text}"`);
                console.log(err.message);

                // Keep English if translation fails
                return text;
            }
        };

        // -----------------------------
        // Split long text into chunks
        // -----------------------------
        const splitText = (text, max = 4500) => {
            if (!text) return [];

            const words = text.split(" ");
            const chunks = [];
            let current = "";

            for (const word of words) {
                if ((current + " " + word).trim().length > max) {
                    chunks.push(current.trim());
                    current = word;
                } else {
                    current += " " + word;
                }
            }

            if (current.trim()) {
                chunks.push(current.trim());
            }

            return chunks;
        };

        console.log(`Translating recipe "${recipe.title}" to ${lang}...`);

        // -----------------------------
        // Title
        // -----------------------------
        const title = await translateText(recipe.title);

        // -----------------------------
        // Description
        // -----------------------------
        const descriptionChunks = splitText(recipe.description);

        const description = (
            await Promise.all(
                descriptionChunks.map((chunk) => translateText(chunk))
            )
        ).join(" ");

        // -----------------------------
        // Ingredients
        // -----------------------------
        const ingredients = [];

        for (const ingredient of recipe.ingredients) {
            ingredients.push({
                quantity: ingredient.quantity,
                name: await translateText(ingredient.name),
            });
        }

        // -----------------------------
        // Instructions
        // -----------------------------
        const instructions = [];

        for (const step of recipe.instructions) {
            instructions.push(await translateText(step));
        }

        // -----------------------------
        // Cache translation
        // -----------------------------
        const translatedRecipe = {
            title,
            description,
            ingredients,
            instructions,
        };

        recipe.translations.set(lang, translatedRecipe);

        await recipe.save();

        console.log(`${lang} translation saved successfully.`);

        return res.json(translatedRecipe);

    } catch (err) {
        console.error("Translation Error:");
        console.error(err.response?.data || err);

        return res.status(500).json({
            message: "Translation failed",
            error: err.response?.data || err.message,
        });
    }
};