Dim voice, stream
Set voice = CreateObject("SAPI.SpVoice")
Set stream = CreateObject("SAPI.SpFileStream")
stream.Open "c:\Users\ADMIN\Desktop\Ramnents\public\audio\test.wav", 3
Set voice.AudioOutputStream = stream
voice.Rate = -2
voice.Volume = 100
voice.Speak "Every journey into the unknown begins with a question."
stream.Close
WScript.Echo "SUCCESS"

