import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        writing: resolve(__dirname, "writing.html"),
        books: resolve(__dirname, "books.html"),
        projects: resolve(__dirname, "projects.html"),
        cv: resolve(__dirname, "cv.html"),
        quietSystems: resolve(__dirname, "posts/quiet-systems.html"),
        deepWorkNotes: resolve(__dirname, "posts/deep-work-notes.html"),
        atomicHabitsNotes: resolve(__dirname, "reviews/atomic-habits-notes.html")
      }
    }
  }
});
