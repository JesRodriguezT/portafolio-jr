import { supabase } from './supabase-client.js';

// Se ejecuta cuando todo el HTML ha sido cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log("Script principal cargado y ejecutándose.");

    // --- LÓGICA DE AUTENTICACIÓN MEJORADA ---
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        // Mensaje para confirmar que el script encontró el formulario
        console.log("Formulario de login encontrado. Listo para recibir datos.");

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita que la página se recargue
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitButton = event.target.querySelector('button[type="submit"]');

            if (!email || !password) {
                alert("Por favor, ingresa un correo y una contraseña.");
                return;
            }

            // Deshabilitar botón para evitar múltiples clics
            submitButton.disabled = true;
            submitButton.textContent = 'Procesando...';

            // 1. Intenta iniciar sesión
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (signInError) {
                // 2. Si el login falla porque las credenciales son inválidas, intenta registrar al usuario
                if (signInError.message === 'Invalid login credentials') {
                    console.log("Usuario no encontrado, intentando registrar...");
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email: email,
                        password: password,
                    });

                    if (signUpError) {
                        alert('Error al registrar: ' + signUpError.message);
                    } else {
                        alert('¡Cuenta creada con éxito! Se ha iniciado sesión.');
                        window.location.href = 'index.html'; // Redirige a la página principal
                    }
                } else {
                    // Muestra otros errores de inicio de sesión (ej. contraseña muy corta)
                    alert('Error: ' + signInError.message);
                }
            } else {
                alert('¡Inicio de sesión exitoso!');
                window.location.href = 'index.html'; // Redirige a la página principal
            }

            // Reactivar el botón al finalizar
            submitButton.disabled = false;
            submitButton.textContent = 'Acceder';
        });
    } else {
        // Mensaje si NO se encuentra el formulario de login en la página actual
        console.log("No se encontró el formulario de login en esta página.");
    }

    // --- Lógica del Contador de Visitas ---
    async function registrarYContarVisita() {
      // 1. Registra una nueva visita
      const { error: insertError } = await supabase
        .from('visitas')
        .insert([{ created_at: new Date() }]);
        
      if (insertError) {
        console.error('Error al registrar la visita:', insertError);
        return;
      }
    
      // 2. Cuenta el total de visitas
      const { data, error: countError, count } = await supabase
        .from('visitas')
        .select('*', { count: 'exact', head: true }); 
    
      if (countError) {
        console.error('Error al contar las visitas:', countError);
        return;
      }
    
      // 3. Muestra el contador en la página
      const visitCounterElement = document.getElementById('visit-counter');
      if (visitCounterElement) {
        visitCounterElement.textContent = count;
      }
    }
    
    // Llama al contador solo si estamos en la página principal
    if (document.title.includes("Mi Portafolio de Arquitectura de Software")) {
        console.log("Página principal detectada, ejecutando contador de visitas.");
        registrarYContarVisita();
    }

});