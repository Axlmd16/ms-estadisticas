class User {
  final String id;
  final String email;
  final String firstname;
  final String lastname;
  final String? phoneNumber;
  final String? image;
  final List<String> role;
  final bool verified;
  final bool? isAdmin;
  final String access;
  final String refresh;

  User({
    required this.id,
    required this.email,
    required this.firstname,
    required this.lastname,
    this.phoneNumber,
    this.image,
    required this.role,
    required this.verified,
    this.isAdmin,
    required this.access,
    required this.refresh,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      firstname: json['firstname'] ?? '',
      lastname: json['lastname'] ?? '',
      phoneNumber: json['phone_number'],
      image: json['image'],
      role: List<String>.from(json['role'] ?? []),
      verified: json['verified'] ?? false,
      isAdmin: json['is_admin'],
      access: json['access'] ?? '',
      refresh: json['refresh'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstname': firstname,
      'lastname': lastname,
      'phone_number': phoneNumber,
      'image': image,
      'role': role,
      'verified': verified,
      'is_admin': isAdmin,
      'access': access,
      'refresh': refresh,
    };
  }

  String get fullName => '$firstname $lastname';

  bool get isAdminUser => isAdmin ?? false;

  bool hasRole(String roleToCheck) {
    return role.contains(roleToCheck);
  }

  User copyWith({
    String? id,
    String? email,
    String? firstname,
    String? lastname,
    String? phoneNumber,
    String? image,
    List<String>? role,
    bool? verified,
    bool? isAdmin,
    String? access,
    String? refresh,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      firstname: firstname ?? this.firstname,
      lastname: lastname ?? this.lastname,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      image: image ?? this.image,
      role: role ?? this.role,
      verified: verified ?? this.verified,
      isAdmin: isAdmin ?? this.isAdmin,
      access: access ?? this.access,
      refresh: refresh ?? this.refresh,
    );
  }
}
