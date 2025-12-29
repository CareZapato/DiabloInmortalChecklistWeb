import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState({ username: '', password: '' });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email || `${username}@diablo.local`, password);
      setSavedCredentials({ username, password });
      setRegistrationSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse');
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/');
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    alert(`${field} copiado al portapapeles`);
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 px-4">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="bg-black/60 backdrop-blur-sm border border-diablo-gold/30 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-diablo-gold/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-diablo-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-diablo-gold mb-2">¡Registro Exitoso!</h2>
              <p className="text-gray-300 text-sm">Guarda tus credenciales de acceso</p>
            </div>

            {/* Credentials Display */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-900/80 border border-diablo-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-diablo-gold uppercase tracking-wider">Usuario</label>
                  <button
                    onClick={() => copyToClipboard(savedCredentials.username, 'Usuario')}
                    className="text-xs text-gray-400 hover:text-diablo-gold transition-colors"
                  >
                    📋 Copiar
                  </button>
                </div>
                <p className="text-white font-mono text-lg break-all">{savedCredentials.username}</p>
              </div>

              <div className="bg-gray-900/80 border border-diablo-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-diablo-gold uppercase tracking-wider">Contraseña</label>
                  <button
                    onClick={() => copyToClipboard(savedCredentials.password, 'Contraseña')}
                    className="text-xs text-gray-400 hover:text-diablo-gold transition-colors"
                  >
                    📋 Copiar
                  </button>
                </div>
                <p className="text-white font-mono text-lg break-all">{savedCredentials.password}</p>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-200 text-sm leading-relaxed">
                ⚠️ <span className="font-semibold">Importante:</span> Guarda estas credenciales en un lugar seguro. 
                No podrás recuperarlas después.
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-diablo-gold to-yellow-600 hover:from-yellow-600 hover:to-diablo-gold text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Continuar al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 px-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-black/60 backdrop-blur-sm border border-diablo-gold/30 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="text-6xl">⚔️</div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-diablo-gold via-yellow-500 to-diablo-gold bg-clip-text text-transparent mb-2">
              Crear Cuenta
            </h1>
            <p className="text-gray-400 text-sm">Únete a la batalla contra las fuerzas del mal</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-diablo-gold uppercase tracking-wider mb-2">
                Nombre de Usuario *
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={50}
                className="w-full px-4 py-3 bg-gray-900/50 border border-diablo-border rounded-lg focus:outline-none focus:border-diablo-gold focus:ring-1 focus:ring-diablo-gold text-white placeholder-gray-500 transition-all"
                placeholder="Guerrero123"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email <span className="text-gray-600">(Opcional)</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-diablo-border rounded-lg focus:outline-none focus:border-diablo-gold focus:ring-1 focus:ring-diablo-gold text-white placeholder-gray-500 transition-all"
                placeholder="correo@ejemplo.com"
              />
              <p className="text-xs text-gray-600 mt-1">Para futuras mejoras (recuperación de cuenta)</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-diablo-gold uppercase tracking-wider mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-diablo-border rounded-lg focus:outline-none focus:border-diablo-gold focus:ring-1 focus:ring-diablo-gold text-white placeholder-gray-500 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-diablo-gold transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-diablo-gold uppercase tracking-wider mb-2">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-diablo-border rounded-lg focus:outline-none focus:border-diablo-gold focus:ring-1 focus:ring-diablo-gold text-white placeholder-gray-500 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-diablo-gold transition-colors"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-diablo-gold to-yellow-600 hover:from-yellow-600 hover:to-diablo-gold text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                '🛡️ Registrarse'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/login" 
                className="text-diablo-gold hover:text-yellow-400 font-semibold transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-4 bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-xs text-center leading-relaxed">
            🔒 Tu contraseña será encriptada con bcrypt. Guárdala después del registro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
