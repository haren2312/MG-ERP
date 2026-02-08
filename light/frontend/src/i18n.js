import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// These are your "properties" (JSON format)
const resources = {
  en: {
    translation: {
      // Login page
      "welcome": "Welcome", 
      "descr": "This is an English description.",
      "password": "Password",
      "app_name": "Light ERP",
      "login_page_under_title": "Sign in to your account",
      "username": "Username",
      "enter_username": "Enter username",
      "enter_password": "Enter password",
      "sign_in": "Sign In",
      "signing_in_loading": "Signing in...",
      "loading": "Loading...",
      // Dashboard page
      "dashboard_title": "Dashboard",
      "dashboard_description": "Overview of your business",
      "total_sales": "Total Sales (30 days)",
      "current_balance": "Current Balance",
      "inventory_value": "Inventory Value",
      "low_stock_items": "Low Stock Items",
      "out_of_stock_items": "Out of stock",
      "quick_stats": "Quick Stats",
      "average_transaction": "Average Transaction",
      "total_tax_collected": "Total Tax Collected",
      "total_discounts": "Total Discounts",
      "total_expenses": "Total Expenses (30 days)",

         // Add more translations as needed
        sales_title: "Sales",
        inventory_title: "Inventory",
        ledger_title: "Ledger",
        expenses_title: "Expenses",
        user_management_title: "Users Management",
        sales_users_title: "Sales Users",
        reports_title: "Reports",
        sales_user_report_title: "Sales User Report",
        pos_title: "POS",

    }
  },
  de: {
  translation: {
    // Login page
    "welcome": "Willkommen", 
    "descr": "Dies ist eine deutsche Beschreibung.",
    "password": "Passwort",
    "app_name": "Light ERP",
    "login_page_under_title": "Melden Sie sich bei Ihrem Konto an",
    "username": "Benutzername",
    "enter_username": "Benutzername eingeben",
    "enter_password": "Passwort eingeben",
    "sign_in": "Anmelden",
    "signing_in_loading": "Anmeldung läuft...",
    "loading": "Laden...",
    // Dashboard page
    "dashboard_title": "Dashboard",
    "dashboard_description": "Überblick über Ihr Unternehmen",
    "total_sales": "Gesamtumsatz (30 Tage)",
    "current_balance": "Aktueller Kontostand",
    "inventory_value": "Lagerwert",
    "low_stock_items": "Geringer Lagerbestand",
    "out_of_stock_items": "Nicht vorrätig",
    "quick_stats": "Kurzstatistik",
    "average_transaction": "Durchschnittliche Transaktion",
    "total_tax_collected": "Gesamte erhobene Steuer",
    "total_discounts": "Gesamte Rabatte",
    "total_expenses": "Gesamtausgaben (30 Tage)",

    // Menu / Sidebar Titles
    "sales_title": "Verkäufe",
    "inventory_title": "Lagerbestand",
    "ledger_title": "Hauptbuch",
    "expenses_title": "Ausgaben",
    "user_management_title": "Benutzerverwaltung",
    "sales_users_title": "Vertriebsmitarbeiter",
    "reports_title": "Berichte",
    "sales_user_report_title": "Vertriebsmitarbeiter-Bericht",
    "pos_title": "POS",
},
  },ar: {
  translation: {
    // Login page
    "welcome": "مرحباً بك", 
    "descr": "هذا وصف باللغة العربية.",
    "password": "كلمة المرور",
    "app_name": "Light ERP",
    "login_page_under_title": "تسجيل الدخول إلى حسابك",
    "username": "اسم المستخدم",
    "enter_username": "أدخل اسم المستخدم",
    "enter_password": "أدخل كلمة المرور",
    "sign_in": "تسجيل الدخول",
    "signing_in_loading": "جاري تسجيل الدخول...",
    "loading": "جاري التحميل...",
    // Dashboard page
    "dashboard_title": "لوحة التحكم",
    "dashboard_description": "نظرة عامة على نشاطك التجاري",
    "total_sales": "إجمالي المبيعات (30 يومًا)",
    "current_balance": "الرصيد الحالي",
    "inventory_value": "قيمة المخزون",
    "low_stock_items": "عناصر منخفضة المخزون",
    "out_of_stock_items": "نفدت الكمية",
    "quick_stats": "إحصائيات سريعة",
    "average_transaction": "متوسط المعاملات",
    "total_tax_collected": "إجمالي الضرائب المحصلة",
    "total_discounts": "إجمالي الخصومات",
    "total_expenses": "إجمالي المصروفات (30 يومًا)",

    // Menu / Sidebar Titles
    "sales_title": "المبيعات",
    "inventory_title": "المخزون",
    "ledger_title": "دفتر الأستاذ",
    "expenses_title": "المصاريف",
    "user_management_title": "إدارة المستخدمين",
    "sales_users_title": "موظفي المبيعات",
    "reports_title": "التقارير",
    "sales_user_report_title": "تقرير موظفي المبيعات",
    "pos_title": "نقطة البيع",
  }
}
};

i18n
  .use(LanguageDetector) // Automatically detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Use English if the detected language isn't available
    interpolation: {
      escapeValue: false // React already escapes values to prevent XSS
    }
  });

  i18n.on('languageChanged', (lng) => {
  // 1. Update the lang attribute (e.g., 'en', 'ar', 'de')
  document.documentElement.lang = lng;

  // 2. Update the direction (Arabic is 'rtl', others are 'ltr')
  document.documentElement.dir = i18n.dir(lng);
});

export default i18n;