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
expInfo = {'Participant':'','Run number': ['1','2','3','4'],\
'EyeTracking':['Off', 'On'],'Screen':['eyeTrack1','PepperJack','testLaptop','Leah']}
dlg = gui.DlgFromDict(dictionary=expInfo, title=expName)
if dlg.OK == False: core.quit()
expInfo['date'] = data.getDateStr()
expInfo['expName'] = expName
if expInfo['Screen']=='Leah':
    _thisDir = '/Users/purkinje/Documents/GitHub/ARC-eyetracking'
else:
    _thisDir = '/Users/cdlab-admin/Documents/GitHub/ARC-eyetracking/'
sys.path.append(_thisDir)
os.chdir(_thisDir)
filename = _thisDir + os.sep + u'data/%s_%s_%s' %(expInfo['Participant'], expName, expInfo['date'])
#save the data
thisExp = data.ExperimentHandler(name=expName, version='', extraInfo=expInfo, runtimeInfo=None, originPath=None, savePickle=False, saveWideText=True, dataFileName=filename)
run = expInfo['Run number']

#create a window
if expInfo['Screen']=='eyeTrack1':
    sp = [1920,1080]
    #sp = [1000,500]
    ppd = 36.2
elif expInfo['Screen']=='Leah':
    sp = [2560, 1600]
    ppd = 128
else:
    sp=[1440,900]
    ppd = 36.2

pyWin = visual.Window(size=sp, screen=0, monitor=expInfo['Screen'], units="pix",winType='pyglet',pos=[0,0], fullscr=False)
colDepth = 24 #color depth
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
    et.eyeTrkCalib(el,sp,colDepth,pyWin)
#open file for EyeLink
if eyeL == 1:
    fnShort = expInfo['Participant'] + '_' + run
    openOut = et.eyeTrkOpenEDF(fnShort, el) #open file
    el.startRecording(1,1,1,1)

pyWin.close()

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
				trial = 1
				##add keepGoing Condition here
				while keepGoing: 
					if (fifo_a, select.POLLIN) in poll.poll(1):  # Poll every 10 ms
						msg = get_message(fifo_a)					# Read from Pipe A
						msg = process_msg(msg)						# Process Message

						#print('----- Received from JS -----')
						#print("	   " + msg.decode("utf-8"))
						signal = msg.decode("utf-8")
			## add signal logic here for eyetracking		
						if signal=='=':
							attempt = 1
							if eyeL ==1:
								el.sendMessage("trialStart_" + str(trial))
							else:
								print('=')
							trial+=1
						elif signal=='+':
							if eyeL ==1:
								el.sendMessage("submit_" + str(attempt))
							else:
								print('+')
							attempt+=1
						elif signal=='q':
							print('q')
							keepGoing = False

							
			finally:
				poll.unregister(fifo_a)
		finally:
			os.close(fifo_a)
	finally:
		os.remove(IPC_FIFO_NAME_A)
