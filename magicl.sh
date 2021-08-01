#!/bin/bash -x

# reduce music library
# into 16k opus, while keeping album art

# use this to better organize big folders:
#mkdir .before; mkdir .error

for i in *.m??; do
	# main activity: compress mp3 down to 10%:
	ffmpeg -hide_banner -y -i "$i" -c:v mjpeg -vsync 2 -vf scale=320:-1 -f flac - | opusenc - --bitrate 16 --music --framesize 40 "${i%.*}.opus" && mv "$i" .before/

	# some times opusenc don't work:
	ffmpeg -hide_banner -n -i "$i" -c:v mjpeg -vsync 2 -vf scale=320:-1 -b:a 16k "${i%.*}.opus" && mv "$i" .before/

	# error catcher, if the folder exists:
	mv "$i" .error/
done

# notify when finished, d'uh:
echo zzz finished $TITLE | termux-notification
termux-vibrate -f
