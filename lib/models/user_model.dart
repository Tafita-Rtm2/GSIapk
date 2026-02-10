class GSIUser {
  final String id;
  final String fullName;
  final String email;
  final String role;
  final String campus;
  final String filiere;
  final String niveau;
  final String? photo;

  GSIUser({required this.id, required this.fullName, required this.email, required this.role, required this.campus, required this.filiere, required this.niveau, this.photo});

  factory GSIUser.fromJson(Map<String, dynamic> json) => GSIUser(
    id: json['id'] ?? '',
    fullName: json['fullName'] ?? '',
    email: json['email'] ?? '',
    role: json['role'] ?? 'student',
    campus: json['campus'] ?? '',
    filiere: json['filiere'] ?? '',
    niveau: json['niveau'] ?? '',
    photo: json['photo'],
  );

  Map<String, dynamic> toJson() => {'id': id, 'fullName': fullName, 'email': email, 'role': role, 'campus': campus, 'filiere': filiere, 'niveau': niveau, 'photo': photo};
}
