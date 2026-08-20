const CLOUD_NAME = 'pkotqxwo';
const UPLOAD_PRESET = 'bell_products';

export async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Image upload failed. Please try again.');
  }

  const data = await response.json();
  return data.secure_url;
}