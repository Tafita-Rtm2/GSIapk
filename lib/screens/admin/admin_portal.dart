import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gsi_insight/providers/auth_provider.dart';
import 'package:gsi_insight/providers/language_provider.dart';
import 'package:gsi_insight/screens/admin/send_announcement_screen.dart';
import 'package:gsi_insight/screens/admin/user_management_screen.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';

class AdminPortal extends StatelessWidget {
  const AdminPortal({super.key});
  @override
  Widget build(BuildContext context) {
    final t = Provider.of<LanguageProvider>(context).t;
    final auth = Provider.of<GSIAuthProvider>(context);
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(t('admin_portal').toUpperCase(), style: GoogleFonts.plusJakartaSans(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1)),
        actions: [IconButton(onPressed: () => auth.signOut(), icon: const Icon(LucideIcons.logOut))],
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const UserManagementScreen())),
            child: _buildItem(LucideIcons.users, t('gestion_utilisateurs'), "Gérer les comptes étudiants et profs"),
          ),
          GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SendAnnouncementScreen())),
            child: _buildItem(LucideIcons.megaphone, t('communication'), "Envoyer des annonces ou convocations"),
          ),
          _buildItem(LucideIcons.building, "Gestion Campus", "Gérer les campus et filières"),
        ],
      ),
    );
  }
  Widget _buildItem(IconData icon, String title, String subtitle) => Container(
    margin: const EdgeInsets.only(bottom: 16),
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: const Color(0xFFF1F5F9)),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.03),
          blurRadius: 10,
          offset: const Offset(0, 4)
        )
      ]
    ),
    child: Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFE0E7FF), borderRadius: BorderRadius.circular(16)),
          child: Icon(icon, color: const Color(0xFF3F51B5), size: 24),
        ),
        const SizedBox(width: 20),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(color: Colors.black45, fontSize: 11, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
        const Icon(LucideIcons.chevronRight, size: 16, color: Colors.black26),
      ],
    ),
  );
}
