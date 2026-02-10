import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gsi_insight/models/user_model.dart';
import 'package:gsi_insight/providers/auth_provider.dart';
import 'package:gsi_insight/providers/language_provider.dart';
import 'package:gsi_insight/screens/register_screen.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_fonts/google_fonts.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  void _handleLogin() async {
    setState(() => _isLoading = true);
    try {
      await Provider.of<GSIAuthProvider>(context, listen: false).signIn(_emailController.text, _passwordController.text);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Erreur: ${e.toString()}")));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = Provider.of<LanguageProvider>(context).t;
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F8),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 60),
              Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)), child: const Icon(LucideIcons.sparkles, color: Color(0xFF3F51B5), size: 30)),
              const SizedBox(height: 32),
              Text("GSI Insight", style: GoogleFonts.plusJakartaSans(fontSize: 32, fontWeight: FontWeight.w900)),
              const SizedBox(height: 48),
              _buildInput(t('email'), _emailController, LucideIcons.mail, false),
              const SizedBox(height: 20),
              _buildInput(t('password'), _passwordController, LucideIcons.lock, true),
              const SizedBox(height: 32),
              SizedBox(width: double.infinity, height: 56, child: ElevatedButton(
                onPressed: _isLoading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF3F51B5), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
                child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : Text(t('se_connecter'), style: const TextStyle(fontWeight: FontWeight.w800)),
              )),
              const SizedBox(height: 24),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                  child: Text(
                    "Vous n'avez pas de compte ? Créer un compte",
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF3F51B5),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: TextButton(
                  onPressed: _showAccessCodeDialog,
                  child: Text(
                    "Accès Portails (Admin/Prof)",
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Colors.black45,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAccessCodeDialog() {
    final codeController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Code d'accès", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
        content: TextField(
          controller: codeController,
          decoration: const InputDecoration(hintText: "Entrez le code"),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Annuler")),
          ElevatedButton(
            onPressed: () async {
              final code = codeController.text;
              if (code == 'Nina GSI') {
                final auth = Provider.of<GSIAuthProvider>(context, listen: false);
                auth.setMockUser(GSIUser(
                  id: 'admin-bypass',
                  fullName: 'Nina GSI',
                  email: 'admin@gsi.mg',
                  role: 'admin',
                  campus: 'Antananarivo',
                  filiere: 'Directeur',
                  niveau: 'N/A'
                ));
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Accès Admin accordé")));
              } else if (code == 'prof-gsi-mg') {
                final auth = Provider.of<GSIAuthProvider>(context, listen: false);
                auth.setMockUser(GSIUser(
                  id: 'prof-bypass',
                  fullName: 'Professeur GSI',
                  email: 'prof@gsi.mg',
                  role: 'professor',
                  campus: 'Antananarivo',
                  filiere: 'Informatique',
                  niveau: 'L1'
                ));
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Accès Professeur accordé")));
              } else {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Code incorrect")));
              }
            },
            child: const Text("Valider"),
          )
        ],
      ),
    );
  }

  Widget _buildInput(String label, TextEditingController controller, IconData icon, bool isPassword) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(label, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: Colors.black54)),
      const SizedBox(height: 8),
      TextField(controller: controller, obscureText: isPassword, decoration: InputDecoration(prefixIcon: Icon(icon, size: 20), filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none))),
    ],
  );
}
