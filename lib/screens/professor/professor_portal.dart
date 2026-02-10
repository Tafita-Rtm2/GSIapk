import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gsi_insight/providers/auth_provider.dart';
import 'package:gsi_insight/providers/gsi_provider.dart';
import 'package:gsi_insight/providers/language_provider.dart';
import 'package:gsi_insight/screens/professor/add_lesson_screen.dart';
import 'package:gsi_insight/screens/student/lesson_detail_screen.dart';
import 'package:lucide_icons/lucide_icons.dart';

class ProfessorPortal extends StatelessWidget {
  const ProfessorPortal({super.key});
  @override
  Widget build(BuildContext context) {
    final t = Provider.of<LanguageProvider>(context).t;
    final auth = Provider.of<GSIAuthProvider>(context);
    return Scaffold(
      appBar: AppBar(title: Text(t('prof_portal')), actions: [IconButton(onPressed: () => auth.signOut(), icon: const Icon(LucideIcons.logOut))]),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.all(24),
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              children: [
                GestureDetector(
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddLessonScreen())),
                  child: _buildActionCard(LucideIcons.bookOpen, t('publier_lecon'), Colors.indigo),
                ),
                _buildActionCard(LucideIcons.fileText, t('publier_devoir'), Colors.orange),
                _buildActionCard(LucideIcons.barChart, t('gestion_notes'), Colors.green),
                _buildActionCard(LucideIcons.users, "Suivi", Colors.blue),
              ],
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Text("MES PUBLICATIONS RÉCENTES", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: Colors.black45, letterSpacing: 1)),
            ),
            Consumer<GSIProvider>(
              builder: (context, gsi, child) {
                if (gsi.lessons.isEmpty) return const Padding(padding: EdgeInsets.all(24), child: Text("Aucune publication"));
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  itemCount: gsi.lessons.length,
                  itemBuilder: (context, index) {
                    final l = gsi.lessons[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: ListTile(
                        leading: const Icon(LucideIcons.fileText, color: Colors.indigo),
                        title: Text(l.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text("${l.subject} - ${l.niveau}"),
                        trailing: const Icon(LucideIcons.chevronRight, size: 16),
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => LessonDetailScreen(lesson: l))),
                      ),
                    );
                  },
                );
              },
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
  Widget _buildActionCard(IconData icon, String label, Color color) => Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(32),
      border: Border.all(color: const Color(0xFFF1F5F9)),
      boxShadow: [
        BoxShadow(
          color: color.withValues(alpha: 0.1),
          blurRadius: 10,
          offset: const Offset(0, 4)
        )
      ]
    ),
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(icon, color: color, size: 28),
        ),
        const SizedBox(height: 16),
        Text(
          label.toUpperCase(),
          textAlign: TextAlign.center,
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 0.5),
        ),
      ],
    ),
  );
}
