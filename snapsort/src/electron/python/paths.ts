import { getScriptsPath } from '../pathResolver.js';
import path from 'path';

// Directories
export const pythonDir = getScriptsPath('python');
export const embedDir = path.join(pythonDir, 'python-embed');
export const venvDir = path.join(pythonDir, 'venv');

// Files
export const pythonScript = path.join(pythonDir, 'main.py');
export const requirementsPath = path.join(pythonDir, 'requirements.txt');
export const pythonEmbedPath = path.join(embedDir, 'python.exe');