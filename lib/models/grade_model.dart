class Grade {
  final String id;
  final String studentId;
  final String studentName;
  final String subject;
  final double score;
  final int maxScore;
  final String date;
  final String niveau;
  final String filiere;

  Grade({required this.id, required this.studentId, required this.studentName, required this.subject, required this.score, required this.maxScore, required this.date, required this.niveau, required this.filiere});

  factory Grade.fromJson(Map<String, dynamic> json, String id) => Grade(
    id: id,
    studentId: json['studentId'] ?? '',
    studentName: json['studentName'] ?? '',
    subject: json['subject'] ?? '',
    score: (json['score'] ?? 0).toDouble(),
    maxScore: json['maxScore'] ?? 20,
    date: json['date'] ?? '',
    niveau: json['niveau'] ?? '',
    filiere: json['filiere'] ?? '',
  );

  Map<String, dynamic> toJson() => {'studentId': studentId, 'studentName': studentName, 'subject': subject, 'score': score, 'maxScore': maxScore, 'date': date, 'niveau': niveau, 'filiere': filiere};
}
