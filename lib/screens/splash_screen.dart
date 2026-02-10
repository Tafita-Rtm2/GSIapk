import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gsi_insight/providers/auth_provider.dart';
import 'package:gsi_insight/screens/login_screen.dart';
import 'package:gsi_insight/screens/student/student_dashboard.dart';
import 'package:gsi_insight/screens/professor/professor_portal.dart';
import 'package:gsi_insight/screens/admin/admin_portal.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<GSIAuthProvider>(context);
    if (!auth.isLoading) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (auth.user == null) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
        else {
          Widget home = const StudentDashboard();
          if (auth.user!.role == 'admin') home = const AdminPortal();
          else if (auth.user!.role == 'professor') home = const ProfessorPortal();
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => home));
        }
      });
    }
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}
