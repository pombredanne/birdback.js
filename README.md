Birdback.js
===========

This library is for use in a web browser to validate and encrypt 16-digit credit card numbers on the client-side.

This approach [significantly reduces](https://blogs.rsa.com/reducing-pci-scope-with-tokenization/) PCI scope.


Quick use
---------

When the constructor `Birdback` is invoked it will look for inputs in forms with the attribute `data-encrypt` on them and ensure they are encrypted when submitted. 
In the following example the input `cardnumber` will be encrypted when the form is submitted:

```html
<body>
  <form>
    <input name="cardnumber" required data-encrypt />
  </form>
  <script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function () {
      var birdback = new Birdback('<yourpublickey>');
    });
  </script>
</body>
```

Validate card number
--------------------

Validating a card number can be done with `Birdback.validateCardNumber`.
You could e.g. use it like this:

```js
var numberInput = document.querySelector('[name=cardnumber]');
numberInput.addEventListener('input', function (e) {
    var value = numberInput.value;
    if (Birdback.validateCardNumber(value)) {
        numberInput.setCustomValidity('');
    } else {
        numberInput.setCustomValidity('Invalid card number');
    }
});
```

Example
-------
To se a full example (without server implementation) see `tests/static/form.html`.


Generated form
--------------

If you insert a form into the DOM *after* `Birdback` is invoked it will *not* be encrypted automatically when the form is submitted. In that case use:

```js
// earlier in your script:
// var birdback = new Birdback('<yourpublickey>');

// now secure a form where `form` refers to a `DOMElement`:
birdback.secureForm(form);
```

Control when to encrypt
-----------------------
Do you want to decide for yourself when to encrypt the field? Instead of listening on the submit event just encrypt it right away: 
```js
// earlier in your script:
// var birdback = new Birdback('<yourpublickey>');

// encrypt every input in the form with attribute `data-encrypt` on it.
birdback.encryptForm(form);

// encrypt a specific input.
birdback.encryptField(input);

```

Both methods works by removing the name from the origin input (thus it wont show up on `post`/`get`) and create a new hidden input with the same name and the encrypted card number as the value.

Stripped down usage
-------------------
If you just want to encrypt the card number and handle everything else yourself use `encrypt`:
```js
// earlier in your script:
// var birdback = new Birdback('<yourpublickey>');
var cardNumber = '4242424242424242';
var cipher = birdback.encrypt(cardNumber);
```

This can be useful if the card number is send with `ajax` and the data is not generated from the form directly. 

OBS: Remember that if you do this ensure that the raw card number is not send along in any way.

Later on on the server side..
-----------------------------
If you submit the following form after invoking `Birdback`:
```
  <form>
    <input name="cardnumber" required data-encrypt />
  </form>
```

Your server will recieve the following POST data:
```json
{
'cardnumber': '5Dl/9vkmHEN3DzyGHE2c8aTLHCP0U6nxcXXxID6Oewwi+n9ioBzNYvLwlo6We9wa9p5kb6PtnL3IOaUp1/wkFRljEmZU8ViI6agJWDjAUysIpqndXtnz2XyvA8VAES4JZqNRQrWXzqW0Hmc9WStwzW76BJB3cqJP2fD6eYb5DhF86+HwxfcRVFncAvmsc84qdqb0OLkC8jEAih6IrMs5RTPCID9vcbr+daDN1sZ/jE9+Hc7GIRu9r5Xw0tiLW5NE08CKAwP82LkvUmHNHmDVq/kqTtr/egw1eiGW4d5BdvoslEFiHfPKaTUmW8CaZeCRuD85OA3b7itxyuB1Zd5Kzg=='
}
```

This value will be accepted by the api as long as the original value was encrypted with the same rsa key as the authenticated application has.


Running the test suite
----------------------

The test suite can be launched in browser:
```bash
$ <browser_executable> tests/static/index.html
```
or within a Python environment with dependencies installed using ``pip``:
```bash
$ pip install -r tests/requirements.txt
$ make test
```
