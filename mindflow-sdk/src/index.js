// @mindflow/sdk - client SDK riusabile con appId e auth.
// Usa fetch nativo; pensato per ambienti browser/Vite.

const resolveApiUrl = () => {
  const isDev =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development') ||
    (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost');
  if (isDev) {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) return import.meta.env.VITE_API_URL;
    return '/api';
  }
  return 'https://mindflowbackend2--main.angelodamora.deno.net';
};

const withBoardId = (appId, payload = {}) => (appId ? { boardId: appId, ...(payload || {}) } : payload || {});

async function request(endpoint, { method = 'GET', body, headers } = {}, { requiresAuth = true } = {}, apiUrl) {
  const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('auth_token') : null;
  if (requiresAuth && !token) throw new Error('Authentication required');
  const baseUrl = apiUrl || resolveApiUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 204) return null;
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.details || data.error || data.message || res.statusText || `Errore ${res.status}`);
  return data;
}

// Entità specifiche per Angel Coaching
const ENTITY_DEFS = [
  { name: 'CoachProfile', slug: 'coachprofile' },
  { name: 'CoacheeProfile', slug: 'coacheeprofile' },
  { name: 'TimeSlot', slug: 'timeslot' },
  { name: 'Appointment', slug: 'appointment' },
  { name: 'Message', slug: 'message' },
  { name: 'Document', slug: 'document' },
  { name: 'CoachingAgreement', slug: 'coachingagreement' },
  { name: 'CoacheeAgreement', slug: 'coacheeagreement' },
  { name: 'CoacheeMatchingProfile', slug: 'coacheematchingprofile' },
  { name: 'User', slug: 'user' },
  // Entità standard MindFlow
  { name: 'Board', slug: 'board' },
  { name: 'Session', slug: 'session' },
  { name: 'ProjectDeployment', slug: 'projectdeployment' },
  { name: 'AIPrompt', slug: 'aiprompt' },
  { name: 'EntitySchema', slug: 'entityschema' },
  { name: 'FileStructure', slug: 'filestructure' },
  { name: 'ConversationHistory', slug: 'conversationhistory' },
  { name: 'entity', slug: 'entity' },
  { name: 'Process', slug: 'process' },
  { name: 'DevelopmentClass', slug: 'developmentclass' },
  { name: 'CodeOptimization', slug: 'codeoptimization' },
  { name: 'CodeTemplate', slug: 'codetemplate' },
  { name: 'TestCase', slug: 'testcase' },
  { name: 'Persona', slug: 'persona' },
  { name: 'UseCase', slug: 'usecase' },
  { name: 'BestPractice', slug: 'bestpractice' },
  { name: 'Capability', slug: 'capability' },
  { name: 'Translation', slug: 'translation' },
  { name: 'Service', slug: 'service' },
  { name: 'ServiceSubscription', slug: 'servicesubscription' },
  { name: 'ServiceUsage', slug: 'serviceusage' },
  { name: 'PagePermission', slug: 'pagepermission' },
  { name: 'SubscriptionPlan', slug: 'subscriptionplan' },
  { name: 'UserSubscription', slug: 'usersubscription' },
  { name: 'TokenUsage', slug: 'tokenusage' },
  { name: 'GeneratedFile', slug: 'generated_file', aliases: ['generated_file'] },
  { name: 'Log', slug: 'log', aliases: ['log'] },
  { name: 'PreviewStandardFile', slug: 'preview_standard_files', aliases: ['preview_standard_files'] }
];

const makeEntityClient = (slug, appId, requiresAuth, apiUrl) => {
  const base = `/entities/${slug}`;
  const listFn = (filter = null, sort = null) => {
    const params = new URLSearchParams();
    if (appId) params.set('boardId', appId);
    if (filter) params.set('filter', JSON.stringify(filter));
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    return request(qs ? `${base}?${qs}` : base, {}, { requiresAuth }, apiUrl);
  };
  const getFn = (id) => {
    const params = new URLSearchParams();
    if (appId) params.set('boardId', appId);
    const qs = params.toString();
    return request(qs ? `${base}/${id}?${qs}` : `${base}/${id}`, {}, { requiresAuth }, apiUrl);
  };
  const deleteFn = (id) => {
    const params = new URLSearchParams();
    if (appId) params.set('boardId', appId);
    const qs = params.toString();
    return request(qs ? `${base}/${id}?${qs}` : `${base}/${id}`, { method: 'DELETE' }, { requiresAuth }, apiUrl);
  };
  return {
    list: listFn,
    filter: listFn,
    get: getFn,
    create: (data) => request(base, { method: 'POST', body: withBoardId(appId, data) }, { requiresAuth }, apiUrl),
    update: (id, data) => request(`${base}/${id}`, { method: 'PUT', body: withBoardId(appId, data) }, { requiresAuth }, apiUrl),
    delete: deleteFn,
    bulkCreate: (records = []) =>
      request(`${base}/bulk`, { method: 'POST', body: records.map((r) => withBoardId(appId, r)) }, { requiresAuth }, apiUrl)
  };
};

const buildEntities = (appId, requiresAuth, apiUrl) => {
  const entities = {};
  ENTITY_DEFS.forEach(({ name, slug, aliases = [] }) => {
    const client = makeEntityClient(slug, appId, requiresAuth, apiUrl);
    entities[name] = client;
    aliases.forEach((alias) => { entities[alias] = client; });
  });
  return entities;
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (err) => reject(err);
  });

const buildIntegrations = (appId, requiresAuth, apiUrl) => ({
  Core: {
    InvokeLLM: (options) => request('/integrations/llm', { method: 'POST', body: withBoardId(appId, options) }, { requiresAuth }, apiUrl),
    SendEmail: ({ to, subject, body, from_name }) =>
      request('/integrations/email', { method: 'POST', body: withBoardId(appId, { to, subject, body, from_name }) }, { requiresAuth }, apiUrl),
    UploadFile: async ({ file }) => {
      const base64String = await fileToBase64(file);
      return request('/integrations/upload', { method: 'POST', body: withBoardId(appId, { file: base64String, filename: file.name }) }, { requiresAuth }, apiUrl);
    },
    GenerateImage: ({ prompt }) =>
      request('/integrations/generate-image', { method: 'POST', body: withBoardId(appId, { prompt }) }, { requiresAuth }, apiUrl),
    ExtractDataFromUploadedFile: ({ file_id }) =>
      request('/integrations/extract-data', { method: 'POST', body: withBoardId(appId, { file_id }) }, { requiresAuth }, apiUrl),
    CreateFileSignedUrl: ({ file_id }) =>
      request('/integrations/create-signed-url', { method: 'POST', body: withBoardId(appId, { file_id }) }, { requiresAuth }, apiUrl),
    UploadPrivateFile: async ({ file }) => {
      const base64String = await fileToBase64(file);
      return request('/integrations/upload-private', { method: 'POST', body: withBoardId(appId, { file: base64String, filename: file.name }) }, { requiresAuth }, apiUrl);
    }
  }
});

const buildFunctions = (appId, requiresAuth, apiUrl) => ({
  invoke: (functionName, params) =>
    request(`/functions/${functionName}`, { method: 'POST', body: withBoardId(appId, params) }, { requiresAuth }, apiUrl)
});

const buildAuth = (requiresAuth, apiUrl) => ({
  register: (email, password, full_name, plan_id = null, plan_data = null) =>
    request('/auth/register', { method: 'POST', body: { email, password, full_name, plan_id, plan_data } }, { requiresAuth: false }, apiUrl),
  login: async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: { email, password } }, { requiresAuth: false }, apiUrl);
    if (data.token && typeof localStorage !== 'undefined') localStorage.setItem('auth_token', data.token);
    return data;
  },
  me: () => request('/auth/me', {}, { requiresAuth }, apiUrl),
  updateMe: (data) => request('/auth/me', { method: 'PUT', body: data }, { requiresAuth }, apiUrl),
  logout: () => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem('auth_token');
    return Promise.resolve({ message: 'Logged out successfully' });
  },
  isAuthenticated: () => (typeof localStorage !== 'undefined') && !!localStorage.getItem('auth_token')
});

const buildHttp = (appId, requiresAuth, apiUrl) => ({
  get: (endpoint) => request(endpoint, {}, { requiresAuth }, apiUrl),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: withBoardId(appId, body) }, { requiresAuth }, apiUrl),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: withBoardId(appId, body) }, { requiresAuth }, apiUrl),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }, { requiresAuth }, apiUrl)
});

export function createClient({ appId = null, requiresAuth = true, apiUrl = null } = {}) {
  return {
    appId,
    requiresAuth,
    auth: buildAuth(requiresAuth, apiUrl),
    entities: buildEntities(appId, requiresAuth, apiUrl),
    integrations: buildIntegrations(appId, requiresAuth, apiUrl),
    functions: buildFunctions(appId, requiresAuth, apiUrl),
    ...buildHttp(appId, requiresAuth, apiUrl)
  };
}
