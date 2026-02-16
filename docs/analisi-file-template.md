# Analisi File Template - Ottimizzazione Token LLM

## Obiettivo
Identificare i file di configurazione e boilerplate che possono essere creati come template standard invece di essere generati dall'LLM, riducendo così i token utilizzati nelle risposte.

## Metodologia
Analisi dei file di configurazione standard di un progetto React + Vite + Tailwind + shadcn/ui per identificare:
- File completamente standard (100% riutilizzabili)
- File parzialmente standard (con piccole personalizzazioni)
- File specifici del progetto (non template)

---

## 📋 Risultati Analisi

### ✅ File Completamente Standard (100% Template)

Questi file sono **identici** per tutti i progetti con lo stesso stack tecnologico e possono essere creati automaticamente senza generazione LLM.

#### 1. **postcss.config.js** ⭐⭐⭐⭐⭐
**Priorità**: ALTISSIMA  
**Risparmio Token**: ~50-100 token per generazione

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Motivazione**: 
- File completamente standard per progetti Vite + Tailwind
- Nessuna personalizzazione necessaria
- Identico per tutti i progetti

**Raccomandazione**: Creare template in `.templates/postcss.config.js`

---

#### 2. **eslint.config.js** ⭐⭐⭐⭐⭐
**Priorità**: ALTISSIMA  
**Risparmio Token**: ~200-300 token per generazione

```javascript
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

**Motivazione**:
- Configurazione standard ESLint per React + Vite
- Solo piccole variazioni possibili (regole custom)
- Identico per la maggior parte dei progetti

**Raccomandazione**: Creare template in `.templates/eslint.config.js`

---

#### 3. **src/main.jsx** ⭐⭐⭐⭐
**Priorità**: ALTA  
**Risparmio Token**: ~80-120 token per generazione

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)
```

**Motivazione**:
- Entry point standard React 18
- Solo il nome del componente App potrebbe cambiare (ma spesso è sempre `App`)
- Struttura identica per tutti i progetti

**Raccomandazione**: Creare template in `.templates/src/main.jsx`

---

### ⚠️ File Parzialmente Standard (Template con Variabili)

Questi file hanno una struttura standard ma richiedono piccole personalizzazioni. Possono essere template con placeholder.

#### 4. **index.html** ⭐⭐⭐⭐
**Priorità**: ALTA  
**Risparmio Token**: ~100-150 token per generazione

**Template Standard**:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{PROJECT_NAME}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Variabili**:
- `{{PROJECT_NAME}}` - Nome del progetto

**Motivazione**:
- Struttura HTML completamente standard
- Solo il titolo cambia tra progetti
- Facilmente templateizzabile

**Raccomandazione**: Creare template in `.templates/index.html` con placeholder `{{PROJECT_NAME}}`

---

#### 5. **jsconfig.json** ⭐⭐⭐⭐
**Priorità**: ALTA  
**Risparmio Token**: ~80-100 token per generazione

**Template Standard**:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "jsx": "react-jsx"
  },
  "include": ["src/**/*.js", "src/**/*.jsx"]
}
```

**Variabili**: Nessuna (completamente standard)

**Motivazione**:
- Configurazione standard per progetti React con path alias
- Identico per tutti i progetti che usano `@/` alias
- Potrebbe avere alias aggiuntivi, ma la struttura base è sempre uguale

**Raccomandazione**: Creare template in `.templates/jsconfig.json`

---

#### 6. **components.json** ⭐⭐⭐
**Priorità**: MEDIA  
**Risparmio Token**: ~150-200 token per generazione

**Template Standard**:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

**Variabili**:
- `style` - potrebbe essere "new-york" o "default"
- `baseColor` - potrebbe variare
- `iconLibrary` - potrebbe variare

**Motivazione**:
- Configurazione standard shadcn/ui
- Solo piccole variazioni possibili
- La maggior parte dei progetti usa valori standard

**Raccomandazione**: Creare template in `.templates/components.json` con valori di default

---

#### 7. **tailwind.config.js** ⭐⭐⭐
**Priorità**: MEDIA  
**Risparmio Token**: ~300-400 token per generazione

**Template Standard**: La configurazione è standard per shadcn/ui, ma è lunga (~90 righe).

**Variabili**:
- Nessuna variabile necessaria (configurazione standard shadcn/ui)

**Motivazione**:
- Configurazione standard per progetti shadcn/ui
- Identica per tutti i progetti che usano shadcn/ui
- File molto lungo, quindi alto risparmio token

**Raccomandazione**: Creare template in `.templates/tailwind.config.js`

---

#### 8. **src/index.css** ⭐⭐⭐
**Priorità**: MEDIA  
**Risparmio Token**: ~400-500 token per generazione

**Template Standard**: File molto lungo (~160 righe) con variabili CSS standard per shadcn/ui.

**Variabili**:
- Nessuna variabile necessaria (CSS standard shadcn/ui)

**Motivazione**:
- CSS completamente standard per shadcn/ui
- Identico per tutti i progetti shadcn/ui
- File molto lungo, quindi alto risparmio token

**Raccomandazione**: Creare template in `.templates/src/index.css`

---

### 🔧 File con Personalizzazioni (Template Parziali)

Questi file hanno una struttura base standard ma richiedono personalizzazioni specifiche del progetto.

#### 9. **vite.config.js** ⭐⭐
**Priorità**: BASSA-MEDIA  
**Risparmio Token**: ~150-200 token per generazione

**Template Base**:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
```

**Personalizzazioni Comuni**:
- Alias aggiuntivi (es: `@mindflow/sdk`)
- Configurazioni server specifiche
- Plugin aggiuntivi

**Motivazione**:
- Struttura base standard
- Ma spesso ha personalizzazioni progetto-specifiche
- Potrebbe essere template base con commenti per personalizzazioni

**Raccomandazione**: Creare template base in `.templates/vite.config.js` con sezioni commentate per personalizzazioni

---

#### 10. **package.json** ⭐
**Priorità**: BASSA  
**Risparmio Token**: Variabile

**Template Base**: Solo struttura base, dipendenze variano molto.

**Personalizzazioni**:
- Nome progetto
- Dipendenze specifiche
- Script custom

**Motivazione**:
- Struttura base standard ma dipendenze variano molto
- Troppo specifico per essere template completo
- Potrebbe essere template minimo con solo struttura base

**Raccomandazione**: Creare template minimo in `.templates/package.json.base` con solo struttura base

---

#### 11. **src/App.jsx** ⭐
**Priorità**: BASSA  
**Risparmio Token**: ~50-100 token per generazione

**Template Base**:
```jsx
import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App
```

**Personalizzazioni**:
- Struttura varia molto tra progetti
- Routing, providers, layout diversi

**Motivazione**:
- Troppo specifico per essere template standard
- Ogni progetto ha struttura diversa

**Raccomandazione**: Non creare template (troppo variabile)

---

## 📊 Riepilogo Risparmio Token

| File | Priorità | Risparmio Token/Generazione | Template Consigliato |
|------|----------|----------------------------|---------------------|
| `postcss.config.js` | ⭐⭐⭐⭐⭐ | 50-100 | ✅ Sì |
| `eslint.config.js` | ⭐⭐⭐⭐⭐ | 200-300 | ✅ Sì |
| `src/main.jsx` | ⭐⭐⭐⭐ | 80-120 | ✅ Sì |
| `index.html` | ⭐⭐⭐⭐ | 100-150 | ✅ Sì (con variabile) |
| `jsconfig.json` | ⭐⭐⭐⭐ | 80-100 | ✅ Sì |
| `components.json` | ⭐⭐⭐ | 150-200 | ✅ Sì |
| `tailwind.config.js` | ⭐⭐⭐ | 300-400 | ✅ Sì |
| `src/index.css` | ⭐⭐⭐ | 400-500 | ✅ Sì |
| `vite.config.js` | ⭐⭐ | 150-200 | ⚠️ Parziale |
| `package.json` | ⭐ | Variabile | ⚠️ Solo base |
| `src/App.jsx` | ⭐ | 50-100 | ❌ No |

**Totale Risparmio Stimato**: ~1,560-2,170 token per generazione completa progetto

---

## 🎯 Raccomandazioni Implementative

### Fase 1: Template Completamente Standard (Implementazione Immediata)

Creare una cartella `.templates/` nella root del progetto con:

1. **`.templates/postcss.config.js`** - Copia esatta
2. **`.templates/eslint.config.js`** - Copia esatta
3. **`.templates/src/main.jsx`** - Copia esatta
4. **`.templates/jsconfig.json`** - Copia esatta
5. **`.templates/components.json`** - Copia esatta
6. **`.templates/tailwind.config.js`** - Copia esatta
7. **`.templates/src/index.css`** - Copia esatta

### Fase 2: Template con Variabili

8. **`.templates/index.html`** - Con placeholder `{{PROJECT_NAME}}`

### Fase 3: Template Parziali (Opzionale)

9. **`.templates/vite.config.js`** - Base con commenti per personalizzazioni
10. **`.templates/package.json.base`** - Solo struttura base

---

## 💡 Strategia di Utilizzo

### Per l'LLM Backend

Quando l'LLM deve generare un nuovo progetto:

1. **Prima di generare**, controllare se esistono template in `.templates/`
2. **Per file completamente standard**: 
   - Non generare il file
   - Invece, rispondere: `"File creato da template: .templates/postcss.config.js"`
3. **Per file con variabili**:
   - Usare template e sostituire variabili
   - Rispondere: `"File creato da template: .templates/index.html (sostituito {{PROJECT_NAME}})"`
4. **Per file personalizzati**:
   - Generare normalmente

### Esempio Risposta LLM Ottimizzata

**Prima (Generazione Completa)**:
```markdown
Created postcss.config.js
Created eslint.config.js
Created src/main.jsx
...
```

**Dopo (Con Template)**:
```markdown
Created from template: .templates/postcss.config.js
Created from template: .templates/eslint.config.js  
Created from template: .templates/src/main.jsx
Created from template: .templates/index.html (PROJECT_NAME=Angel Coaching)
Created vite.config.js (customized with @mindflow/sdk alias)
...
```

**Risparmio**: ~1,500-2,000 token per progetto completo

---

## 🔄 Integrazione con Sistema di Generazione

### Modifiche Necessarie al Backend

1. **Aggiungere logica di template detection**:
   - Prima di generare file, controllare se esiste template
   - Se esiste template standard → copiare invece di generare
   - Se esiste template con variabili → copiare e sostituire

2. **Aggiungere endpoint per template**:
   - `GET /api/templates` - Lista template disponibili
   - `GET /api/templates/:filename` - Ottieni template specifico

3. **Modificare prompt system**:
   - Istruire LLM a usare template quando disponibili
   - Ridurre token allocation per file template

### Struttura Cartella Template

```
.templates/
├── postcss.config.js
├── eslint.config.js
├── jsconfig.json
├── components.json
├── tailwind.config.js
├── index.html (con {{PROJECT_NAME}})
├── vite.config.js (base con commenti)
├── package.json.base (solo struttura)
└── src/
    ├── main.jsx
    └── index.css
```

---

## ✅ Checklist Implementazione

- [ ] Creare cartella `.templates/`
- [ ] Copiare file completamente standard (7 file)
- [ ] Creare `index.html` con placeholder
- [ ] Creare `vite.config.js` base con commenti
- [ ] Creare `package.json.base` minimo
- [ ] Documentare sistema template nel README
- [ ] Modificare backend per supportare template
- [ ] Aggiornare prompt system LLM
- [ ] Testare generazione progetto con template

---

## 📈 Impatto Stimato

### Per Progetto Singolo
- **Risparmio Token**: ~1,500-2,000 token
- **Riduzione Costi**: ~30-40% per generazione progetto completo
- **Velocità**: Generazione più veloce (meno token da processare)

### Per 100 Progetti/Anno
- **Risparmio Token**: ~150,000-200,000 token
- **Riduzione Costi**: Significativa su scala

---

## 🎓 Note Finali

1. **Template devono essere mantenuti**: Se cambiano le versioni delle librerie, aggiornare template
2. **Versioning**: Considerare versioning dei template (es: `template-v1/`, `template-v2/`)
3. **Documentazione**: Documentare ogni template e le sue variabili
4. **Testing**: Testare che i template generino progetti funzionanti

---

**Data Analisi**: 2026-01-31  
**Analista**: AI Assistant  
**Versione**: 1.0
