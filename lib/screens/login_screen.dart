import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gsi_insight/providers/auth_provider.dart';
import 'package:gsi_insight/providers/language_provider.dart';
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
    try { await Provider.of<GSIAuthProvider>(context, listen: false).signIn(_emailController.text, _passwordController.text); }
    catch (e) { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Erreur: ${e.toString()}"))); }
    finally { if (mounted) setState(() => _isLoading = false); }
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
            ],
          ),
        ),
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
