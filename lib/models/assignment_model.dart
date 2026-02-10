class Assignment {
  final String id;
  final String title;
  final String description;
  final String subject;
  final String niveau;
  final List<String> filiere;
  final List<String> campus;
  final String deadline;
  final String timeLimit;
  final int maxScore;
  final List<String>? files;

  Assignment({required this.id, required this.title, required this.description, required this.subject, required this.niveau, required this.filiere, required this.campus, required this.deadline, required this.timeLimit, required this.maxScore, this.files});

  factory Assignment.fromJson(Map<String, dynamic> json, String id) => Assignment(
    id: id,
    title: json['title'] ?? '',
    description: json['description'] ?? '',
    subject: json['subject'] ?? '',
    niveau: json['niveau'] ?? '',
    filiere: List<String>.from(json['filiere'] ?? []),
    campus: List<String>.from(json['campus'] ?? []),
    deadline: json['deadline'] ?? '',
    timeLimit: json['timeLimit'] ?? '',
    maxScore: json['maxScore'] ?? 20,
    files: json['files'] != null ? List<String>.from(json['files']) : null,
  );

  Map<String, dynamic> toJson() => {'title': title, 'description': description, 'subject': subject, 'niveau': niveau, 'filiere': filiere, 'campus': campus, 'deadline': deadline, 'timeLimit': timeLimit, 'maxScore': maxScore, 'files': files};
}
