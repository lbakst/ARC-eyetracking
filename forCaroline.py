# for Caroline
# Basic code for eye tracker task
import serial

eyeL = 0

ARCport = serial.Serial(port='dev/ttyUSB0', baudrate=XXXX)

keepGoing = True
trial = 1
while keepGoing:
    #automatically reads 1 byte unless otherwise specified
    #will wait for requested number of bytes unless timeout is set.
    signal = ARCport.read()
    if signal=='=':
        attempt = 1
        if eyeL ==1:
            el.sendMessage("trialStart_" + str(trial))
        else:
            print('=')
        ARCport.reset_input_buffer()
        trial+=1
    elif signal=='+':
        if eyeL ==1:
            el.sendMessage("submit_" + str(attempt))
        else:
            print('+')
        ARCport.reset_input_buffer()
        attempt+=1
    elif signal=='q':
        keepGoing = False
