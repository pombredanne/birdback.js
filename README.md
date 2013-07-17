birdback.js
===========

Client side javascript library to use Birdback API wihtout being PCI compliant.


Encrypt a card number
---------------------
```html
<body>
  <form>
    <input name="cardnumber" required data-encrypt />
  </form>
  <script type="text/javascript">
    document.addEventListener('DOMContentLoaded, function () {
      var birdback = new Birdback('<yourpublickey>');
    });
  </script>
</body>
```

Validate card number
--------------------
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
