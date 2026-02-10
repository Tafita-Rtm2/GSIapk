import 'package:flutter/material.dart';
import 'package:gsi_insight/models/lesson_model.dart';
import 'package:gsi_insight/services/storage_service.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:open_file/open_file.dart';
import 'dart:io';

class LessonDetailScreen extends StatefulWidget {
  final Lesson lesson;
  const LessonDetailScreen({super.key, required this.lesson});
  @override
  State<LessonDetailScreen> createState() => _LessonDetailScreenState();
}

class _LessonDetailScreenState extends State<LessonDetailScreen> {
  final StorageService _storage = StorageService();
  bool _isDownloading = false;

  void _downloadAndOpen(String url) async {
    setState(() => _isDownloading = true);
    File? file = await _storage.downloadFile(url, url.split('/').last.split('?').first);
    if (mounted) {
      setState(() => _isDownloading = false);
    }
    if (file != null) {
      OpenFile.open(file.path);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Échec")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.lesson.title)),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text(widget.lesson.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
          const SizedBox(height: 16),
          Text(widget.lesson.description),
          const SizedBox(height: 32),
          ...widget.lesson.files.map((url) => ListTile(
            leading: const Icon(LucideIcons.file),
            title: Text(url.split('/').last.split('?').first),
            trailing: _isDownloading ? const CircularProgressIndicator() : const Icon(LucideIcons.download),
            onTap: () => _downloadAndOpen(url),
          )),
        ],
      ),
    );
  }
}
