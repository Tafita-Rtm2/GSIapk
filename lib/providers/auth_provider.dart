import 'package:flutter/material.dart';
import 'package:gsi_insight/models/user_model.dart';
import 'package:gsi_insight/services/auth_service.dart';

class GSIAuthProvider with ChangeNotifier {
  GSIUser? _user;
  bool _isLoading = true;
  final AuthService _authService = AuthService();
  GSIUser? get user => _user;
  bool get isLoading => _isLoading;
  GSIAuthProvider() { _init(); }
  void _init() {
    _authService.authStateChanges.listen((fbUser) async {
      _user = fbUser != null ? await _authService.getUser(fbUser.uid) : null;
      _isLoading = false;
      notifyListeners();
    });
  }
  Future<void> signIn(String email, String password) => _authService.signIn(email, password);
  Future<void> signOut() => _authService.signOut();
}
