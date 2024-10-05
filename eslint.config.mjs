import henderea from 'eslint-config-henderea';

export default [
  ...henderea,
  {
    ignores: ['.vercel/*', '.idea/*', 'build/*', 'dist/*', 'public/*']
  }
];
