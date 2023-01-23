# Basic code for eye tracker task
# using node.js
import os

if not os.path.exists("pipe_a"):
    os.mkfifo("pipe_a")

eyeL = 0

# Open the FIFO pipe in read-only mode
pipe = open("pipe_a", "r")

# Continuously read messages from the pipe
keepGoing = True
trial = 1
while keepGoing:
    #automatically reads 1 byte unless otherwise specified
    #will wait for requested number of bytes unless timeout is set.
    message = pipe.read()
    if message=='=':
        attempt = 1
        if eyeL ==1:
            el.sendMessage("trialStart_" + str(trial))
        else:
            print('=')
        pipe.reset_input_buffer()
        trial+=1
    elif message=='+':
        if eyeL ==1:
            el.sendMessage("submit_" + str(attempt))
        else:
            print('+')
        pipe.reset_input_buffer()
        attempt+=1
    elif message=='q':
        keepGoing = False
