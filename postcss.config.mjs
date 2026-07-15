const config = {
  plugins: {
    '@tailwindcss/postcss': {
      // Keep Tailwind resolution inside this project when Next/Turbopack is
      // launched from a parent workspace on Windows.
      base: import.meta.dirname,
    },
  },
};

export default config;
