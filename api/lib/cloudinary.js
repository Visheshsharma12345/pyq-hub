const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer  - file buffer
 * @param {string} folder  - cloudinary folder name
 * @param {object} options - extra cloudinary options
 * @returns {Promise<{url: string, publicId: string}>}
 */
function uploadBuffer(buffer, folder = 'pyq_hub', options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'raw', ...options },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete a resource from Cloudinary by its public ID.
 */
function deleteResource(publicId, resourceType = 'raw') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = { uploadBuffer, deleteResource };
