# 1. Basis-Image (sicherer und gepflegter)
FROM node:20-slim AS base

# 2. Setzt Arbeitsverzeichnis
WORKDIR /app

# 3. Kopiere nur das Notwendigste für Installation
COPY package*.json ./

# 4. Installiere Abhängigkeiten ohne devDependencies
RUN npm ci --omit=dev

# 5. Kopiere restlichen Code
COPY . .

# 6. Baue das Projekt
RUN npm run build

# 7. Verwende kleineres, sauberes Laufzeit-Image
FROM node:20-slim AS runtime

WORKDIR /app

# 8. Nur das Nötigste kopieren
COPY --from=base /app/dist ./dist
COPY --from=base /app/package*.json ./

# 9. Installiere nur Produktions-Abhängigkeiten
RUN npm ci --omit=dev --ignore-scripts

# 10. Nutze non-root User (sicherheitsrelevant)
RUN useradd -m appuser
USER appuser

# 11. Starte App
CMD ["node", "dist/server.js"]
