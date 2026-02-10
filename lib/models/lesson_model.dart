class Lesson {
  final String id;
  final String title;
  final String description;
  final String subject;
  final String niveau;
  final List<String> filiere;
  final List<String> campus;
  final String date;
  final List<String> files;

  Lesson({required this.id, required this.title, required this.description, required this.subject, required this.niveau, required this.filiere, required this.campus, required this.date, required this.files});

  factory Lesson.fromJson(Map<String, dynamic> json, String id) => Lesson(
    id: id,
    title: json['title'] ?? '',
    description: json['description'] ?? '',
    subject: json['subject'] ?? '',
    niveau: json['niveau'] ?? '',
    filiere: List<String>.from(json['filiere'] ?? []),
    campus: List<String>.from(json['campus'] ?? []),
    date: json['date'] ?? '',
    files: List<String>.from(json['files'] ?? []),
  );

  Map<String, dynamic> toJson() => {'title': title, 'description': description, 'subject': subject, 'niveau': niveau, 'filiere': filiere, 'campus': campus, 'date': date, 'files': files};
}
