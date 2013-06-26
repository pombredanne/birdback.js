mocha.setup('tdd');


var publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8KIZEQhdmodJUTFzNGBvLz2NZk8B8O3FbkWbKhumLhv14CDkuSd9GGTz9YRKFDIyE5BFJqNJftdKDyuyaOALNtiqBB5Xtb3LiJ1Ut6H/Q2ACmVuHJ72jsvY4fNoznWCEIJJA3ld/IofXpPsIbmY/rvnu6NCfsQ7aZB7DvujrfySeVVbRU5/wYU/b/8wM2ZraG9NOEnFZAReO9CfWTKZgxjCe3z86M8F1vD26ic0Nfp6VSv1TMcDTncE+wnLjSPK+J509S+tr4x6EWwVjpN55AUiFFh4jEMJWI/yELZjnEikLI3fG7SenchNMy09BQrVZ5APR9dn9B/4Gv076cuW98QIDAQAB';

suite('Birdback', function () {
    "use strict";

    test('should raise proper exception when an invalid key is provided', function () {
        expect(function () { return new Birdback('invalid'); }).to.throwException();
    });

    test('should not raise exception when a valid key is provided', function () {
        expect(function () { return new Birdback(publicKey); }).to.not.throwException();
    });

    suite('buildKey', function () {
        var birdback = new Birdback(publicKey);

        test('should build a correct RSAKey when a valid ASN1 is given', function () {
            var asn1 = ASN1.decode(b64toBA(publicKey)),
                rsa = birdback.buildKey(asn1);
            expect(rsa.e).to.be(65537);
        });

        test('should raise proper exception when an invalid ASN1 is given', function () {
            var asn1 = ASN1.decode('invalid');
            expect(birdback.buildKey).withArgs(asn1).to.throwException();
        });
    });

    suite('extractIntegers', function () {
        var birdback = new Birdback(publicKey);

        test('should return an array of two intergers when a valid ASN1 is given', function () {
            var asn1 = ASN1.decode(b64toBA(publicKey)),
                parts = birdback.extractIntegers(asn1);
            expect(parts.length).to.be(2);
        });

        test('should return an empty array when an invalid ASN1 is given', function () {
            var asn1 = ASN1.decode('invalid'),
                parts = birdback.extractIntegers(asn1);
            expect(parts.length).to.be(0);
        });
    });

    suite('encrypt', function () {
        test('should encrypt string from a valid key', function () {
            var birdback = new Birdback(publicKey),
                plain = 'my secret text',
                cipher = birdback.encrypt(plain);
            expect(cipher.length).to.be(256);
        });
    });

    suite('luhn', function () {
        suite('calculate', function () {
            test('should return 1 for 450060000000006 digits', function () {
                expect(Birdback.luhn.calculate('450060000000006')).to.be(1);
            });

            test('should return 7 for 401200007777777 digits', function () {
                expect(Birdback.luhn.calculate('401200007777777')).to.be(7);
            });
        });

        suite('validate', function () {
            test('should return true when valid digits are given', function () {
                expect(Birdback.luhn.validate('4500600000000061')).to.be.ok();
            });

            test('should return false when invalid digits are given', function () {
                expect(Birdback.luhn.validate('4500600000000062')).not.to.be.ok();
            });
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    "use strict";
    mocha.run();
});
