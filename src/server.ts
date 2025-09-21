import { App } from './App';

console.log('Starte Gateway...');

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const appInstance = new App();
appInstance.getApp().listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});