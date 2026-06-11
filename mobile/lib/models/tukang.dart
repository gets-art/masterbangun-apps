class Tukang {
  final String id, name;
  final String? phone, skill;
  Tukang({required this.id, required this.name, this.phone, this.skill});
  factory Tukang.fromJson(Map<String, dynamic> j) => Tukang(id: j['id'], name: j['name'], phone: j['phone'], skill: j['skill']);
}
