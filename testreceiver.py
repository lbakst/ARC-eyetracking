import os
import select

IPC_FIFO_NAME_A = "pipe_a"

def get_message(fifo):
	'''Read n bytes from pipe. Note: n=24 is an example'''
	return os.read(fifo, 24)

def process_msg(msg):
	'''Process message read from pipe'''
	return msg

eyeL = 0

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
					if (fifo_a, select.POLLIN) in poll.poll(1):  # Poll every 1 ms
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
						elif signal=='b':
							if eyeL ==1:
								el.sendMessage("breakStart")
							else:
								print('b')
						elif signal=='e':
							if eyeL ==1:
								el.sendMessage("breakEnd")
							else:
								print('e')
						elif signal=='q':
							print('q')
							keepGoing = False
										
			finally:
				poll.unregister(fifo_a)
		finally:
			os.close(fifo_a)
	finally:
		os.remove(IPC_FIFO_NAME_A)
