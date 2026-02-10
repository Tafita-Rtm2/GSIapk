import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gsi_insight/providers/auth_provider.dart';
import 'package:gsi_insight/providers/gsi_provider.dart';
import 'package:gsi_insight/providers/language_provider.dart';
import 'package:gsi_insight/screens/professor/add_lesson_screen.dart';
import 'package:gsi_insight/screens/student/lesson_detail_screen.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';

class ProfessorPortal extends StatelessWidget {
  const ProfessorPortal({super.key});
  @override
  Widget build(BuildContext context) {
    final t = Provider.of<LanguageProvider>(context).t;
    final auth = Provider.of<GSIAuthProvider>(context);
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(t('prof_portal').toUpperCase(), style: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1)),
        actions: [IconButton(onPressed: () => auth.signOut(), icon: const Icon(LucideIcons.logOut))],
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
      ),
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
                if (gsi.lessons.isEmpty) {
                  return Container(
                    margin: const EdgeInsets.all(24),
                    padding: const EdgeInsets.all(40),
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(32),
                      border: Border.all(color: const Color(0xFFF1F5F9), width: 2),
                    ),
                    child: const Text("AUCUNE PUBLICATION", textAlign: TextAlign.center, style: TextStyle(color: Colors.black26, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                  );
                }
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  itemCount: gsi.lessons.length,
                  itemBuilder: (context, index) {
                    final l = gsi.lessons[index];
                    return Card(
                      elevation: 0,
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFFF1F5F9))),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: Colors.indigo.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(LucideIcons.fileText, color: Colors.indigo, size: 20),
                        ),
                        title: Text(l.title.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
                        subtitle: Text("${l.subject} • ${l.niveau}", style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.black45)),
                        trailing: const Icon(LucideIcons.chevronRight, size: 16, color: Colors.black26),
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
          blurRadius: 15,
          offset: const Offset(0, 8)
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
