class User {
  final String id, name, email, role, language;
  User({required this.id, required this.name, required this.email, required this.role, required this.language});
  factory User.fromJson(Map<String, dynamic> j) => User(id: j['id'], name: j['name'], email: j['email'], role: j['role'], language: j['language'] ?? 'ID');
  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'email': email, 'role': role, 'language': language};
}
