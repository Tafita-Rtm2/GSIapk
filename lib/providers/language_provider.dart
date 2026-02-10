import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageProvider with ChangeNotifier {
  String _language = 'fr';
  String get language => _language;
  final Map<String, Map<String, String>> _translations = {
    'accueil': {'fr': 'Accueil', 'en': 'Home'},
    'success_today': {'fr': 'la réussite aujourd\'hui', 'en': 'success today'},
    'cours_en_cours': {'fr': 'Cours en cours', 'en': 'Current courses'},
    'se_connecter': {'fr': 'Se connecter', 'en': 'Login'},
    'email': {'fr': 'Adresse Email', 'en': 'Email Address'},
    'password': {'fr': 'Mot de passe', 'en': 'Password'},
    'prof_portal': {'fr': 'Portail Professeur', 'en': 'Professor Portal'},
    'admin_portal': {'fr': 'Portail Administrateur', 'en': 'Administrator Portal'},
    'publier_lecon': {'fr': 'Publier une leçon', 'en': 'Publish a lesson'},
    'publier_devoir': {'fr': 'Publier un devoir', 'en': 'Publish an assignment'},
    'gestion_notes': {'fr': 'Gestion des notes', 'en': 'Grade Management'},
    'gestion_utilisateurs': {'fr': 'Gestion des Utilisateurs', 'en': 'User Management'},
    'communication': {'fr': 'Communication', 'en': 'Communication'},
  };

  LanguageProvider() { _loadLanguage(); }
  void _loadLanguage() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    _language = prefs.getString('app_lang') ?? 'fr';
    notifyListeners();
  }
  void setLanguage(String lang) async {
    _language = lang;
    (await SharedPreferences.getInstance()).setString('app_lang', lang);
    notifyListeners();
  }
  String t(String key) => _translations[key]?[_language] ?? key;
}
