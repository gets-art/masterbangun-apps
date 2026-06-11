class Project {
  final String id, name, address, status;
  final int progressPercentage;
  Project({required this.id, required this.name, required this.address, required this.status, required this.progressPercentage});
  factory Project.fromJson(Map<String, dynamic> j) => Project(id: j['id'], name: j['name'], address: j['address'], status: j['status'], progressPercentage: j['progressPercentage'] ?? 0);
}
