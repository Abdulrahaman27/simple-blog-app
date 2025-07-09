// const express = require('express');
import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node'; 
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// For __dirname in ESM;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// Setup Lowdb
const db = new Low(new JSONFile('db.json'));
await db.read();
db.data ||= { posts: [] };

// Routes

// serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Redirect / to frontend index.html
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})


// Get all posts
app.get('/posts', (req, res) => {
    res.json(db.data.posts);
});

// Get single post
app.get('/posts/:id', (req, res) => {
    const post = db.data.posts.find(p => p.id === parseInt(req.params.id));
    if(!post) return res.status(404).json({message: 'Post not found'});
    res.json(post);
});

// create post
app.post('/posts', (req, res) => {
    const { title, content } = req.body;
    if(!title || !content) return res.status(400).json({message: 'Title and content required'});

    const newPost = { id: Date.now(), title, content };
    db.data.posts.push(newPost);
    db.write();
    res.status(201).json(newPost);
})

// Update post 
app.put('/posts/:id', (req, res) => {
    const { title, content} = req.body;
    const post = db.data.posts.find(p => p.id === parseInt(req.params.id));

    if(!post) return res.status(404).json({message: 'Post not found'});
    
    post.title = title ?? post.title;
    post.content = content ?? post.content; 
    db.write();

    res.json(post);
});

// Delete post 
app.delete('/posts/:id', (req, res) => {
    const postIndex = db.data.posts.findIndex( p => p.id === parseInt(req.params.id));
    if(postIndex === -1 ) return res.status(404).json({message: "Post not found"});
    
    const deletedPost = db.data.posts.splice(postIndex, 1);
    db.write();

    res.json({message : "Post deleted", post:deletedPost[0]});
}); 

// Start server 
app.listen(PORT, () => console.log(`Blog API running at http://localhost:${PORT}`));


