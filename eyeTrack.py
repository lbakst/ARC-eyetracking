#SP eye tracking modules
#LRB June 2017


import sys
sys.path.append('/Users/cdlab-admin/Documents/GitHub/LRB/')
import pylink as pl
import EyeLinkCoreGraphicsPsychoPy
#from psychopy import visual, event, core
#import time
#import gc
#import sys
#import os


#Must set up connection between eyelink computer and stimulus computer
#the eyelink manual lists how to do that for windows, linux, and mac

#Initialize the eye tracker
def eyeTrkInit(sp):
        el = pl.EyeLink()
        el.sendCommand("screen_pixel_coords = 0 0 %d %d" % (sp[0]/2, sp[1]/2))
        el.sendMessage("DISPLAY_COORDS  0 0 %d %d" % (sp[0]/2, sp[1]/2))
        el.sendCommand("select_parser_configuration 0")
        el.sendCommand("scene_camera_gazemap = NO")
        el.sendCommand("pupil_size_diameter = %s"%("YES"))
        return(el)


#This will allow you to calibrate, though it doesn't run the calibration routine automatically
#If you press 'c' on the stimulus computer while this function is running, the calibration will come up
#You can also validate the calibration during this time
def eyeTrkCalib(el,sp,cd,win):
    backgroundColor = win.color
    foregroundColor = (1, 1, 1,)
    genv = EyeLinkCoreGraphicsPsychoPy.EyeLinkCoreGraphicsPsychoPy(el,win)
    #genv.fixMacRetinaDisplay()
    #genv.setCalibrationColors(foregroundColor,backgroundColor)
    #genv.setTargetSize(10)
    #genv.setCalibrationSounds("","","")
    pl.openGraphicsEx(genv)
    el.doTrackerSetup()

     #pl.closeGraphics()
     #el.setOfflineMode()

#Open a new data file
def eyeTrkOpenEDF(filename,el):
    #the eyelink seems to be very sensitive to long filenames, try to keep them under 8 characters
    el.openDataFile(filename)

"""
#To run drift correction/check -- I don't actually use this currently; might be buggy.
def driftCor(el,sp,cd,win):
    #drift correction is only appropriate if we're okay having a fixation point at the beginning of each trial
    #can at least drift correct before each block
    #the current eyelink is actually set to drift *check* not correct -- so I haven't been using this function
    blockLabel=visual.TextStim(win,text="Press the space bar to begin drift correction",pos=[0,0], color="white", bold=True,alignHoriz="center",height=0.5)
    notdone=True
    while notdone:
        blockLabel.draw()
        win.flip()
        event.waitKeys(maxWait=3)
        eyeTrkCalib(el,sp,cd)
        win.winHandle.activate()
        notdone=False
"""

"""
#This is all code I found online that I haven't gone through yet.
#Gaze-contingent displays should be possible through pylink, but I can't speak to creating them yet.
#(Though this will definitely be something I'm working on in the not-too-distant future.)


#for gaze-contingent displays
while notdone:
            if recalib==True:
                dict['recalib']=True
                eyelink.sendMessage("RECALIB END")
                eyelink.startRecording(1,1,1,1)
                recalib=False
            eventType=eyelink.getNextData()
            if eventType==pl.STARTFIX or eventType==pl.FIXUPDATE or eventType==pl.ENDFIX:
                sample=eyelink.getNewestSample()

                if sample != None:
                    if sample.isRightSample():
                        gazePos = sample.getRightEye().getGaze()
                    if sample.isLeftSample():
                        gazePos = sample.getLeftEye().getGaze()

                gazePosCorFix = [gazePos[0]-scrx/2,-(gazePos[1]-scry/2)]

                posPix = posToPix(fixation)
                eucDistFix = sqrt((gazePosCorFix[0]-posPix[0])**2+(gazePosCorFix[1]-posPix[1])**2)

                if eucDistFix < tolFix:
                    core.wait(timeFix1)
                    notdone=False
                    eyelink.resetData()
                    break
"""

"""
#from pylink example code
RIGHT_EYE = 1
LEFT_EYE = 0
BINOCULAR = 2
#NTRIALS = 3
#TRIALDUR = 5000
#SCREENWIDTH = 800
#SCREENHEIGHT = 600
#trial_condition=['condition1', 'condition2', 'condition3']
def endTrial_eyeLink():
	'''Ends recording: adds 100 msec of data to catch final events'''
	pylink.endRealTimeMode()
	pumpDelay(100)
	getEYELINK().stopRecording()
	while getEYELINK().getkey() :
		pass


def driftCorr(SCREENWIDTH,SCREENHEIGHT):
    #The following loop does drift correction at the start of each trial
	while True:
		# Checks whether we are still connected to the tracker
		if not getEYELINK().isConnected():
			return ABORT_EXPT
		# Does drift correction and handles the re-do camera setup situations
		try:
			error = getEYELINK().doDriftCorrect(SCREENWIDTH // 2, SCREENHEIGHT // 2, 1, 1)
			if error != 27:
				break
			else:
				getEYELINK().doTrackerSetup()
		except:
			getEYELINK().doTrackerSetup()


def startEyelink():
    	getEYELINK().setOfflineMode()
    	msecDelay(50)
    	#start recording samples and events to edf file and over the link.
    	error = getEYELINK().startRecording(1, 1, 1, 1)
    	if error:	return error
    	#disable python garbage collection to avoid delays
    	gc.disable()
    	#begin the realtime mode
    	pylink.beginRealTimeMode(100)
    	try:
    		getEYELINK().waitForBlockStart(100,1,0)
    	except RuntimeError:
    		if getLastError()[0] == 0: # wait time expired without link data
    			end_trial()
    			print ("ERROR: No link samples received!")
    			return TRIAL_ERROR
    		else: # for any other status simply re-raise the exception
    			raise
    	#determine which eye is-are available
    	eye_used = getEYELINK().eyeAvailable() #determine which eye(s) are available
    	if eye_used == RIGHT_EYE:
    		getEYELINK().sendMessage("EYE_USED 1 RIGHT")
    	elif eye_used == LEFT_EYE or eye_used == BINOCULAR:
    		getEYELINK().sendMessage("EYE_USED 0 LEFT")
    		eye_used = LEFT_EYE
    	else:
    		print ("Error in getting the eye information!")
    		return TRIAL_ERROR
    	#reset keys and buttons on tracker
    	getEYELINK().flushKeybuttons(0)
    	# pole for link events and samples
    	while True:
    		#check recording status
    		error = getEYELINK().isRecording()  # First check if recording is aborted
    		if error != 0:
    			end_trial()
    			return error
    		#check if break pressed
    		if(getEYELINK().breakPressed()):	# Checks for program termination or ALT-F4 or CTRL-C keys
    			end_trial()
    			return ABORT_EXPT
    		#check if escape pressed
    		elif(getEYELINK().escapePressed()): # Checks for local ESC key to abort trial (useful in debugging)
    			end_trial()
    			return SKIP_TRIAL

def finishEyelink()
    		# see if there are any new samples
    		#get next link data
    		nSData = getEYELINK().getNewestSample() # check for new sample update
    		# Do we have a sample in the sample buffer?
    		# and does it differ from the one we've seen before?
    		if(nSData != None and (sData == None or nSData.getTime() != sData.getTime())):
    			# it is a new sample, let's mark it for future comparisons.
    			sData = nSData
    			# Detect if the new sample has data for the eye currently being tracked,
    			if eye_used == RIGHT_EYE and sData.isRightSample():
    				sample = sData.getRightEye().getGaze()
    				#INSERT OWN CODE (EX: GAZE-CONTINGENT GRAPHICS NEED TO BE UPDATED)
    			elif eye_used != RIGHT_EYE and sData.isLeftSample():
    				sample = sData.getLeftEye().getGaze()
    				#INSERT OWN CODE (EX: GAZE-CONTINGENT GRAPHICS NEED TO BE UPDATED)
    	getEYELINK().sendMessage("TRIAL_RESULT %d" % button)
    	#return exit record status
    	ret_value = getEYELINK().getRecordingStatus()
    	#end realtime mode
    	pylink.endRealTimeMode()
    	#re-enable python garbage collection to do memory cleanup at the end of trial
    	gc.enable()
    	return ret_value
        """
