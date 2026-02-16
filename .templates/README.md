# Template Files

Questa cartella contiene file template standard che possono essere riutilizzati per generare nuovi progetti React + Vite + Tailwind + shadcn/ui senza dover generare il codice dall'LLM.

## Scopo

Ridurre i token utilizzati nelle risposte LLM copiando file standard invece di generarli ogni volta.

## File Template Disponibili

### File Completamente Standard (100% riutilizzabili)

- **`postcss.config.js`** - Configurazione PostCSS standard per Tailwind
- **`eslint.config.js`** - Configurazione ESLint standard per React + Vite
- **`jsconfig.json`** - Configurazione path alias standard
- **`components.json`** - Configurazione shadcn/ui standard
- **`tailwind.config.js`** - Configurazione Tailwind standard per shadcn/ui
- **`src/main.jsx`** - Entry point React standard
- **`src/index.css`** - CSS standard con variabili shadcn/ui

### File con Variabili

- **`index.html`** - Template HTML con placeholder `{{PROJECT_NAME}}`

## Utilizzo

### Per l'LLM Backend

Quando si genera un nuovo progetto:

1. **Per file completamente standard**: Copiare direttamente dal template
2. **Per file con variabili**: Copiare e sostituire i placeholder
3. **Per file personalizzati**: Generare normalmente dall'LLM

### Esempio

```javascript
// Invece di generare:
// "Created postcss.config.js" (con tutto il contenuto)

// Rispondere:
"Created from template: .templates/postcss.config.js"
```

## Risparmio Token Stimato

- **Per progetto completo**: ~1,500-2,000 token risparmiati
- **Per 100 progetti/anno**: ~150,000-200,000 token risparmiati

## Manutenzione

I template devono essere aggiornati quando:
- Cambiano le versioni delle librerie principali
- Vengono aggiunte nuove configurazioni standard
- Cambiano le best practices del framework

## Note

- I template sono specifici per lo stack: React 18 + Vite 6 + Tailwind 3 + shadcn/ui
- Per altri stack tecnologici, creare nuovi template nella stessa struttura
