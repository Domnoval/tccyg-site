import { handleCmsAuth } from '../lib/cms-auth.js';

export default {
  fetch(request) {
    return handleCmsAuth(request, 'auth');
  },
};
