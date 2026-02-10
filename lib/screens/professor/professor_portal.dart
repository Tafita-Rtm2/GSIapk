import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gsi_insight/providers/auth_provider.dart';
import 'package:gsi_insight/providers/language_provider.dart';
import 'package:lucide_icons/lucide_icons.dart';

class ProfessorPortal extends StatelessWidget {
  const ProfessorPortal({super.key});
  @override
  Widget build(BuildContext context) {
    final t = Provider.of<LanguageProvider>(context).t;
    final auth = Provider.of<GSIAuthProvider>(context);
    return Scaffold(
      appBar: AppBar(title: Text(t('prof_portal')), actions: [IconButton(onPressed: () => auth.signOut(), icon: const Icon(LucideIcons.logOut))]),
      body: GridView.count(
        padding: const EdgeInsets.all(24), crossAxisCount: 2, mainAxisSpacing: 16, crossAxisSpacing: 16,
        children: [
          _buildActionCard(LucideIcons.bookOpen, t('publier_lecon'), Colors.indigo),
          _buildActionCard(LucideIcons.fileText, t('publier_devoir'), Colors.orange),
          _buildActionCard(LucideIcons.barChart, t('gestion_notes'), Colors.green),
          _buildActionCard(LucideIcons.users, "Suivi", Colors.blue),
        ],
      ),
    );
  }
  Widget _buildActionCard(IconData icon, String label, Color color) => Container(
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.black12)),
    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(icon, color: color, size: 32), const SizedBox(height: 12), Text(label, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12))]),
  );
}
