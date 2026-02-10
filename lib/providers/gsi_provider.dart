import 'package:flutter/material.dart';
import 'package:gsi_insight/models/user_model.dart';
import 'package:gsi_insight/models/lesson_model.dart';
import 'package:gsi_insight/models/assignment_model.dart';
import 'package:gsi_insight/models/announcement_model.dart';
import 'package:gsi_insight/services/database_service.dart';

class GSIProvider with ChangeNotifier {
  GSIUser? _currentUser;
  final DatabaseService _db = DatabaseService();
  List<Lesson> _lessons = [];
  List<Assignment> _assignments = [];
  List<Announcement> _announcements = [];
  List<Lesson> get lessons => _lessons;
  List<Assignment> get assignments => _assignments;
  List<Announcement> get announcements => _announcements;

  void updateUser(GSIUser? user) {
    _currentUser = user;
    if (_currentUser != null) _listenToData();
    else { _lessons = []; _assignments = []; _announcements = []; }
  }

  void _listenToData() {
    _db.getLessons(_currentUser!.niveau).listen((data) {
      _lessons = data.where((l) => (l.campus.contains(_currentUser!.campus) || l.campus.isEmpty) && (l.filiere.contains(_currentUser!.filiere) || l.filiere.isEmpty)).toList();
      notifyListeners();
    });
    _db.getAssignments(_currentUser!.niveau).listen((data) {
      _assignments = data.where((a) => (a.campus.contains(_currentUser!.campus) || a.campus.isEmpty) && (a.filiere.contains(_currentUser!.filiere) || a.filiere.isEmpty)).toList();
      notifyListeners();
    });
    _db.getAnnouncements().listen((data) {
      _announcements = data.where((a) => a.targetUserId == null || a.targetUserId == _currentUser!.id).toList();
      notifyListeners();
    });
  }
}
