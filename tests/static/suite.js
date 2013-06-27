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

    test('should secure all document forms', function (done) {
        var sensibleInput = Birdback.createElement('input', {name: 'sensible', value: 'secret value', 'data-encrypt': ''}),
            form = Birdback.createElement('form', {}, [sensibleInput]),
            event = document.createEvent("HTMLEvents"),
            birdback;
        document.body.appendChild(form);
        console.log(document.getElementsByTagName('FORM'));
        birdback = new Birdback(publicKey);
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            expect(form.childNodes.length).to.be(2);
            expect(sensibleInput.hasAttribute('name')).to.be(false);
            done();
        }, false);
        event.initEvent('submit', true, true);
        form.dispatchEvent(event);
    });

    suite('createElement', function () {
        test('should return right html tag name', function () {
            var form = Birdback.createElement('form');
            expect(form.tagName).to.be('FORM');
        });

        test('should correctly set given attributes', function () {
            var input = Birdback.createElement('input', {name: 'inputname', id: 'inputid'});
            expect(input.id).to.be('inputid');
            expect(input.getAttribute('name')).to.be('inputname');
        });

        test('should append given children', function () {
            var input = Birdback.createElement('input'),
                form = Birdback.createElement('form', {}, [input]);
            expect(form.childNodes.length).to.be(1);
        });
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
        test('should return a cipher with correct length', function () {
            var birdback = new Birdback(publicKey),
                plain = 'my secret text',
                cipher = birdback.encrypt(plain);
            expect(cipher.length).to.be(344);
        });

        test('should return a decryptable cipher', function (done) {
            var birdback = new Birdback(publicKey),
                plain = 'my secret text',
                cipher = birdback.encrypt(plain);
            $.post('/decrypt/', {cipher: cipher}, function (data) {
                expect(data).to.be(plain);
                done();
            });
        });
    });


    suite('form', function () {
        var birdback = new Birdback(publicKey),
            sensibleInput,
            plainInput,
            form;

        beforeEach(function () {
            sensibleInput = Birdback.createElement('input', {name: 'sensible', value: 'secret value', 'data-encrypt': ''});
            plainInput = Birdback.createElement('input', {name: 'plain', value: 'plain text'});
            form = Birdback.createElement('form', {}, [sensibleInput, plainInput]);
        });

        suite('encryptField', function () {
            test('should only secure input element', function () {
                var textarea = Birdback.createElement('textarea');
                expect(birdback.encryptField).withArgs(textarea).to.throwException();
            });

            test('should return an hidden input with encryped value', function () {
                var hidden = birdback.encryptField(sensibleInput);
                expect(hidden.getAttribute('name')).to.be('sensible');
                expect(hidden.value).not.to.be('secret value');
            });

            test('should unset name attribute of given input', function () {
                birdback.encryptField(sensibleInput);
                expect(sensibleInput.getAttribute('name')).to.be(null);
            });
        });

        suite('encryptForm', function () {
            test('should encrypt sensible fields', function () {
                birdback.encryptForm(form);
                expect(form.childNodes.length).to.be(3);
                expect(sensibleInput.hasAttribute('name')).to.be(false);
            });

            test('should not encrypt other fields', function () {
                birdback.encryptForm(form);
                expect(plainInput.value).to.be('plain text');
            });
        });

        suite('secureForm', function () {
            test('should force given form to encrypt on submit', function (done) {
                birdback.secureForm(form);
                form.addEventListener('submit', function (e) {
                    e.preventDefault();
                }, false);
                var event = document.createEvent("HTMLEvents");
                event.initEvent('submit', true, true);
                form.dispatchEvent(event);
                expect(form.childNodes.length).to.be(3);
                done();
            });
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


// Sets the runner and run tests as globals that can be accessed by Ghost.py.
var __mocha_tests__ = [],
     __mocha_runner__,
    isMochaRunning = function () {
        return __mocha_runner__ !== null;
    }

document.addEventListener("DOMContentLoaded", function () {
     __mocha_runner__ = mocha.run().globals(['stats', 'report']).on('test end', function (test) {
        __mocha_tests__.push({title: test.title, state: test.state});
    });
}, false);
