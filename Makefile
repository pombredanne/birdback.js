all: uglify

uglify: 
		uglifyjs vendor/jsbn/jsbn.js vendor/jsbn/prng4.js vendor/jsbn/rng.js vendor/jsbn/rsa.js vendor/jsbn/base64.js vendor/asn1.js birdback.js > build/birdback.js
test:
		nosetests tests/runner.py	
