export class ChatbotData {
  pluginPath: string;
  backendUrl: string;
  pseudoId: string;
  token: string;
  hasJustLoggedIn: boolean;
  isRunLocally?: boolean;

  constructor(pluginPath: string, backendUrl: string, pseudoId: string, token: string, hasJustLoggedIn: boolean) {
    this.pluginPath = pluginPath;
    this.backendUrl = backendUrl;
    this.pseudoId = pseudoId;
    this.token = token;
    this.hasJustLoggedIn = hasJustLoggedIn;
  }
}
