import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // --- Identificar la semana actual a partir de la URL ---
    const path = window.location.pathname;
    const pageName = path.split("/").pop(); // ej: "semana1.html"
    const semanaId = pageName.split(".")[0]; // ej: "semana1"

    // --- Verificar si hay una sesión de usuario activa ---
    const { data: { session } } = await supabase.auth.getSession();

    const uploadFormContainer = document.getElementById('upload-form-container');
    const logoutMenuItem = document.getElementById('logout-menu-item');

    if (session) {
        // --- Si el usuario está autenticado ---
        console.log('Usuario autenticado:', session.user.email);
        uploadFormContainer.style.display = 'block';
        if (logoutMenuItem) logoutMenuItem.style.display = 'list-item';
        
        const uploadButton = document.getElementById('upload-button');
        uploadButton.addEventListener('click', () => subirPdf(semanaId, session));
    } else {
        // --- Si el usuario NO está autenticado ---
        console.log('No hay sesión activa.');
        uploadFormContainer.style.display = 'none';
        if (logoutMenuItem) logoutMenuItem.style.display = 'none';
    }
    
    // Cargar la lista de PDFs para todos los visitantes
    await cargarPdfs(semanaId, session);
});

async function cargarPdfs(semanaId, session) {
    const pdfList = document.getElementById('pdf-list');
    if (!pdfList) return;
    pdfList.innerHTML = '<li>Cargando...</li>';

    const { data, error } = await supabase
        .from('archivos')
        .select('*')
        .eq('semana_id', semanaId);

    if (error) {
        pdfList.innerHTML = '<li>Error al cargar archivos.</li>';
        console.error('Error cargando PDFs:', error);
        return;
    }
    
    if (data.length === 0) {
        // Si no hay archivos, removemos la lista para que no ocupe espacio
        pdfList.innerHTML = ''; 
        // Verificamos si ya existe un mensaje para no duplicarlo
        const parent = pdfList.parentNode;
        if (!parent.querySelector('.no-files-message')) {
            const noFilesMessage = document.createElement('p');
            noFilesMessage.className = 'no-files-message'; // Añadimos una clase para identificarlo
            noFilesMessage.textContent = 'Aún no hay archivos para esta semana.';
            parent.appendChild(noFilesMessage);
        }
        return;
    }
    
    // Limpiamos mensajes previos de "no hay archivos" antes de añadir la cuadrícula
    const parent = pdfList.parentNode;
    const existingMessage = parent.querySelector('.no-files-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // NUEVA ESTRUCTURA HTML PARA CADA TARJETA
    const bucketUrl = 'https://ppyflcwibvjmfghfsxnm.supabase.co/storage/v1/object/public/pdfs/';
    pdfList.innerHTML = data.map(archivo => `
        <li>
            <div class="file-icon">📄</div>
            <a href="${bucketUrl}${archivo.path_storage}" target="_blank" title="${archivo.nombre_archivo}">
                ${archivo.nombre_archivo}
            </a>
            ${session ? `<button class="delete-button" data-path="${archivo.path_storage}" data-id="${archivo.id}">Eliminar</button>` : ''}
        </li>
    `).join('');

    if (session) {
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const path = e.target.dataset.path;
                const id = e.target.dataset.id;
                if (confirm('¿Estás seguro de que quieres eliminar este archivo? Esta acción es irreversible.')) {
                    eliminarPdf(path, id, semanaId, session);
                }
            });
        });
    }
}

async function subirPdf(semanaId, session) {
    const fileInput = document.getElementById('pdf-upload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor, selecciona un archivo PDF.');
        return;
    }

    // 1. Sube el archivo a Supabase Storage
    const filePath = `${session.user.id}/${semanaId}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file);

    if (uploadError) {
        alert('Error al subir el archivo: ' + uploadError.message);
        return;
    }

    // 2. Guarda la referencia en la tabla 'archivos'
    const { error: dbError } = await supabase
        .from('archivos')
        .insert({
            nombre_archivo: file.name,
            path_storage: filePath,
            semana_id: semanaId,
            user_id: session.user.id
        });

    if (dbError) {
        alert('Error al guardar la referencia del archivo: ' + dbError.message);
    } else {
        alert('¡Archivo subido con éxito!');
        fileInput.value = ''; // Limpia el input
        await cargarPdfs(semanaId, session); // Recarga la lista
    }
}

async function eliminarPdf(filePath, recordId, semanaId, session) {
    // 1. Elimina el archivo de Supabase Storage
    const { error: storageError } = await supabase.storage
        .from('pdfs')
        .remove([filePath]);

    if (storageError) {
        alert('Error al eliminar el archivo del almacenamiento: ' + storageError.message);
        return;
    }

    // 2. Elimina el registro de la base de datos
    const { error: dbError } = await supabase
        .from('archivos')
        .delete()
        .eq('id', recordId);

    if (dbError) {
        alert('Error al eliminar la referencia del archivo: ' + dbError.message);
    } else {
        alert('¡Archivo eliminado con éxito!');
        await cargarPdfs(semanaId, session); // Recarga la lista
    }
}

// --- Lógica para Cerrar Sesión ---
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error al cerrar sesión:', error);
        } else {
            window.location.reload(); // Recarga la página para actualizar la vista
        }
    });
}