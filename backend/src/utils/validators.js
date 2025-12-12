// Reusable validation helpers and regex patterns
module.exports = {
  nameValid: (name) => {
    if (!name) return false;
    return typeof name === 'string' && name.trim().length >= 20 && name.trim().length <= 60;
  },

  addressValid: (address) => {
    if (address === undefined || address === null) return true; // optional in some contexts
    return typeof address === 'string' && address.trim().length <= 400;
  },

  emailValid: (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  passwordValid: (password) => {
    if (!password) return false;
    // 8-16 chars, at least 1 uppercase, at least 1 special char
    const re = /^(?=.{8,16}$)(?=.*[A-Z])(?=.*[^\w\s]).*$/;
    return re.test(password);
  },
};
