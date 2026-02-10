import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gsi_insight/providers/auth_provider.dart';
import 'package:gsi_insight/providers/gsi_provider.dart';
import 'package:gsi_insight/providers/language_provider.dart';
import 'package:gsi_insight/screens/chat/chat_screen.dart';
import 'package:gsi_insight/screens/student/lesson_detail_screen.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';

class StudentDashboard extends StatelessWidget {
  const StudentDashboard({super.key});
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<GSIAuthProvider>(context);
    final gsi = Provider.of<GSIProvider>(context);
    final t = Provider.of<LanguageProvider>(context).t;
    final user = auth.user;
    if (user == null) return const Scaffold();
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(user, t),
            const SizedBox(height: 24),
            _buildAICard(context, t),
            const SizedBox(height: 32),
            _buildSectionHeader(t('cours_en_cours'), "${gsi.lessons.length} PUBLIÉS"),
            const SizedBox(height: 16),
            _buildLessonsList(context, gsi.lessons),
            const SizedBox(height: 32),
            _buildSectionHeader("Devoirs à rendre", "${gsi.assignments.length} EN ATTENTE"),
            const SizedBox(height: 16),
            _buildAssignmentsList(gsi.assignments),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(dynamic user, String Function(String) t) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text("BONJOUR ${user.fullName.split(' ')[0]}".toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: Colors.black45)),
        const SizedBox(height: 4),
        Text("Prêt pour ${t('success_today')} ?", style: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w900)),
      ]),
      CircleAvatar(backgroundImage: NetworkImage("https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}")),
    ],
  );

  Widget _buildAICard(BuildContext context, String Function(String) t) => Container(
    padding: const EdgeInsets.all(24),
    decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF7C4DFF), Color(0xFF3F51B5)]), borderRadius: BorderRadius.circular(32)),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("ASK INSIGHT AI", style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w900)),
        const SizedBox(height: 12),
        const Text("Des questions ?", style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
        const SizedBox(height: 20),
        ElevatedButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ChatScreen())), child: const Text("LANCER")),
      ],
    ),
  );

  Widget _buildSectionHeader(String title, String subtitle) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(title.toUpperCase(), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
      Text(subtitle.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.black26)),
    ],
  );

  Widget _buildLessonsList(BuildContext context, List<dynamic> lessons) => SizedBox(
    height: 140,
    child: ListView.builder(
      scrollDirection: Axis.horizontal,
      itemCount: lessons.length,
      itemBuilder: (context, index) {
        final l = lessons[index];
        return GestureDetector(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => LessonDetailScreen(lesson: l))),
          child: Container(
            width: 200, margin: const EdgeInsets.only(right: 16), padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFF1F5F9))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Icon(LucideIcons.bookOpen, color: Color(0xFF3F51B5)),
              const Spacer(),
              Text(l.title.toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900), maxLines: 1),
              Text(l.subject.toUpperCase(), style: const TextStyle(fontSize: 9, color: Colors.black26)),
            ]),
          ),
        );
      },
    ),
  );

  Widget _buildAssignmentsList(List<dynamic> assignments) => Column(children: assignments.map((a) => Container(
    margin: const EdgeInsets.only(bottom: 16), padding: const EdgeInsets.all(24),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(32)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(a.title.toUpperCase(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
      Text(a.subject, style: const TextStyle(fontSize: 10, color: Colors.black45)),
    ]),
  )).toList());
}
