const axios = require("axios");

const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
const key = process.env.AZURE_TRANSLATOR_KEY;
const region = process.env.AZURE_TRANSLATOR_REGION;

const languageMap = {
    en: "en",

    // Nigeria
    ig: "ig",
    yo: "yo",
    ha: "ha",

    // West Africa
    fr: "fr",
    pt: "pt",

    // East Africa
    sw: "sw",

    // North Africa
    ar: "ar",

    // Southern Africa
    af: "af",

    // Global
    es: "es",
    de: "de",
    it: "it",
    nl: "nl",
    zh: "zh-Hans",
    ja: "ja",
    ko: "ko",
    ru: "ru",
    tr: "tr",
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const translate = async (text, language = "ig") => {

    if (!text || !text.trim()) {
        return "";
    }

    // Validate language
    if (!languageMap[language]) {
        throw new Error(`Unsupported language: ${language}`);
    }

    await sleep(200);

    const response = await axios.post(
        `${endpoint}/translate`,
        [
            {
                text,
            },
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
                "Content-Type": "application/json",
            },
            timeout: 30000,
        }
    );

    return response.data[0].translations[0].text;
};

module.exports = translate;
