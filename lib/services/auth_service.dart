import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:gsi_insight/models/user_model.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Future<GSIUser?> getUser(String uid) async {
    DocumentSnapshot doc = await _db.collection('users').doc(uid).get();
    if (doc.exists) return GSIUser.fromJson(doc.data() as Map<String, dynamic>);
    return null;
  }

  Future<UserCredential?> signIn(String email, String password) async => await _auth.signInWithEmailAndPassword(email: email, password: password);
  Future<void> signOut() async => await _auth.signOut();
}
