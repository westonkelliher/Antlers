# Antlers
project by Weston Kelliher, Pierson Marks, and David West

### Goal

We want to devise a system to quickly and simply generate realistic looking antlers or horns to be used in models of animals and fictional creatures. The antlers will be procedurally generated and the feature space should have the ability to represent a large range of models: anything from reindeer antlers to curled ram horns. To showcase our framework we will generate a dozen or so sets of antlers each of which is unique and interesting. We will mount the antlers on an animal which will look around and walk around with the camera tracking the head. Instead of abruptly switching between sets of antlers to show each one, we will animate a smooth morphing of the antlers which will momentarily assume the shape of the ones we have chosen as it morphs. The goal is that any given frame, the morphology of the antlers will be unique, interesting, and somewhat realistic.  

This is interesting to our fellow classmates due to the extreme prevalence of fractals in nature. By developing an L-system to accurately model an aspect of nature, such as antlers, we are able to easily create life-like forms that are similar yet look very different. Video game developers use this type of implementation when randomly generating many different aspects of nature, such as trees throughout a world or similar families of animals. 

### Implementation
To generate natural looking animal antlers we will ubyse an L system to generate each segment of the antlers. In order to have a better mathematical definition and control over the antlers, we will have a way of mapping a 3d representation of antlers to a feature vector. In order to animate smooth transitions between morphologies we will use a spline through feature vectors. These antlers will be textured procedurally in real-time.  

This is impressive and interesting because it allows for the simple creation of separate models of antlers if certain parameters are changed for the user’s curiosity. We chose this project because it not only extends the production of fractals in computer graphics to a more realistic scenario but also can allow for smooth creation of models in a virtual-world setting.
The antlers will be attached to an animal’s body, where the animal is placed in a “forest-like” environment. The camera tracking will be implemented by “attaching” the camera to an “arrow” that is shot, using the lookat matrices to keep the focus of the camera on the animal’s morphing antlers. 

### Challenges
One of the biggest challenges that we believe we will face is the smooth transition between antlers. This challenge appears due to the combination of an L-system and feature vector to coordinate a smooth transition between models. We want to prevent sudden changes of angles or entire sections disappearing arbitrarily. In addition, another challenge will be the real-time rendering and texturing of the antlers while using a camera to track this growth. If in a time crunch, this real-time growth and rendering may be done before the start of the video and the world will not be as vividly developed. Another challenge will be to do the bulk of calculations on the morphology of the antlers directly on the graphics card. Because we have to modify specific vertices of shapes, we cannot simply load in our shapes then use affine transform to move them around.

