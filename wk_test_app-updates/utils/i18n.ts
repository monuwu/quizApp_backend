import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome, Smith!",
      choose_level: "Choose your challenge level",
      beginner: "Beginner",
      beginner_desc: "Start here! Basic questions to warm up.",
      intermediate: "Intermediate",
      intermediate_desc: "Ready for a challenge? Test your knowledge.",
      advanced: "Advanced",
      advanced_desc: "Expert level! Only for the brave.",
      questions: "questions",
      requires: "Requires 70% on previous level"
    }
  },
  fr: {
    translation: {
      welcome: "Bienvenue, Smith!",
      choose_level: "Choisissez votre niveau de défi",
      beginner: "Débutant",
      beginner_desc: "Commencez ici ! Questions de base pour s'échauffer.",
      intermediate: "Intermédiaire",
      intermediate_desc: "Prêt pour un défi ? Testez vos connaissances.",
      advanced: "Avancé",
      advanced_desc: "Niveau expert ! Seulement pour les courageux.",
      questions: "questions",
      requires: "Nécessite 70% au niveau précédent"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
