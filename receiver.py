import os
import select
import sys
import eyeTrack as et
from psychopy import visual, core, data, gui, prefs

IPC_FIFO_NAME_A = "pipe_a"

def get_message(fifo):
	'''Read n bytes from pipe. Note: n=24 is an example'''
	return os.read(fifo, 24)

def process_msg(msg):
	'''Process message read from pipe'''
	return msg

#run task
expName = u'ARCeyetracking'
expInfo = {'Participant':'',\
'EyeTracking':['Off', 'On'],'Screen':['eyeTrack1','PepperJack','testLaptop','Leah']}
dlg = gui.DlgFromDict(dictionary=expInfo, title=expName)
if dlg.OK == False: core.quit()
expInfo['date'] = data.getDateStr()
expInfo['expName'] = expName
_thisDir = '/Users/cdlab-admin/Documents/GitHub/ARC-eyetracking/'
#if expInfo['Screen']=='Leah':
#_thisDir = '/Users/purkinje/Documents/GitHub/ARC-eyetracking'
#else:
#    _thisDir = '/Users/cdlab-admin/Documents/GitHub/ARC-eyetracking/'
sys.path.append(_thisDir)
os.chdir(_thisDir)
filename = _thisDir + os.sep + u'data/%s_%s_%s' %(expInfo['Participant'], expName, expInfo['date'])
#save the data
thisExp = data.ExperimentHandler(name=expName, version='',
    extraInfo=expInfo, runtimeInfo=None,
    originPath=None,
    savePickle=True, saveWideText=True,
    dataFileName=filename)
run = 1

#create a window
if expInfo['Screen']=='eyeTrack1':
    sp = [1920,1080]
    #sp = [1000,500]
    ppd = 36.2
else:
    sp=[2560,1600]
    ppd = 36.2

pyWin = visual.Window(size=sp, screen=0, monitor=expInfo['Screen'], units="pix",winType='pyglet',pos=[0,0], fullscr=True)

#eye track
if expInfo['EyeTracking'] == 'Off':
    eyeL = 0 #no eye track
else:
    eyeL = 1 #eye track
    #Initialize EyeLink
    print('made it!')
    el = et.eyeTrkInit(sp)
    print('made it past initialization')
    #calibration for EyeLink
    et.eyeTrkCalib(el,sp,run,pyWin)
#open file for EyeLink
if eyeL == 1:
    #fnShort = expInfo['Participant'] + '_' + str(run)
	fnShort = 'LRB_' + str(run)
    openOut = et.eyeTrkOpenEDF(fnShort, el) #open file
    el.startRecording(1,1,1,1)

#pyWin.close()
pyWin.winHandle.minimize()
pyWin.winHandle.set_fullscreen(False)

if __name__ == "__main__":
	if not os.path.exists(IPC_FIFO_NAME_A):
		os.mkfifo(IPC_FIFO_NAME_A)

	try:
		fifo_a = os.open(IPC_FIFO_NAME_A, os.O_RDONLY | os.O_NONBLOCK)	# pipe is opened as read only and in a non-blocking mode
		print('Read pipe ready')
		try:
			poll = select.poll()
			poll.register(fifo_a, select.POLLIN)

			try:
				keepGoing = True
				trial = 0
				##add keepGoing Condition here
				while keepGoing:
					if (fifo_a, select.POLLIN) in poll.poll(0):  # Poll every 10 ms
						msg = get_message(fifo_a)					# Read from Pipe A
						msg = process_msg(msg)						# Process Message
						#print('----- Received from JS -----')
						#print("	   " + msg.decode("utf-8"))
						signal = msg.decode("utf-8")
			## add signal logic here for eyetracking
						if signal=='=':
							trial+=1
							if trial==1:
								runClock = core.Clock()
							trialStart = runClock.getTime()
							attempt = 1
							thisExp.addData('run',run)
							thisExp.addData('trial',trial)
							thisExp.addData('action','newTrial')
							thisExp.addData('time',trialStart)
							thisExp.nextEntry()
							print('=')
							if eyeL ==1:
								el.sendMessage("trialStart_" + str(trial))
						elif signal=='+':
							submit = runClock.getTime()
							print('+')
							thisExp.addData('run',run)
							thisExp.addData('trial',trial)
							thisExp.addData('action','submit')
							thisExp.addData('time',submit)
							thisExp.nextEntry()
							if eyeL ==1:
								el.sendMessage("submit_" + str(attempt))
							attempt+=1
						elif signal=='b':
							takeBreak = runClock.getTime()
							print('b')
							thisExp.addData('run',run)
							thisExp.addData('trial',trial)
							thisExp.addData('action','break')
							thisExp.addData('time',takeBreak)
							thisExp.nextEntry()
							run +=1
							testStim = visual.TextStim(pyWin, text='I work', pos=[0,0], height = 100, units='pix', color=[1, 1, 1])
							testStim.draw()
							pyWin.flip()
							if eyeL ==1:
								el.sendMessage("breakStart")
								if eyeL == 1:
									closeOut = el.closeDataFile()
									el.receiveDataFile(fnShort + '.EDF', filename + '.EDF')
									pyWin.winHandle.maximize()
									pyWin.winHandle.set_fullscreen(True)
									et.eyeTrkCalib(el,sp,run,pyWin)
									pyWin.winHandle.minimize()
									pyWin.winHandle.set_fullscreen(False)
									fnShort = expInfo['Participant'] + '_' + str(run)
									openOut = et.eyeTrkOpenEDF(fnShort, el)
									el.startRecording(1,1,1,1)
						elif signal=='e':
							endBreak = runClock.getTime()
							print('e')
							thisExp.addData('run',run)
							thisExp.addData('trial',trial)
							thisExp.addData('action','newRun')
							thisExp.addData('time',endBreak)
							thisExp.nextEntry()
							if eyeL ==1:
								el.sendMessage("breakEnd")
						elif signal=='q':
							stopTime = runClock.getTime()
							print('q')
							thisExp.addData('trial',trial)
							thisExp.addData('action','stop')
							thisExp.addData('time',stopTime)
							if eyeL == 1:
								closeOut = el.closeDataFile() #close eyelink file
								el.receiveDataFile(fnShort + '.EDF', filename + '.EDF')
							keepGoing = False

			finally:
				poll.unregister(fifo_a)
		finally:
			os.close(fifo_a)
	finally:
		os.remove(IPC_FIFO_NAME_A)

pyWin.close()
core.quit()
