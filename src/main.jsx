/**
 * main.jsx — Application Entry Point
 *
 * This is the FIRST file that runs when the app starts.
 *
 * KEY CONCEPT — ReactDOM.createRoot
 * React "mounts" (attaches) the entire app to a single <div id="root">
 * element in index.html.  From that point on, React controls everything
 * inside that div — adding, updating, and removing DOM elements as
 * component state changes.
 *
 * KEY CONCEPT — ThemeProvider
 * MUI uses React Context to pass the theme down to every component.
 * By wrapping the app in <ThemeProvider theme={theme}>, every MUI
 * component (Button, Paper, etc.) automatically picks up our custom
 * colors and style overrides from theme.js.
 *
 * KEY CONCEPT — CssBaseline
 * Normalises browser default styles so the app looks consistent across
 * Chrome, Firefox, Safari, etc.  Think of it as a CSS reset.
 *
 * KEY CONCEPT — StrictMode
 * In development, React.StrictMode intentionally renders components
 * twice to help you find bugs (like missing cleanup in useEffect).
 * It does nothing in production builds.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';
import './index.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  </React.StrictMode>
);
