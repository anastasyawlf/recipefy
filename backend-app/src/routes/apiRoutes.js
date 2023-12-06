// routes/apiRoutes.js

const Joi = require('@hapi/joi');
const recipeController = require('../controllers/recipeController');

const apiRoutes = [
  {
    method: 'GET',
    path: '/',
    handler: async (request, h) => {
      // Periksa token dari Authorization header
      const idToken = request.headers.authorization;
      if (!idToken) {
        return h.response('Unauthorized').code(401);
      }

      // Verifikasi token menggunakan Firebase Admin SDK
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid; // Dapatkan userId dari token yang diverifikasi
        return { userId };
      } catch (error) {
        console.error('Error verifying token:', error);
        return h.response('Unauthorized').code(401);
      }
    }
  },
  {
    method: 'POST',
    path: '/recipes',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024, // Batas ukuran gambar (1MB)
      },
      validate: {
        payload: Joi.object({
          name: Joi.string().allow('').label('name'),
          image: Joi.any().required(),
          note: Joi.string().allow('').label('note'),
          ingredients: Joi.string().allow('').label('ingredients'),
          tools: Joi.string().allow('').label('tools'),
          instructions: Joi.string().allow('').label('instructions'),
          likes: Joi.number().integer().allow(null).label('likes'),
        }).options({ abortEarly: false }),
        failAction: async (request, h, err) => {
          throw err;
        },
      },
    },
    handler: recipeController.createRecipe,
  },
  {
    method: 'GET',
    path: '/recipes',
    handler: recipeController.getAllRecipes,
  },
  {
    method: 'GET',
    path: '/recipes/{recipesId}',
    options: {
      validate: {
        params: Joi.object({
          recipesId: Joi.string().required()
        })
      }
    },
    handler: recipeController.getRecipeById,
  },
  {
    method: 'PUT',
    path: '/recipes/{recipesId}',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024, // Batas ukuran gambar (10MB)
      },
      validate: {
        params: Joi.object({
          recipesId: Joi.string().required()
        }),
        payload: Joi.object({
          name: Joi.string().allow('').label('name'),
          image: Joi.any().optional(),
          note: Joi.string().allow('').label('note'),
          ingredients: Joi.string().allow('').label('ingredients'),
          tools: Joi.string().allow('').label('tools'),
          instructions: Joi.string().allow('').label('instructions'),
          likes: Joi.number().integer().allow(null).label('likes'),
        }).options({ abortEarly: false }),
        failAction: async (request, h, err) => {
          throw err;
        },
      }
    },
    handler: recipeController.updateRecipeById,
  },
  {
    method: 'DELETE',
    path: '/recipes/{recipesId}',
    options: {
      validate: {
        params: Joi.object({
          recipesId: Joi.string().required()
        })
      }
    },
    handler: recipeController.deleteRecipeById,
  }
];

module.exports = apiRoutes;
