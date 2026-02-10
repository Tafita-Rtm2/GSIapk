import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:gsi_insight/models/lesson_model.dart';
import 'package:gsi_insight/services/database_service.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'dart:io';

class AddLessonScreen extends StatefulWidget {
  const AddLessonScreen({super.key});
  @override
  State<AddLessonScreen> createState() => _AddLessonScreenState();
}

class _AddLessonScreenState extends State<AddLessonScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _subjectController = TextEditingController();
  String _niveau = 'L1';
  List<File> _selectedFiles = [];
  bool _isLoading = false;

  void _pickFiles() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(allowMultiple: true);
    if (result != null) {
      setState(() { _selectedFiles = result.paths.map((path) => File(path!)).toList(); });
    }
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      List<String> fileUrls = [];
      for (var file in _selectedFiles) {
        String fileName = DateTime.now().millisecondsSinceEpoch.toString() + '_' + file.path.split('/').last;
        Reference ref = FirebaseStorage.instance.ref().child('lessons/$fileName');
        await ref.putFile(file);
        fileUrls.add(await ref.getDownloadURL());
      }

      final lesson = Lesson(
        id: '',
        title: _titleController.text,
        description: _descController.text,
        subject: _subjectController.text,
        niveau: _niveau,
        filiere: [], // Simplified for now
        campus: [],
        date: DateTime.now().toIso8601String(),
        files: fileUrls,
      );

      await DatabaseService().addLesson(lesson);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Erreur: $e")));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Publier une leçon")),
      body: _isLoading ? const Center(child: CircularProgressIndicator()) : SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(controller: _titleController, decoration: const InputDecoration(labelText: "Titre"), validator: (v) => v!.isEmpty ? "Requis" : null),
              TextFormField(controller: _subjectController, decoration: const InputDecoration(labelText: "Matière"), validator: (v) => v!.isEmpty ? "Requis" : null),
              TextFormField(controller: _descController, decoration: const InputDecoration(labelText: "Description"), maxLines: 3),
              const SizedBox(height: 20),
              DropdownButtonFormField<String>(
                value: _niveau,
                items: ['L1', 'L2', 'L3', 'M1', 'M2'].map((n) => DropdownMenuItem(value: n, child: Text(n))).toList(),
                onChanged: (v) => setState(() => _niveau = v!),
                decoration: const InputDecoration(labelText: "Niveau"),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(onPressed: _pickFiles, icon: const Icon(Icons.attach_file), label: Text("${_selectedFiles.length} fichiers sélectionnés")),
              const SizedBox(height: 40),
              SizedBox(width: double.infinity, height: 50, child: ElevatedButton(onPressed: _submit, child: const Text("PUBLIER"))),
            ],
          ),
        ),
      ),
    );
  }
}
