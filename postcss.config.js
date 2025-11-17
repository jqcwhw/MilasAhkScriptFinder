
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss({
      config: './tailwind.config.js'
    }),
    autoprefixer(),
  ],
  parser: false,
  map: process.env.NODE_ENV === 'development'
};
