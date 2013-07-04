# -*- coding: utf-8 -*-
import os
import re
import base64

from Crypto.PublicKey import RSA
from Crypto.Util import number

from flask import Flask, jsonify, request


app = Flask(__name__)


app.debug = True


private_key = """-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEA8KIZEQhdmodJUTFzNGBvLz2NZk8B8O3FbkWbKhumLhv14CDk
uSd9GGTz9YRKFDIyE5BFJqNJftdKDyuyaOALNtiqBB5Xtb3LiJ1Ut6H/Q2ACmVuH
J72jsvY4fNoznWCEIJJA3ld/IofXpPsIbmY/rvnu6NCfsQ7aZB7DvujrfySeVVbR
U5/wYU/b/8wM2ZraG9NOEnFZAReO9CfWTKZgxjCe3z86M8F1vD26ic0Nfp6VSv1T
McDTncE+wnLjSPK+J509S+tr4x6EWwVjpN55AUiFFh4jEMJWI/yELZjnEikLI3fG
7SenchNMy09BQrVZ5APR9dn9B/4Gv076cuW98QIDAQABAoIBAQDvhyuUfNNQAuLE
Y4jd1jBWwdqCwJqaDNS+E6OEoskklMiHNbb3Z4tqQPNmrSxgNicKuk1bTKbYD820
lDafloUTL1DtkJaWXjq/3nx53lON6YAsz6MVt/u/JMDN5xYBzhU3pt3TdR0kbjwG
Caw22KkDr95U+XY8dSCHEOignJHul8KPoD0ay6W+ZxpAc77mFsEbhbnPx9wMObap
IBlGNikN4GazFGz8MHlepEEsbZLBlMB7QPJSh/H8D9jSHdRj+dt/vj1mgiDxGdyP
UTTRrOiTKJ2Ob9n4pAGHjB/WXfmaGPn4n+nE376RZA9Vm9mYtrziNUpz/Uw2dwZp
kP/UErARAoGBAPJGXWdiVfY4eu31ORduAVAs+JM3/DgrzarrniaDPPrVvKy8M4gS
Xt8po84F/WH2uPhPnkdMkEAYANYLXwm2ABzzeXt/DRjTSni3M1Vn4uiW21MIql/W
mAqw1v0UPO3tN0cbVwZmD4Fg10HkGtry6ru++gGU0ybWTUNuMEVWL4fzAoGBAP5D
7KpFpBM0IVLpOeGuonErjwjQT5D8ojytlFXducTbphxZB9WKRAk105RDtc4JLZtJ
YQil6CYhjSfFAYWWuM32/lzVzUOegHAAQJun0wqtosQdkT1czOfW3Lpm/SIIyjGW
6jIzhLHT4YQXjd/1yM5sq5VKgLDKGB+QoblAfZ+LAoGBANzGRE12rdDuzQ7U/Q6d
vvKZ2HcHeH6TZBrSFU8RHtuRNBrQccEYxH1mC5AtoyXHV+1nWFuuqHDPrstel19Z
C6dWM6jXMU8jE+UHRO8Z+QtslTaIWgF1ox1y4qbC73b9SPcyMc5x6MVEQ0QXImXN
IRyvPlF8liH4/XVqDvDQRgYDAoGAC2kG7Nk1NLtpJ2xZ8ZvBpGx8/btDZtE/gpOT
jYrmtEPbH3iLVnTe+r7UoNmtBfL5ffd8CERRt6xXxkob+F+8KVoFLitWC8vIHb6V
J6cPXHJQVJazFtrcQycsPp0yjN1yHWmVVu1i7gwBGcloz30bJtBPnuJ6BfT7wibe
aw7O1GMCgYEA8VHGM/SsHViE+gTY2jHSW+hyvtI4ui6/uuhpOFkIflA+q9wZqGIC
s/1MBgsGaF5ogvPwFzpRHICyA/Nuy/JTHx4p+NST+p5w2u3riiqA7dLJXatCJOJM
A7Pt3/rmwC1pdjsvk25yL+rtLJvqYhjICgT1FoslMUJIjuqHDXC+Qrw=
-----END RSA PRIVATE KEY-----"""


def decrypt_cipher(cipher):
    key = RSA.importKey(private_key)
    cipher_string = base64.b64decode(cipher)
    cipher_long = number.bytes_to_long(cipher_string)
    decrypted = number.long_to_bytes(key.decrypt(cipher_long))

    # Removes "noises"
    r = re.compile('([a-z0-9\ ]{5,})$')
    return r.search(decrypted).group(0)


@app.route('/decrypt/', methods=['POST'])
def decrypt():
    cipher = request.form.get('cipher')
    return decrypt_cipher(cipher), 200


@app.route('/form/', methods=['POST'])
def post():
    decrypted_number = decrypt_cipher(request.form.get('number'))
    return jsonify(received_values=request.form,
        decrypted_number=decrypted_number)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
