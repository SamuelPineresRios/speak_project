// Script para limpiar caché de localStorage en el navegador
// Copia y pega esto en la consola del navegador (F12 > Console)

// Opción 1: Limpiar TODO el localStorage
localStorage.clear();
console.log('✅ localStorage completamente limpiado');

// Opción 2: Si solo quieres limpiar misiones
const keysToDelete = Object.keys(localStorage).filter(key => 
  key.includes('mission') || 
  key.includes('saludos') ||
  key.toLowerCase().includes('greeting')
);
keysToDelete.forEach(key => {
  console.log('Borrando:', key);
  localStorage.removeItem(key);
});

// Opción 3: Limpiar sessionStorage también
sessionStorage.clear();
console.log('✅ sessionStorage completamente limpiado');

// Luego recarga la página
console.log('Recargando página...');
location.reload();
