const axios = require("axios");

const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
const key = process.env.AZURE_TRANSLATOR_KEY;
const region = process.env.AZURE_TRANSLATOR_REGION;

const languageMap = {
    // Nigeria
    ig: "ig", // Igbo
    yo: "yo", // Yoruba
    ha: "ha", // Hausa

    // East Africa
    sw: "sw", // Swahili

    // North Africa
    ar: "ar", // Arabic

    // Francophone Africa
    fr: "fr", // French

    // Lusophone Africa
    pt: "pt", // Portuguese

    // Southern Africa
    af: "af", // Afrikaans

    // Global fallback
    en: "en", // English
};

if (!languageMap[language]) {
    throw new Error(`Unsupported language: ${language}`);
}

const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

const translate = async (text, language = "ig") => {

    if (!text || !text.trim()) return "";

    await sleep(200);

    const response = await axios.post(
        `${endpoint}/translate`,
        [
            {
                text
            }
        ],
        {
            params: {
                "api-version": "3.0",
                from: "en",
                to: languageMap[language],
            },

            headers: {
                "Ocp-Apim-Subscription-Key": key,
                "Ocp-Apim-Subscription-Region": region,
                "Content-Type": "application/json"
            },
            timeout: 30000
        }
    );

    return response.data[0].translations[0].text;
};

module.exports = translate;
