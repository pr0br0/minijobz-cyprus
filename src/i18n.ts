import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'el'];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  // Simple fallback messages for testing
  const messages = {
    common: {
      loading: "Loading...",
      error: "An error occurred",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      filter: "Filter",
      apply: "Apply",
      view: "View",
      next: "Next",
      previous: "Previous",
      close: "Close",
      back: "Back",
      continue: "Continue",
      submit: "Submit",
      confirm: "Confirm",
      yes: "Yes",
      no: "No"
    },
    navigation: {
      home: "Home",
      jobs: "Browse Jobs",
      companies: "Companies",
      resources: "Resources",
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      signOut: "Sign Out",
      signIn: "Sign In",
      signUp: "Sign Up"
    }
  };

  try {
    // Try to load the actual locale file
    const localeMessages = (await import(`../public/locales/${locale}/common.json`)).default;
    return {
      locale,
      messages: localeMessages,
      timeZone: 'Europe/Nicosia'
    };
  } catch (error) {
    console.log(`Using fallback messages for locale: ${locale}`);
    return {
      locale,
      messages,
      timeZone: 'Europe/Nicosia'
    };
  }
});