import 'package:flutter/material.dart';
import 'package:gsi_insight/models/announcement_model.dart';
import 'package:gsi_insight/services/database_service.dart';

class SendAnnouncementScreen extends StatefulWidget {
  const SendAnnouncementScreen({super.key});
  @override
  State<SendAnnouncementScreen> createState() => _SendAnnouncementScreenState();
}

class _SendAnnouncementScreenState extends State<SendAnnouncementScreen> {
  final _titleController = TextEditingController();
  final _msgController = TextEditingController();
  bool _isLoading = false;

  void _submit() async {
    if (_titleController.text.isEmpty) return;
    setState(() => _isLoading = true);
    try {
      await DatabaseService().addAnnouncement(Announcement(
        id: '',
        title: _titleController.text,
        message: _msgController.text,
        date: DateTime.now().toIso8601String(),
        author: 'Admin',
        type: 'info',
      ));
      if (mounted) {
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Erreur: $e")));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Envoyer une annonce")),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            TextField(controller: _titleController, decoration: const InputDecoration(labelText: "Titre")),
            TextField(controller: _msgController, decoration: const InputDecoration(labelText: "Message"), maxLines: 5),
            const SizedBox(height: 40),
            _isLoading ? const CircularProgressIndicator() : SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _submit, child: const Text("ENVOYER"))),
          ],
        ),
      ),
    );
  }
}
