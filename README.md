# Slide Puzzle

The idea of this is to create a game that will take a picture and divide it up into square sections that can be moved around.  The initial location of the sections will be randomized.

For example, a 600x600 image is square and can be evenly divided into a 3x3 grid.  For the slide puzzle to work, there needs to be a blank spot, which is any one of the squares.

You can access the images in contentful using the restful API: 
https://images.ctfassets.net/5g4h2poikwrg/01J3demBXdMBI9OX5VDjrN/2a6788e136ac53459e66d9391f42532c/nature-1370825-639x573.jpg

The images uploaded to contentful should be square so that it can evenly be divided into a 3x3 grid of images.  Currently, there is a tool I'm using to manually split the image: https://postcron.com/image-splitter/editor/en/upload-image.

Both the whole image and the image pieces are uploaded as assets and linked together using a Puzzle content entry.

