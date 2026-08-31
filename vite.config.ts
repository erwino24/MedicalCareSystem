import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

function excelDatabasePlugin(): Plugin {
  return {
    name: 'excel-database-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/save-excel' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const body = Buffer.concat(chunks);
              const filePath = path.resolve(process.cwd(), 'public/OBGYN_Clinic_Database.xlsx');
              fs.writeFileSync(filePath, body);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Saved directly to public/OBGYN_Clinic_Database.xlsx' }));
            } catch (err: unknown) {
              const error = err as Error;
              console.error('Error writing to Excel file on disk:', error.message);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: error.message,
                isLocked: error.message.includes('EBUSY') || error.message.includes('permission')
              }));
            }
          });
          return;
        }
        next();
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    excelDatabasePlugin(),
  ],
})

