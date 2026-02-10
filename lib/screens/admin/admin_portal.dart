import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gsi_insight/providers/auth_provider.dart';
import 'package:gsi_insight/providers/language_provider.dart';
import 'package:gsi_insight/screens/admin/send_announcement_screen.dart';
import 'package:gsi_insight/screens/admin/user_management_screen.dart';
import 'package:lucide_icons/lucide_icons.dart';

class AdminPortal extends StatelessWidget {
  const AdminPortal({super.key});
  @override
  Widget build(BuildContext context) {
    final t = Provider.of<LanguageProvider>(context).t;
    final auth = Provider.of<GSIAuthProvider>(context);
    return Scaffold(
      appBar: AppBar(title: Text(t('admin_portal')), actions: [IconButton(onPressed: () => auth.signOut(), icon: const Icon(LucideIcons.logOut))]),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const UserManagementScreen())),
            child: _buildItem(LucideIcons.users, t('gestion_utilisateurs')),
          ),
          GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SendAnnouncementScreen())),
            child: _buildItem(LucideIcons.megaphone, t('communication')),
          ),
          _buildItem(LucideIcons.building, "Campus"),
        ],
      ),
    );
  }
  Widget _buildItem(IconData icon, String title) => ListTile(leading: Icon(icon, color: const Color(0xFF3F51B5)), title: Text(title), trailing: const Icon(LucideIcons.chevronRight));
}
