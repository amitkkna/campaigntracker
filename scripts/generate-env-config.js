// This script generates the env-config.js file with environment variables
// It's meant to be run during the build process

const fs = require('fs');
const path = require('path');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create the content of the env-config.js file
const envConfigContent = `// This file is generated during build
// It contains environment variables that are injected into the window object

window.ENV_SUPABASE_URL = '${supabaseUrl}';
window.ENV_SUPABASE_ANON_KEY = '${supabaseAnonKey}';
`;

// Ensure the public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write the file
const envConfigPath = path.join(publicDir, 'env-config.js');
fs.writeFileSync(envConfigPath, envConfigContent);

console.log('Generated env-config.js with environment variables');
