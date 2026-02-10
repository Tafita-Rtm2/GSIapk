import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:gsi_insight/models/lesson_model.dart';
import 'package:gsi_insight/models/assignment_model.dart';
import 'package:gsi_insight/models/announcement_model.dart';
import 'package:gsi_insight/models/grade_model.dart';

class DatabaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Stream<List<Lesson>> getLessons(String niveau) => _db.collection('lessons').where('niveau', isEqualTo: niveau).snapshots().map((snap) => snap.docs.map((doc) => Lesson.fromJson(doc.data(), doc.id)).toList());
  Stream<List<Assignment>> getAssignments(String niveau) => _db.collection('assignments').where('niveau', isEqualTo: niveau).snapshots().map((snap) => snap.docs.map((doc) => Assignment.fromJson(doc.data(), doc.id)).toList());
  Stream<List<Announcement>> getAnnouncements() => _db.collection('announcements').orderBy('date', descending: true).snapshots().map((snap) => snap.docs.map((doc) => Announcement.fromJson(doc.data(), doc.id)).toList());
  Stream<List<Grade>> getGrades(String studentId) => _db.collection('grades').where('studentId', isEqualTo: studentId).snapshots().map((snap) => snap.docs.map((doc) => Grade.fromJson(doc.data(), doc.id)).toList());
}
