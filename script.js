// Se ejecuta cuando el contenido de la página se ha cargado por completo
document.addEventListener('DOMContentLoaded', () => {

  const darkModeButton = document.getElementById('darkModeToggle');
  const body = document.body;

  // Función para activar o desactivar el modo oscuro
  const toggleDarkMode = () => {
    // Esta función sigue igual, ya que solo alterna la clase.
    // El CSS se encarga de definir cómo se ve cada modo.
    body.classList.toggle('dark-mode'); 

    // Opcional: Guardar la preferencia del usuario
    if (body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light'); // Asumiendo que el default es light
    }
  };

  // Comprobar si el usuario ya tenía un tema guardado
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
  }

  // Asignar el evento click al botón
  if (darkModeButton) {
    darkModeButton.addEventListener('click', toggleDarkMode);
  }

});
// script.js
import { supabase } from './supabase-client.js';

// ... (tu código existente del contador, etc.) ...

// --- LÓGICA DE AUTENTICACIÓN ---

const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button'); // Necesitaremos un botón de logout

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Intenta iniciar sesión
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
      // Opcional: Intenta registrar al usuario si el login falla (ej: si no existe)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) {
        alert('Error al registrar usuario: ' + signUpError.message);
      } else {
        alert('Cuenta creada. ¡Bienvenido!');
        window.location.href = 'index.html'; // Redirige después de registrar
      }
    } else {
      alert('Inicio de sesión exitoso. ¡Bienvenido!');
      window.location.href = 'index.html'; // Redirige después de iniciar sesión
    }
  });
}