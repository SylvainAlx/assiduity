/**
 * js/storage.js - Gestionnaire de Persistance (LocalStorage & Fichiers JSON)
 * Permet de sauvegarder localement et de créer/charger des fichiers de sauvegarde.
 */

const STORAGE_KEY = 'LIGUE_ASSIDUITE_DATA_V1';

/**
 * Charge les données depuis le LocalStorage
 */
export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erreur lors du chargement LocalStorage:', err);
    return null;
  }
}

/**
 * Sauvegarde les données dans le LocalStorage
 */
export function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Erreur lors de la sauvegarde LocalStorage:', err);
    return false;
  }
}

/**
 * Exporte l'état complet de la Ligue sous forme de fichier JSON téléchargeable
 */
export function exportToJSONFile(data) {
  const payload = {
    app: "Ligue d'Assiduité",
    version: "1.0",
    exportDate: new Date().toISOString(),
    data: data
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `sauvegarde_ligue_assiduite_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Lit et valide un fichier JSON importé par l'utilisateur
 */
export function importFromJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // Vérification de la structure du fichier de sauvegarde
        if (parsed && parsed.data && Array.isArray(parsed.data.students)) {
          resolve(parsed.data);
        } else if (parsed && Array.isArray(parsed.students)) {
          // Format direct alternatif
          resolve(parsed);
        } else {
          reject(new Error('Format de fichier JSON invalide (structure attendue non trouvée).'));
        }
      } catch (err) {
        reject(new Error('Fichier JSON corrompu ou illisible.'));
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier.'));
    reader.readAsText(file);
  });
}

/**
 * Vide totalement le LocalStorage
 */
export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}
