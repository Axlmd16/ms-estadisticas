import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/constants/app_constants.dart';

class CompleteAuthScreen extends StatefulWidget {
  const CompleteAuthScreen({super.key});

  @override
  State<CompleteAuthScreen> createState() => _CompleteAuthScreenState();
}

class _CompleteAuthScreenState extends State<CompleteAuthScreen> {
  bool _isLoginMode = true; // true = login, false = register
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _usernameController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _usernameController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      final success = await authProvider.login(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (success && mounted) {
        // This will automatically trigger AuthWrapper to show HomeScreen
        // No need to navigate manually
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? 'Error en el login'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _register() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      final success = await authProvider.register(
        username: _usernameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        firstname: _firstNameController.text.trim(),
        lastname: _lastNameController.text.trim(),
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('¡Registro exitoso! Ahora puedes iniciar sesión'),
            backgroundColor: Colors.green,
          ),
        );
        // Switch to login mode after successful registration
        setState(() {
          _isLoginMode = true;
          _clearControllers();
        });
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? 'Error en el registro'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _clearControllers() {
    _emailController.clear();
    _passwordController.clear();
    _confirmPasswordController.clear();
    _usernameController.clear();
    _firstNameController.clear();
    _lastNameController.clear();
  }

  void _toggleMode() {
    setState(() {
      _isLoginMode = !_isLoginMode;
      _clearControllers();
    });
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'El correo electrónico es obligatorio';
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Introduce un correo electrónico válido';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'La contraseña es obligatoria';
    }
    if (value.length < AppConstants.minPasswordLength) {
      return 'La contraseña debe tener al menos ${AppConstants.minPasswordLength} caracteres';
    }
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (!_isLoginMode) {
      if (value == null || value.isEmpty) {
        return 'Confirma tu contraseña';
      }
      if (value != _passwordController.text) {
        return 'Las contraseñas no coinciden';
      }
    }
    return null;
  }

  String? _validateUsername(String? value) {
    if (!_isLoginMode) {
      if (value == null || value.isEmpty) {
        return 'El nombre de usuario es obligatorio';
      }
      if (value.length < 3) {
        return 'El nombre de usuario debe tener al menos 3 caracteres';
      }
    }
    return null;
  }

  String? _validateName(String? value) {
    if (!_isLoginMode) {
      if (value == null || value.isEmpty) {
        return 'Este campo es obligatorio';
      }
      if (value.length < 2) {
        return 'Debe tener al menos 2 caracteres';
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 24),

                // Logo/Icon
                const Icon(
                  Icons.sports_soccer,
                  size: 64,
                  color: Colors.blue,
                ),
                const SizedBox(height: 8),

                // Title
                Text(
                  'SportBoard',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Welcome message
                Text(
                  _isLoginMode ? 'Bienvenido de vuelta' : 'Crear nueva cuenta',
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  _isLoginMode
                      ? 'Inicia sesión en tu cuenta'
                      : 'Únete a SportBoard',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Colors.grey[600],
                      ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Username field (only for register)
                if (!_isLoginMode) ...[
                  TextFormField(
                    controller: _usernameController,
                    decoration: const InputDecoration(
                      labelText: 'Nombre de usuario',
                      hintText: 'Introduce tu nombre de usuario',
                      prefixIcon: Icon(Icons.person_outline),
                      border: OutlineInputBorder(),
                    ),
                    validator: _validateUsername,
                  ),
                  const SizedBox(height: 16),
                ],

                // First Name field (only for register)
                if (!_isLoginMode) ...[
                  TextFormField(
                    controller: _firstNameController,
                    decoration: const InputDecoration(
                      labelText: 'Nombre',
                      hintText: 'Introduce tu nombre',
                      prefixIcon: Icon(Icons.person),
                      border: OutlineInputBorder(),
                    ),
                    validator: _validateName,
                  ),
                  const SizedBox(height: 16),
                ],

                // Last Name field (only for register)
                if (!_isLoginMode) ...[
                  TextFormField(
                    controller: _lastNameController,
                    decoration: const InputDecoration(
                      labelText: 'Apellido',
                      hintText: 'Introduce tu apellido',
                      prefixIcon: Icon(Icons.person),
                      border: OutlineInputBorder(),
                    ),
                    validator: _validateName,
                  ),
                  const SizedBox(height: 16),
                ],

                // Email field
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Correo electrónico',
                    hintText: 'Introduce tu correo electrónico',
                    prefixIcon: Icon(Icons.email_outlined),
                    border: OutlineInputBorder(),
                  ),
                  validator: _validateEmail,
                ),
                const SizedBox(height: 16),

                // Password field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Contraseña',
                    hintText: 'Introduce tu contraseña',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_off
                            : Icons.visibility,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                    border: const OutlineInputBorder(),
                  ),
                  validator: _validatePassword,
                ),
                const SizedBox(height: 16),

                // Confirm Password field (only for register)
                if (!_isLoginMode) ...[
                  TextFormField(
                    controller: _confirmPasswordController,
                    obscureText: _obscureConfirmPassword,
                    decoration: InputDecoration(
                      labelText: 'Confirmar contraseña',
                      hintText: 'Confirma tu contraseña',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureConfirmPassword
                              ? Icons.visibility_off
                              : Icons.visibility,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscureConfirmPassword = !_obscureConfirmPassword;
                          });
                        },
                      ),
                      border: const OutlineInputBorder(),
                    ),
                    validator: _validateConfirmPassword,
                  ),
                  const SizedBox(height: 16),
                ],

                const SizedBox(height: 8),

                // Login/Register button
                Consumer<AuthProvider>(
                  builder: (context, authProvider, child) {
                    return ElevatedButton(
                      onPressed: authProvider.isLoading
                          ? null
                          : (_isLoginMode ? _login : _register),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: authProvider.isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : Text(
                              _isLoginMode ? 'Iniciar Sesión' : 'Registrarse',
                              style: const TextStyle(fontSize: 16),
                            ),
                    );
                  },
                ),
                const SizedBox(height: 16),

                // Forgot password (only for login)
                if (_isLoginMode) ...[
                  TextButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text(
                                'Función de recuperar contraseña próximamente')),
                      );
                    },
                    child: const Text('¿Olvidaste tu contraseña?'),
                  ),
                  const SizedBox(height: 24),
                ],

                // Toggle between login and register
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(_isLoginMode
                        ? "¿No tienes una cuenta? "
                        : "¿Ya tienes una cuenta? "),
                    TextButton(
                      onPressed: _toggleMode,
                      child:
                          Text(_isLoginMode ? 'Regístrate' : 'Inicia sesión'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
