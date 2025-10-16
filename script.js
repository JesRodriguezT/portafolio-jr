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