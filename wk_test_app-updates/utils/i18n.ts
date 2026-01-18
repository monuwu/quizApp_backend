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
      requires: "Requires 70% on previous level",
      english: "English",
      french: "French",
      total_earned: "Total Earned:",
      ready_test_knowledge: "Ready to Test Your Knowledge?",
      login_to_begin: "Login to begin the assessment",
      phone_number: "Phone Number",
      password: "Password",
      hide_password: "Hide password",
      show_password: "Show password",
      forgot_password: "Forgot password?",
      login: "Login",
      dont_have_account: "Don’t have an account?",
      create_account: "Create Account",
      minutes: "minutes",
      instant_results: "Instant results"
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
      requires: "Nécessite 70% au niveau précédent",
      english: "Anglais",
      french: "Français",
      total_earned: "Total gagné :",
      ready_test_knowledge: "Prêt à tester vos connaissances ?",
      login_to_begin: "Connectez-vous pour commencer l'évaluation",
      phone_number: "Numéro de téléphone",
      password: "Mot de passe",
      hide_password: "Masquer le mot de passe",
      show_password: "Afficher le mot de passe",
      forgot_password: "Mot de passe oublié ?",
      login: "Connexion",
      dont_have_account: "Vous n'avez pas de compte ?",
      create_account: "Créer un compte",
      minutes: "minutes",
      instant_results: "Résultats instantanés"
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
