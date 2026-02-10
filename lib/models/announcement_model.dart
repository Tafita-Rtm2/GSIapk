class Announcement {
  final String id;
  final String title;
  final String message;
  final String date;
  final String author;
  final String? type;
  final String? targetUserId;

  Announcement({required this.id, required this.title, required this.message, required this.date, required this.author, this.type, this.targetUserId});

  factory Announcement.fromJson(Map<String, dynamic> json, String id) => Announcement(
    id: id,
    title: json['title'] ?? '',
    message: json['message'] ?? '',
    date: json['date'] ?? '',
    author: json['author'] ?? '',
    type: json['type'],
    targetUserId: json['targetUserId'],
  );

  Map<String, dynamic> toJson() => {'title': title, 'message': message, 'date': date, 'author': author, 'type': type, 'targetUserId': targetUserId};
}
