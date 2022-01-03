#!/bin/bash -x

# reduce:
# music into 16k opus, while keeping album art
# image into 1024 jpg, png, or svg

# use this to better organize big folders:
#mkdir .before; mkdir .error

# and almost this to help preventing multiple jpeg compressions
#mv *.jpg *.jpeg

for i in *.m??; do
	# main activity: compress mp3 down to 10%:
	ffmpeg -hide_banner -y -i "$i" -c:v mjpeg -vsync 2 -vf scale=320:-1 -f flac - | opusenc - --bitrate 16 --music --framesize 40 "${i%.*}.opus" && mv "$i" .before/

	# some times opusenc don't work:
	ffmpeg -hide_banner -n -i "$i" -c:v mjpeg -vsync 2 -vf scale=320:-1 -b:a 16k "${i%.*}.opus" && mv "$i" .before/

	# error catcher, if the folder exists:
	mv "$i" .error/
done

for i in *.jpg *.png; do
	# main activity: compress jpeg down to 10%:
	ffmpeg -hide_banner -y -i "$i" -vf scale=1024:-1 "${i%.*}.jpeg" && mv "$i" .before/

	mv "$i" .error/
done

# notify when finished, d'uh:
echo finished $TITLE | termux-notification
termux-vibrate -f
