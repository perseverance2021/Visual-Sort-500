# Rod Sort Visualizer

A browser-based visualizer for sorting algorithms. Generate a random set of rods, pick an algorithm, and watch it sort from shortest (left) to tallest (right).

## Features

- Adjustable rod count (`5` to `500`)
- Adjustable animation speed
- Multiple algorithms:
  - Bubble Sort
  - Selection Sort
  - Insertion Sort
  - Quick Sort
  - Merge Sort
  - Heap Sort
  - Shell Sort
  - Comb Sort
  - Cocktail Sort
- Mobile-friendly responsive layout

## Run Locally

This project is a static site with no build step.

1. Open `index.html` directly in your browser, or
2. Serve the folder with a local static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy to GitHub Pages (Automatic)

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that deploys automatically from the `main` branch.

### One-time setup

1. Create a new GitHub repository.
2. Push this project to the `main` branch.
3. In your repository settings:
   - Go to **Settings -> Pages**
   - Under **Build and deployment**, choose **GitHub Actions**

After that, every push to `main` deploys the site.

## Suggested Git Commands

```bash
git init
git add .
git commit -m "Initial commit: Rod Sort Visualizer"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Project Structure

- `index.html` - app markup
- `styles.css` - app styling and responsive behavior
- `script.js` - sorting logic and visualization
