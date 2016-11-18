# http://ejohn.org/blog/keeping-passwords-in-source-control/
# automatically decrypt based on environment variable

CONF=private/gcloud-secret.json

decrypt:
	openssl cast5-cbc -d -in ${CONF}.cast5 -out ${CONF} -pass env:KEYPASS
	chmod -v 600 ${CONF}

encrypt:
	openssl cast5-cbc -e -in ${CONF} -out ${CONF}.cast5 -pass env:KEYPASS

.PHONY: decrypt encrypt
