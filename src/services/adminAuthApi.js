const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://api.bellphoness.com/api');

export const adminAuthApi = {
  sendOtp: async () => {
    const res = await fetch(`${API_URL}/admin/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to request security verification code.');
    }
    return data;
  },

  verifyOtp: async (otp) => {
    const res = await fetch(`${API_URL}/admin/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: (otp || '').trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Verification failed. Please check the OTP and try again.');
    }
    return data;
  },
};
