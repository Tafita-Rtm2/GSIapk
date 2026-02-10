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
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
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
      ),
    );
  }

  Widget _buildHeader(dynamic user, String Function(String) t) {
    String firstName = user.fullName.split(' ')[0];
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("BONJOUR $firstName".toUpperCase(), style: GoogleFonts.plusJakartaSans(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: Colors.black45)),
            const SizedBox(height: 4),
            RichText(
              text: TextSpan(
                style: GoogleFonts.plusJakartaSans(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.black),
                children: [
                  const TextSpan(text: "Prêt pour "),
                  TextSpan(text: t('success_today'), style: const TextStyle(color: Color(0xFF3F51B5))),
                  const TextSpan(text: " ?"),
                ],
              ),
            ),
          ],
        ),
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white, width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 10,
                offset: const Offset(0, 4)
              )
            ],
            image: DecorationImage(
              image: NetworkImage("https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}")
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAICard(BuildContext context, String Function(String) t) => Container(
    padding: const EdgeInsets.all(24),
    decoration: BoxDecoration(
      gradient: const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF7C4DFF), Color(0xFF3F51B5)]
      ),
      borderRadius: BorderRadius.circular(40),
      boxShadow: [
        BoxShadow(
          color: const Color(0xFF3F51B5).withValues(alpha: 0.3),
          blurRadius: 20,
          offset: const Offset(0, 10)
        )
      ]
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(LucideIcons.sparkles, color: Colors.white70, size: 16),
            const SizedBox(width: 8),
            Text("ASK INSIGHT AI", style: GoogleFonts.plusJakartaSans(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1.5, color: Colors.white70)),
          ],
        ),
        const SizedBox(height: 12),
        const Text("Des questions ?", style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
        const Text("Emplois du temps, devoirs, notes...", style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500)),
        const SizedBox(height: 24),
        GestureDetector(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ChatScreen())),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white24)
            ),
            child: const Text("LANCER L'ASSISTANT", style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
          ),
        ),
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

  Widget _buildLessonsList(BuildContext context, List<dynamic> lessons) {
    if (lessons.isEmpty) return _buildEmptyState("Aucun contenu pédagogique");
    return SizedBox(
      height: 160,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: lessons.length,
        itemBuilder: (context, index) {
          final l = lessons[index];
          return GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => LessonDetailScreen(lesson: l))),
            child: Container(
              width: 200,
              margin: const EdgeInsets.only(right: 16),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: const Color(0xFFF1F5F9)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4)
                  )
                ]
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE0E7FF),
                      borderRadius: BorderRadius.circular(12)
                    ),
                    child: const Icon(LucideIcons.bookOpen, size: 18, color: Color(0xFF3F51B5)),
                  ),
                  const Spacer(),
                  Text(l.title.toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)), maxLines: 1, overflow: TextOverflow.ellipsis),
                  Text(l.subject.toUpperCase(), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.black26, letterSpacing: 1)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(40),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: const Color(0xFFF1F5F9), width: 2, style: BorderStyle.solid),
      ),
      child: Text(message.toUpperCase(), textAlign: TextAlign.center, style: const TextStyle(color: Colors.black26, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
    );
  }

  Widget _buildAssignmentsList(List<dynamic> assignments) {
    if (assignments.isEmpty) return _buildEmptyState("Aucune deadline");
    return Column(
      children: assignments.map((a) => Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: const Color(0xFFF1F5F9)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 10,
              offset: const Offset(0, 4)
            )
          ]
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    borderRadius: BorderRadius.circular(20)
                  ),
                  child: const Text("EN ATTENTE", style: TextStyle(color: Color(0xFFEA580C), fontSize: 9, fontWeight: FontWeight.w900)),
                ),
                Text(a.deadline.toUpperCase(), style: const TextStyle(color: Colors.black26, fontSize: 9, fontWeight: FontWeight.w900)),
              ],
            ),
            const SizedBox(height: 16),
            Text(a.title.toUpperCase(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
            Text(a.subject, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.black45)),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))
                ),
                child: const Text("DÉPOSER MON TRAVAIL", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
              ),
            ),
          ],
        ),
      )).toList(),
    );
  }
}
