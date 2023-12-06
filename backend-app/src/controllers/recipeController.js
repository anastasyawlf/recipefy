// controllers/recipeController.js

const pool = require('../config/database');
const { uploadImageToStorage } = require('../utils/imageUploader');
const admin = require("firebase-admin");
const { nanoid } = require('nanoid');

// Inisialisasi Firebase Admin SDK
var serviceAccountFirebase = require("../JSON/serviceFirebase.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountFirebase),
  databaseURL: "https://recipefy-2a678-default-rtdb.firebaseio.com"
});

// Fungsi untuk menyimpan resep di database
const saveRecipeToDatabase = async (recipeData) => {
  const {
    name,
    imageUrl,
    note,
    ingredients,
    tools,
    instructions,
    likes,
  } = recipeData;

  const connection = await pool.getConnection();

  const [result] = await connection.query('INSERT INTO data_recipe (id, name, image_url, note, ingredients, tools, instructions, likes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [nanoid(16), name, imageUrl, note, ingredients, tools, instructions, likes]);

  connection.release();

  return result;
};

// Controller untuk operasi terkait resep
const recipeController = {
  createRecipe: async (request, h) => {
    try {
      const {
        name,
        image,
        note,
        ingredients,
        tools,
        instructions,
        likes,
      } = request.payload;

      if (!name) {
        return h.response({
          status: 'fail',
          message: "Gagal menambahkan resep. Mohon isi nama resep",
        }).code(400);
      }

      if (!image || !image.hapi.filename) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan resep. Mohon sertakan gambar resep',
        }).code(400);
      }

      const imageUrl = await uploadImageToStorage(image);

      await saveRecipeToDatabase({
        name,
        imageUrl,
        note,
        ingredients,
        tools,
        instructions,
        likes,
      });

      return h.response({ message: 'Data resep berhasil disimpan', imageUrl });
    } catch (error) {
      return h.response({ error: error.message }).code(500);
    }
  },

  getAllRecipes: async (request, h) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM data_recipe');
      connection.release();

      return h.response({ recipes: rows });
    } catch (error) {
      return h.response({ error: error.message }).code(500);
    }
  },

  getRecipeById: async (request, h) => {
    try {
      const { recipesId } = request.params;

      const connection = await pool.getConnection();
      const [result] = await connection.query('SELECT * FROM data_recipe WHERE id = ?', [recipesId]);
      connection.release();

      if (result.length === 0) {
        return h.response({
          status: 'fail',
          message: 'Resep tidak ditemukan'
        }).code(404);
      }

      return h.response({ recipe: result[0] });
    } catch (error) {
      return h.response({ error: error.message }).code(500);
    }
  },

  updateRecipeById: async (request, h) => {
    try {
      const { recipesId } = request.params;
      const {
        name,
        image,
        note,
        ingredients,
        tools,
        instructions,
        likes,
      } = request.payload;

      const connection = await pool.getConnection();

      const [result] = await connection.query('SELECT * FROM data_recipe WHERE id = ?', [recipesId]);

      if (result.length === 0) {
        connection.release();
        return h.response({
          status: 'fail',
          message: 'Resep tidak ditemukan'
        }).code(404);
      }

      let imageUrl = result[0].image_url;
      if (image) {
        imageUrl = await uploadImageToStorage(image);
      }

      const [updateResult] = await connection.query('UPDATE data_recipe SET name = ?, image_url = ?, note = ?, ingredients = ?, tools = ?, instructions = ?, likes = ? WHERE id = ?',
        [name, imageUrl, note, ingredients, tools, instructions, likes, recipesId]);

      connection.release();

      if (updateResult.affectedRows === 0) {
        return h.response({
          status: 'fail',
          message: 'Tidak ada perubahan pada resep'
        }).code(400);
      }

      return h.response({ message: 'Data resep berhasil diupdate' });
    } catch (error) {
      return h.response({ error: error.message }).code(500);
    }
  },

  deleteRecipeById: async (request, h) => {
    try {
      const { recipesId } = request.params;

      const connection = await pool.getConnection();

      const [result] = await connection.query('SELECT * FROM data_recipe WHERE id = ?', [recipesId]);

      if (result.length === 0) {
        connection.release();
        return h.response({
          status: 'fail',
          message: 'Resep tidak ditemukan'
        }).code(404);
      }

      await connection.query('DELETE FROM data_recipe WHERE id = ?', [recipesId]);
      connection.release();

      return h.response({ message: 'Resep berhasil dihapus' });
    } catch (error) {
      return h.response({ error: error.message }).code(500);
    }
  },
};

module.exports = recipeController;
