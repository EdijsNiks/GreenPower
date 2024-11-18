import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../translation/en.json";
import lv from "../translation/lv.json";
import rus from "../translation/rus.json";

export const languageResources = {
    en: { translation: en },
    lv: { translation: lv },
    rus: { translation: rus },
};

i18next.use(initReactI18next).init({
    compatibilityJSON: "v3",
    lng: "lv",
    fallbackLng: "lv",
    resources: languageResources,
})

export default i18next;