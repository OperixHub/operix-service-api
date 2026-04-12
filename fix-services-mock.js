import fs from 'fs';
import path from 'path';

let file = path.join(process.cwd(), 'tests', 'integration', 'services.test.ts');
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(
  "if (sql.includes('INSERT INTO services')) return { rows: [{ id: 1 }], rowCount: 1 };",
  "if (sql.includes('INSERT INTO order_of_service')) return { rows: [{ cod_order: 'OS123' }], rowCount: 1 };\n      if (sql.includes('INSERT INTO services')) return { rows: [{ id: 1 }], rowCount: 1 };"
);
fs.writeFileSync(file, content);
