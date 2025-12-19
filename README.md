# 🌌 Embedding Explorer

An interactive 3D visualization of word embedding space. Explore how words relate to each other in high-dimensional semantic space, projected into an explorable 3D universe.

![Embedding Explorer Preview](preview.png)

## ✨ Features

- **3D Word Galaxy** - Navigate through clusters of semantically related words
- **Interactive Exploration** - Click words to see their neighbors and relationships
- **Semantic Clusters** - Words naturally group by meaning (animals, emotions, technology, etc.)
- **Embedding Visualization** - See the actual vector values for each word
- **Search** - Find any word instantly
- **Smooth Animations** - Camera transitions and hover effects

## 🚀 Live Demo

Visit: `https://YOUR_USERNAME.github.io/embedding-explorer/`

## 🛠️ Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/embedding-explorer.git
cd embedding-explorer

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📦 Deploy to GitHub Pages

1. Create a new repository on GitHub named `embedding-explorer`

2. Push this code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/embedding-explorer.git
git push -u origin main
```

3. Go to repository **Settings** → **Pages**

4. Under "Build and deployment", select **GitHub Actions**

5. The site will auto-deploy on every push to `main`

## 🧠 How It Works

### Word Embeddings
Words are represented as high-dimensional vectors (100+ dimensions) where semantic similarity corresponds to geometric proximity. Similar words cluster together.

### Dimensionality Reduction
UMAP reduces 100D vectors to 3D coordinates while preserving local and global structure.

### Visualization
Three.js renders the 3D space with:
- Instanced meshes for performance
- Real-time camera controls
- Dynamic LOD (level of detail)

## 🎨 Tech Stack

- **React** - UI framework
- **Three.js** - 3D rendering
- **React Three Fiber** - React renderer for Three.js
- **Drei** - Useful helpers for R3F
- **Vite** - Build tool

## 📊 Data

Currently using synthetic embeddings based on GloVe-like structure. The positions maintain realistic semantic clustering.

For real embeddings, you could:
1. Load actual GloVe/Word2Vec vectors
2. Run UMAP server-side
3. Export 3D coordinates as JSON

## 🤝 Contributing

PRs welcome! Some ideas:
- Load real GloVe embeddings
- Add analogy visualization (king - man + woman = queen)
- More interaction modes
- VR support

## 📄 License

MIT

---

Built by [Yaxita Amin](https://yaxitaamin.github.io/portfolio/)
