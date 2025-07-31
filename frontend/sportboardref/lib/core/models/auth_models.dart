class LoginRequest {
  final String email;
  final String password;

  LoginRequest({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }
}

class RegisterRequest {
  final String username;
  final String email;
  final String password;
  final String firstname;
  final String lastname;
  final String? phoneNumber;
  final List<String> role;

  RegisterRequest({
    required this.username,
    required this.email,
    required this.password,
    required this.firstname,
    required this.lastname,
    this.phoneNumber,
    this.role = const ['ESPECTATOR'],
  });

  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'email': email,
      'password': password,
      'firstname': firstname,
      'lastname': lastname,
      'phone_number': phoneNumber,
      'role': role,
    };
  }
}

class RefreshTokenRequest {
  final String refresh;

  RefreshTokenRequest({required this.refresh});

  Map<String, dynamic> toJson() {
    return {
      'refresh': refresh,
    };
  }
}

class RefreshTokenResponse {
  final String access;

  RefreshTokenResponse({required this.access});

  factory RefreshTokenResponse.fromJson(Map<String, dynamic> json) {
    return RefreshTokenResponse(
      access: json['access'] ?? '',
    );
  }
}

class ChangePasswordRequest {
  final String oldPassword;
  final String newPassword;

  ChangePasswordRequest({
    required this.oldPassword,
    required this.newPassword,
  });

  Map<String, dynamic> toJson() {
    return {
      'old_password': oldPassword,
      'new_password': newPassword,
    };
  }
}

class ResetPasswordRequest {
  final String email;

  ResetPasswordRequest({required this.email});

  Map<String, dynamic> toJson() {
    return {
      'email': email,
    };
  }
}

class CreatePasswordRequest {
  final String token;
  final String newPassword;

  CreatePasswordRequest({
    required this.token,
    required this.newPassword,
  });

  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'new_password': newPassword,
    };
  }
}

class UpdateProfileRequest {
  final String? firstname;
  final String? lastname;
  final String? phoneNumber;
  final String? image;

  UpdateProfileRequest({
    this.firstname,
    this.lastname,
    this.phoneNumber,
    this.image,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (firstname != null) data['firstname'] = firstname;
    if (lastname != null) data['lastname'] = lastname;
    if (phoneNumber != null) data['phone_number'] = phoneNumber;
    if (image != null) data['image'] = image;
    return data;
  }
}
